import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FineData.css'; // Import CSS file for component-specific styles

function FineData() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [fineType, setFineType] = useState('');
  const [fineAmount, setFineAmount] = useState(0); // Initialize with default amount
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students from database or API using Axios
  useEffect(() => {
    axios.get('/api/students')
      .then(response => {
        setStudents(response.data); // Assuming response.data is an array of student objects
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }, []); // Empty dependency array ensures this effect runs only once when component mounts

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleFineTypeChange = (e) => {
    setFineType(e.target.value);
  };

  const handleFineAmountChange = (amount) => {
    setFineAmount(amount);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const applyFine = () => {
    if (!selectedStudent) {
      alert('Please select a student.');
      return;
    }
    if (!fineType) {
      alert('Please select a fine type.');
      return;
    }
    if (fineAmount === 0) {
      alert('Please select a fine amount.');
      return;
    }
    // Here you can perform the logic to apply the fine to the selected student
    alert(`Applied ${fineType} fine of Rs ${fineAmount} to student ${selectedStudent}`);
    // Reset states or perform any other necessary actions after applying fine
    setSelectedStudent('');
    setFineType('');
    setFineAmount(0);
  };

  // Filtering students based on search term (name, ID, section)
  const filteredStudents = students.filter(student => {
    const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = student.id.toString().includes(searchTerm);
    const sectionMatch = student.section.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || idMatch || sectionMatch;
  });

  return (
    <div className="fine-data-container">
      <h1>Train Data Page</h1>
      <p>This is the Train Data page content.</p>

      <div className="fine-search">
        <label htmlFor="search">Search Student:</label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, ID, or section..."
        />
      </div>

      <div className="fine-student-select">
        <label htmlFor="studentSelect">Select Student:</label>
        <select id="studentSelect" value={selectedStudent} onChange={(e) => handleStudentSelect(e.target.value)}>
          <option value="">Select a student</option>
          {filteredStudents.map(student => (
            <option key={student.id} value={student.id}>
              {student.name} - ID: {student.id} - Section: {student.section}
            </option>
          ))}
        </select>
      </div>

      <div className="fine-apply">
        <h2>Apply Fine</h2>
        <div className="fine-type">
          <label>
            <input
              type="radio"
              name="fineType"
              value="Round collar"
              checked={fineType === 'Round collar'}
              onChange={handleFineTypeChange}
            />
            Round Collar
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Sandals/Slippers"
              checked={fineType === 'Sandals/Slippers'}
              onChange={handleFineTypeChange}
            />
            Sandals/Slippers
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="No card"
              checked={fineType === 'No card'}
              onChange={handleFineTypeChange}
            />
            No Card
          </label>
          <label>
            <input
              type="radio"
              name="fineType"
              value="Violation"
              checked={fineType === 'Violation'}
              onChange={handleFineTypeChange}
            />
            Violation
          </label>
        </div>

        <div className="fine-amount">
          <h3>Select Fine Amount:</h3>
          <label>
            <input
              type="radio"
              name="fineAmount"
              value="500"
              checked={fineAmount === 500}
              onChange={() => handleFineAmountChange(500)}
            />
            Rs 500
          </label>
          <label>
            <input
              type="radio"
              name="fineAmount"
              value="1000"
              checked={fineAmount === 1000}
              onChange={() => handleFineAmountChange(1000)}
            />
            Rs 1000
          </label>
          <label>
            <input
              type="radio"
              name="fineAmount"
              value="2500"
              checked={fineAmount === 2500}
              onChange={() => handleFineAmountChange(2500)}
            />
            Rs 2500
          </label>
        </div>

        <button className="fine-apply-button" onClick={applyFine}>Apply Fine</button>
      </div>
    </div>
  );
}

export default FineData;
