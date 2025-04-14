import React from 'react';
import './CustomerOverviewPage.css';
import { FaPhone, FaEnvelope, FaLeaf } from 'react-icons/fa';

function CustomerOverviewPage() {
  // In a real app, you'd parse the customer ID from the URL or query string
  // and fetch that specific customer's data from an API. For now, we’ll use mock data.
  const customer = {
    id: '1',
    name: 'Jane Goodall',
    email: 'jane.goodall@example.com',
    phone: '+44 20 1234 5678',
    status: 'Active',
    totalCO2Offset: '45 kg', // Sample eco KPI
    totalOrders: 12,
    lifetimeSpend: '$540.00',
    averageOrderValue: '$45.00',
    lastOrderDate: '2025-01-14',
    recentActivities: [
      { date: '2025-01-14', action: 'Placed an order (#1245).' },
      { date: '2025-01-03', action: 'Reviewed “Recycled Cotton Tote”.' },
      { date: '2024-12-29', action: 'Updated shipping address.' },
      { date: '2024-12-11', action: 'Subscribed to newsletter.' },
    ],
  };

  const handleSendMessage = () => {
    alert(`Send a direct message to ${customer.name}`);
  };

  const handleAddInternalNote = () => {
    alert(`Add internal note for ${customer.name}`);
  };

  const handleDeactivateAccount = () => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${customer.name}'s account?`
    );
    if (confirmed) {
      alert(`${customer.name}'s account has been deactivated!`);
    }
  };

  return (
    <div className="customer-overview-page">
      {/* Page Header */}
      <div className="header">
        <h1>Customer Overview</h1>
      </div>

      {/* Main Grid Layout */}
      <div className="overview-grid">
        {/* LEFT: Customer Profile Card */}
        <div className="profile-card">
          <div className="avatar">
            <img
              src="https://via.placeholder.com/100/2AB674/ffffff?text=Avatar"
              alt="Customer Avatar"
            />
          </div>
          <h2 className="customer-name">{customer.name}</h2>
          <p className="customer-email">
            <FaEnvelope /> {customer.email}
          </p>
          <p className="customer-phone">
            <FaPhone /> {customer.phone}
          </p>
          <div className={`status-badge ${customer.status.toLowerCase()}`}>
            {customer.status}
          </div>
          <div className="eco-kpi">
            <FaLeaf className="leaf-icon" />
            <div>
              <span className="kpi-label">CO2 Offset:</span>
              <span className="kpi-value">{customer.totalCO2Offset}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Account Statistics */}
        <div className="stats-card">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{customer.totalOrders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lifetime Spend</span>
              <span className="stat-value">{customer.lifetimeSpend}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg. Order Value</span>
              <span className="stat-value">{customer.averageOrderValue}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Order Date</span>
              <span className="stat-value">{customer.lastOrderDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {customer.recentActivities.map((ra, index) => (
            <li key={index}>
              <span className="activity-date">{ra.date}</span>
              <span className="activity-text">{ra.action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn green" onClick={handleSendMessage}>
          Send Message
        </button>
        <button className="btn primary" onClick={handleAddInternalNote}>
          Add Internal Note
        </button>
        <button className="btn danger" onClick={handleDeactivateAccount}>
          Deactivate Account
        </button>
      </div>
    </div>
  );
}

export default CustomerOverviewPage;
