import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3000/api';

const AdjustTab = () => {
  const { vendorId } = useContext(LoginContext);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [adjustmentData, setAdjustmentData] = useState({
    itemId: '',
    quantity: 0,
    adjustmentType: 'stockIn',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories/vendor/${vendorId}`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/vendor/${vendorId}/items`);
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchCategories();
    fetchItems();
  }, [vendorId]);

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const { itemId, quantity, adjustmentType } = adjustmentData;
      const response = await axios.post(`${API_BASE_URL}/adjustment`, {
        vendor_id: vendorId,
        item_id: itemId,
        quantity,
        adjustment_type: adjustmentType,
      });
      setSnackbar({ open: true, message: 'Adjustment Successful!', severity: 'success' });
      console.log('Adjustment Success:', response.data);
    } catch (error) {
      console.error('Adjustment failed:', error);
      setSnackbar({ open: true, message: 'Adjustment failed.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#ffffff', borderRadius: 2, fontFamily: 'Inter, sans-serif', color: '#1e1e1e' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Adjust Inventory</h2>
      </motion.div>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          marginTop: 3,
          backgroundColor: '#f9f9f9',
          padding: 3,
          borderRadius: 2,
          border: '1px solid #cccccc',
        }}
      >
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={adjustmentData.categoryId || ''}
            onChange={(e) =>
              setAdjustmentData({ ...adjustmentData, categoryId: e.target.value })
            }
          >
            <MenuItem value="">Select a Category</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.categoryId} value={category.categoryId}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Item</InputLabel>
          <Select
            value={adjustmentData.itemId}
            onChange={(e) =>
              setAdjustmentData({ ...adjustmentData, itemId: e.target.value })
            }
          >
            <MenuItem value="">Select an Item</MenuItem>
            {items.map((item) => (
              <MenuItem key={item.item_id} value={item.item_id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Quantity"
          type="number"
          value={adjustmentData.quantity}
          onChange={(e) =>
            setAdjustmentData({ ...adjustmentData, quantity: e.target.value })
          }
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Adjustment Type</InputLabel>
          <Select
            value={adjustmentData.adjustmentType}
            onChange={(e) =>
              setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value })
            }
          >
            <MenuItem value="stockIn">Stock In</MenuItem>
            <MenuItem value="stockOut">Stock Out</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleAdjustmentSubmit}
          sx={{
            marginTop: 2,
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1e1e1e',
            },
          }}
        >
          <Save sx={{ marginRight: 1 }} /> Submit Adjustment
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdjustTab;
