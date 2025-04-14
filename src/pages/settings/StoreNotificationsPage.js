import React, { useState } from 'react';
import './StoreNotificationsPage.css';
import { FaEdit } from 'react-icons/fa';

function StoreNotificationsPage() {
  // Notification Channels
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: false,
    slack: false,
  });

  // Notification Triggers
  const [triggers, setTriggers] = useState({
    newOrder: { email: true, sms: false, push: false, slack: false },
    lowInventory: { email: true, sms: true, push: false, slack: false },
    newCustomer: { email: false, sms: false, push: false, slack: true },
    newReview: { email: true, sms: false, push: false, slack: false },
  });

  // Digest Emails
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('daily');

  // Handler toggles
  const handleChannelToggle = (channel) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleTriggerToggle = (triggerKey, channel) => {
    setTriggers((prev) => ({
      ...prev,
      [triggerKey]: {
        ...prev[triggerKey],
        [channel]: !prev[triggerKey][channel],
      },
    }));
  };

  const handleSave = () => {
    alert('Store-wide notification settings saved!');
  };

  const handleCancel = () => {
    alert('Changes canceled.');
  };

  return (
    <div className="store-notifications-page">
      <h1>Notifications Settings</h1>

      {/* Notification Channels */}
      <div className="card">
        <h2>Notification Channels</h2>
        <div className="channel-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={channels.email}
              onChange={() => handleChannelToggle('email')}
            />
            <span className="slider round"></span>
          </label>
          <span>Email</span>
          {channels.email && (
            <button
              className="edit-template-btn"
              onClick={() => alert('Open Email Template Editor')}
            >
              <FaEdit /> Edit Email Templates
            </button>
          )}
        </div>
        <div className="channel-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={() => handleChannelToggle('sms')}
            />
            <span className="slider round"></span>
          </label>
          <span>SMS</span>
        </div>
        <div className="channel-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={channels.push}
              onChange={() => handleChannelToggle('push')}
            />
            <span className="slider round"></span>
          </label>
          <span>Push Notifications</span>
        </div>
        <div className="channel-item">
          <label className="switch">
            <input
              type="checkbox"
              checked={channels.slack}
              onChange={() => handleChannelToggle('slack')}
            />
            <span className="slider round"></span>
          </label>
          <span>Slack</span>
        </div>
      </div>

      {/* Notification Triggers */}
      <div className="card">
        <h2>Notification Triggers</h2>
        <div className="trigger-group">
          <h3>New Order Placed</h3>
          <div className="channel-toggles">
            {Object.keys(triggers.newOrder).map((ch) => (
              <label key={ch}>
                <input
                  type="checkbox"
                  checked={triggers.newOrder[ch]}
                  onChange={() => handleTriggerToggle('newOrder', ch)}
                />
                {ch.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
        <div className="trigger-group">
          <h3>Low Inventory</h3>
          <div className="channel-toggles">
            {Object.keys(triggers.lowInventory).map((ch) => (
              <label key={ch}>
                <input
                  type="checkbox"
                  checked={triggers.lowInventory[ch]}
                  onChange={() => handleTriggerToggle('lowInventory', ch)}
                />
                {ch.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
        <div className="trigger-group">
          <h3>New Customer Registration</h3>
          <div className="channel-toggles">
            {Object.keys(triggers.newCustomer).map((ch) => (
              <label key={ch}>
                <input
                  type="checkbox"
                  checked={triggers.newCustomer[ch]}
                  onChange={() => handleTriggerToggle('newCustomer', ch)}
                />
                {ch.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
        <div className="trigger-group">
          <h3>New Review Posted</h3>
          <div className="channel-toggles">
            {Object.keys(triggers.newReview).map((ch) => (
              <label key={ch}>
                <input
                  type="checkbox"
                  checked={triggers.newReview[ch]}
                  onChange={() => handleTriggerToggle('newReview', ch)}
                />
                {ch.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Digest / Summary Emails */}
      <div className="card">
        <h2>Digest / Summary Emails</h2>
        <div className="digest-row">
          <label>
            <input
              type="checkbox"
              checked={digestEnabled}
              onChange={() => setDigestEnabled(!digestEnabled)}
            />
            Enable Digest Emails?
          </label>
          {digestEnabled && (
            <select
              value={digestFrequency}
              onChange={(e) => setDigestFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          )}
        </div>
      </div>

      {/* Save / Cancel Buttons */}
      <div className="button-row">
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default StoreNotificationsPage;
