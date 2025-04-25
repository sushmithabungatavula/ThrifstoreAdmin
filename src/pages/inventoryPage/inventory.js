import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';
import ItemsListTab from './ItemsListTab';
import InventoryMonitoringTab from './InventoryMonitoringTab';
import AdjustTab from './AdjustTab';
import TransactionsTab from './TransactionsTab';
import StockInTab from './StockInTab';
import StockOutTab from './StockOutTab';
import WarehouseDetailsTab from './WarehouseDetailsTab';
import { Tabs, Tab, Box, Paper, Typography } from '@mui/material';

const Inventory = () => {
  const { vendorId } = useContext(LoginContext);
  const [value, setValue] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/vendor/${vendorId}/items`);
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [vendorId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          textTransform: 'uppercase',
          color: '#1e1e1e',
          mb: 3,
        }}
      >
        Inventory Management
      </Typography>

      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Inventory Tabs"
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            borderBottom: '1px solid #ccc',
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              color: '#1e1e1e',
            },
            '& .Mui-selected': {
              color: '#000000',
            },
          }}
        >
          <Tab label="Inventory Monitoring" />
          <Tab label="Stock In" />
          <Tab label="Stock Out" />
          <Tab label="Adjust Inventory" />
          <Tab label="Transactions" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {value === 0 && <InventoryMonitoringTab />}
      {value === 1 && <StockInTab />}
      {value === 2 && <StockOutTab />}
      {value === 3 && <AdjustTab />}
      {value === 4 && <TransactionsTab />}
    </Box>
  );
};

export default Inventory;
