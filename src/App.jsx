import React, { useState } from 'react';
import '../src/style.css';
import TrainData from './pages/TrainData';
import DetectPeople from './pages/DetectPeople';
import FineData from './pages/FineData';
import GenerateReports from './pages/GenerateReports';
import Staff from './pages/Staff';
import StaffData from './pages/StaffData';

function App() {
  const [activePage, setActivePage] = useState('TrainData');

  const handleMenuClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className="App">
      <header>
        <div className="message">
          <div className="circle"></div>
          <img
            src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183322/8.png"
            className="icn"
            alt=""
          />
          <div className="dp">
            <img
              src="https://media.geeksforgeeks.org/wp-content/uploads/20221210180014/profile-removebg-preview.png"
              className="dpicn"
              alt="dp"
            />
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="navcontainer">
          <nav className="nav">
            <div className="nav-upper-options">
              <div className={`nav-option ${activePage === 'TrainData' ? 'active' : ''}`} onClick={() => handleMenuClick('TrainData')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210182148/Untitled-design-(29).png"
                  className="nav-img"
                  alt="dashboard"
                />
                <h3>Train Data</h3>
              </div>

              <div className={`nav-option ${activePage === 'DetectPeople' ? 'active' : ''}`} onClick={() => handleMenuClick('DetectPeople')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183322/9.png"
                  className="nav-img"
                  alt="articles"
                />
                <h3>Detect People</h3>
              </div>

              <div className={`nav-option ${activePage === 'FineData' ? 'active' : ''}`} onClick={() => handleMenuClick('FineData')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183320/5.png"
                  className="nav-img"
                  alt="report"
                />
                <h3>Fine Data</h3>
              </div>

              <div className={`nav-option ${activePage === 'GenerateReports' ? 'active' : ''}`} onClick={() => handleMenuClick('GenerateReports')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183321/6.png"
                  className="nav-img"
                  alt="institution"
                />
                <h3>Generate Reports</h3>
              </div>

              <div className={`nav-option ${activePage === 'Staff' ? 'active' : ''}`} onClick={() => handleMenuClick('Staff')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183323/10.png"
                  className="nav-img"
                  alt="blog"
                />
                <h3>Staff</h3>
              </div>

              <div className={`nav-option ${activePage === 'StaffData' ? 'active' : ''}`} onClick={() => handleMenuClick('StaffData')}>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210183320/4.png"
                  className="nav-img"
                  alt="settings"
                />
                <h3>Staff Data</h3>
              </div>
            </div>
          </nav>
        </div>
        <div className="main">
          {activePage === 'TrainData' && <TrainData />}
          {activePage === 'DetectPeople' && <DetectPeople />}
          {activePage === 'FineData' && <FineData />}
          {activePage === 'GenerateReports' && <GenerateReports />}
          {activePage === 'Staff' && <Staff />}
          {activePage === 'StaffData' && <StaffData />}
        </div>
      </div>
    </div>
  );
}

export default App;
