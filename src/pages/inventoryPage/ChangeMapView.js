// src/components/InventoryPage/ChangeMapView.jsx
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ChangeMapView
 * Dynamically updates the map center when the `center` prop changes.
 * Useful for fly-to functionality in response to user actions.
 *
 * @param {Object} props
 * @param {number[]} props.center - [latitude, longitude] for new map center
 * @returns null (does not render DOM)
 */
const ChangeMapView = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center?.length === 2) {
      map.setView(center, map.getZoom(), {
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [center, map]);

  return null;
};

ChangeMapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ChangeMapView;
