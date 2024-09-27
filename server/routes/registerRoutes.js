const express = require('express');
const twilio = require('twilio');
require('dotenv').config(); // Load .env file
const OTP= require('../Models/otp');
const ExistenceCheck= require('../Models/existenceCheck');

// Twilio setup (ensure these values are correctly set)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Function to generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const registerRoutes = (upload, PrimaryData, SecondaryData, OTP, ExistenceCheck) => {
  const router = express.Router();

 // Route to send OTP and store it in the database
  router.post('/send-otp', async (req, res) => {
  const { contactNumber } = req.body;

  try {
    // Generate OTP
    const otp = generateOTP();

    // Store OTP in the primary or secondary database (you can choose which one)
    const otpInstance = new OTP({ contactNumber, otp });
    await otpInstance.save(); // Saves OTP to the database

    // Send OTP using Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhoneNumber,
      to: contactNumber,
    });

    // Respond with success
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: 'Error sending OTP' });
  }
});


// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { contactNumber, otp } = req.body;

    if (!contactNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Contact number and OTP are required' });
    }

    // Find the OTP in the database
    const otpEntry = await OTP.findOne({ contactNumber });
    if (!otpEntry) {
      return res.status(400).json({ success: false, message: 'OTP not found or has expired' });
    }

    // (Optional) Check for OTP expiration
    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Verify OTP (ensure the types are the same by converting both to strings)
    if (otpEntry.otp === String(otp)) {
      await OTP.deleteOne({ contactNumber }); // Delete OTP after successful verification
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


 // Check for duplicate phone number, Aadhar ID, or Voter ID
router.post('/check-existence', async (req, res) => {
  const { contactNumber, aadharID, voterID } = req.body;

  try {
    // Check for existence in PrimaryData
    const contactNumberExists = contactNumber ? await PrimaryData.exists({ contactNumber }) : false;
    const aadharIDExists = aadharID ? await PrimaryData.exists({ aadharID }) : false;
    const voterIDExists = voterID ? await PrimaryData.exists({ voterID }) : false;

    // If any exist, save an existence check to the database
    if (contactNumberExists || aadharIDExists || voterIDExists) {
      const existenceCheck = new ExistenceCheck({
        contactNumber,
        aadharID,
        voterID,
        exists: true,  // Setting true because one or more fields already exist
      });
      await existenceCheck.save(); // Saving to the database
    }

    // Respond with the results of the existence check
    res.status(200).json({
      contactNumberExists,
      aadharIDExists,
      voterIDExists,
    });
  } catch (error) {
    console.error('Error checking existence:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


  // Register primary data route
  router.post('/primary', async (req, res) => {
    try {
      const {
        farmerID,
        farmerName,
        dateOfBirth,
        contactNumber,
        aadharID,
        voterID,
        village,
        gramPanchayat,
        block,
        district,
        state,
        country,
        pin
      } = req.body;

      // Check for existing farmers with the same contactNumber, aadharID, or voterID
      const existingFarmer = await PrimaryData.findOne({
        $or: [
          { contactNumber },
          { aadharID },
          { voterID }
        ]
      });

      if (existingFarmer) {
        return res.status(400).json({
          success: false,
          error: 'Farmer with the provided contact number, Aadhar, or Voter ID already exists.',
        });
      }

      const primaryData = new PrimaryData({
        farmerID,
        farmerName,
        dateOfBirth,
        contactNumber,
        aadharID,
        voterID,
        village,
        gramPanchayat,
        block,
        district,
        state,
        country,
        pin
      });

      await primaryData.save();
      res.status(200).json({ success: true, message: 'Primary data saved successfully' });
    } catch (error) {
      console.error('Error saving primary data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update primary data route
  router.put('/primary/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await PrimaryData.findByIdAndUpdate(id, updatedData, { new: true });
      if (!result) {
        return res.status(404).json({ success: false, message: 'Primary data not found' });
      }

      res.status(200).json({ success: true, message: 'Primary data updated successfully', data: result });
    } catch (error) {
      console.error('Error updating primary data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Register secondary data route
  router.post('/secondary', upload.fields([
    { name: 'farmerPhoto', maxCount: 1 },
    { name: 'aadharScan', maxCount: 1 },
    { name: 'voterScan', maxCount: 1 },
  ]), async (req, res) => {
    try {
      // Check if the necessary files are present
      if (!req.files || !req.files.farmerPhoto || !req.files.aadharScan || !req.files.voterScan) {
        throw new Error('Missing files in the request');
      }
  
      // Extract the farmer ID and land details
      const farmerID = req.body.farmerID;
      const landDetails = {
        landInAcres: parseFloat(req.body.landDetails.landInAcres) || null,
        landInBigha: parseFloat(req.body.landDetails.landInBigha) || null,
        waterSourceType: req.body.landDetails.waterSourceType,
        distanceFromWaterSource: parseFloat(req.body.landDetails.distanceFromWaterSource) || null,
      };
  
      // Handle file uploads via FTP
      const farmerPhoto = `farmerPhoto-${Date.now()}${path.extname(req.files.farmerPhoto[0].originalname)}`;
      await uploadFileToFTP(req.files.farmerPhoto[0].buffer, farmerPhoto); // Upload to FTP
  
      const aadharScan = `aadharScan-${Date.now()}${path.extname(req.files.aadharScan[0].originalname)}`;
      await uploadFileToFTP(req.files.aadharScan[0].buffer, aadharScan); // Upload to FTP
  
      const voterScan = `voterScan-${Date.now()}${path.extname(req.files.voterScan[0].originalname)}`;
      await uploadFileToFTP(req.files.voterScan[0].buffer, voterScan); // Upload to FTP
  
      // Now that the files have been uploaded to the FTP server, save the document URLs in MongoDB
      const secondaryData = new SecondaryData({
        farmerID,
        landDetails,
        documents: {
          farmerPhoto,  // Save the file name that was uploaded to FTP
          aadharScan,
          voterScan,
        },
      });
  
      await secondaryData.save();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving secondary data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  //login routes
  router.post('/login', async (req, res) => {
    try {
      const { farmerID, contactNumber } = req.body;
  
      // Validate input
      if (!farmerID || !contactNumber) {
        return res.status(400).json({ success: false, error: 'Farmer ID and contact number are required.' });
      }
  
      // Find farmer in the primary data collection
      const farmer = await PrimaryData.findOne({ farmerID }); // Use PrimaryData model here
      if (!farmer) {
        return res.status(404).json({ success: false, error: 'Farmer not found.' });
      }
  
      // Check if the contact number matches
      if (farmer.contactNumber !== contactNumber) {
        return res.status(400).json({ success: false, error: 'Invalid contact number.' });
      }
  
      // Successful login
      res.json({ success: true, message: 'Login successful!' });
  
    } catch (error) {
      console.error('Error during login:', error.stack); // Log full error stack for debugging
      res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
    }
  });

  return router;
};

module.exports = registerRoutes;
