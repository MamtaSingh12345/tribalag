const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const dotenv = require('dotenv');
const registerRoutes = require('./routes/registerRoutes'); // Ensure this path is correct
//const ExistenceCheck = require('./Models/existenceCheck'); // Import the ExistenceCheck model


dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

//mongoose.set('debug', true);

// Environment variables
const primaryDbURI = process.env.PRIMARY_DB_URI ;
const secondaryDbURI = process.env.SECONDARY_DB_URI ;

// Connect to primary database
const primaryConnection = mongoose.createConnection(primaryDbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
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
  ssl: true,
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
  contactNumber: { type: Number, required: true, unique: true },
  aadharID: { type: String, required: true, unique: true },
  voterID: { type: String, required: true, unique: true },
  village: { type: String, required: true },
  gramPanchayat: { type: String, required: true },
  block: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: false },
  country: { type: String, required: false },
  pin: { type: Number, required: false },
}));

const SecondaryData = secondaryConnection.model('SecondaryData', new mongoose.Schema({
  farmerID: { type: String, required: true }, // Assuming farmerID is required
  landDetails: {
    landInAcres: { type: Number, }, // Field for land size in acres
    landInBigha: { type: Number,  }, // Field for land size in bigha
    waterSourceType: { type: String,  }, // Assuming this is required
    distanceFromWaterSource: { type: Number,  }, // Assuming this is required
  },
  documents: {
    farmerPhoto: { type: String }, // Field for the farmer's photo
    aadharScan: { type: String }, // Field for Aadhar scan
    voterScan: { type: String }, // Field for Voter scan
  },
}));

// Import the OTP model
const OTP = primaryConnection.model('OTP', require('./Models/otp').schema);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

const ExistenceCheck = primaryConnection.model('ExistenceCheck', require('./Models/existenceCheck').schema);



// POST route for secondary registration with file uploads
app.post('/register/secondary', upload.fields([
  { name: 'farmerPhoto', maxCount: 1 },
  { name: 'aadharScan', maxCount: 1 },
  { name: 'voterScan', maxCount: 1 }
]), async (req, res) => {
  try {
    const farmerID = req.body.farmerID;

    const landInAcres = req.body['landDetails.landInAcres'];
    const landInBigha = req.body['landDetails.landInBigha'];
    const waterSourceType = req.body['landDetails.waterSourceType'];
    const distanceFromWaterSource = req.body['landDetails.distanceFromWaterSource'];

    const farmerPhoto = req.files['farmerPhoto'] ? req.files['farmerPhoto'][0].path : null;
    const aadharScan = req.files['aadharScan'] ? req.files['aadharScan'][0].path : null;
    const voterScan = req.files['voterScan'] ? req.files['voterScan'][0].path : null;

    const secondaryData = new SecondaryData({
      farmerID,
      landDetails: {
        landInAcres,
        landInBigha,
        waterSourceType,
        distanceFromWaterSource,
      },
      documents: {
        farmerPhoto,
        aadharScan,
        voterScan,
      },
    });

    await secondaryData.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling secondary registration:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// Use the existing register routes for primary registration and OTP sending
app.use('/register', registerRoutes(upload, PrimaryData, SecondaryData, OTP, ExistenceCheck));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
