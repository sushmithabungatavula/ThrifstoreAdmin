import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight,FaUserTie, FaChevronDown, FaAngleDoubleLeft, FaAngleDoubleRight, FaBox, FaUser, FaCog, FaList, FaCartPlus, FaChartLine, FaLayerGroup } from 'react-icons/fa';

import './sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const activeLink = location.pathname;
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const doubleArrowIconStyle = {
    transition: 'transform 0.3s ease',
    transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    fontSize: '16px',
    color: '#1e1e1e',
  };

  const linkStyle = (link) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: activeLink.startsWith(link) ? '#000000' : '#1e1e1e',
    backgroundColor: activeLink.startsWith(link) ? '#f0f0f0' : 'transparent',
    borderLeft: activeLink.startsWith(link) ? '4px solid #000000' : '4px solid transparent',
    transition: 'all 0.2s',
    borderRadius: '6px',
    marginBottom: '6px'
  });

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="toggle-button" onClick={handleSidebarToggle}>
        {isSidebarCollapsed ? <FaAngleDoubleRight style={doubleArrowIconStyle} /> : <FaAngleDoubleLeft style={doubleArrowIconStyle} />}
      </div>

      <Link to="/dashboard" style={linkStyle('/dashboard')}><FaChartLine />{!isSidebarCollapsed && 'Dashboard'}</Link>
      <Link to="/InventoryPage" style={linkStyle('/InventoryPage')}><FaLayerGroup />{!isSidebarCollapsed && 'Inventory'}</Link>
      <Link to="/ecommerce/ProductList" style={linkStyle('/ecommerce/ProductList')}><FaBox />{!isSidebarCollapsed && 'Products'}</Link>
      <Link to="/ecommerce/categoryList" style={linkStyle('/ecommerce/categoryList')}><FaList />{!isSidebarCollapsed && 'Categories'}</Link>
      <Link to="/OrderList" style={linkStyle('/OrderList')}><FaCartPlus />{!isSidebarCollapsed && 'Orders'}</Link>
      <Link to="/Customer/AllCustomersPage" style={linkStyle('/Customer/AllCustomersPage')}><FaUser />{!isSidebarCollapsed && 'Customers'}</Link>
      <Link to="/settingsPage" style={linkStyle('/settingsPage')}><FaCog />{!isSidebarCollapsed && 'Store Settings'}</Link>
      <Link to="/employeesDetails" style={linkStyle('/employeesDetails')}><FaUserTie />{!isSidebarCollapsed && 'Employees Details'}</Link>
    </div>
  );
};

export default Sidebar;
