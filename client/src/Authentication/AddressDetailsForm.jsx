import React from 'react';

const AddressDetailsForm = ({
  addressData,
  handleAddressChange,
  handleNext,
  handlePrevious,
  errors = {},
}) => {
  const {
    village = '',
    gramPanchayat = '',
    block = '',
    district = '',
    state = '',
    country = '',
    pin = ''
  } = addressData || {};

  return (
    <div>
      <h4 className="mb-3">Address Details</h4>
      <div className="mb-3">
        <label htmlFor="village" className="form-label">Village</label>
        <input
          type="text"
          className={`form-control ${errors.village ? 'is-invalid' : ''}`}
          id="village"
          value={village}
          onChange={handleAddressChange}
        />
        {errors.village && <div className="invalid-feedback">{errors.village}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="gramPanchayat" className="form-label">Gram Panchayat</label>
        <input
          type="text"
          className={`form-control ${errors.gramPanchayat ? 'is-invalid' : ''}`}
          id="gramPanchayat"
          value={gramPanchayat}
          onChange={handleAddressChange}
        />
        {errors.gramPanchayat && <div className="invalid-feedback">{errors.gramPanchayat}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="block" className="form-label">Block</label>
        <input
          type="text"
          className={`form-control ${errors.block ? 'is-invalid' : ''}`}
          id="block"
          value={block}
          onChange={handleAddressChange}
        />
        {errors.block && <div className="invalid-feedback">{errors.block}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="district" className="form-label">District</label>
        <input
          type="text"
          className={`form-control ${errors.district ? 'is-invalid' : ''}`}
          id="district"
          value={district}
          onChange={handleAddressChange}
        />
        {errors.district && <div className="invalid-feedback">{errors.district}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="state" className="form-label">State</label>
        <input
          type="text"
          className={`form-control ${errors.state ? 'is-invalid' : ''}`}
          id="state"
          value={state}
          onChange={handleAddressChange}
        />
        {errors.state && <div className="invalid-feedback">{errors.state}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="country" className="form-label">Country</label>
        <input
          type="text"
          className={`form-control ${errors.country ? 'is-invalid' : ''}`}
          id="country"
          value={country}
          onChange={handleAddressChange}
        />
        {errors.country && <div className="invalid-feedback">{errors.country}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="pin" className="form-label">PIN Code</label>
        <input
          type="text"
          className={`form-control ${errors.pin ? 'is-invalid' : ''}`}
          id="pin"
          value={pin}
          onChange={handleAddressChange}
        />
        {errors.pin && <div className="invalid-feedback">{errors.pin}</div>}
      </div>
      <button className="btn btn-secondary me-2" type="button" onClick={handlePrevious}>
        Previous
      </button>
      <button className="btn btn-primary" type="button" onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default AddressDetailsForm;
