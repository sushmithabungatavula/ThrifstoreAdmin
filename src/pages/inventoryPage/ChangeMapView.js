// src/components/InventoryPage/ChangeMapView.jsx
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ChangeMapView Component
 * Updates the map's center whenever the `center` prop changes.
 *
 * @param {Array} center - The new center of the map in [latitude, longitude] format.
 */
const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, map.getZoom(), {
        animate: true,
      });
    }
  }, [center, map]);

  return null;
};

ChangeMapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ChangeMapView;
