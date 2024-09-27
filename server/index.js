const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const registerRoutes = require('./routes/registerRoutes'); // Ensure this path is correct
const { Client } = require('basic-ftp'); // Import basic-ftp
const { Readable } = require('stream');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Environment variables
const primaryDbURI = process.env.PRIMARY_DB_URI;
const secondaryDbURI = process.env.SECONDARY_DB_URI;
const ftpHost = process.env.FTP_HOST;
const ftpUser = process.env.FTP_USER;
const ftpPassword = process.env.FTP_PASSWORD;

// Connect to primary database
const primaryConnection = mongoose.createConnection(primaryDbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

primaryConnection.on('error', (err) => {
  console.error('Primary DB connection error:', err);
});

primaryConnection.once('open', () => {
  console.log('Primary database connected');
});

// Connect to secondary database
const secondaryConnection = mongoose.createConnection(secondaryDbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

secondaryConnection.on('error', (err) => {
  console.error('Secondary DB connection error:', err);
});

secondaryConnection.once('open', () => {
  console.log('Secondary database connected');
});

// Define models for primary and secondary databases
const PrimaryData = primaryConnection.model('PrimaryData', new mongoose.Schema({
  farmerID: { type: String, required: true },
  farmerName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  aadharID: { type: String, required: true, unique: true },
  voterID: { type: String, required: true, unique: true },
  village: { type: String, required: true },
  gramPanchayat: { type: String, required: true },
  block: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pin: { type: Number, required: true },
}));

const SecondaryData = secondaryConnection.model('SecondaryData', new mongoose.Schema({
  farmerID: { type: String, required: true }, // Assuming farmerID is required
  landDetails: {
    landInAcres: { type: Number, }, // Field for land size in acres
    landInBigha: { type: Number, }, // Field for land size in bigha
    waterSourceType: { type: String, },
    distanceFromWaterSource: { type: Number, },
  },
  documents: {
    farmerPhoto: { type: String }, // Field for the farmer's photo
    aadharScan: { type: String }, // Field for Aadhar scan
    voterScan: { type: String }, // Field for Voter scan
  },
}));

// Import the OTP model
const OTP = primaryConnection.model('OTP', require('./Models/otp').schema);

// Set up storage options for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// FTP Upload Function
async function uploadFileToFTP(fileBuffer, remoteFileName) {
  const client = new Client();
  try {
    await client.access({
      host: ftpHost,
      user: ftpUser,
      password: ftpPassword,
    });

    console.log('FTP access successful');

    // Convert the file buffer to a readable stream
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null); // Signal the end of the stream

    // Upload file to the specified path
    await client.uploadFrom(stream, `/htdocs/uploads/${remoteFileName}`);

    console.log('File uploaded successfully to FTP:', remoteFileName);
  } catch (error) {
    console.error('Error uploading file to FTP:', error);
    throw error;
  } finally {
    client.close();
  }
}

// ExistenceCheck model (assuming it is required for some other logic)
const ExistenceCheck = primaryConnection.model('ExistenceCheck', require('./Models/existenceCheck').schema);

// POST route for secondary registration with file uploads
app.post('/register/secondary', upload.fields([
  { name: 'farmerPhoto', maxCount: 1 },
  { name: 'aadharScan', maxCount: 1 },
  { name: 'voterScan', maxCount: 1 }
]), async (req, res) => {
  try {
    const farmerID = req.body.farmerID;

    const landInAcres = parseFloat(req.body.landInAcres) || null;
    const landInBigha = parseFloat(req.body.landInBigha) || null;
    const waterSourceType = req.body['landDetails.waterSourceType'];
    const distanceFromWaterSource = parseFloat(req.body['landDetails.distanceFromWaterSource']) || null;

    // Handle file uploads via FTP
    let farmerPhoto = null;
    let aadharScan = null;
    let voterScan = null;

    // Farmer Photo FTP Upload
    if (req.files['farmerPhoto']) {
      const file = req.files['farmerPhoto'][0];
      farmerPhoto = `farmerPhoto-${Date.now()}${path.extname(file.originalname)}`;
      
      // Log to check if file buffer exists
      console.log('Uploading farmerPhoto to FTP:', file.buffer);
      
      await uploadFileToFTP(file.buffer, farmerPhoto);  // Call FTP upload
    }

    // Aadhar Scan FTP Upload
    if (req.files['aadharScan']) {
      const file = req.files['aadharScan'][0];
      aadharScan = `aadharScan-${Date.now()}${path.extname(file.originalname)}`;

      console.log('Uploading aadharScan to FTP:', file.buffer);
      
      await uploadFileToFTP(file.buffer, aadharScan);  // Call FTP upload
    }

    // Voter Scan FTP Upload
    if (req.files['voterScan']) {
      const file = req.files['voterScan'][0];
      voterScan = `voterScan-${Date.now()}${path.extname(file.originalname)}`;

      console.log('Uploading voterScan to FTP:', file.buffer);

      await uploadFileToFTP(file.buffer, voterScan);  // Call FTP upload
    }

    // Now that the files have been uploaded to the FTP server, save the document URLs in MongoDB
    const secondaryData = new SecondaryData({
      farmerID,
      landDetails: {
        landInAcres,
        landInBigha,
        waterSourceType,
        distanceFromWaterSource,
      },
      documents: {
        farmerPhoto,  // Save the file name that was uploaded to FTP
        aadharScan,
        voterScan,
      },
    });

    await secondaryData.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling secondary registration:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Duplicate field detected. Ensure unique values for contactNumber, aadharID, or voterID.' });
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Use the existing register routes for primary registration and OTP sending
app.use('/register', registerRoutes(upload, PrimaryData, SecondaryData, OTP, ExistenceCheck));

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
