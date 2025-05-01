import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Form, 
  Modal, 
  Image, 
  Card, 
  Badge,
  Container,
  Row,
  Col,
  Spinner,
  Alert
} from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus, FiImage, FiFilm } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [movieType, setMovieType] = useState("");
  const [newMovie, setNewMovie] = useState({ 
    title: "", 
    genre: "", 
    director: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    trending: 0,
    recommended: 0,
    total: 0
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/movies/all");
      const data = await response.json();
      
      // Add type property to each movie
      const trendingMovies = (data.trending || []).map(movie => ({ 
        ...movie, 
        type: 'Trending' 
      }));
      const recommendedMovies = (data.recommended || []).map(movie => ({ 
        ...movie, 
        type: 'Recommended' 
      }));
      
      const combinedMovies = [...trendingMovies, ...recommendedMovies];
      setMovies(combinedMovies);
      
      setStats({
        trending: trendingMovies.length,
        recommended: recommendedMovies.length,
        total: combinedMovies.length
      });
      
    } catch (error) {
      setError("Failed to fetch movies");
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalShow = (type) => {
    setMovieType(type);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewMovie({ 
      title: "", 
      genre: "", 
      director: ""
    });
    setPreviewImage("");
    setSelectedFile(null);
  };

  const handleCarouselShow = () => setShowCarouselModal(true);
  const handleCarouselClose = () => {
    setShowCarouselModal(false);
    setPreviewImage("");
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMovie({ ...newMovie, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMovie = async (url) => {
    try {
      const formData = new FormData();
      formData.append("title", newMovie.title);
      formData.append("genre", newMovie.genre);
      formData.append("director", newMovie.director);
      
      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add movie");
      
      const savedMovie = await response.json();
      setMovies([...movies, savedMovie]);
      handleModalClose();
      fetchMovies(); // Refresh stats
      
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    
    try {
      const response = await fetch(`http://localhost:8080/movies/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) throw new Error("Failed to delete movie");
      
      setMovies(movies.filter((movie) => movie.id !== id));
      fetchMovies(); // Refresh stats
      
    } catch (error) {
      setError(error.message);
      console.error("Error deleting movie:", error);
    }
  };

  const addCarouselImage = async () => {
    if (!selectedFile) {
      setError("Please select an image for the carousel");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("imageFile", selectedFile);

      const response = await fetch("http://localhost:8080/Carousel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add carousel image");
      
      handleCarouselClose();
      
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Movie Management</h2>
          <p className="text-muted mb-0">Manage all movies and carousel content</p>
        </div>
        <div>
          <Button 
            variant="primary" 
            onClick={() => handleModalShow("Trending")} 
            className="me-2"
          >
            <FiPlus className="me-1" /> Add Trending
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => handleModalShow("Recommended")} 
            className="me-2"
          >
            <FiPlus className="me-1" /> Add Recommended
          </Button>
          <Button variant="secondary" onClick={handleCarouselShow}>
            <FiImage className="me-1" /> Add Carousel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <FiFilm size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Movies</h6>
                  <h4 className="fw-bold mb-0">{stats.total}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                  <FiFilm size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Trending</h6>
                  <h4 className="fw-bold mb-0">{stats.trending}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <FiFilm size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Recommended</h6>
                  <h4 className="fw-bold mb-0">{stats.recommended}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Movies Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Director</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <Image
                        src={`http://localhost:8080/static/${movie.image}`}
                        alt={movie.title}
                        width="60"
                        height="80"
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold">{movie.title}</td>
                    <td>
                      <Badge bg="secondary" className="me-1">
                        {movie.genre}
                      </Badge>
                    </td>
                    <td>{movie.director}</td>
                    <td>
                      <Badge bg={movie.type === 'Trending' ? 'success' : 'info'}>
                        {movie.type}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => console.log('Edit:', movie.id)}
                      >
                        <FiEdit2 size={14} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => deleteMovie(movie.id)}
                      >
                        <FiTrash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Movie Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {movieType === "Trending" ? "Add Trending Movie" : "Add Recommended Movie"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  type="text" 
                  name="title" 
                  value={newMovie.title} 
                  onChange={handleChange} 
                  placeholder="Enter movie title"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Genre</Form.Label>
                <Form.Control 
                  type="text" 
                  name="genre" 
                  value={newMovie.genre} 
                  onChange={handleChange} 
                  placeholder="Enter genre"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Director</Form.Label>
                <Form.Control 
                  type="text" 
                  name="director" 
                  value={newMovie.director} 
                  onChange={handleChange} 
                  placeholder="Enter director name"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Movie Poster</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                {previewImage && (
                  <div className="mt-3 text-center">
                    <Image 
                      src={previewImage} 
                      alt="Preview" 
                      width={150} 
                      height={200}
                      className="rounded border"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => addMovie(`http://localhost:8080/movies/${movieType}`)}
          >
            Add Movie
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Carousel Modal */}
      <Modal show={showCarouselModal} onHide={handleCarouselClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Carousel Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Image</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            {previewImage && (
              <div className="mt-3 text-center">
                <Image 
                  src={previewImage} 
                  alt="Preview" 
                  fluid
                  className="rounded"
                />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCarouselClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addCarouselImage}>
            Upload Image
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MoviesPage;