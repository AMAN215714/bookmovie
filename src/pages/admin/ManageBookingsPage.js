import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  InputGroup,
  Nav,
  Toast,
  ToastContainer
} from "react-bootstrap";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiCalendar
} from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import axios from "axios";

const ManageBookingsPage = () => {
  // State management
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const bookingsPerPage = 6;

  // Status constants
  const STATUS = {
    PENDING: 0,
    CONFIRMED: 1,
  };

  // Fetch bookings and movies data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [bookingsResponse, moviesResponse] = await Promise.all([
        fetch("http://localhost:8080/bookings/all"),
        fetch("http://localhost:8080/movies/all")
      ]);

      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
      if (!moviesResponse.ok) throw new Error("Failed to fetch movies");

      const [bookingsData, moviesData] = await Promise.all([
        bookingsResponse.json(),
        moviesResponse.json()
      ]);
      
      // Combine all movies
      const allMovies = [
        ...(moviesData.trending || []),
        ...(moviesData.recommended || [])
      ];
      
      // Enhance bookings with movie images
      const enhancedBookings = bookingsData.map(booking => {
        const movie = allMovies.find(m => m.title === booking.movie);
        return {
          ...booking,
          movieImage: movie?.image || 'default-movie.jpg'
        };
      });
      
      setBookings(enhancedBookings);
      setFilteredBookings(enhancedBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let results = bookings;
    
    // Tab filtering
    if (activeTab === "pending") {
      results = results.filter(booking => booking.status === STATUS.PENDING);
    } else if (activeTab === "confirmed") {
      results = results.filter(booking => booking.status === STATUS.CONFIRMED);
    }
    
    // Search filtering
    if (searchTerm) {
      results = results.filter(booking =>
        booking.movie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBookings(results);
    setCurrentPage(1);
  }, [searchTerm, bookings, activeTab]);

  const confirmBooking = async (id, status) => {
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:8080/bookings/${id}/confirm?status=${status}`);
      fetchData();
      showSuccessToast("Booking confirmed successfully");
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
        showSuccessToast("Booking deleted successfully");
      } catch (err) {
        setError("Failed to delete booking");
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Helper functions
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      [STATUS.PENDING]: { bg: "warning", text: "Pending", icon: <FiCalendar size={14} /> },
      [STATUS.CONFIRMED]: { bg: "success", text: "Confirmed", icon: <FiCheckCircle size={14} /> }
    };
    
    return (
      <Badge 
        bg={statusMap[status]?.bg || "secondary"} 
        className="text-capitalize d-flex align-items-center gap-1"
      >
        {statusMap[status]?.icon}
        {statusMap[status]?.text || "Unknown"}
      </Badge>
    );
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Filters and Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                <Button variant="outline-secondary">
                  <FiFilter className="me-1" /> Filters
                </Button>
              </InputGroup>
            </Col>
            <Col md={6}>
              <Nav variant="pills" className="justify-content-end">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "all"} 
                    onClick={() => setActiveTab("all")}
                  >
                    All Bookings
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "pending"} 
                    onClick={() => setActiveTab("pending")}
                  >
                    Pending
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "confirmed"} 
                    onClick={() => setActiveTab("confirmed")}
                  >
                    Confirmed
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-primary bg-opacity-10">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-25 p-3 rounded me-3">
                  <FiCalendar className="text-primary" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Bookings</h6>
                  <h4 className="fw-bold mb-0">{bookings.length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-25 p-3 rounded me-3">
                  <FiCheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Confirmed</h6>
                  <h4 className="fw-bold mb-0">
                    {bookings.filter(b => b.status === STATUS.CONFIRMED).length}
                  </h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-warning bg-opacity-10">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-25 p-3 rounded me-3">
                  <FiCalendar className="text-warning" size={24} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Pending</h6>
                  <h4 className="fw-bold mb-0">
                    {bookings.filter(b => b.status === STATUS.PENDING).length}
                  </h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bookings Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Movie</th>
                  <th>Date/Time</th>
                  <th>Theater</th>
                  <th>Seats</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div 
                              className="bg-light rounded" 
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundImage: `url(http://localhost:8080/static/${booking.movieImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }}
                            ></div>
                          </div>
                          <div>
                            <div className="fw-bold">{booking.movie}</div>
                            <small className="text-muted">ID: {booking.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{booking.date}</div>
                        <small className="text-muted">{booking.time}</small>
                      </td>
                      <td>{booking.theater}</td>
                      <td>
                        <Badge bg="secondary">{booking.seats}</Badge>
                      </td>
                      <td>
                        <div>{booking.user?.name || "Guest"}</div>
                        <small className="text-muted">{booking.user?.email || ""}</small>
                      </td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowModal(true);
                            }}
                            title="View Details"
                          >
                            <FiEye />
                          </Button>
                          {booking.status === STATUS.PENDING && (
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => confirmBooking(booking.id, STATUS.CONFIRMED)}
                              className="d-flex align-items-center gap-1"
                              disabled={processingId === booking.id}
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
                            title="Delete"
                            disabled={processingId === booking.id}
                          >
                            {processingId === booking.id ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <FiXCircle />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <FiSearch size={48} className="text-muted mb-3" />
                        <h5>No bookings found</h5>
                        <p className="text-muted">
                          {searchTerm 
                            ? "Try adjusting your search query" 
                            : activeTab !== "all"
                              ? `No ${activeTab.toLowerCase()} bookings`
                              : "No bookings available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredBookings.length > bookingsPerPage && (
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
              <div>
                Showing {indexOfFirstBooking + 1} to{" "}
                {Math.min(indexOfLastBooking, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <FiChevronLeft /> Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next <FiChevronRight />
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ManageBookingsPage;