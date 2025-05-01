import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ReportsPage = () => {
  // Sample report data
  const [reports, setReports] = useState([
    { id: 1, type: "Sales", date: "2025-02-10", status: "Completed" },
    { id: 2, type: "Users", date: "2025-02-12", status: "Pending" },
    { id: 3, type: "Bookings", date: "2025-02-15", status: "Completed" },
  ]);

  // State for filtering
  const [filter, setFilter] = useState("All");

  // Filter reports based on selection
  const filteredReports =
    filter === "All" ? reports : reports.filter((report) => report.status === filter);

  return (
    <div className="container mt-5">
      <h1>Reports</h1>
      <p>View and generate platform reports.</p>

      {/* Filter Dropdown */}
      <div className="mb-3">
        <label className="form-label">Filter by Status:</label>
        <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.type}</td>
                <td>{report.date}</td>
                <td>
                  <span className={`badge ${report.status === "Completed" ? "bg-success" : "bg-warning text-dark"}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
