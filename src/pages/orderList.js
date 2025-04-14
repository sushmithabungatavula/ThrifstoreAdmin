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
          `https://thriftstorebackend-8xii.onrender.com/api/orders/${order.order_id}`,
          { order_status: 'cancelled' }
        );
    
        // Then call the admin approval endpoint with all required data
        const response = await axios.put(
          `https://thriftstorebackend-8xii.onrender.com/api/orders/admin/approve`,
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
        `https://thriftstorebackend-8xii.onrender.com/api/orders/vendor/${vendorId}`
      );


      const ordersWithDetails = await Promise.all(
        data.map(async (o) => {
          let lat = null;
          let lng = null;
          let customerName = 'Unknown Customer';
          let itemName = `Item ${o.item_id}`;

          if (o.shipping_address && o.shipping_address !== 'null') {
            try {
              const shippingObj = JSON.parse(o.shipping_address);
              lat = parseFloat(shippingObj.latitude) || null;
              lng = parseFloat(shippingObj.longitude) || null;
            } catch (error) {
              console.error('Error parsing shipping_address:', error);
            }
          }

          try {
            const customerRes = await axios.get(
              `https://thriftstorebackend-8xii.onrender.com/api/customer/${o.customer_id}`
            );
            if (customerRes.data && customerRes.data.name) {
              customerName = customerRes.data.name;
            }
          } catch (error) {
            console.error('Error fetching customer details:', error);
          }

          // Fetch item details
          try {
            const itemRes = await axios.get(
              `https://thriftstorebackend-8xii.onrender.com/api/item/${o.item_id}`
            );
            if (itemRes.data && itemRes.data.name) {
              itemName = itemRes.data.name;
            }
          } catch (error) {
            console.error('Error fetching item details:', error);
          }

          return {
            ...o,
            lat,
            lng,
            customerName,
            itemName,
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
        `https://thriftstorebackend-8xii.onrender.com/api/orders/shipping`,
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
  
      await axios.put(`https://thriftstorebackend-8xii.onrender.com/api/orders/${order.order_id}`, {
        order_status: order.order_status,
      });
  
      // ✅ Step 3: If status is 'delivered', trigger payment transaction API
      if (order.order_status === 'delivered') {
        await axios.post(`https://thriftstorebackend-8xii.onrender.com/payment/record`, {
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
                        // If status is 'placed', button is disabled & grey
                        backgroundColor:
                          order.order_status === 'placed'
                            ? '#d3d3d3'
                            : '#8ce08a',
                        cursor:
                          order.order_status === 'placed'
                            ? 'not-allowed'
                            : 'pointer',
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
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9fc',
    minHeight: '100vh',
    padding: '20px',
  },

  tableTitle: {
    fontSize: '1.4rem',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  approveButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  title: {
    fontSize: '1.8rem',
    marginBottom: '20px',
  },
  content: {
    display: 'flex',
    gap: '20px',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflowX: 'auto',
    marginBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
    color: '#333',
  },
  tr: {
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
  },
  td: {
    padding: '8px',
    fontSize: '0.95rem',
    color: '#555',
    verticalAlign: 'middle',
  },
  tdClickable: {
    padding: '8px',
    fontSize: '0.95rem',
    color: '#007bff',
    textDecoration: 'underline',
    verticalAlign: 'middle',
  },
  select: {
    padding: '4px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  updateButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#8ce08a',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mapSection: {
    width: '800px',
    height: '30vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mapTitle: {
    margin: 0,
    fontSize: '1.2rem',
    marginBottom: '8px',
  },
  mapContainer: {
    height: '300px',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
  },
  mapInner: {
    height: '100%',
    width: '100%',
  },
  locateButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#8ce08a',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
};

export default OrderList;
