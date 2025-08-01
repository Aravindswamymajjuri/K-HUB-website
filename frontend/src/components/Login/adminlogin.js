// src/pages/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './adminlogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate(); // You may keep this for other navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        setOtpSent(true);
      } else {
        setError('Invalid email or password!');
      }
    } catch (error) {
      setError('Login failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('loginTimestamp', Date.now().toString());
        alert('Login successful!');
        // Force full reload so that the auth state updates for the whole app
        window.location.href = '/admin';
        return;
      } else {
        setError('Invalid OTP!');
      }
    } catch (error) {
      setError(`OTP verification failed! ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP if needed
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        alert('OTP resent successfully!');
      } else {
        setError('Failed to resend OTP!');
      }
    } catch (error) {
      setError('Failed to resend OTP! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <p className="error-message">{error}</p>}

      {!otpSent ? (
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <div>
          <p>An OTP has been sent to {email}</p>
          <form onSubmit={handleOtpVerification} className="otp-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                disabled={loading}
                maxLength="6"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
          <button 
            type="button" 
            onClick={handleResendOtp} 
            disabled={loading}
            className="resend-btn"
          >
            Resend OTP
          </button>
          <button 
            type="button" 
            onClick={() => setOtpSent(false)}
            className="back-btn"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
