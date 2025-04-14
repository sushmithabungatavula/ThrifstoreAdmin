import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const API_BASE_URL = 'https://thrifstorebackend.onrender.com';

const DetailsContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
`;

// Other styled components...

export default function WarehouseDetailsTab({ vendorId, warehouseId, refreshWarehouses }) {
  const [warehouse, setWarehouse] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper function to flatten the warehouse data if needed (you can adjust based on actual structure)
const flattenWarehouseData = (data) => {
  return {
    name: data.name || '',
    location: data.location || '',
    // Add other fields based on the warehouse data structure
  };
};

  useEffect(() => {
    if (!warehouseId) return;

    const fetchWarehouseDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/warehouses/${vendorId}/${warehouseId}`);
        setWarehouse(res.data);
        setFormData(flattenWarehouseData(res.data));
        setError(null);
      } catch (err) {
        setError('Failed to fetch warehouse details');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseDetails();
  }, [vendorId, warehouseId]);

  // Handle form submission...
}
