import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIconImage from '../location.png'; // your custom marker icon

// Create a basic Leaflet icon
const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIconImage,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// A helper component to recenter the map whenever locationToFocus changes
function Updater({ locationToFocus }) {
  const map = useMap();

  useEffect(() => {
    if (map && locationToFocus) {
      map.setView(locationToFocus, 13);
    }
  }, [map, locationToFocus]);

  return null;
}

const OrderList = () => {
  // ---------------------- States ----------------------
  const [orders, setOrders] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]); // default map center
  const mapRef = useRef();

  // ---------------------- Fetch Orders on Mount ----------------------
  useEffect(() => {
    fetchOrders();
  }, []);

    // ---------------------- Order Categorization ----------------------
    const ongoingOrders = orders.filter(order => 
      ['placed', 'shipped'].includes(order.order_status)
    );
    const cancelledOrders = orders.filter(order => 
      ['approve_cancel', 'cancelled'].includes(order.order_status)
    );
    const completedOrders = orders.filter(order => 
      order.order_status === 'delivered'
    );
  
    // ---------------------- New Handler for Cancel Approval ----------------------
    const handleApproveCancel = async (order) => {
      try {
        // Get required data - you may need to adjust these values based on your data structure
        const refund_amount = order.item_price * order.item_quantity; // Example calculation
        const payment_method = "Stripe"; // Default or get from system config
        const comment = "Approved cancellation and refund processed";
        const status = "approved";
    
        // First update order status to cancelled
        await axios.put(
          `http://localhost:3000/api/orders/${order.order_id}`,
          { order_status: 'cancelled' }
        );
    
        // Then call the admin approval endpoint with all required data
        const response = await axios.put(
          `http://localhost:3000/api/orders/admin/approve`,
          {
            order_id: order.order_id,
            return_id: order.return_id,
            status,
            refund_amount,
            payment_method,
            comment
          }
        );
    
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.order_id === order.order_id ? { 
              ...o, 
              order_status: 'cancelled',
              return_status: status,
              refund_amount 
            } : o
          )
        );
        
        alert('Cancellation and refund processed successfully!');
      } catch (error) {
        console.error('Error approving cancellation:', error);
        alert('Failed to process cancellation approval.');
      }
    };

  // Retrieve orders, then fetch their associated customer & item details
  const fetchOrders = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId') || 'demo_vendor';
      const { data } = await axios.get(
        `http://localhost:3000/api/orders/vendor/${vendorId}`
      );
  
      const ordersWithDetails = await Promise.all(
        data.map(async (o) => {
          let lat = null;
          let lng = null;
          let customerName = 'Unknown Customer';
          let itemName = `Item ${o.item_id}`;
  
          // — parse shipping_address for coords
          if (o.shipping_address && o.shipping_address !== 'null') {
            try {
              const shippingObj = JSON.parse(o.shipping_address);
              lat = parseFloat(shippingObj.latitude) || null;
              lng = parseFloat(shippingObj.longitude) || null;
            } catch (err) {
              console.error('Error parsing shipping_address:', err);
            }
          }
  
          // — fetch customer name
          try {
            const customerRes = await axios.get(
              `http://localhost:3000/api/customer/${o.customer_id}`
            );
            if (customerRes.data?.name) {
              customerName = customerRes.data.name;
            }
          } catch (err) {
            console.error('Error fetching customer details:', err);
          }
  
          // — fetch item name
          try {
            const itemRes = await axios.get(
              `http://localhost:3000/api/item/${o.item_id}`
            );
            if (itemRes.data?.name) {
              itemName = itemRes.data.name;
            }
          } catch (err) {
            console.error('Error fetching item details:', err);
          }
  
          // — NEW: for cancelled orders, grab matching return_id
          let return_id = null;
          if (['approve_cancel', 'cancelled'].includes(o.order_status)) {
            try {
              const retRes = await axios.get(
                `http://localhost:3000/api/orders/returns/${o.customer_id}`
              );
              if (Array.isArray(retRes.data)) {
                const match = retRes.data.find(rr => rr.order_id === o.order_id);
                if (match) return_id = match.return_id;
              }
            } catch (err) {
              console.error('Error fetching return requests:', err);
            }
          }
  
          return {
            ...o,
            lat,
            lng,
            customerName,
            itemName,
            return_id,    // ◄ now available on each order object
          };
        })
      );
  
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  

  // ---------------------- Shipping Creation ----------------------
 
  const handleCreateShipping = async (order) => {
    try {
      const payload = {
        order_id: order.order_id,
        shipping_method: 'Standard Shipping',
        shipping_cost: 5.0,
        shipping_date: new Date().toISOString(),
        tracking_number: `TRK${order.order_id}`, 
        delivery_date: null,
        shipping_status: 'shipped',
      };

      const { data } = await axios.post(
        `http://localhost:3000/api/orders/shipping`,
        payload
      );
      console.log('Shipping created:', data);
    } catch (err) {
      console.error('Error creating shipping:', err);
    }
  };

  // ---------------------- Status & Update Handlers ----------------------

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, order_status: newStatus } : order
      );
  
      const updatedOrder = updatedOrders.find(o => o.order_id === orderId);
  
      if (newStatus === 'delivered') {
        handleUpdate({ ...updatedOrder, order_status: 'delivered' });
      }
  
      return updatedOrders;
    });
  };
  



  /**
   * When the "Update" button is clicked, we:
   *  1) If status=shipped, first call createShipping.
   *  2) Then call the standard PUT /api/orders/:order_id update.
   */
  const handleUpdate = async (order) => {
    try {
      if (order.order_status === 'shipped') {
        await handleCreateShipping(order);
      }
  
      await axios.put(`http://localhost:3000/api/orders/${order.order_id}`, {
        order_status: order.order_status,
      });
  
      // ✅ Step 3: If status is 'delivered', trigger payment transaction API
      if (order.order_status === 'delivered') {
        await axios.post(`http://localhost:3000/payment/record`, {
          order_id: order.order_id,
          item_id: order.item_id,
          vendor_id: order.vendor_id,
          payment_amount: parseFloat(order.item_price),
          payment_method: 'card', 
          status: 'paid'
        });
      }
  
      alert(`Order #${order.order_id} updated successfully!`);
    } catch (error) {
      console.error('Error updating order status or recording payment:', error);
      alert('Failed to update order or record payment.');
    }
  };
  

  // ---------------------- Map Handlers ----------------------
  /**
   * When the user clicks on a table row, if lat/lng are valid,
   * we recenter the map and place a marker at that location.
   */
  const handleOrderClick = (order) => {
    if (order.lat && order.lng) {
      setSelectedLocation([order.lat, order.lng]);
    } else {
      setSelectedLocation(null);
    }
  };

  /**
   * Click "Locate Me" to recenter map on user’s current position
   */
  const handleLocateMeClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setCurrentLocation(newLocation);

          
          if (mapRef.current) {
            mapRef.current.setView(newLocation, 13);
          }
        },
        (error) => {
          console.error('Error getting current location: ', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <div style={styles.pageContainer}>

      {/* Right Column: Map */}
      <div style={styles.mapSection}>
        <h2 style={styles.mapTitle}>Map View</h2>
        <div style={styles.mapContainer}>
          <MapContainer
            center={currentLocation}
            zoom={13}
            style={styles.mapInner}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* If an order row was clicked and lat/lng are valid, show a marker */}
            {selectedLocation && (
              <Marker position={selectedLocation} icon={defaultMarkerIcon}>
                <Popup>Order location</Popup>
              </Marker>
            )}

            {/* Always keep the map updated whenever selectedLocation changes */}
            <Updater locationToFocus={selectedLocation} />
          </MapContainer>
        </div>

        <button style={styles.locateButton} onClick={handleLocateMeClick}>
          Locate Me
        </button>
      </div>

      <h1 style={styles.title}>Order List</h1>

      <div style={styles.content}>
        {/* Ongoing Orders Table */}
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Ongoing Orders</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ongoingOrders.map((order) => (
                <tr
                  key={order.order_id}
                  style={styles.tr}
                  onClick={() => handleOrderClick(order)}
                >
                  {/* Order ID */}
                  <td style={styles.tdClickable}>{order.order_id}</td>

                  {/* Customer Name */}
                  <td style={styles.td}>
                    {order.customerName}
                  </td>

                  {/* Order Date */}
                  <td style={styles.td}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>

                  {/* Status Dropdown */}
                  <td style={styles.td}>
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleStatusChange(order.order_id, e.target.value)
                      }
                      style={styles.select}
                    >
                      <option value="placed">placed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </td>

                  {/* Item Name */}
                  <td style={styles.td}>{order.itemName}</td>

                  {/* Quantity */}
                  <td style={styles.td}>{order.item_quantity}</td>

                  {/* Price */}
                  <td style={styles.td}>{order.item_price}</td>

                  {/* Action Button */}
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.updateButton,
                        backgroundColor: order.order_status === 'placed' ? '#d3d3d3' : '#000000',
                        color: '#ffffff',
                        border: '1px solid #000000',
                        cursor: order.order_status === 'placed' ? 'not-allowed' : 'pointer',
                      }}
                      
                      disabled={order.order_status === 'placed'}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent row-click
                        if (order.order_status !== 'placed') {
                          handleUpdate(order);
                        }
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Cancelled Orders</h2>
          <table style={styles.table}>
            <thead>
              <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Customer</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Price</th>
