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

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Check authentication status from backend
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/users/check-auth', {
        withCredentials: true
      });
      
      if (response.data.loggedIn) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  // Check auth status on component mount and when mobile menu opens
  useEffect(() => {
    checkAuthStatus();
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/users/logout', {}, {
        withCredentials: true
      });
      setIsLoggedIn(false);
      setUserData(null);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = ['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'];

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
          
          <Link to="/" className="logo-link">
            <img src={logo} alt="BookMyShow Logo" className="logo-image" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {/* Location Selector */}
          <div className="location-selector">
            <div className="location-content">
              <FaMapMarkerAlt className="location-icon" />
              <span className="location-text">Mumbai</span>
            </div>
          </div>

          {/* Main Nav Items */}
          <div className="nav-items">
            {navItems.map(item => (
              <Link 
                key={item}
                // to={`/${item.toLowerCase()}`}
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
              placeholder="Search for movies, events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* User Controls - Show different buttons based on backend auth status */}
          <div className="user-controls">
            {isLoggedIn ? (
              <div className="user-profile">
                <button 
                  className="control-button" 
                  onClick={() => navigate('/profile')}
                  title={userData?.name || 'Profile'}
                >
                  <FaUserCircle className="profile-icon" />
                  <span className="profile-name">
      {userData?.name || 'Profile'}
    </span>
                </button>
                <button className="signin-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button 
                className="signin-button"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {navItems.map(item => (
              <Link 
                key={item}
                to={`/${item.toLowerCase()}`}
                className={`mobile-nav-item ${activeTab === item ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item);
                  setMobileMenuOpen(false);
                }}
              >
                {item}
              </Link>
            ))}
            
            {/* Mobile auth buttons - Show based on backend auth status */}
            <div className="mobile-auth-buttons">
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/profile"
                    className="signin-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    className="register-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="signin-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="register-button"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;