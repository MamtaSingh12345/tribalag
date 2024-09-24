import React, { useState } from 'react';

const LandDetailsForm = ({ formData, handleLandDetailsChange, handleNext, handlePrevious }) => {
  const [landInAcres, setLandInAcres] = useState(formData.landInAcres || '');
  const [landInBigha, setLandInBigha] = useState(formData.landInBigha || '');

  const handleLandAcresChange = (e) => {
    const acres = e.target.value;
    setLandInAcres(acres);
    setLandInBigha(acres ? convertAcresToBigha(acres) : '');
    handleLandDetailsChange({ target: { id: 'landInAcres', value: acres } });
  };

  const handleLandBighaChange = (e) => {
    const bigha = e.target.value;
    setLandInBigha(bigha);
    setLandInAcres(bigha ? convertBighaToAcres(bigha) : '');
    handleLandDetailsChange({ target: { id: 'landInBigha', value: bigha } });
  };

  const convertAcresToBigha = (acres) => {
    return (acres * 2.47105).toFixed(2); // 1 acre = 2.47105 bigha
  };

  const convertBighaToAcres = (bigha) => {
    return (bigha / 2.47105).toFixed(2); // 1 bigha = 0.404686 acre
  };

  return (
    <div>
      <h4 className="mb-3">Land Details (Optional)</h4>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="landInAcres" className="form-label">Land Size (Acres)</label>
          <input
            type="text"
            className="form-control"
            id="landInAcres"
            value={landInAcres}
            onChange={handleLandAcresChange}
          />
        </div>
        <div className="col">
          <label htmlFor="landInBigha" className="form-label">Land Size (Bigha)</label>
          <input
            type="text"
            className="form-control"
            id="landInBigha"
            value={landInBigha}
            onChange={handleLandBighaChange}
          />
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="waterSourceType" className="form-label">Water Source Type</label>
        <input
          type="text"
          className="form-control"
          id="waterSourceType"
          value={formData.waterSourceType || ''}
          onChange={handleLandDetailsChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="distanceFromWaterSource" className="form-label">Distance from Water Source</label>
        <input
          type="text"
          className="form-control"
          id="distanceFromWaterSource"
          value={formData.distanceFromWaterSource || ''}
          onChange={handleLandDetailsChange}
        />
      </div>
      <button type="button" className="btn btn-secondary me-2" onClick={handlePrevious}>Previous</button>
      <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
    </div>
  );
};

export default LandDetailsForm;
