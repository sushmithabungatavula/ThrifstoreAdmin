import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import axios from 'axios';
/**
 * Example usage:
 * <OrderDetails order={selectedOrder} onStatusChange={...} />
 *
 * Props:
 *  - order: {
 *      id, date, paymentMethod, shippingMethod, totalPrice, taxes, shippingCost,
 *      items: [{ productId, name, quantity, price, ecoFriendly, imageUrl, ...}],
 *      statusHistory: [{ status, date, remarks }],
 *      tracking: { number, carrier, expectedDeliveryDate, carbonOffset },
 *      customer: { name, email, address, phone, greenMembership },
 *      ...
 *    }
 *  - onStatusChange: (newStatus) => void
 *  - onRefund: () => void
 *  - onPrintInvoice: () => void
 *  - onContactCustomer: () => void
 */
const OrderDetails = ({
    onStatusChange,
    onRefund,
    onPrintInvoice,
    onContactCustomer,
  }) => {
    const { orderId } = useParams(); // Retrieve orderId from URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Fetch order details based on orderId
      const fetchOrderDetails = async () => {
        try {
          const response = await axios.get(
            `https://recycle-backend-apao.onrender.com/getOrderDetails/${orderId}`
          );
          setOrder(response.data.order);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching order details:', err);
          setError('Failed to fetch order details.');
          setLoading(false);
        }
      };
  
      fetchOrderDetails();
    }, [orderId]);
  
    if (loading) {
      return (
        <div style={styles.container}>
          <h2 style={styles.heading}>Order Details</h2>
          <p>Loading...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div style={styles.container}>
          <h2 style={styles.heading}>Order Details</h2>
          <p style={styles.errorText}>{error}</p>
        </div>
      );
    }
  
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Order Details</h2>

      {/* --- Order Summary Box --- */}
      <div style={styles.summaryBox}>
        <h3 style={styles.summaryHeading}>Order Summary</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
        <p><strong>Shipping Method:</strong> {order.shippingMethod || 'Standard'}</p>
        {/* <hr style={styles.divider} />
        <p><strong>Subtotal:</strong> ${subtotal?.toFixed(2)}</p>
        <p><strong>Taxes:</strong> ${taxes?.toFixed(2)}</p>
        <p><strong>Shipping:</strong> ${shippingCost?.toFixed(2)}</p>
        <p style={styles.totalLine}>
          <strong>Total:</strong> ${total}
        </p> */}
      </div>

      {/* --- Customer Information --- */}
      <div style={styles.customerBox}>
        <h3 style={styles.summaryHeading}>Customer Information</h3>
        <p><strong>Name:</strong> {order.customer?.name}</p>
        <p><strong>Email:</strong> {order.customer?.email}</p>
        <p><strong>Phone:</strong> {order.customer?.phone}</p>
        <p><strong>Address:</strong> {order.customer?.address}</p>
        {order.customer?.greenMembership && (
          <p style={styles.greenBadge}>
            Green Membership Active
          </p>
        )}
      </div>

      {/* --- Itemized Product List --- */}
      <div style={styles.itemsBox}>
        <h3 style={styles.summaryHeading}>Items</h3>
        {order.items?.map((item) => (
          <div key={item.productId} style={styles.itemRow}>
            <div style={styles.itemImageWrapper}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={styles.itemImage}
                />
              ) : (
                <div style={styles.placeholderImage}>No Image</div>
              )}
            </div>
            <div style={styles.itemDetails}>
              <p style={styles.itemName}>{item.name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price?.toFixed(2)}</p>
              {item.ecoFriendly && (
                <span style={styles.ecoBadge}>Eco-Friendly</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- Order Timeline --- */}
      <div style={styles.timelineBox}>
        <h3 style={styles.summaryHeading}>Order Timeline</h3>
        <ul style={styles.timelineList}>
          {order.statusHistory?.map((hist, index) => (
            <li key={index} style={styles.timelineItem}>
              <strong>{hist.status}</strong>
              <span style={styles.timelineDate}>
                {new Date(hist.date).toLocaleString()}
              </span>
              {hist.remarks && <div style={styles.timelineRemarks}>{hist.remarks}</div>}
            </li>
          ))}
        </ul>
      </div>

      {/* --- Shipment Tracking --- */}
      <div style={styles.trackingBox}>
        <h3 style={styles.summaryHeading}>Shipment Tracking</h3>
        {order.tracking?.number ? (
          <>
            <p><strong>Tracking #:</strong> {order.tracking.number}</p>
            <p><strong>Carrier:</strong> {order.tracking.carrier || 'N/A'}</p>
            <p>
              <strong>Expected Delivery:</strong>{' '}
              {order.tracking.expectedDeliveryDate
                ? new Date(order.tracking.expectedDeliveryDate).toLocaleString()
                : 'N/A'}
            </p>
            {order.tracking.carbonOffset && (
              <p style={styles.greenBadge}>
                Carbon Offset Shipping
              </p>
            )}
          </>
        ) : (
          <p>No tracking information available.</p>
        )}
      </div>

      {/* --- Actions --- */}
      <div style={styles.actionsBox}>
        <h3 style={styles.summaryHeading}>Actions</h3>
        <div style={styles.buttonGroup}>
          <button style={styles.actionButton} onClick={() => onStatusChange?.('shipped')}>
            Change Status
          </button>
          <button style={styles.actionButton} onClick={onRefund}>
            Issue Refund
          </button>
          <button style={styles.actionButton} onClick={onPrintInvoice}>
            Print Invoice
          </button>
          <button style={styles.actionButton} onClick={onContactCustomer}>
            Contact Customer
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9fc',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '1200px',
    margin: '20px auto',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  heading: {
    margin: 0,
    marginBottom: '20px',
    fontSize: '1.8rem',
  },
  errorText: {
    color: 'red',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  summaryHeading: {
    fontSize: '1.2rem',
    margin: '0 0 10px',
  },
  divider: {
    margin: '10px 0',
  },
  totalLine: {
    fontSize: '1.1rem',
    borderTop: '1px dashed #ccc',
    paddingTop: '10px',
  },
  customerBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  greenBadge: {
    display: 'inline-block',
    backgroundColor: '#28A745',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  itemsBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  itemImageWrapper: {
    width: '80px',
    height: '80px',
    marginRight: '10px',
    overflow: 'hidden',
    borderRadius: '8px',
    backgroundColor: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: 'auto',
  },
  placeholderImage: {
    color: '#999',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontWeight: 'bold',
    margin: 0,
  },
  ecoBadge: {
    backgroundColor: '#28A745',
    color: '#fff',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    marginTop: '5px',
    width: 'fit-content',
  },
  timelineBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  timelineList: {
    listStyleType: 'none',
    padding: 0,
  },
  timelineItem: {
    marginBottom: '10px',
    borderLeft: '3px solid #36A2EB',
    paddingLeft: '10px',
  },
  timelineDate: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#777',
  },
  timelineRemarks: {
    marginTop: '5px',
    fontStyle: 'italic',
    color: '#555',
  },
  trackingBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  actionsBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    backgroundColor: '#36A2EB',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s',
  },
};

export default OrderDetails;
