import React, { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle,
  FaUser, 
  FaEnvelope, 
  FaTicketAlt,
  FaFilm,
  FaChair,
  FaSearch
} from "react-icons/fa";
import '../../css/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('http://localhost:8080/users/check-auth', {
          credentials: 'include'
        });
        
        const authData = await authResponse.json();
        
        if (!authData.loggedIn) {
          window.location.href = '/login';
          return;
        }
        
        // Set user data
        setUser(authData.user);
        
        // Fetch bookings for this user
        const bookingsResponse = await fetch(
          `http://localhost:8080/bookings/user/${authData.user.id}`, 
          { credentials: 'include' }
        );
        
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const statusIcons = {
    CONFIRMED: <FaCheckCircle className="confirmed-icon" />,
    PENDING: <FaExclamationTriangle className="pending-icon" />,
    CANCELLED: <FaTimesCircle className="cancelled-icon" />
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusText = (status) => {
    if (typeof status === 'number') {
      switch(status) {
        case 0: return 'PENDING';
        case 1: return 'CONFIRMED';
        case 2: return 'CANCELLED';
        default: return 'UNKNOWN';
      }
    }
    return status;
  };

  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = booking.movie.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (booking.theater && booking.theater.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const status = getStatusText(booking.status);
    let matchesFilter = true;
    if (activeFilter === "upcoming") {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      matchesFilter = bookingDate >= today && status === 'CONFIRMED';
    } else if (activeFilter === "past") {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      matchesFilter = bookingDate < today || status !== 'CONFIRMED';
    }
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="auth-message">Please login to view your bookings</div>;
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email"><FaEnvelope /> {user.email}</p>
          <div className="profile-stats">
            <span className="stat-item">
              <FaTicketAlt /> {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>
        </div>
      </div>

      {/* Bookings Dashboard */}
      <section className="bookings-dashboard">
        <div className="bookings-header">
          <h2>Your Bookings</h2>
          <div className="bookings-controls">
            <div className="search-box">
              <FaSearch className="search-icon1" />
              <input 
                type="text" 
                placeholder="Search bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'past' ? 'active' : ''}`}
                onClick={() => setActiveFilter('past')}
              >
                Past
              </button>
            </div>
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map((booking) => {
              const statusText = getStatusText(booking.status);
              const statusLower = statusText.toLowerCase();
              
              return (
                <div key={booking.id} className={`booking-item ${statusLower}`}>
                  <div className="booking-poster">
                    <div className="poster-placeholder">
                      {booking.movie.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="booking-content1">
                    <div className="booking-main">
                      <h3>{booking.movie}</h3>
                      <div className="booking-meta">
                        <span className="meta-item">
                          <FaCalendarAlt /> {formatDate(booking.date)}
                        </span>
                        <span className="meta-item">
                          <FaClock /> {booking.time}
                        </span>
                        {booking.theater && (
                          <span className="meta-item">
                            <FaFilm /> {booking.theater}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="booking-side">
                      <div className={`status-label ${statusLower}`}>
                        {statusIcons[statusText]} {statusText}
                      </div>
                      {booking.seats && (
                        <div className="seats-info">
                          <FaChair /> Seats: {booking.seats}
                        </div>
                      )}
                      <button className="action-btn">View Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-bookings">
            <div className="empty-content">
              <FaTicketAlt className="empty-icon" />
              <h3>No Bookings Found</h3>
              <p>
                {searchTerm || activeFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't made any bookings yet. Start by browsing our movies."}
              </p>
              <button className="primary-btn">Browse Movies</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;