import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel, Card, Badge, Spinner } from "react-bootstrap";
import { FaStar, FaTicketAlt, FaChevronRight } from "react-icons/fa";
import "../css/style.css";

const UserDashboard = () => {
  const [carouselImages, setCarouselImages] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [premiereMovies, setPremiereMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [allTrendingMovies, setAllTrendingMovies] = useState([]);
  const [allRecommendedMovies, setAllRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState({
    carousel: true,
    trending: true,
    recommended: true,
    premiere: true,
    comedy: true,
    events: true
  });
  const [authChecking, setAuthChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carouselRes, trendingRes, recommendedRes] = await Promise.all([
          fetch("http://localhost:8080/Carousel-images"),
          fetch("http://localhost:8080/movies/Trending"),
          fetch("http://localhost:8080/movies/Recommended")
        ]);

        const [carouselData, trendingData, recommendedData] = await Promise.all([
          carouselRes.json(),
          trendingRes.json(),
          recommendedRes.json()
        ]);

        setCarouselImages(carouselData);
        
        // For display on dashboard, show only 7 movies
        setTrendingMovies(trendingData.slice(0, 7));
        setRecommendedMovies(recommendedData.slice(0, 7));
        setPremiereMovies(trendingData.slice(0, 7));
        setComedyMovies(recommendedData.slice(0, 7));
        setLiveEvents(trendingData.slice(0, 7));

        // Store ALL movies in state
        setAllTrendingMovies(trendingData);
        setAllRecommendedMovies(recommendedData);

        setLoading({
          carousel: false,
          trending: false,
          recommended: false,
          premiere: false,
          comedy: false,
          events: false
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading({
          carousel: false,
          trending: false,
          recommended: false,
          premiere: false,
          comedy: false,
          events: false
        });
      }
    };

    fetchData();
  }, []);

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

  const createSlidingGroups = (arr) => {
    if (arr.length <= 6) return [arr];
    
    const groups = [];
    groups.push(arr.slice(0, 6));
    groups.push([arr[6], ...arr.slice(0, 5)]);
    groups.push([...arr.slice(5, 7), ...arr.slice(0, 4)]);
    
    return groups;
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

  const renderMovieCard = (movie, index, badge = null) => (
    <div key={index} className="col-md-2 mb-4">
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
    </div>
  );

  const renderEventCard = (event, index) => (
    <div key={index} className="col-md-2 mb-4">
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
    </div>
  );

  const chunkArray = (arr, chunkSize) => {
    const groups = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
  };

  const renderSection = (title, subtitle, items, type = 'movie', badge = null, category = '') => {
    const groups = items.length === 7 
      ? createSlidingGroups(items)
      : chunkArray(items, 6);
    
    return (
      <section className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {items.length > 0 && (
            <Link 
              to={`/see-all/${category || title.toLowerCase().replace(/\s+/g, '-')}`} 
              state={{ 
                items: category === 'trending' ? allTrendingMovies : 
                      category === 'recommended' ? allRecommendedMovies : 
                      items, 
                title: title, 
                subtitle: subtitle,
                type: type,
                badge: badge
              }}
              className="see-all-link"
            >
              See All <FaChevronRight />
            </Link>
          )}
        </div>
        
        <Carousel indicators={false} interval={null}>
          {groups.map((group, groupIndex) => (
            <Carousel.Item key={groupIndex}>
              <div className="row">
                {group.map((item, index) => 
                  type === 'event' 
                    ? renderEventCard(item, index) 
                    : renderMovieCard(item, index, badge)
                )}
                {group.length < 6 && Array(6 - group.length).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="col-md-2 mb-4"></div>
                ))}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>
    );
  };

  return (
    <main className="main-container">
      {authChecking && (
        <div className="auth-checking-overlay">
          <Spinner animation="border" variant="light" />
        </div>
      )}
      
      <Carousel>
        {carouselImages.map((carousel, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={`http://localhost:8080/static/${carousel.image}`}
              alt={`Slide ${index + 1}`}
              style={{ maxHeight: "600px", objectFit: "cover" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {renderSection("🔥 Trending Now", null, trendingMovies, 'movie', null, 'trending')}
      {renderSection("⭐ Recommended Movies", null, recommendedMovies, 'movie', null, 'recommended')}
      {renderSection("🎬 Premieres", "Brand new releases every Friday", premiereMovies, 'movie', 'PREMIERE', 'premieres')}
      {renderSection("🎤 Live Events", null, liveEvents, 'event', null, 'events')}
      {renderSection("😂 Comedy Movies", "Comedy movies to make your day", comedyMovies, 'movie', null, 'comedy')}
    </main>
  );
};

export default UserDashboard;