// src/components/InventoryPage/MoveTab.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Snackbar, Alert, Tooltip, IconButton, Paper } from '@mui/material';
import { Save, AddCircleOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3000/api';

export default function MoveTab({ selectedWarehouseId }) {
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleMove = async () => {
    if (!selectedWarehouseId) {
      setSnackbar({ open: true, message: 'Please select a warehouse first.', severity: 'error' });
      return;
    }
    if (!sourceLocation || !destinationLocation || !itemName || !quantity) {
      setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'error' });
      return;
    }

    const payload = {
      transactionType: 'moveStock',
      warehouseId: selectedWarehouseId,
      sellerId: 'SOME_SELLER_ID',
      performedBy: 'AdminUser',
      sourceLocation,
      destinationLocation,
      products: [
        {
          productId: 'mock-productId',
          variantId: null,
          quantity: Number(quantity),
        },
      ],
      notes: `Moving ${quantity} of ${itemName}`,
    };

    try {
      await axios.post(`${API_BASE_URL}/stockTransactions`, payload);
      setSnackbar({ open: true, message: 'Move Stock transaction recorded successfully!', severity: 'success' });
      setSourceLocation('');
      setDestinationLocation('');
      setItemName('');
      setQuantity(0);
    } catch (error) {
      console.error('Failed to record Move transaction', error);
      setSnackbar({ open: true, message: 'Error creating move transaction.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Move Stock</h2>
      </motion.div>

      {/* Top Form */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          marginBottom: 4,
          backgroundColor: '#fff',
          padding: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TextField
          label="Source Location"
          value={sourceLocation}
          onChange={(e) => setSourceLocation(e.target.value)}
          fullWidth
          placeholder="e.g. Warehouse A"
        />

        <TextField
          label="Destination Location"
          value={destinationLocation}
          onChange={(e) => setDestinationLocation(e.target.value)}
          fullWidth
          placeholder="e.g. Warehouse B"
        />

        <TextField
          label="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          fullWidth
          placeholder="Enter item name"
        />

        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          inputProps={{ min: 1 }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 4, alignItems: 'center' }}>
        <Tooltip title="Add New Item">
          <IconButton color="primary">
            <AddCircleOutline />
          </IconButton>
        </Tooltip>

        <Tooltip title="Move Stock">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleMove}
            fullWidth
          >
            Move Stock
          </Button>
        </Tooltip>
      </Box>

      {/* Snackbar Notifications */}
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
}
