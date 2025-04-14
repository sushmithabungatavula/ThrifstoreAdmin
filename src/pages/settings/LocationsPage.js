import React, { useState } from 'react';
import './LocationsPage.css';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';

function LocationsPage() {
  // Mock data
  const [locations, setLocations] = useState([
    {
      id: 'loc1',
      name: 'Main Warehouse',
      address: '123 Green Lane, Springfield, USA',
      isDefault: true,
      phone: '+1 (555) 999-8888',
    },
    {
      id: 'loc2',
      name: 'Secondary Storage',
      address: '456 Eco Avenue, Portland, USA',
      isDefault: false,
      phone: '+1 (555) 222-1111',
    },
  ]);

  const handleAddLocation = () => {
    alert('Add new location form...');
  };

  const handleEditLocation = (locId) => {
    alert(`Edit location: ${locId}`);
  };

  const handleDeleteLocation = (locId) => {
    alert(`Delete location: ${locId}`);
  };

  const handleSetDefault = (locId) => {
    alert(`Set location ${locId} as default?`);
  };

  return (
    <div className="locations-page">
      <h1>Locations</h1>
      <p className="subtitle">
        Manage your physical/warehouse locations for shipping origins, pickups, or inventory
        distribution.
      </p>

      {/* Locations Table / Cards */}
      <div className="locations-table">
        <div className="table-header">
          <h2>Store Locations</h2>
          <button className="add-location-btn" onClick={handleAddLocation}>
            <FaPlus /> Add New Location
          </button>
        </div>

        <div className="locations-list">
          {locations.map((loc) => (
            <div key={loc.id} className="location-card">
              <div className="card-header">
                <h3>{loc.name}</h3>
                {loc.isDefault && (
                  <span className="default-badge">
                    <FaMapMarkerAlt /> Default
                  </span>
                )}
              </div>
              <p className="location-address">{loc.address}</p>
              <p className="location-phone">{loc.phone}</p>
              <div className="card-actions">
                {!loc.isDefault && (
                  <button onClick={() => handleSetDefault(loc.id)} className="default-btn">
                    Set as Default
                  </button>
                )}
                <button onClick={() => handleEditLocation(loc.id)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDeleteLocation(loc.id)} className="delete-btn">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Map Preview (Placeholder) */}
      <div className="map-preview">
        <h2>Map Preview (Optional)</h2>
        <div className="map-placeholder">[Embed a Google Map or similar here]</div>
      </div>
    </div>
  );
}

export default LocationsPage;
