import React, { useState } from 'react';
import './ShippingDeliveryPage.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function ShippingDeliveryPage() {
  // Mock shipping zones
  const [zones, setZones] = useState([
    {
      id: 'zone1',
      name: 'Domestic (US)',
      methods: [
        { name: 'Free Shipping', cost: '$0', ecoOption: true, estimatedTime: '3-5 days' },
        { name: 'Flat Rate', cost: '$5', ecoOption: false, estimatedTime: '2-4 days' },
      ],
    },
    {
      id: 'zone2',
      name: 'International',
      methods: [
        { name: 'Eco Courier', cost: '$15', ecoOption: true, estimatedTime: '7-14 days' },
      ],
    },
  ]);

  const handleAddZone = () => {
    alert('Adding a new shipping zone...');
  };

  const handleConfigureMethod = (zoneId, methodIndex) => {
    alert(`Configuring method: ${methodIndex} in zone: ${zoneId}`);
  };

  const handleAddMethod = (zoneId) => {
    alert(`Add new shipping method for zone: ${zoneId}`);
  };

  const handleRemoveMethod = (zoneId, methodIndex) => {
    alert(`Remove shipping method: ${methodIndex} from zone: ${zoneId}`);
  };

  const handleSave = () => {
    alert('Shipping & Delivery settings saved.');
  };

  const handleCancel = () => {
    alert('Changes canceled.');
  };

  return (
    <div className="shipping-delivery-page">
      <h1>Shipping & Delivery</h1>

      {/* Shipping Zones List */}
      <div className="card">
        <div className="header-row">
          <h2>Shipping Zones</h2>
          <button className="add-btn" onClick={handleAddZone}>
            <FaPlus /> Add Zone
          </button>
        </div>

        {zones.map((zone) => (
          <div key={zone.id} className="zone-card">
            <h3>{zone.name}</h3>
            <div className="methods-list">
              {zone.methods.map((method, index) => (
                <div key={index} className="method-item">
                  <div className="method-info">
                    <p className="method-name">{method.name}</p>
                    <p className="method-cost">
                      Cost: <strong>{method.cost}</strong>
                    </p>
                    <p className="method-time">
                      Estimated: <strong>{method.estimatedTime}</strong>
                    </p>
                    {method.ecoOption && (
                      <p className="eco-label">Eco-friendly Shipping</p>
                    )}
                  </div>
                  <div className="method-actions">
                    <button
                      className="edit-method-btn"
                      onClick={() => handleConfigureMethod(zone.id, index)}
                    >
                      <FaEdit /> Configure
                    </button>
                    <button
                      className="remove-method-btn"
                      onClick={() => handleRemoveMethod(zone.id, index)}
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="add-method-btn"
              onClick={() => handleAddMethod(zone.id)}
            >
              <FaPlus /> Add Method
            </button>
          </div>
        ))}
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

export default ShippingDeliveryPage;
