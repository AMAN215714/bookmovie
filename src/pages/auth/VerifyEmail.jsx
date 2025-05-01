import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerifyEmail = () => {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleVerify = () => {
    try {
      const queryParams = new URL(link).searchParams;
      const token = queryParams.get('token');

      if (!token) {
        setMessage('Invalid verification link!');
        return;
      }

      axios.get(`http://localhost:8080/verify?token=${token}`)
        .then((response) => {
          setMessage(response.data);
          setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 sec
        })
        .catch((error) => setMessage(error.response?.data || 'Verification failed!'));
    } catch (error) {
      setMessage('Invalid link format!');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-90 bg-light m-5">
      <div className="card shadow p-4 text-center" style={{ width: '400px' }}>
        <h4 className="mb-3">Email Verification</h4>
        <input 
          type="text" 
          className="form-control mb-3" 
          placeholder="Enter verification link" 
          value={link} 
          onChange={(e) => setLink(e.target.value)}
        />
        <button className="btn btn-primary w-100" onClick={handleVerify}>Verify</button>
        
        {message && <p className="mt-3 text-dark">{message}</p>}
        
        {/* Back to Register Button */}
        <button className="btn btn-link mt-2" onClick={() => navigate('/register')}>
          Back to Register
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
