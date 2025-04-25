import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';
import styled from 'styled-components';

const API_BASE_URL = 'http://localhost:3000';

const InventoryMonitoringTab = () => {
  const { vendorId } = useContext(LoginContext);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const reorderLevel = 10;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/vendor/${vendorId}/items`);
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [vendorId]);

  const getStatusBarColor = (stock) => {
    if (stock <= reorderLevel) return '#ff4d4f'; // Red
    else if (stock <= reorderLevel * 2) return '#faad14'; // Yellow
    else return '#52c41a'; // Green
  };

  return (
    <Container>
      <Header>Inventory Monitoring</Header>
      <SearchBar
        type="text"
        placeholder="Search items"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Item Name</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
              <TableRow key={item.item_id}>
                <TableCell>
                  <ProductImg src={item.imageURL || ''} alt={item.name} />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.stock_quantity}</TableCell>
                <TableCell>
                  <StatusBarContainer>
                    <StatusBar
                      stock={item.stock_quantity}
                      reorderLevel={reorderLevel}
                      barColor={getStatusBarColor(item.stock_quantity)}
                    />
                  </StatusBarContainer>
                </TableCell>
              </TableRow>
            ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default InventoryMonitoringTab;

// ================= Styled Components =================

const Container = styled.div`
  padding: 30px;
  background-color: #ffffff;
  color: #1e1e1e;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.h2`
  font-size: 1.6rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 20px;
`;

const SearchBar = styled.input`
  padding: 12px 20px;
  width: 100%;
  border: 1px solid #cccccc;
  border-radius: 30px;
  font-size: 1rem;
  margin-bottom: 24px;
  outline: none;
  color: #1e1e1e;

  &:focus {
    border-color: #000000;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 14px;
    text-align: center;
    font-size: 0.95rem;
  }

  th {
    background-color: #f8f8f8;
    color: #000000;
    font-weight: 600;
  }

  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f0f0f0;
  }
`;

const TableCell = styled.td`
  font-size: 0.95rem;
  color: #1e1e1e;
`;

const ProductImg = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #cccccc;
`;

const StatusBarContainer = styled.div`
  width: 100%;
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
`;

const StatusBar = styled.div`
  height: 100%;
  width: ${(props) => (props.stock / (props.reorderLevel * 2)) * 100}%;
  background-color: ${(props) => props.barColor};
  transition: width 0.3s ease-in-out;
  border-radius: 10px;
`;


