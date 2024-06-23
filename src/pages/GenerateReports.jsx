import React, { useState } from 'react';
import './GenerateReports.css'; // Import CSS file for component-specific styles

function GenerateReports() {
  const [fines, setFines] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Dummy fines data for demonstration
  const dummyFines = [
    { id: 1, student: 'Student A', fineType: 'Round collar', amount: 1000, date: '2024-06-20', department: 'IT' },
    { id: 2, student: 'Student B', fineType: 'Violation', amount: 2500, date: '2024-06-22', department: 'Admin' },
    { id: 3, student: 'Student C', fineType: 'No card', amount: 500, date: '2024-06-23', department: 'HR' },
    // Add more dummy data as needed
  ];

  // Function to apply filters
  const applyFilters = () => {
    // Filter logic based on filterDate, filterWeek, filterMonth, filterDepartment
    // Example: Filter by date
    const filteredFines = dummyFines.filter(fine => fine.date === filterDate);
    setFines(filteredFines);
  };

  // Function to clear filters
  const clearFilters = () => {
    setFilterDate('');
    setFilterWeek('');
    setFilterMonth('');
    setFilterDepartment('');
    // Reset fines to show all data
    setFines(dummyFines);
  };

  return (
    <div className="generate-reports-container">
      <h1>Generate Reports</h1>

      {/* Filters */}
      <div className="filters-container">
        <h2>Filters</h2>
        <label>Date:
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </label>
        {/* Add more filters as needed */}
        <div className="filter-buttons">
          <button className="filter-button" onClick={applyFilters}>Apply Filters</button>
          <button className="filter-button" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {/* Fines List */}
      <div className="fines-list-container">
        <h2>Fines</h2>
        <table className="fines-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Fine Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {fines.map(fine => (
              <tr key={fine.id}>
                <td>{fine.id}</td>
                <td>{fine.student}</td>
                <td>{fine.fineType}</td>
                <td>${fine.amount}</td>
                <td>{fine.date}</td>
                <td>{fine.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GenerateReports;
