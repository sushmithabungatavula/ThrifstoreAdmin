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
  const ongoingOrders = orders.filter(
    ({ order_status }) => ['placed', 'shipped'].includes(order_status)
  );
  const cancelledOrders = orders.filter(({ order_status }) =>
    ['approve_cancel', 'cancelled'].includes(order_status)
  );
  const completedOrders = orders.filter(
    ({ order_status }) => order_status === 'delivered'
  );

  // ---------------------- New Handler for Cancel Approval ----------------------
  const handleApproveCancel = async (order) => {
    try {
      const refund_amount = order.item_price * order.item_quantity;
      const payment_method = 'Stripe';
      const comment = 'Approved cancellation and refund processed';
      const status = 'approved';

      // 1) update order to cancelled
      await axios.put(
        `http://localhost:3000/api/orders/${order.order_id}`,
        { order_status: 'cancelled' }
      );
      // 2) call admin approve
      const vendor_id = localStorage.getItem('vendorId');
      await axios.put(`http://localhost:3000/api/orders/admin/approve`, {
        order_id: order.order_id,
        return_id: order.return_id,
        status,
        vendor_id,
        refund_amount,
        payment_method,
        comment,
      });

      // 3) update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id
            ? { ...o, order_status: 'cancelled', return_status: status, refund_amount }
            : o
        )
      );
      alert('Cancellation and refund processed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to process cancellation approval.');
    }
  };

  // ---------------------- Retrieve Orders ----------------------
  const fetchOrders = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId') || 'demo_vendor';
      const { data } = await axios.get(
        `http://localhost:3000/api/orders/vendor/${vendorId}`
      );

      const ordersWithDetails = await Promise.all(
        data.map(async (o) => {
          let lat = null,
            lng = null;
          let customerName = 'Unknown Customer';
          let itemName = `Item ${o.item_id}`;

          // parse coords
          if (o.shipping_address && o.shipping_address !== 'null') {
            try {
              const { latitude, longitude } = JSON.parse(o.shipping_address);
              lat = parseFloat(latitude) || null;
              lng = parseFloat(longitude) || null;
            } catch {}
          }

          // fetch customer
          try {
            const { data: c } = await axios.get(
              `http://localhost:3000/api/customer/${o.customer_id}`
            );
            if (c.name) customerName = c.name;
          } catch {}

          // fetch item
          try {
            const { data: i } = await axios.get(
              `http://localhost:3000/api/item/${o.item_id}`
            );
            if (i.name) itemName = i.name;
          } catch {}

          // fetch return_id if cancelled
          let return_id = null;
          if (['approve_cancel', 'cancelled'].includes(o.order_status)) {
            try {
              const { data: rr } = await axios.get(
                `http://localhost:3000/api/orders/returns/${o.customer_id}`
              );
              const match = Array.isArray(rr)
                ? rr.find((r) => r.order_id === o.order_id)
                : null;
              if (match) return_id = match.return_id;
            } catch {}
          }

          return {
            ...o,
            lat,
            lng,
            customerName,
            itemName,
            return_id,
            tempStatus: o.order_status, // stage field
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- Shipping Creation ----------------------
  const handleCreateShipping = async (order) => {
    try {
      await axios.post(`http://localhost:3000/api/orders/shipping`, {
        order_id: order.order_id,
        shipping_method: 'Standard Shipping',
        shipping_cost: 5.0,
        shipping_date: new Date().toISOString(),
        tracking_number: `TRK${order.order_id}`,
        delivery_date: null,
        shipping_status: 'shipped',
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------- Status & Update Handlers ----------------------

  // updates only tempStatus
  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId ? { ...o, tempStatus: newStatus } : o
      )
    );
  };

  // commits tempStatus to order_status + API
  const handleUpdate = async (order) => {
    const newStatus = order.tempStatus;
    try {
      // shipped → create shipping
      if (newStatus === 'shipped') {
        await handleCreateShipping(order);
      }

      // persist status
      await axios.put(
        `http://localhost:3000/api/orders/${order.order_id}`,
        { order_status: newStatus }
      );

      // delivered → record payment
      if (newStatus === 'delivered') {
        const vendor_id = localStorage.getItem('vendorId');
        await axios.post(
          `http://localhost:3000/api/orders/${order.order_id}/payment`,
          {
            payment_amount: parseFloat(order.item_price),
            payment_method: 'card',
            status: 'paid',
            payment_type: 'credit',
            vendor_id,
          }
        );
      }

      // update local state: push temp → real status
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id
            ? { ...o, order_status: newStatus, tempStatus: newStatus }
            : o
        )
      );

      alert(`Order #${order.order_id} updated successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update order or record payment.');
    }
  };

  // ---------------------- Map Handlers ----------------------
  const handleOrderClick = (order) => {
    if (order.lat && order.lng) {
      setSelectedLocation([order.lat, order.lng]);
    } else {
      setSelectedLocation(null);
    }
  };

  const handleLocateMeClick = () => {
    if (!navigator.geolocation) return console.error('No geolocation');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const newLoc = [coords.latitude, coords.longitude];
        setCurrentLocation(newLoc);
        if (mapRef.current) mapRef.current.setView(newLoc, 13);
      },
      console.error
    );
  };

  // ---------------------- Rendering ----------------------
  return (
    <div style={styles.pageContainer}>
      <div style={styles.mapSection}>
        <h2 style={styles.mapTitle}>Map View</h2>
        <div style={styles.mapContainer}>
          <MapContainer
            center={currentLocation}
            zoom={13}
            style={styles.mapInner}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={defaultMarkerIcon}
              >
                <Popup>Order location</Popup>
              </Marker>
            )}
            <Updater locationToFocus={selectedLocation} />
          </MapContainer>
        </div>
      </div>

      <h1 style={styles.title}>Order List</h1>

      {/* Ongoing */}
      <div style={styles.content}>
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
                  <td style={styles.tdClickable}>
                    {order.order_id}
                  </td>
                  <td style={styles.td}>{order.customerName}</td>
                  <td style={styles.td}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <select
                      value={order.tempStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          order.order_id,
                          e.target.value
                        )
                      }
                      style={styles.select}
                    >
                      <option value="placed">placed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </td>
                  <td style={styles.td}>{order.itemName}</td>
                  <td style={styles.td}>{order.item_quantity}</td>
                  <td style={styles.td}>{order.item_price}</td>
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.updateButton,
                        backgroundColor:
                          order.tempStatus === 'placed'
                            ? '#d3d3d3'
                            : '#000',
                        cursor:
                          order.tempStatus === 'placed'
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      disabled={order.tempStatus === 'placed'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdate(order);
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

      {/* Cancelled */}
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
                  <td style={styles.tdClickable}>
                    {order.order_id}
                  </td>
                  <td style={styles.td}>{order.itemName}</td>
                  <td style={styles.td}>{order.customerName}</td>
                  <td style={styles.td}>{order.order_status}</td>
                  <td style={styles.td}>{order.item_quantity}</td>
                  <td style={styles.td}>{order.item_price}</td>
                  <td style={styles.td}>
                    {order.refund_amount
                      ? `$${order.refund_amount}`
                      : 'Pending'}
                  </td>
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

      {/* Completed */}
      <div style={styles.content}>
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
                  <td style={styles.tdClickable}>
                    {order.order_id}
                  </td>
                  <td style={styles.td}>{order.itemName}</td>
                  <td style={styles.td}>{order.customerName}</td>
                  <td style={styles.td}>
                    {new Date(order.order_date).toLocaleString()}
                  </td>
                  <td style={styles.td}>{order.order_status}</td>
                  <td style={styles.td}>{order.item_quantity}</td>
                  <td style={styles.td}>{order.item_price}</td>
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
    backgroundColor: '#fff',
    color: '#1e1e1e',
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    minHeight: '100vh',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    fontWeight: 600,
  },
  td: {
    padding: 10,
    borderBottom: '1px solid #ccc',
    fontSize: 14,
  },
  tdClickable: {
    padding: 10,
    fontSize: 14,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  tr: {
    transition: 'background-color 0.2s ease',
  },
  select: {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  updateButton: {
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    border: '1px solid #000',
  },
  approveButton: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 6,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 14,
  },
  locateButton: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 30,
    padding: '10px 20px',
    marginTop: 12,
    cursor: 'pointer',
  },
  mapSection: {
    width: '100%',
    maxWidth: 900,
    marginBottom: 30,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
  },
  mapInner: {
    height: '100%',
    width: '100%',
  },
};

export default OrderList;
