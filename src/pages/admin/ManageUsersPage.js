import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  InputGroup,
  Modal,
  Dropdown
} from "react-bootstrap";
import {
  FiSearch,
  FiEdit2,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiMoreVertical,
  FiPlus,
  FiFilter
} from "react-icons/fi";

const ManageUsersPage = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/all");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let results = users;
    
    // Status filtering
    if (activeFilter !== "all") {
      results = results.filter(user => 
        activeFilter === "active" ? user.active : !user.active
      );
    }
    
    // Search filtering
    if (searchTerm) {
      results = results.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(results);
  }, [searchTerm, users, activeFilter]);

  // User actions
  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/users/toggle-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Failed to update user status");
      
      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => (u.id === id ? updatedUser : u)));
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8080/users/delete/${userToDelete.id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) throw new Error("Failed to delete user");
      
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-1">User Management</h2>
          <p className="text-muted mb-0">
            Manage system users and their permissions
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FiPlus className="me-1" /> Add User
          </Button>
        </Col>
      </Row>

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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
                    <FiFilter className="me-1" /> Filter
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item 
                      active={activeFilter === "all"} 
                      onClick={() => setActiveFilter("all")}
                    >
                      All Users
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={activeFilter === "active"} 
                      onClick={() => setActiveFilter("active")}
                    >
                      Active Only
                    </Dropdown.Item>
                    <Dropdown.Item 
                      active={activeFilter === "inactive"} 
                      onClick={() => setActiveFilter("inactive")}
                    >
                      Inactive Only
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end">
                <Badge bg="light" text="dark" className="me-2">
                  Total: {users.length}
                </Badge>
                <Badge bg="success" className="me-2">
                  Active: {users.filter(u => u.active).length}
                </Badge>
                <Badge bg="secondary">
                  Inactive: {users.filter(u => !u.active).length}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Name</th>
                  <th>Email</th>
                  {/* <th>Role</th> */}
                  <th>Status</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="ps-4">
                        <div className="fw-bold">{user.name}</div>
                        <small className="text-muted">ID: {user.id}</small>
                      </td>
                      <td>{user.email}</td>
                      {/* <td>
                        <Badge bg="info" className="text-capitalize">
                          {user.role}
                        </Badge>
                      </td> */}
                      <td>
                        <Badge bg={user.active ? "success" : "secondary"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            title="Edit User"
                          >
                            <FiEdit2 />
                          </Button>
                          <Button 
                            variant={user.active ? "outline-warning" : "outline-success"} 
                            size="sm"
                            onClick={() => toggleStatus(user.id)}
                            title={user.active ? "Deactivate User" : "Activate User"}
                          >
                            {user.active ? <FiUserX /> : <FiUserCheck />}
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => confirmDelete(user)}
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="py-4">
                        <FiSearch size={48} className="text-muted mb-3" />
                        <h5>No users found</h5>
                        <p className="text-muted">
                          {searchTerm 
                            ? "Try adjusting your search query" 
                            : activeFilter !== "all"
                              ? `No ${activeFilter} users`
                              : "No users available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p>Are you sure you want to delete this user?</p>
              <div className="bg-light p-3 rounded">
                <div className="fw-bold">{userToDelete.name}</div>
                <div>{userToDelete.email}</div>
                <div>
                  <Badge bg="info" className="me-2">
                    {userToDelete.role}
                  </Badge>
                  <Badge bg={userToDelete.active ? "success" : "secondary"}>
                    {userToDelete.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <Alert variant="warning" className="mt-3">
                This action cannot be undone. All user data will be permanently deleted.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageUsersPage;