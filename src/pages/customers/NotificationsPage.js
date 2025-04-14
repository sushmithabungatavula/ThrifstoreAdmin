import React, { useState } from 'react';
import './NotificationsPage.css';
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa';

function NotificationsPage() {
  // Mock user preferences
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotionalEmails: true,
    shippingStatus: true,
    ecoTips: false,
  });

  // Indicate if user is unsubscribed from everything
  const isUnsubscribed = Object.values(preferences).every((val) => val === false);

  /**
   * Handlers
   */
  const handleTogglePreference = (prefKey) => {
    setPreferences((prev) => ({
      ...prev,
      [prefKey]: !prev[prefKey],
    }));
  };

  const handleUnsubscribeAll = () => {
    setPreferences({
      orderUpdates: false,
      promotionalEmails: false,
      shippingStatus: false,
      ecoTips: false,
    });
  };

  const handleSubscribeAll = () => {
    setPreferences({
      orderUpdates: true,
      promotionalEmails: true,
      shippingStatus: true,
      ecoTips: true,
    });
  };

  const handleSave = () => {
    alert('Your notification preferences have been saved!');
  };

  const handleCancel = () => {
    // revert to some initial state or simply do nothing
    alert('Changes cancelled.');
  };

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <p className="subtitle">
        Manage how you receive updates about orders, promotions, and eco-friendly tips.
      </p>

      <div className="prefs-section">
        <h2>Notification Preferences</h2>
        <div className="preference-item">
          <label onClick={() => handleTogglePreference('orderUpdates')}>
            {preferences.orderUpdates ? <FaCheckSquare /> : <FaRegSquare />}
            <span>Order Updates</span>
          </label>
          <small>You will receive notifications when a new order is placed, confirmed, or updated.</small>
        </div>

        <div className="preference-item">
          <label onClick={() => handleTogglePreference('promotionalEmails')}>
            {preferences.promotionalEmails ? <FaCheckSquare /> : <FaRegSquare />}
            <span>Promotional Emails</span>
          </label>
          <small>Get discounts, special offers, and exclusive promos in your inbox.</small>
        </div>

        <div className="preference-item">
          <label onClick={() => handleTogglePreference('shippingStatus')}>
            {preferences.shippingStatus ? <FaCheckSquare /> : <FaRegSquare />}
            <span>Shipping Status</span>
          </label>
          <small>Receive updates on your shipment, including tracking and delivery details.</small>
        </div>

        <div className="preference-item">
          <label onClick={() => handleTogglePreference('ecoTips')}>
            {preferences.ecoTips ? <FaCheckSquare /> : <FaRegSquare />}
            <span>Eco Tips & Sustainability Newsletters</span>
          </label>
          <small>Stay informed on green living ideas, product updates, and community events.</small>
        </div>
      </div>

      <div className="unsubscribe-actions">
        {isUnsubscribed ? (
          <button className="subscribe-all-btn" onClick={handleSubscribeAll}>
            Subscribe to All
          </button>
        ) : (
          <button className="unsubscribe-all-btn" onClick={handleUnsubscribeAll}>
            Unsubscribe from All
          </button>
        )}
      </div>

      <div className="form-actions">
        <button className="btn save-btn" onClick={handleSave}>Save</button>
        <button className="btn cancel-btn" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default NotificationsPage;
