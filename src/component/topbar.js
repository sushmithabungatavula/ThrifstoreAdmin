// src/components/TopBar/TopBar.js
import React, { useState, useContext  } from 'react';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import './topbar.css';

import { useNavigate, Link } from 'react-router-dom';

import { LoginContext } from '../context/loginContext';

function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const {
    setIsLoggedIn,
    setVendorId,
  } = useContext(LoginContext);

  const handleLogout = () => {
    // Remove just the session‑critical keys the backend cares about
    ['token', 'email', 'isLoggedIn', 'name', 'vendorId']
      .forEach(item => localStorage.removeItem(item));
  
    // Clear any in‑memory auth state you track in parent / context
    setIsLoggedIn(false);
    setVendorId(null);
  
    // Close the dropdown
    setDropdownOpen(false);
  
    // Redirect to the public / landing page
    navigate('/');
  };
  

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">THRIFT STORE ADMIN</h1>
      </div>

      <div className="search-bar">
        <FaSearch className="icon" />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="topbar-right">
        <div className="profile" onClick={toggleDropdown}>
          <FaUserCircle className="icon" />
          {dropdownOpen && (
            <div className="dropdown-item" onClick={handleLogout}>
            Logout
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
