import React, { useState, useEffect } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Nav,
  Badge,
  Alert,
  Spinner
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaHome, 
  FaFilm, 
  FaUsers, 
  FaCalendarAlt, 
  FaCog,
  FaCheck,
  FaTrash,
  FaClipboardList
} from "react-icons/fa";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    bookings: 0,
    revenue: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, moviesRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8080/bookings/all"),
        axios.get("http://localhost:8080/movies/all"),
        axios.get("http://localhost:8080/users/all")
        
      ]);
      
      setBookings(bookingsRes.data);
      
      setStats({
        users: usersRes.data.length,
        movies: moviesRes.data.trending.length + moviesRes.data.recommended.length,
        bookings: bookingsRes.data.length,
        revenue: bookingsRes.data.length * 150,
        pending: bookingsRes.data.filter(b => b.status === 0).length
      });
      
      
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (id, status) => {
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:8080/bookings/${id}/confirm?status=${status}`);
      fetchData();
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError("Failed to confirm booking");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setProcessingId(id);
      try {
        await axios.delete(`http://localhost:8080/bookings/${id}`);
        fetchData();
      } catch (err) {
        setError("Failed to delete booking");
      } finally {
        setProcessingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar Navigation */}
      <div className="bg-white shadow-sm p-3" style={{ 
        width: "250px", 
        position: "sticky", 
        top: 0, 
        height: "100vh",
        borderRight: "1px solid #eee"
      }}>
        <Nav className="flex-column gap-2">
          <Nav.Link 
            as={Link} 
            to="/admin" 
            className="text-dark d-flex align-items-center gap-2 p-3 rounded"
            activeClassName="bg-primary text-white"
          >
            <FaHome className="fs-5" /> Dashboard
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/movies" 
            className="text-dark d-flex align-items-center gap-2 p-3 rounded"
          >
            <FaFilm className="fs-5" /> Movies
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/manage-users" 
            className="text-dark d-flex align-items-center gap-2 p-3 rounded"
          >
            <FaUsers className="fs-5" /> Users
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/manage-bookings" 
            className="text-dark d-flex align-items-center gap-2 p-3 rounded"
          >
            <FaCalendarAlt className="fs-5" /> Bookings
          </Nav.Link>
          <Nav.Link 
            as={Link} 
            to="/admin/settings" 
            className="text-dark d-flex align-items-center gap-2 p-3 rounded"
          >
            <FaCog className="fs-5" /> Settings
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4 bg-light">
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
            {error}
          </Alert>
        )}

        <h2 className="mb-4 text-dark fw-bold">Dashboard Overview</h2>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          {[
            { icon: FaUsers, label: "Total Users", value: stats.users, variant: "primary" },
            { icon: FaFilm, label: "Total Movies", value: stats.movies, variant: "success" },
            { icon: FaCalendarAlt, label: "Total Bookings", value: stats.bookings, variant: "info" },
            { icon: FaClipboardList, label: "Pending Bookings", value: stats.pending, variant: "danger" }
          ].map((stat, index) => (
            <Col key={index} xl={3} lg={6} md={6} sm={12}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`bg-${stat.variant}-subtle p-3 rounded`}>
                      <stat.icon size={24} className={`text-${stat.variant}`} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">{stat.label}</h6>
                      <h4 className="fw-bold mb-0">{stat.value}</h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Bookings Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Bookings</h5>
              <div>
                <Button variant="outline-primary" size="sm" onClick={fetchData} className="me-2">
                  Refresh
                </Button>
                <Button variant="primary" size="sm" as={Link} to="/admin/manage-bookings">
                  View All
                </Button>
              </div>
            </div>
            
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>#</th>
                    <th>Movie</th>
                    <th>Theater</th>
                    <th>Date/Time</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking, index) => (
                    <tr key={booking.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{booking.movie}</td>
                      <td>{booking.theater}</td>
                      <td>
                        <div>{booking.date}</div>
                        <small className="text-muted">{booking.time}</small>
                      </td>
                      <td>{booking.seats}</td>
                      <td>
                        <Badge bg={booking.status === 1 ? "success" : "warning"}>
                          {booking.status === 1 ? "Confirmed" : "Pending"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {booking.status === 0 && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => confirmBooking(booking.id, 1)}
                              disabled={processingId === booking.id}
                              className="d-flex align-items-center gap-1"
                            >
                              {processingId === booking.id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <>
                                  <FaCheck size={12} /> Confirm
                                </>
                              )}
                            </Button>
                          )}
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => deleteBooking(booking.id)}
                            disabled={processingId === booking.id}
                            className="d-flex align-items-center gap-1"
                          >
                            {processingId === booking.id ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <>
                                <FaTrash size={12} /> Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;