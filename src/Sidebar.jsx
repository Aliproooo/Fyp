// Sidebar.js
import React from 'react';

const Sidebar = ({ setActiveView }) => {
  const handleClick = (view) => {
    setActiveView(view);
  };

  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => handleClick('TrainData')}>Dashboard</li>
        <li onClick={() => handleClick('profile')}>Profile</li>
        <li onClick={() => handleClick('settings')}>Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
