import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEye, FaEyeSlash, FaLock, FaUserShield } from 'react-icons/fa';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if already logged in as admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/admins/check-auth',
          { withCredentials: true }
        );
        
        if (response.data.loggedIn && response.data.admin?.role === 'ADMIN') {
          navigate('/admin');
        }
      } catch (error) {
        console.log("Not logged in as admin");
      }
    };
    
    checkAdminAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/admins/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        if (response.data.role === 'ADMIN') {
          const from = location.state?.from?.pathname || '/admin';
          navigate(from, { replace: true });
          window.location.reload(); // Reload to update auth state globally
        } else {
          await axios.post(
            'http://localhost:8080/admins/logout',
            {},
            { withCredentials: true }
          );
          setError('Access restricted to admin only');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials or unauthorized access!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light  mt-5">
      <div className="card shadow-lg p-4 rounded-3 border-primary" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <FaLock size={40} className="text-primary mb-2" />
          <h4 className="fw-bold">Admin Portal</h4>
          <small className="text-muted">Restricted access</small>
        </div>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Admin Email</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUserShield />
              </span>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-3" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <Link to="/forgot-password" className="text-decoration-none">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;