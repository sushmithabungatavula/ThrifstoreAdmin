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
  AddCircleOutline, 
  Delete, 
  Search, 
  Save 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoginContext } from '../../context/loginContext';

const API_BASE_URL = 'http://localhost:3000/api';

export default function StockInTab({ selectedWarehouseId }) {
  const { login, vendorId } = useContext(LoginContext); 

  const [date, setDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [transportCharges, setTransportCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [taxes, setTaxes] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [items, setItems] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!vendorId) return;
  
    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/vendor/${vendorId}/items`);
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

  // Generate Batch Number
  const generateBatchNumber = (warehouseId) => {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,''); 
    return `${warehouseId}-${dateStr}-${Math.floor(Math.random()*1000)}`;
  };

  useEffect(() => {
    if (!batchNumber && selectedWarehouseId) {
      setBatchNumber(generateBatchNumber(selectedWarehouseId));
    }
  }, [batchNumber, selectedWarehouseId]);

  const handleAddInventoryItem = (inventoryItem) => {
    const newId = Date.now();
  
    // Ensure all fields are initialized correctly
    setItems((prev) => [
      ...prev,
      {
        _id: newId,
        productId: inventoryItem.item_id, // Use item_id from the response
        name: inventoryItem.name,
        brand: inventoryItem.brand,
        size: inventoryItem.size || 'N/A',
        color: inventoryItem.color || 'N/A',
        item_condition: inventoryItem.item_condition || 'N/A',
        costPrice: parseFloat(inventoryItem.cost_price) || 0,
        sellingPrice: parseFloat(inventoryItem.selling_price) || 0,
        currentStock: inventoryItem.stock_quantity || 0,
        quantity: 1,
        totalCost: 0, // Ensure initialized to 0
        allocatedTransport: 0, // Ensure initialized to 0
        allocatedOther: 0, // Ensure initialized to 0
        allocatedTax: 0, // Ensure initialized to 0
        finalCutoffUnitPrice: 0, // Ensure initialized to 0
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

  // Handle Unit Price Change
  const handleUnitPriceChange = (id, value) => {
    const price = parseFloat(value) || 0;
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, totalCost: item.quantity * price } : item))
    );
  };

  // Handle Notes Change
  const handleNotesChange = (id, value) => {
    setItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, notes: value } : item))
    );
  };

  // Distribute Charges and Taxes
  useEffect(() => {
    if (items.length === 0) return;

    const totalSubTotals = items.reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0
    );

    const updated = items.map((item) => {
      const subTotal = item.quantity * item.sellingPrice;
      const ratio = totalSubTotals > 0 ? subTotal / totalSubTotals : 0;

      const distributedTransport = transportCharges * ratio;
      const distributedOther = otherCharges * ratio;
      const distributedTax = taxes * ratio;

      const totalCost = subTotal + distributedTransport + distributedOther + distributedTax;

      return {
        ...item,
        allocatedTransport: distributedTransport,
        allocatedOther: distributedOther,
        allocatedTax: distributedTax,
        totalCost,
      };
    });

    setItems(updated);
  }, [items, transportCharges, otherCharges, taxes]);

  const handleSubmitStockIn = async () => {
    if (items.length === 0) {
      setSnackbar({ open: true, message: 'No items to stock in.', severity: 'error' });
      return;
    }
  
    try {
      // First, update stock for each item by calling the updateStock API (operation "add")
      const updatePromises = items.map(async (item) => {
        // Find the matching current inventory record to calculate a new selling price
        const inventoryItem = inventoryItems.find(inv => inv.item_id === item.productId);
        const currentStock = inventoryItem ? parseFloat(inventoryItem.stock_quantity) : 0;
        const currentSellingPrice = inventoryItem ? parseFloat(inventoryItem.selling_price) : 0;
        
        // Calculate a new selling price using a simple formula.
        // (This example uses item.totalCost/item.quantity; adjust calculation as needed.)
        const newSellingPrice = item.totalCost / item.quantity;
        
        return axios.put(`${API_BASE_URL}/item/updateStock/${item.productId}`, {
          operation: 'add',
          quantity: item.quantity,
          newSellingPrice
        });
      });
      await Promise.all(updatePromises);
  
      // Now record the stock-in transaction for each item
      const transactionPromises = items.map((item) =>
        axios.post(`${API_BASE_URL}/Stock-transactions/create`, {
          transaction_type: "stockIn",
          item_id: item.productId,
          vendor_id: vendorId,  // assuming vendorId is available from context for stockIn
          performed_by: "vendor",
          quantity: item.quantity
        })
      );
      await Promise.all(transactionPromises);
  
      setSnackbar({ open: true, message: 'Stock In transaction recorded successfully!', severity: 'success' });
      // Reset form fields
      setItems([]);
      setDate('');
      setPurchaseNotes('');
      setPaymentMethod('');
      setTransportCharges(0);
      setOtherCharges(0);
      setTaxes(0);
    } catch (error) {
      console.error('Failed to update stock for Stock In transaction', error);
      setSnackbar({ open: true, message: 'Error updating Stock In transaction.', severity: 'error' });
    }
  };
  
  

  // Filter suggestions by product name, excluding already added items
  const filteredInventoryItems = inventoryItems.filter((invItem) => {
    return (
      (invItem.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') && 
      !items.some((item) => item.productId === invItem.item_id)
    );
  });

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Stock In</h2>
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
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />

        <TextField
          label="Batch Number"
          placeholder="Batch #"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          fullWidth
        />

        <TextField
          label="Purchase Notes"
          placeholder="Any purchase note..."
          value={purchaseNotes}
          onChange={(e) => setPurchaseNotes(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="payment-method-label">Payment Method</InputLabel>
          <Select
            labelId="payment-method-label"
            value={paymentMethod}
            label="Payment Method"
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="CreditCard">Credit Card</MenuItem>
            <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Transport Charges"
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
          value={transportCharges}
          onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
          fullWidth
        />

        <TextField
          label="Other Charges"
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
          value={otherCharges}
          onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
          fullWidth
        />

        <TextField
          label="Taxes"
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
          value={taxes}
          onChange={(e) => setTaxes(parseFloat(e.target.value) || 0)}
          fullWidth
        />
      </Box>

      {/* Search & Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          marginBottom: 4,
          flexWrap: 'wrap',
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
            InputProps={{
              endAdornment: <Search />,
            }}
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

        <Tooltip title="Submit Stock In">
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<Save />} 
            onClick={handleSubmitStockIn}
          >
            Submit Stock In
          </Button>
        </Tooltip>
      </Box>

      {/* Items Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>S.No</TableCell>
              <TableCell sx={{ color: '#fff' }}>Item</TableCell>
              <TableCell sx={{ color: '#fff' }}>Brand</TableCell>
              <TableCell sx={{ color: '#fff' }}>Size</TableCell>
              <TableCell sx={{ color: '#fff' }}>Current Stock</TableCell>
              <TableCell sx={{ color: '#fff' }}>Quantity</TableCell>
              <TableCell sx={{ color: '#fff' }}>Unit Price</TableCell>
              <TableCell sx={{ color: '#fff' }}>Transport Charges</TableCell>
              <TableCell sx={{ color: '#fff' }}>Other Charges</TableCell>
              <TableCell sx={{ color: '#fff' }}>Taxes</TableCell>
              <TableCell sx={{ color: '#fff' }}>Total Cost</TableCell>
              <TableCell sx={{ color: '#fff' }}>Final Unit Price</TableCell>
              <TableCell sx={{ color: '#fff' }}>Notes</TableCell>
              <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  No items found. Start by searching or adding new items.
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
                  <TableCell>{item.brand || 'N/A'}</TableCell>
                  <TableCell>{item.size || 'N/A'}</TableCell>
                  <TableCell>{item.currentStock ?? 0}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      inputProps={{ min: 1 }}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                      {item.sellingPrice || 'N/A'}
                  </TableCell>
                  <TableCell>${item.allocatedTransport.toFixed(2)}</TableCell>
                  <TableCell>${item.allocatedOther.toFixed(2)}</TableCell>
                  <TableCell>${item.allocatedTax.toFixed(2)}</TableCell>
                  <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                  <TableCell>${item.totalCost / item.quantity} </TableCell>
                  <TableCell>
                    <TextField
                      value={item.notes}
                      onChange={(e) => handleNotesChange(item._id, e.target.value)}
                      size="small"
                      variant="outlined"
                      placeholder="Add notes..."
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