<th style={styles.th}>Refund Amount</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cancelledOrders.map((order) => (
                <tr
                  key={order.order_id}
                  style={styles.tr}
                  onClick={() => handleOrderClick(order)}
                >

                <td style={styles.tdClickable}>{order.order_id}</td>

                  {/* Item Name */}
                  <td style={styles.td}>{order.itemName}</td>

                    {/* Customer Name */}
                    <td style={styles.td}>
                    {order.customerName}
                  </td>


                  <td style={styles.td}>{order.order_status}</td>
                  {/* Quantity */}
                  <td style={styles.td}>{order.item_quantity}</td>

                  {/* Price */}
                  <td style={styles.td}>{order.item_price}</td>

                  <td style={styles.td}>
                    {order.refund_amount ? `$${order.refund_amount}` : 'Pending'}
                  </td>

                  <td style={styles.td}>{order.order_status}</td>
                  <td style={styles.td}>
                    {order.order_status === 'approve_cancel' && (
                      <button
                        style={styles.approveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveCancel(order);
                        }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      <div style={styles.content}>

        {/* Completed Orders Table */}
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Completed Orders</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Price</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.map((order) => (
                <tr
                  key={order.order_id}
                  style={styles.tr}
                  onClick={() => handleOrderClick(order)}
                >
                  
                  <td style={styles.tdClickable}>{order.order_id}</td>

                  {/* Item Name */}
                  <td style={styles.td}>{order.itemName}</td>

                  {/* Customer Name */}
                  <td style={styles.td}>
                    {order.customerName}
                  </td>

                  {/* Order Date */}
                  <td style={styles.td}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                  <td style={styles.td}>{order.order_status}</td>
                  {/* Quantity */}
                  <td style={styles.td}>{order.item_quantity}</td>

                  {/* Price */}
                  <td style={styles.td}>{order.item_price}</td>

                  
                  {/* No action column */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};


// ---------------------- Inline Styles ----------------------
const styles = {
  pageContainer: {
    backgroundColor: '#ffffff',
    color: '#1e1e1e',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    minHeight: '100vh',
  },

  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: '24px',
    textTransform: 'uppercase',
  },

  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e1e1e',
    marginBottom: '16px',
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },

  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  th: {
    textAlign: 'left',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #cccccc',
    color: '#1e1e1e',
    fontWeight: '600',
  },

  td: {
    padding: '10px',
    borderBottom: '1px solid #cccccc',
    color: '#1e1e1e',
    fontSize: '14px',
  },

  tdClickable: {
    padding: '10px',
    fontSize: '14px',
    color: '#000000',
    textDecoration: 'underline',
    cursor: 'pointer',
    verticalAlign: 'middle',
  },

  tr: {
    transition: 'background-color 0.2s ease',
  },

  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #cccccc',
    color: '#1e1e1e',
    fontSize: '14px',
    backgroundColor: '#ffffff',
  },

  approveButton: {
    backgroundColor: '#000000',
    color: '#ffff',
    border: '1px solid #000000',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '14px',
  },

  updateButton: {
    backgroundColor: '#000000',
    color: '#1e1e1e',
    border: '1px solid #000000',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  locateButton: {
    backgroundColor: '#000000',
    color: '#ffff',
    border: '1px solid #000000',
    borderRadius: '30px',
    padding: '10px 20px',
    fontWeight: '500',
    marginTop: '12px',
    cursor: 'pointer',
  },

  mapSection: {
    width: '100%',
    maxWidth: '900px',
    marginBottom: '30px',
  },

  mapTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1e1e1e',
  },

  mapContainer: {
    height: '300px',
    width: '100%',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
  },

  mapInner: {
    height: '100%',
    width: '100%',
  },
};

export default OrderList;
