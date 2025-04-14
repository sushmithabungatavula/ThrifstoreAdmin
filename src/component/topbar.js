import React, { useState } from 'react';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import './topbar.css';

function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="topbar">
      <div className="search-bar">
        <FaSearch className="icon" />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="profile-section">
      </div>
    </div>
  );
}

export default TopBar;
