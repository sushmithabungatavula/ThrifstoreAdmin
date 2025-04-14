import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../context/loginContext';
import axios from 'axios';
import styled from 'styled-components';

const API_BASE_URL = 'https://thriftstorebackend-8xii.onrender.com';

const InventoryMonitoringTab = () => {
  const { vendorId } = useContext(LoginContext);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const reorderLevel = 10; // Set reorder level to 10

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

  // Function to determine the color of the status bar based on stock level
  const getStatusBarColor = (stock) => {
    if (stock <= reorderLevel) {
      return '#e74c3c'; // Red
    } else if (stock <= reorderLevel * 2) {
      return '#f39c12'; // Yellow
    } else {
      return '#2ecc71'; // Green
    }
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
            <th>Item Name</th>
            <th>Stock Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => {
              const stock = item.stock_quantity;
              const barColor = getStatusBarColor(stock);

              return (
                <TableRow key={item.item_id}>
                  <ImageCell>
                      <ProductImg src={item.imageURL || ''} alt={item.name} />
                  </ImageCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{stock}</TableCell>
                  <TableCell>
                    <StatusBarContainer>
                      <StatusBar
                        stock={stock}
                        reorderLevel={reorderLevel}
                        barColor={barColor}
                      />
                    </StatusBarContainer>
                  </TableCell>
                </TableRow>
              );
            })}
        </tbody>
      </Table>
    </Container>
  );
};

// Styled components for the layout
const Container = styled.div`
  padding: 30px;
  background-color: #f4f6f9;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  font-family: 'Roboto', sans-serif;
`;

const SearchBar = styled.input`
  padding: 12px 20px;
  width: 100%;
  margin-bottom: 20px;
  font-size: 16px;
  border-radius: 25px;
  border: 1px solid #ddd;
  outline: none;
  transition: 0.3s;
  
  &:focus {
    border-color: #3498db;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #ecf0f1;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  text-align: center;
  font-size: 16px;
  color: #333;
`;

const ImageCell = styled.div`
  flex: 0 0 80px;
  text-align: center;
`;


const ProductImg = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ced4da;
`;

const StatusBarContainer = styled.div`
  width: 100%;
  height: 15px;
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

export default InventoryMonitoringTab;
