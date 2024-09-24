import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FarmerDetailsForm from './FarmerDetailsForm';
import AddressDetailsForm from './AddressDetailsForm';
import LandDetailsForm from './LandDetailsForm';
import DocumentUploadForm from './DocumentUploadForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 


const RegisterFarmer = () => {
  const [primaryData, setPrimaryData] = useState({
    farmerName: '',
    dateOfBirth: '',
    contactNumber: '',
    aadharID: '',
    voterID: '',
    village: '',
    gramPanchayat: '',
    block: '',
    district: '',
    state: '',
    country: '',
    pin: '',
  });

  const [secondaryData, setSecondaryData] = useState({
    landDetails: {
      landInAcres: '', // Updated field for land size in acres
      landInBigha: '', // New field for land size in bigha
      waterSourceType: '',
      distanceFromWaterSource: '',
    },
    documents: {
      farmerPhoto: null,
      aadharScan: null,
      voterScan: null,
    },
  });

  const [formData, setFormData] = useState({
    contactNumber: '',
    aadharID: '',
    voterID: '',
  });

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // const checkExists = async (type, value) => {
  //   try {
  //     const response = await axios.post('http://localhost:4000/register/check-existence', { type, value });
  //     return response.data.exists;
  //   } catch (error) {
  //     console.error(`Error checking ${type}:`, error);
  //     return false;
  //   }
  //  };

  
    // Validation function for Farmer Details
    const validateFarmerDetails = async () => {
      const newErrors = {};
    
      // Basic field validations
      if (!primaryData.farmerName) newErrors.farmerName = 'Farmer Name is required';
      if (!primaryData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
  
      if (!primaryData.contactNumber) {
          newErrors.contactNumber = 'Contact Number is required';
      } 
  
      if (!primaryData.aadharID) {
          newErrors.aadharID = 'Aadhar ID is required';
      } 
  
      if (!primaryData.voterID) {
          newErrors.voterID = 'Voter ID is required';
      } 
    
      // Update errors state in one go
      setErrors(newErrors);
    
      // Return true if no errors exist, otherwise false
      return Object.keys(newErrors).length === 0;
  };
  
     // Validation for Address Details
  const validateAddressDetails = () => {
    const newErrors = {};

    if (!primaryData.village) newErrors.village = 'Village is required';
    if (!primaryData.district) newErrors.district = 'District is required';
    if (!primaryData.pin || primaryData.pin.length !== 6) newErrors.pin = 'Valid 6-digit PIN is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Validation for Document Upload
  const validateDocumentUpload = () => {
    const newErrors = {};

    if (!secondaryData.documents.farmerPhoto) newErrors.farmerPhoto = 'Farmer photo is required';
    if (!secondaryData.documents.aadharScan) newErrors.aadharScan = 'Aadhar scan is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle primary data changes
  const handlePrimaryChange = (e) => {
    const { id, value } = e.target;
    setPrimaryData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle secondary data changes for land details
  const handleLandDetailsChange = (e) => {
    const { id, value } = e.target;
    setSecondaryData((prevData) => ({
      ...prevData,
      landDetails: {
        ...prevData.landDetails,
        [id]: value,
      },
    }));
  };

  // Handle file changes for documents
  const handleFileChange = (e) => {
    const { id, files } = e.target;
    setSecondaryData((prevData) => ({
      ...prevData,
      documents: {
        ...prevData.documents,
        [id]: files[0],
      },
    }));
  };

  //function for sending otp
  const handleSendOTP = async () => {
    // Logic to send the OTP (e.g., make API call)
    try {
      const response = await axios.post('http://localhost:4000/register/send-otp', {
        contactNumber: primaryData.contactNumber,
      });
  
      if (response.data.success) {
        setOtpSent(true); // Mark OTP as sent
        alert('OTP sent to your contact number.');
      } else {
        alert('Failed to send OTP: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    }
  };
  
  
  //function for verify otp
  const handleVerifyOTP = async () => {
    if (!primaryData.contactNumber) {
      alert('Please enter your contact number.');
      return;
    }
    if (!otp) {
      alert('Please enter the OTP.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:4000/register/verify-otp', {
        contactNumber: primaryData.contactNumber,
        otp,
      });
  
      if (response.data.success) {
        setOtpVerified(true);
        alert('OTP verified successfully');
      } else {
        alert('Invalid OTP: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
  
      if (error.response) {
        alert('Error: ' + (error.response.data.message || 'Error verifying OTP'));
      } else {
        alert('Error verifying OTP. Please try again.');
      }
    }
  };
  
  //handle the next button
  const handleNext = async () => {
    let isValid = false;
  
    // Perform validation based on the current step
    switch (currentStep) {
      case 1:
        // Step 1: Validate farmer details and check for duplicates
        isValid = await validateFarmerDetails();
  
        // If farmer details are valid, check for duplicates in MongoDB
        if (isValid) {
          try {
            const response = await axios.post('http://localhost:4000/register/check-existence', formData); // Ensure formData has the correct data
  
            if (response.data.success) {
              const { contactNumberExists, aadharIDExists, voterIDExists } = response.data;
  
              // Check if any of the fields are duplicates
              if (contactNumberExists || aadharIDExists || voterIDExists) {
                setIsDuplicate(true);
                setError('Duplicate data found. Please check your entries.');
                isValid = false; // Prevent moving to the next step
              } else {
                setIsDuplicate(false);
                setError(null); // Clear error if no duplicates are found
              }
            }
          } catch (error) {
            setError('Error checking existence. Please try again.');
            console.error('Error during existence check:', error);
            isValid = false; // Prevent moving to the next step due to an error
          }
        }
        break;
  
      case 2:
        isValid = validateAddressDetails(); // Step 2: Validate address details
        break;
  
      case 3:
        isValid = validateAddressDetails(); // Step 3: Validate land details (changed from address)
        break;
  
      case 4:
        isValid = validateDocumentUpload(); // Step 4: Validate document upload
        break;
  
      default:
        isValid = true;
    }
  
    // Move to the next step if everything is valid
    if (isValid) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };
  

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      alert('Please verify OTP before submitting');
      return;
    }

    const farmerID = uuidv4();

    const primarySubmissionData = {
      farmerID,
      ...primaryData,
    };

    const secondarySubmissionData = new FormData();
    secondarySubmissionData.append('farmerID', farmerID);
    Object.entries(secondaryData.landDetails).forEach(([key, value]) => {
      secondarySubmissionData.append(`landDetails.${key}`, value);
    });
    secondarySubmissionData.append('farmerPhoto', secondaryData.documents.farmerPhoto);
    secondarySubmissionData.append('aadharScan', secondaryData.documents.aadharScan);
    secondarySubmissionData.append('voterScan', secondaryData.documents.voterScan);

    try {
      await axios.post('http://localhost:4000/register/primary', primarySubmissionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await axios.post('http://localhost:4000/register/secondary', secondarySubmissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(`Registration successful! Your Farmer ID is: ${farmerID}`);

    // Redirect to the login page
    navigate('/login');

    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <section className="vh" style={{ backgroundColor: '#ade4b0' }}>
      <div className="container py-4 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-12 col-lg-10">
            <div className="card" style={{ borderRadius: '1rem' }}>
              <div className="row g-0">
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
                  <img
                    src="https://wallpaperaccess.com/full/1598225.jpg"
                    alt="register form"
                    className="img-fluid"
                    style={{ borderRadius: '1rem 0 0 1rem', height: '100%' }}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="card-body p-4 p-lg-5 text-black">
                    <form onSubmit={handleFormSubmit}>
                      {currentStep === 1 && (
                        <FarmerDetailsForm
                          formData={primaryData}
                          handlePrimaryChange={handlePrimaryChange}
                          handleSendOTP={handleSendOTP}
                          handleVerifyOTP={handleVerifyOTP}
                          handleNext={handleNext}
                          otpSent={otpSent}
                          otp={otp}
                          setOtp={setOtp}
                          otpVerified={otpVerified}
                          setOtpVerified={setOtpVerified} // Pass the state updater
                          errors={errors}

                        />
                      )}
                      {currentStep === 2 && (
                        <AddressDetailsForm
                          addressData={primaryData} // Pass addressData
                          handleAddressChange={handlePrimaryChange}
                          handleNext={handleNext}
                          handlePrevious={handlePrevious}
                          errors={errors}
                        />
                      )}
                      {currentStep === 3 && (
                        <LandDetailsForm
                          formData={secondaryData.landDetails}
                          handleLandDetailsChange={handleLandDetailsChange}
                          handleNext={handleNext}
                          handlePrevious={handlePrevious}
                        />
                      )}
                      {currentStep === 4 && (
                        <DocumentUploadForm
                          formData={secondaryData.documents}
                          handleFileChange={handleFileChange}
                          handleNext={handleNext}
                          errors={errors}
                        />
                      )}
                      {currentStep === 5 && (
                        <div className="d-flex justify-content-center">
                          <button type="submit" className="btn btn-primary btn-lg">
                            Submit Registration
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterFarmer;
