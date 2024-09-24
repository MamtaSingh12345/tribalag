import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const Login = () => {
  const [farmerID, setFarmerID] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:4000/register/login', {
        farmerID,
        contactNumber,
      });

      if (response.data.success) {
        // Handle successful login (e.g., redirect to dashboard)
        alert('Login successful!');
        navigate('/farmer-dashboard'); // Redirect to Farmer Dashboard
      } else {
        setErrorMessage(response.data.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Error during login. Please try again.');
    }
  };

  return (
    <section className="vh-100" style={{ backgroundColor: '#ade4b0' }}>
      <div className="container py-4 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-10">
            <div className="card" style={{ borderRadius: '1rem', height: '100vh' }}>
              <div className="row g-0">
                <div className="col-md-6 col-lg-5 d-none d-md-block">
                  <img
                    src="https://wallpaperaccess.com/full/1598225.jpg"
                    alt="login form"
                    className="img-fluid"
                    style={{ borderRadius: '1rem 0 0 1rem' }}
                  />
                </div>
                <div className="col-md-6 col-lg-7 d-flex align-items-center" style={{ height: '100vh' }}>
                  <div className="card-body p-4 p-lg-5 text-black">
                    <form onSubmit={handleLogin}>
                      <div className="d-flex align-items-center mb-3 pb-1">
                        <span className="h5 fw-bold mb-0">Fruit Tree Planting Lifecycle Management Solution</span>
                      </div>
                      <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>
                        Sign into your account
                      </h5>
                      <div className="form-outline mb-4">
                        <input
                          type="text"
                          id="farmerID"
                          className="form-control form-control-lg"
                          value={farmerID}
                          onChange={(e) => setFarmerID(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="farmerID">
                          Farmer ID
                        </label>
                      </div>
                      <div className="form-outline mb-4">
                        <input
                          type="text"
                          id="contactNumber"
                          className="form-control form-control-lg"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          required
                        />
                        <label className="form-label" htmlFor="contactNumber">
                          Phone Number
                        </label>
                      </div>
                      {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                          {errorMessage}
                        </div>
                      )}
                      <div className="pt-1 mb-4">
                        <button className="btn btn-dark btn-lg btn-block" type="submit">
                          Login
                        </button>
                      </div>
                      <a className="small text-muted" href="#!">
                        Forgot password?
                      </a>
                      <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#393f81' }}>
                          Register here
                        </Link>
                      </p>
                      <a href="#!" className="small text-muted">
                        Terms of use.
                      </a>
                      <a href="#!" className="small text-muted">
                        Privacy policy
                      </a>
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

export default Login;
