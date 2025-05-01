import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Badge, Spinner, Container, Row, Col, Button } from "react-bootstrap";
import { FaStar, FaTicketAlt, FaArrowLeft, FaFilter } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";

const SeeAllPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Get data passed from navigation state
  const { items = [], title = "", subtitle = "", type = 'movie', badge = null } = location.state || {};

  useState(() => {
    setFilteredItems(items);
  }, [items]);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/check-auth", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Auth check failed");
      const data = await response.json();
      return data.loggedIn;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  };

  const handleBooking = async (movieTitle) => {
    setAuthChecking(true);
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate("/login", { state: { from: `/BookTickets/${encodeURIComponent(movieTitle)}` } });
      } else {
        navigate(`/BookTickets/${encodeURIComponent(movieTitle)}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setAuthChecking(false);
    }
  };

  const renderMovieCard = (movie, index) => (
    <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-4">
      <Card className="movie-card" onClick={() => handleBooking(movie.title)}>
        <div className="card-img-container">
          <Card.Img
            variant="top"
            src={`http://localhost:8080/static/${movie.image}`}
            alt={movie.title}
            className="movie-img"
          />
          {badge && (
            <div className="card-badge">
              <Badge bg="danger">{badge}</Badge>
            </div>
          )}
          <div className="card-overlay">
            <div className="overlay-content">
              <h5>{movie.title}</h5>
              <div className="movie-details">
                {movie.genre && <span>{movie.genre}</span>}
                {movie.rating && (
                  <span className="rating">
                    <FaStar className="star-icon" /> {movie.rating}
                  </span>
                )}
              </div>
              <button className="btn btn-book">
                <FaTicketAlt className="me-1" /> Book Now
              </button>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );

  const renderEventCard = (event, index) => (
    <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-4">
      <Card className="event-card">
        <div className="card-img-container">
          <Card.Img
            variant="top"
            src={`http://localhost:8080/static/${event.image}`}
            alt={event.title}
            className="event-img"
          />
          <div className="event-overlay">
            <div className="overlay-content">
              <h5 className="event-title">{event.title}</h5>
              <div className="event-count">
                {event.count}+ Events
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.genre && item.genre.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  if (!location.state) {
    return (
      <Container className="mt-5 text-center">
        <h3>No data available</h3>
        <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
          Go Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container className="see-all-container">
      {authChecking && (
        <div className="auth-checking-overlay">
          <Spinner animation="border" variant="light" />
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate(-1)} 
          className="back-button p-0"
        >
          <FaArrowLeft className="me-2" /> Back
        </Button>
        
        <div className="filters">
          <Button 
            variant={activeFilter === 'all' ? 'primary' : 'outline-secondary'} 
            size="sm" 
            className="me-2"
            onClick={() => applyFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === 'action' ? 'primary' : 'outline-secondary'} 
            size="sm" 
            className="me-2"
            onClick={() => applyFilter('action')}
          >
            Action
          </Button>
          <Button 
            variant={activeFilter === 'comedy' ? 'primary' : 'outline-secondary'} 
            size="sm" 
            className="me-2"
            onClick={() => applyFilter('comedy')}
          >
            Comedy
          </Button>
          <Button 
            variant={activeFilter === 'drama' ? 'primary' : 'outline-secondary'} 
            size="sm" 
            onClick={() => applyFilter('drama')}
          >
            Drama
          </Button>
        </div>
      </div>
      
      <div className="page-header mb-4">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      
      <Row>
        {filteredItems.map((item, index) => 
          type === 'event' 
            ? renderEventCard(item, index) 
            : renderMovieCard(item, index)
        )}
      </Row>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-5">
          <h4>No items found for this filter</h4>
          <Button variant="outline-primary" onClick={() => applyFilter('all')}>
            Show All
          </Button>
        </div>
      )}
    </Container>
  );
};

export default SeeAllPage;