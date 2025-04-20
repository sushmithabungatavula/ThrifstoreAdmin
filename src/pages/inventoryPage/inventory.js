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
import { Tabs, Tab, Box } from '@mui/material';

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
    <div>
      <h2>Inventory Management</h2>
      <Box sx={{ width: '100%' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Inventory Management Tabs">
          <Tab label="Inventory Monitoring" />
          <Tab label="Stock In" />
          <Tab label="Stock Out" />
          <Tab label="Adjust Inventory" />
          <Tab label="Transactions" />
        </Tabs>
        {value === 0 && <InventoryMonitoringTab />}
        {value === 1 && <StockInTab  />}
        {value === 2 && <StockOutTab />}
        {value === 3 && <AdjustTab />}
        {value === 4 && <TransactionsTab />}

      </Box>
    </div>
  );
};

export default Inventory;
