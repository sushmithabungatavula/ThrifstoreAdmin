import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

// React Icons:
import { FaSearch, FaBoxOpen, FaExchangeAlt, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { BiNotepad } from 'react-icons/bi';
import { LoginContext } from '../../context/loginContext';

const API_BASE_URL = 'http://localhost:3000/api';

export default function TransactionsTab() {
  const { login, vendorId } = useContext(LoginContext); 
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedTxProducts, setSelectedTxProducts] = useState([]);

  // Fetch transactions by vendor_id
  useEffect(() => {
    if (!vendorId) {
      setTransactions([]);
      setFilteredTx([]);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Stock-transactions/vendor/${vendorId}`);
        console.log('transactions...', res.data);
        setTransactions(res.data);
        setFilteredTx(res.data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
    };

    fetchTransactions();
  }, [vendorId]);

  // Filter transactions by search term
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredTx(transactions);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = transactions.filter((tx) => {
      const typeMatch = tx.transaction_type?.toLowerCase().includes(lowerTerm);
      const notesMatch = tx.notes?.toLowerCase().includes(lowerTerm);
      const idMatch = tx.transaction_id?.toString().includes(lowerTerm);
      return typeMatch || notesMatch || idMatch;
    });
    setFilteredTx(results);
  };

  // Get the corresponding icon based on the transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'stockIn':
        return <FaBoxOpen style={{ marginRight: 6, color: 'green' }} />;
      case 'stockOut':
        return <FaArrowUp style={{ marginRight: 6, color: 'red' }} />;
      case 'moveStock':
        return <FaExchangeAlt style={{ marginRight: 6 }} />;
      case 'adjust':
        return <FaArrowDown style={{ marginRight: 6, color: 'orange' }} />;
      default:
        return <BiNotepad style={{ marginRight: 6 }} />;
    }
  };

  // Fetch item details based on item_id
  const fetchItemDetails = async (item_id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/item/${item_id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  };




    // Handle the selection of a transaction
    const handleSelectTransaction = async (tx) => {
      setSelectedTx(tx);
  
      // Check if tx.item_id exists before attempting to fetch details
      if (tx.item_id) {
        const productDetails = await fetchItemDetails(tx.item_id);
        console.log('productDetails...',productDetails);
      setSelectedTxProducts(productDetails);
      
      } else {
        setSelectedTxProducts(null);
      }
    };

    console.log('SelectedTxProducts...',selectedTxProducts);
  // Format the date for displaying in "DD-MM-YYYY" format
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div style={styles.container}>
      {/* LEFT PANE - TRANSACTION LIST */}
      <div style={styles.leftPane}>
        <h2 style={styles.headerTitle}>Transactions</h2>

        {/* Search Bar */}
        <div style={styles.searchBarContainer}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Transaction List */}
        <div style={styles.txList}>
          {filteredTx.map((tx) => {
            const isSelected = selectedTx?._id === tx._id;
            return (
              <div
                key={tx._id}
                style={{
                  ...styles.txItem,
                  backgroundColor: isSelected ? '#e3f7ff' : '#f9f9f9',
                  border: isSelected ? '1px solid #1e88e5' : '1px solid #ddd',
                }}
                onClick={() => handleSelectTransaction(tx)}
              >
                {getTransactionIcon(tx.transaction_type)}
                <span style={{ fontWeight: 'bold' }}>
                  {tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                </span>
                <span style={styles.txDate}>
                  {formatDate(tx.created_at)}  {/* Updated to show date in DD-MM-YYYY format */}
                </span>
              </div>
            );
          })}
          {filteredTx.length === 0 && (
            <p style={styles.noTxMsg}>No transactions found.</p>
          )}
        </div>
      </div>

      {/* RIGHT PANE - TRANSACTION DETAILS */}
      <div style={styles.rightPane}>
        {selectedTx ? (
          <div style={styles.detailContainer} key={selectedTx.transaction_id}>
            <h2 style={styles.detailHeader}>
              Transaction #{selectedTx.transaction_id}
            </h2>

            {/* Transaction details */}
            <div style={styles.detailContent}>
              <p style={styles.detailRow}>
                <strong>Type:</strong> {selectedTx.transaction_type}
              </p>
              <p style={styles.detailRow}>
                <strong>Date:</strong>{' '}
                {new Date(selectedTx.created_at).toLocaleString()}
              </p>
              <p style={styles.detailRow}>
                <strong>Notes:</strong> {selectedTx.notes || '—'}
              </p>
              <p style={styles.detailRow}>
                <strong>Performed By:</strong> {selectedTx.performed_by || '—'}
              </p>

              {/* Product details */}
              {selectedTxProducts? (
                <div style={styles.subHeader}>
                  <h3>Product Details</h3>
                  <ul style={styles.productList}>
                    <li style={styles.productItem}>
                      <div style={styles.productInfo}>
                        {/* Product Image */}
                        <img
                          src={selectedTxProducts.imageURL}
                          alt={selectedTxProducts.name}
                          style={styles.productImage}
                        />
                        {/* Product Information */}
                        <div style={styles.productDetails}>
                          <span style={{ color: '#444' }}>
                            <strong>Item Name:</strong> {selectedTxProducts.name || 'N/A'}
                          </span>
                          <br />
                          <span style={{ color: '#444' }}>
                            <strong>Quantity:</strong> {selectedTxProducts.stock_quantity}
                          </span>
                          <br />
                          <span style={{ color: '#444' }}>
                            <strong>Final Price:</strong> ${selectedTxProducts.selling_price || '—'}
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              ) : (
                <p>No product details available.</p>
              )}
            </div>
          </div>
        ) : (
          <div style={styles.emptyDetails}>
            <p>Select a transaction on the left to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== STYLES =====================
const styles = {
  container: {
    display: 'flex',
    minHeight: '500px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
  },
  leftPane: {
    flex: 1,
    borderRight: '1px solid #ccc',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    margin: '0 0 1rem',
    color: '#333',
  },
  searchBarContainer: {
    position: 'relative',
    marginBottom: '1rem',
  },
  searchIcon: {
    position: 'absolute',
    top: '50%',
    left: '8px',
    transform: 'translateY(-50%)',
    color: '#aaa',
  },
  searchInput: {
    width: '100%',
    padding: '8px 8px 8px 32px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  txList: {
    flex: 1,
    overflowY: 'auto',
    marginTop: '0.5rem',
  },
  txItem: {
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  txDate: {
    marginLeft: 'auto',
    fontStyle: 'italic',
    fontSize: '0.8rem',
    color: '#555',
  },
  noTxMsg: {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#999',
  },
  rightPane: {
    flex: 2,
    padding: '1rem',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  detailContainer: {
    animation: 'fadeIn 0.4s ease forwards',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  },
  detailHeader: {
    margin: '0 0 1rem',
    borderBottom: '1px solid #ddd',
    paddingBottom: '0.5rem',
    color: '#444',
  },
  detailContent: {
    marginTop: '1rem',
  },
  detailRow: {
    marginBottom: '0.5rem',
    color: '#555',
  },
  subHeader: {
    marginTop: '1.5rem',
    color: '#333',
    borderBottom: '1px solid #ddd',
    paddingBottom: '0.25rem',
  },
  productList: {
    listStyle: 'none',
    paddingLeft: 0,
    marginTop: '1rem',
  },
  productItem: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '4px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  productImage: {
    width: '50px',
    height: '50px',
    marginRight: '10px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyDetails: {
    margin: 'auto',
    color: '#666',
    fontStyle: 'italic',
  },

  // Keyframe for fade-in animation
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateX(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
};