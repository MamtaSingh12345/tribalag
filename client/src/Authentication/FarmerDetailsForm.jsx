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
  setOtpVerified, // Passed from parent
  isDuplicate,      // Passed from parent to handle duplicate state
  errors = {},      // Errors object for validation messages
  setIsDuplicate, 
}) => {
  const [showModal, setShowModal] = useState(false); // Modal control state
  const [resendCooldown, setResendCooldown] = useState(30); // Cooldown for resend OTP
  const [resendDisabled, setResendDisabled] = useState(true); // Resend button state

  // Start countdown for Resend OTP
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

      return () => clearInterval(interval); // Cleanup the interval on unmount
    }
  }, [otpSent]);

  // Handle resend OTP logic
  const handleResendOTP = async () => {
    try {
      await handleSendOTP(); // Send a new OTP
      setOtp(''); // Clear OTP input field
      setOtpVerified(false); // Reset OTP verification state
      setResendDisabled(true); // Disable Resend OTP
      setResendCooldown(30); // Reset cooldown

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Farmer Details</h4>

      {/* Farmer Name */}
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

      {/* Date of Birth */}
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

      {/* Contact Number */}
      <div className="mb-3">
        <label htmlFor="contactNumber" className="form-label">Contact Number</label>
        <input
          type="text"
          className={`form-control ${errors.contactNumber ? 'is-invalid' : ''}`}
          id="contactNumber"
          name="contactNumber"
          placeholder='+91XXXXXXXXXX'
          value={formData.contactNumber}
          onChange={handlePrimaryChange}
        />
        {errors.contactNumber && <div className="invalid-feedback">{errors.contactNumber}</div>}
        
        {/* Container for Send OTP and Resend OTP */}
        <div className="d-flex mt-2">
          <button
            className="btn btn-secondary"
            onClick={handleSendOTP}
            disabled={otpSent || !formData.contactNumber}
          >
            {otpSent ? 'OTP Sent' : 'Send OTP'}
          </button>

          {/* Resend OTP Button */}
          <button
            type="button"
            className="btn btn-warning ms-2"
            onClick={handleResendOTP}
            disabled={resendDisabled}
          >
            Resend OTP {resendDisabled && `(${resendCooldown}s)`}
          </button>
        </div>
      </div>
      {errors.otp && <div className="alert alert-danger mt-2">{errors.otp}</div>}

      {/* Aadhar ID */}
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

      {/* Voter ID */}
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

      {/* Verify Button */}
      <Button
        className="btn btn-primary"
        onClick={() => setShowModal(true)} // Show the modal when clicking "Verify"
        disabled={!otpSent}
      >
        Verify
      </Button>

      {/* Next Button */}
      <Button
        type="button"
        className="btn btn-primary ms-2"
        onClick={handleNext} 
        disabled={!otpVerified || isDuplicate}  // Disable if OTP not verified or duplicates exist
      >
        Next
      </Button>

      {/* Error Message Display */}
      {isDuplicate && (
        <div className="alert alert-danger mt-3">
          One or more fields contain duplicate data. Please fix the errors above.
        </div>
      )}

      {errors.form && <div className="alert alert-danger">{errors.form}</div>}

      {/* OTP Verification Modal */}
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
                await handleVerifyOTP(); // Ensure handleVerifyOTP is async
                setShowModal(false); // Close modal after success
              } catch (error) {
                console.error("Error verifying OTP:", error);
                setOtpVerified(false); // Keep OTP verification state false
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
