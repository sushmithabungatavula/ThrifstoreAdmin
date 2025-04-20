import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';

const ItemsListTab = () => {
  const { vendorId } = useContext(LoginContext);
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

  return (
    <div>
      <h2>Items List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.item_id}>
            {item.name} - {item.selling_price} - {item.stock_quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemsListTab;
