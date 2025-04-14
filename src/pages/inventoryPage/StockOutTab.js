import React, { useState, useEffect, useContext } from 'react'; 
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Tooltip, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { 
  Delete, 
  Search, 
  Save 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoginContext } from '../../context/loginContext';

const API_BASE_URL = 'https://thriftstorebackend-8xii.onrender.com/api';

export default function StockOutTab({ selectedWarehouseId }) {
  const { login, vendorId } = useContext(LoginContext);

  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [items, setItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch inventory items for the selected warehouse
  useEffect(() => {
    if (!vendorId) return;

     const fetchItems = async () => {
          try {
            const response = await axios.get(`https://thriftstorebackend-8xii.onrender.com/api/vendor/${vendorId}/items`);
            if (Array.isArray(response.data)) {
              setInventoryItems(response.data);  
            }
          } catch (error) {
            console.error('Failed to fetch warehouse inventory items', error);
            setSnackbar({ open: true, message: 'Failed to fetch inventory items.', severity: 'error' });
          }
        };

    fetchItems();
  }, [vendorId]);




  // Filter suggestions by product name, excluding already added items
  const filteredInventoryItems = inventoryItems.filter((invItem) => {
    return (
      (invItem.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && 
      !items.some((item) => item.productId === invItem.item_id)
    );
  });


  // When a suggestion is clicked, add that item to the table.
  const handleAddInventoryItem = (inventoryItem) => {
    const newId = Date.now();
  
    // Ensure all fields are initialized correctly
    setItems((prev) => [
      ...prev,
      {
        _id: newId,
        productId: inventoryItem.item_id, 
        name: inventoryItem.name,
        brand: inventoryItem.brand,
        size: inventoryItem.size || 'N/A',
        color: inventoryItem.color || 'N/A',
        item_condition: inventoryItem.item_condition || 'N/A',
        costPrice: parseFloat(inventoryItem.cost_price) || 0,
        sellingPrice: parseFloat(inventoryItem.selling_price) || 0,
        currentStock: inventoryItem.stock_quantity || 0,
        quantity: 1,
        totalCost: 0, 
        allocatedTransport: 0, 
        allocatedOther: 0,
        allocatedTax: 0, 
        finalCutoffUnitPrice: 0, 
        notes: '',
      },
    ]);
    setSearchTerm('');
    setShowSuggestions(false);
    setSnackbar({ open: true, message: `${inventoryItem.name} added to the list.`, severity: 'success' });
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
    setSnackbar({ open: true, message: 'Item removed.', severity: 'warning' });
  };

  // Handle Quantity Change
  const handleQuantityChange = (id, value) => {
    const qty = parseFloat(value) || 0;
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity: qty } : item))
    );
  };

  // Handle unit price change
  const handleUnitPriceChange = (id, value) => {
    const price = Math.max(0, parseFloat(value) || 0);
    setItems(prev => prev.map(item => item._id === id ? { ...item, unitPrice: price } : item));
  };

  // Handle notes change
  const handleNotesChange = (id, value) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, notes: value } : item));
  };

  // Calculate total price for an item
  const calculateTotalPrice = (unitPrice, quantity) => {
    return (unitPrice * quantity).toFixed(2);
  };

  // Submit Stock Out transaction
  const handleSubmitStockOut = async () => {
    if (!items.length) {
      setSnackbar({ open: true, message: 'No items to stock out.', severity: 'error' });
      return;
    }
    try {
      // First, update stock for each item by calling the updateStock API (operation "remove")
      const updatePromises = items.map((item) =>
        axios.put(`${API_BASE_URL}/item/updateStock/${item.productId}`, {
          operation: 'remove',
          quantity: item.quantity
        })
      );
      await Promise.all(updatePromises);
  
      // Now record the stock-out transaction for each item
      const transactionPromises = items.map((item) =>
        axios.post(`${API_BASE_URL}/Stock-transactions/create`, {
          transaction_type: "stockOut",
          item_id: item.productId,
          vendor_id: vendorId, 
          performed_by: "vendor",
          quantity: item.quantity
        })
      );
      await Promise.all(transactionPromises);
  
      setSnackbar({ open: true, message: 'Stock Out transaction recorded successfully!', severity: 'success' });
      // Reset form fields
      setItems([]);
      setDate('');
      setNotes('');
    } catch (error) {
      console.error('Failed to update stock for Stock Out transaction', error);
      setSnackbar({ open: true, message: 'Error updating Stock Out transaction.', severity: 'error' });
    }
  };
  

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2>Stock Out</h2>
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
          boxShadow: 1 
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Notes"
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Search & Submit Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          marginBottom: 4,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ position: 'relative', flexGrow: 1 }}>
          <TextField
            label="Search Item"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            fullWidth
            InputProps={{ endAdornment: <Search /> }}
          />
          {showSuggestions && filteredInventoryItems.length > 0 && (
            <Paper 
              sx={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                maxHeight: 200, 
                overflowY: 'auto', 
                zIndex: 10 
              }}
            >
              {filteredInventoryItems.map((invItem) => (
                              <Box
                                key={invItem.item_id}
                                onClick={() => handleAddInventoryItem(invItem)}
                                sx={{ 
                                  padding: 1, 
                                  cursor: 'pointer', 
                                  '&:hover': { backgroundColor: '#f0f0f0' } 
                                }}
                              >
                                {invItem.name}
                              </Box>
                            ))}
            </Paper>
          )}
        </Box>

        <Tooltip title="Submit Stock Out">
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Save />} 
            onClick={handleSubmitStockOut}
          >
            Submit Stock Out
          </Button>
        </Tooltip>
      </Box>

      {/* Items Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#d32f2f' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>S.No</TableCell>
              <TableCell sx={{ color: '#fff' }}>Item</TableCell>
              <TableCell sx={{ color: '#fff' }}>Size</TableCell>
              <TableCell sx={{ color: '#fff' }}>Current Stock</TableCell>
              <TableCell sx={{ color: '#fff' }}>Quantity</TableCell>
              <TableCell sx={{ color: '#fff' }}>Unit Price</TableCell>
              <TableCell sx={{ color: '#fff' }}>Total Price</TableCell>
              <TableCell sx={{ color: '#fff' }}>Notes</TableCell>
              <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No items added. Start by searching or adding new items.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.name || 'Unnamed'}</TableCell>
                  <TableCell>{item.size || 'N/A'}</TableCell>
                  <TableCell>{item.currentStock || 0}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      inputProps={{ min: 1, max: item.currentStock }}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      size="small"
                      variant="outlined"
                      sx={{ width: '80px' }}
                    />
                  </TableCell>
                  <TableCell>
                          {item.sellingPrice || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={item.notes}
                      onChange={(e) => handleNotesChange(item._id, e.target.value)}
                      size="small"
                      variant="outlined"
                      placeholder="Add notes..."
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Remove Item">
                      <IconButton color="error" onClick={() => handleRemoveItem(item._id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
