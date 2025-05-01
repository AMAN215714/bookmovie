// src/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.post('http://localhost:8080/users/logout')
      .then(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
        navigate('/login'); // Redirect to login page
      })
      .catch(error => console.error('Logout error:', error));
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
