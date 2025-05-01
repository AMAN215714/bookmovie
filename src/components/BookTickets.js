import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Badge, Modal, Form, ProgressBar, Spinner } from "react-bootstrap";
import { FaChair, FaCheck, FaTimes, FaRupeeSign, FaArrowLeft, FaStar, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/BookTickets.css";

const BookTickets = () => {
  const { movieTitle } = useParams();
  const navigate = useNavigate();
  
  // State
  const [theater, setTheater] = useState(null);
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showTooltip, setShowTooltip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [error, setError] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [movieDetails, setMovieDetails] = useState(null);
  const [showTimes, setShowTimes] = useState([]);

  // Config - 30 seats (5 rows x 6 columns)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6];
  const price = 180;
  const steps = ["Theater", "Time", "Seats", "Confirm"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch theaters from API
        const theatersResponse = await axios.get('http://localhost:8080/theaters/all');
        setTheaters(theatersResponse.data);
        
        // Fetch show times from API
        const timesResponse = await axios.get('http://localhost:8080/times/all');
        setShowTimes(timesResponse.data.map(time => time.startTime));
        
        // Mock movie details based on title
        const movieData = {
          "Chawwa": {
            genre: "Horror",
            rating: 7.5,
            duration: "2h 18m",
            languages: ["Hindi", "Tamil"]
          },
          "KGF": {
            genre: "Action",
            rating: 8.2,
            duration: "2h 35m",
            languages: ["Kannada", "Hindi"]
          },
          "Pushpa": {
            genre: "Action",
            rating: 7.8,
            duration: "2h 59m",
            languages: ["Telugu", "Hindi"]
          }
        };
        setMovieDetails(movieData[movieTitle] || movieData["Chawwa"]);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [movieTitle]);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (theater && time) {
        try {
          setLoadingSeats(true);
          setSeats([]); // Clear previous selections when theater or time changes
          const response = await axios.get(`http://localhost:8080/bookings/seats`, {
            params: {
              movie: movieTitle,
              theater: `${theater.name}, ${theater.location}`,
              time: time
            }
          });
          setBookedSeats(response.data);
        } catch (err) {
          console.error("Error fetching seats:", err);
        } finally {
          setLoadingSeats(false);
        }
      }
    };
    
    fetchBookedSeats();
  }, [theater, time, movieTitle]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setSeats(prev => prev.includes(seatId) 
      ? prev.filter(s => s !== seatId) 
      : [...prev, seatId]);
  };

  const handleBooking = async () => {
    if (!theater || !time || seats.length === 0) {
      alert("Please complete all details");
      return;
    }
    
    try {
      setLoading(true);
      
      const bookingData = {
        movie: movieTitle,
        theater: `${theater.name}, ${theater.location}`,
        time: time,
        seats: seats.join(", "),
        status: 0,
        price: seats.length * price,
        theaterId: theater.id
      };
      
      await axios.post(
        `http://localhost:8080/bookings/add`, 
        bookingData, 
        { withCredentials: true }
      );
      
      setShowModal(false);
      alert(`Success! ${seats.length} ticket(s) booked for ${time}`);
      navigate("/");
    } catch (err) {
      setError(err.message);
      alert("Booking failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !theater) {
      alert("Please select a theater");
      return;
    }
    if (activeStep === 2 && !time) {
      alert("Please select a show time");
      return;
    }
    setActiveStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  if (loading && activeStep === 1) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading movie details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <div className="alert alert-danger">
          Error loading data: {error}
        </div>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container className="compact-booking">
      <header className="compact-header">
        <Button 
          variant="link" 
          onClick={() => navigate(-1)}
          className="compact-back"
        >
          <FaArrowLeft />
        </Button>
        <div className="movie-title-container">
          <h3>{movieTitle}</h3>
          {movieDetails && (
            <>
              <div className="movie-meta">
                <Badge bg="dark">{movieDetails.genre}</Badge>
                <span><FaStar className="text-warning" /> {movieDetails.rating}</span>
                <span>{movieDetails.duration}</span>
              </div>
              <div className="movie-languages">
                {movieDetails.languages.map(lang => (
                  <span key={lang}>{lang}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="progress-container">
        <ProgressBar now={(activeStep / steps.length) * 100} className="progress-bar-custom" />
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div 
              key={step}
              className={`step ${activeStep > index + 1 ? "completed" : ""} ${activeStep === index + 1 ? "active" : ""}`}
              onClick={() => setActiveStep(index + 1)}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-name">{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="booking-content">
        {activeStep === 1 && (
          <div className="theater-selection">
            <h4>Select Theater</h4>
            {theaters.length === 0 ? (
              <div className="text-center py-4">
                <p>No theaters available for this movie</p>
              </div>
            ) : (
              <div className="theater-options">
                {theaters.map(t => (
                  <div 
                    key={t.id}
                    className={`theater-card ${theater?.id === t.id ? "selected" : ""}`}
                    onClick={() => setTheater(t)}
                  >
                    <div className="theater-name">{t.name}</div>
                    <div className="theater-location">{t.location}</div>
                    <div className="theater-features">
                      {t.features?.map(f => (
                        <Badge key={f} bg="light" text="dark">{f}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="time-selection">
            <h4>Select Show Time</h4>
            <div className="time-options">
              {showTimes.map(t => (
                <Button
                  key={t}
                  variant={time === t ? "primary" : "outline-primary"}
                  className="time-option"
                  onClick={() => setTime(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="seat-selection">
            <h4>Select Seats</h4>
            {loadingSeats ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p>Loading seat availability...</p>
              </div>
            ) : (
              <>
                <div className="screen-indicator">Screen This Way</div>
                <div className="seat-map-container">
                  <div className="seat-map">
                    {rows.map(row => (
                      <div key={row} className="seat-row">
                        <div className="row-label">{row}</div>
                        {cols.map(col => {
                          const seatId = `${row}${col}`;
                          const isBooked = bookedSeats.includes(seatId);
                          const isSelected = seats.includes(seatId);
                          return (
                            <div 
                              key={seatId}
                              className="seat-container"
                              onMouseEnter={() => setShowTooltip(seatId)}
                              onMouseLeave={() => setShowTooltip(null)}
                            >
                              <button
                                className={`seat ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleSeat(seatId)}
                                disabled={isBooked}
                              >
                                {isBooked ? <FaTimes /> : <FaChair />}
                              </button>
                              {showTooltip === seatId && (
                                <div className="seat-tooltip">
                                  Seat {seatId} {isBooked ? "(Booked)" : "(Available)"}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="seat-icon available"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat-icon selected"></div>
                    <span>Selected</span>
                  </div>
                  <div className="legend-item">
                    <div className="seat-icon booked"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeStep === 4 && (
          <div className="confirmation-section">
            <h4>Confirm Booking</h4>
            <div className="booking-details">
              <div className="detail-item">
                <span>Movie:</span>
                <span>{movieTitle}</span>
              </div>
              <div className="detail-item">
                <span>Theater:</span>
                <span>{theater?.name}, {theater?.location}</span>
              </div>
              <div className="detail-item">
                <span>Time:</span>
                <span>{time}</span>
              </div>
              <div className="detail-item">
                <span>Seats:</span>
                <span className="seats-list">{seats.join(", ")}</span>
              </div>
              <div className="detail-item total">
                <span>Total:</span>
                <span><FaRupeeSign /> {seats.length * price}</span>
              </div>
            </div>
            <div className="payment-info">
              <FaInfoCircle className="info-icon" />
              <span>Payment will be processed after confirmation</span>
            </div>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        {activeStep > 1 && (
          <Button 
            variant="outline-secondary" 
            onClick={handleBack}
            className="nav-button"
          >
            Back
          </Button>
        )}
        {activeStep < steps.length ? (
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={(activeStep === 1 && !theater) || (activeStep === 2 && !time)}
            className="nav-button"
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="success" 
            onClick={() => setShowModal(true)}
            disabled={seats.length === 0}
            className="nav-button confirm-btn"
          >
            {loading ? (
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            ) : (
              "Confirm Booking"
            )}
          </Button>
        )}
      </div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Final Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirm-details">
            <p>Proceed with payment for:</p>
            <p><strong>{seats.length}</strong> ticket(s) at <strong>{theater?.name}</strong></p>
            <p className="total-price">
              <FaRupeeSign /> {seats.length * price}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBooking} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookTickets;