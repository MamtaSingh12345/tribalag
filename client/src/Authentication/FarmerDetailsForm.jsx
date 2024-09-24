import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const FarmerDetailsForm = ({
  formData,
  handlePrimaryChange,
  handleSendOTP,
  handleVerifyOTP,
  handleNext,
  otpSent,
  otp,
  setOtp,
  otpVerified,
  setOtpVerified, // If handled in the parent component, ensure it's passed
  errors = {},    // Add errors prop for validation messages

}) => {
  const [showModal, setShowModal] = useState(false); // Modal control state
  const [resendCooldown, setResendCooldown] = useState(30); // Cooldown time for Resend OTP
  const [resendDisabled, setResendDisabled] = useState(true); // Resend button disabled state

  // Start the countdown for resend OTP when OTP is sent
  useEffect(() => {
    if (otpSent) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false); // Enable resend button after cooldown
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Reduce countdown by 1 every second

      return () => clearInterval(interval); // Cleanup the interval on component unmount
    }
  }, [otpSent]);

  //handle the resend otp button
  const handleResendOTP = async () => {
    try {
      // Send a new OTP
      await handleSendOTP(); // This should only send the OTP
  
      // Clear the OTP input field
      setOtp(''); 
  
      // Mark OTP as unverified
      setOtpVerified(false); 
  
      // Disable Resend OTP until cooldown ends
      setResendDisabled(true); 
      
      // Reset cooldown to 30 seconds
      setResendCooldown(30); 
  
      // Start cooldown timer
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false); // Re-enable button when cooldown is over
            return 0; // Reset cooldown
          }
          return prev - 1; // Decrease cooldown
        });
      }, 1000); // Update every second
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };
  
  


  return (
    <div>
      <h4 className="mb-3">Farmer Details</h4>
      
      <div className="mb-3">
        <label htmlFor="farmerName" className="form-label">Farmer Name</label>
        <input
          type="text"
          className={`form-control ${errors.farmerName ? 'is-invalid' : ''}`}
          id="farmerName"
          name="farmerName"
          value={formData.farmerName}
          onChange={handlePrimaryChange}
        />
        {errors.farmerName && <div className="invalid-feedback">{errors.farmerName}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
        <input
          type="date"
          className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handlePrimaryChange}
        />
        {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="contactNumber" className="form-label">Contact Number</label>
        <input
          type="text"
          className={`form-control ${errors.contactNumber ? 'is-invalid' : ''}`}
          id="contactNumber"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handlePrimaryChange}
        />
        {errors.contactNumber && <div className="invalid-feedback">{errors.contactNumber}</div>}
        
         {/* Container for both Send OTP and Resend OTP buttons */}
         <div className="d-flex mt-2">
          <button
            className="btn btn-secondary"
            onClick={handleSendOTP}
            disabled={otpSent || !formData.contactNumber}
          >
            {otpSent ? 'OTP Sent' : 'Send OTP'}
          </button>

          {/* Resend OTP button beside Send OTP */}
          <button
            type="button"
            className="btn btn-warning ms-2" // "ms-2" adds margin between buttons
            onClick={handleResendOTP}
            disabled={resendDisabled}
          >
            Resend OTP {resendDisabled && `(${resendCooldown}s)`}
          </button>
        </div>
      </div>

      
      <div className="mb-3">
        <label htmlFor="aadharID" className="form-label">Aadhar ID</label>
        <input
          type="text"
          className={`form-control ${errors.aadharID ? 'is-invalid' : ''}`}
          id="aadharID"
          name="aadharID"
          value={formData.aadharID}
          onChange={handlePrimaryChange}
        />
        {errors.aadharID && <div className="invalid-feedback">{errors.aadharID}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="voterID" className="form-label">Voter ID</label>
        <input
          type="text"
          className={`form-control ${errors.voterID ? 'is-invalid' : ''}`}
          id="voterID"
          name="voterID"
          value={formData.voterID}
          onChange={handlePrimaryChange}
        />
        {errors.voterID && <div className="invalid-feedback">{errors.voterID}</div>}
      </div>
      
      <Button
        className="btn btn-primary"
        onClick={() => setShowModal(true)} // Show the modal when clicking "Verify"
        disabled={!otpSent}
      >
        Verify
      </Button>
      
      <Button
        className="btn btn-primary ms-2" // Add margin to separate the buttons
        onClick={handleNext} // Replace with actual next step handler
        disabled={!otpVerified}
      >
        Next
      </Button>

      {/* Modal for OTP Verification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={async () => {
              try {
                await handleVerifyOTP(); // Ensure handleVerifyOTP is an async function
                setOtpVerified(true); // Set OTP as verified if the API call is successful
                setShowModal(false); // Close the modal
              } catch (error) {
                console.error("Error verifying OTP:", error);
                setOtpVerified(false); // Ensure the button remains disabled on failure
              }
            }}
          >
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FarmerDetailsForm;
