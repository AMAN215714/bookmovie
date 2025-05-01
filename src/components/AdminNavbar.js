import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaUserCircle, 
  FaMapMarkerAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import "../css/Navbar.css";
import logo from "../assets/image.png";
import axios from 'axios';

const AdminNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  // Check admin authentication status
  const checkAdminAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8080/admins/check-auth', {
        withCredentials: true
      });
      
      if (response.data.loggedIn && response.data.admin?.role === 'ADMIN') {
        setIsAdminLoggedIn(true);
        setAdminData(response.data.admin);
      } else {
        setIsAdminLoggedIn(false);
        setAdminData(null);
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      setIsAdminLoggedIn(false);
      setAdminData(null);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await axios.post('http://localhost:8080/admins/logout', {}, {
        withCredentials: true
      });
      setIsAdminLoggedIn(false);
      setAdminData(null);
      setMobileMenuOpen(false);
      navigate('/admin/login');
    } catch (error) {
      console.error('Admin logout failed:', error);
    }
  };

  const adminNavItems = ['Dashboard', 'Movies', 'Users', 'Bookings', 'Reports'];

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        {/* Logo and Mobile Menu Button */}
        <div className="navbar-brand">
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <Link to="/admin" className="logo-link">
            <img src={logo} alt="Admin Panel Logo" className="logo-image" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {/* Main Nav Items */}
          <div className="nav-items">
            {adminNavItems.map(item => (
              <Link 
                key={item}
                // to={`/admin/${item.toLowerCase()}`}
                className={`nav-item ${activeTab === item ? 'active' : ''}`}
                onClick={() => setActiveTab(item)}
              >
                {item}
                {activeTab === item && <div className="active-indicator"></div>}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for movies, users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* Admin Controls */}
          <div className="user-controls">
            {isAdminLoggedIn ? (
              <div className="user-profile">
                <button 
                  className="control-button" 
                  // onClick={() => navigate('/admin')}
                  title={adminData?.name || 'Admin Profile'}
                >
                  <FaUserCircle className="profile-icon" />
                  <span className="profile-name">
                    {adminData?.name || 'Admin'}
                  </span>
                </button>
                <button className="signin-button" onClick={handleAdminLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="signin-button"
                onClick={() => navigate('/admin/login')}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {adminNavItems.map(item => (
              <Link 
                key={item}
                to={`/admin/${item.toLowerCase()}`}
                className={`mobile-nav-item ${activeTab === item ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item);
                  setMobileMenuOpen(false);
                }}
              >
                {item}
              </Link>
            ))}
            
            <div className="mobile-auth-buttons">
              {isAdminLoggedIn ? (
                <>
                  <Link 
                    to="/admin/profile"
                    className="signin-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    className="register-button"
                    onClick={handleAdminLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className="signin-button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/admin/login');
                  }}
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;