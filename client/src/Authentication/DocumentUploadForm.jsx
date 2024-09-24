import React, { useState} from 'react';

const DocumentUploadForm = ({ handleFileChange, handleNext, handlePrevious, errors }) => {
  const [files, setFiles] = useState({
    farmerPhoto: null,
    aadharScan: null,
    voterScan: null,
  });

  // Disable "Next" button if required fields are missing
  const isNextDisabled = !files.farmerPhoto || !files.aadharScan;

  // Handle file input changes and validation
  const handleFileInputChange = (e) => {
    const { id, files } = e.target;
    const selectedFile = files[0];

    setFiles((prevFiles) => ({
      ...prevFiles,
      [id]: selectedFile,
    }));

    handleFileChange(e); // Call handleFileChange passed as a prop

    // Call validation logic based on file input
    if (id === 'farmerPhoto' && !selectedFile) {
      errors.farmerPhoto = 'Farmer photo is required';
    } else if (id === 'aadharScan' && !selectedFile) {
      errors.aadharScan = 'Aadhar scan is required';
    } else {
      errors[id] = ''; // Clear error if file is valid
    }
  };

  return (
    <div>
      <div className="doc-form">
        <h4 className="mb-3">Upload Documents</h4>

        <div className="mb-3">
          <label htmlFor="farmerPhoto" className="form-label">
            Farmer’s Passport-Size Photo
          </label>
          <input
            type="file"
            className={`form-control ${errors.farmerPhoto ? 'is-invalid' : ''}`}
            id="farmerPhoto"
            onChange={handleFileInputChange}
            required
          />
          {errors.farmerPhoto && <div className="invalid-feedback">{errors.farmerPhoto}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="aadharScan" className="form-label">Aadhar ID Scan</label>
          <input
            type="file"
            className={`form-control ${errors.aadharScan ? 'is-invalid' : ''}`}
            id="aadharScan"
            onChange={handleFileInputChange}
            required
          />
          {errors.aadharScan && <div className="invalid-feedback">{errors.aadharScan}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="voterScan" className="form-label">Voter ID Scan</label>
          <input
            type="file"
            className="form-control"
            id="voterScan"
            onChange={handleFileInputChange}
          />
        </div>

        <button className="btn btn-secondary me-2" type="button" onClick={handlePrevious}>
          Previous
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled} // Disable the "Next" button if validation fails
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
