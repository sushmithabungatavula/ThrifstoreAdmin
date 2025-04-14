import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalProducts: 0,
    todayOrders: 0,
    pendingShipments: 0,
    salesData: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorId = localStorage.getItem('vendorId');
        if (!vendorId) throw new Error('Vendor not authenticated');

        const [itemsRes, ordersRes] = await Promise.all([
          fetch(`https://thrifstorebackend.onrender.com/api/vendor/${vendorId}/items`),
          fetch(`https://thrifstorebackend.onrender.com/api/orders/vendor/${vendorId}`)
        ]);

        const checkJSON = async (res) => {
          if (!res.ok) {
            if (res.status === 404) return [];
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        };

        const items = await checkJSON(itemsRes);
        const orders = await checkJSON(ordersRes);
        const safeOrders = Array.isArray(orders) ? orders : [];

        // Calculate metrics
        const totalSales = safeOrders.reduce((sum, order) => 
          sum + (order.item_price * order.item_quantity), 0
        );

        const pendingShipments = safeOrders.filter(order => 
          ['processing', 'shipped'].includes(order.order_status?.toLowerCase())
        ).length;

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = safeOrders.filter(order => 
          order.order_date?.startsWith?.(today)
        ).length;

        // Process sales data for chart
        const salesMap = safeOrders.reduce((acc, order) => {
          const date = order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Unknown';
          acc[date] = (acc[date] || 0) + (order.item_price * order.item_quantity);
          return acc;
        }, {});

        const salesData = Object.entries(salesMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-7)
          .map(([date, amount]) => ({ date, amount }));

        setDashboardData({
          totalSales,
          totalProducts: items.length,
          todayOrders,
          pendingShipments,
          salesData,
          recentOrders: safeOrders.slice(0, 5).map(order => ({
            id: order.order_id,
            date: new Date(order.order_date).toLocaleDateString(),
            item: order.item_name,
            quantity: order.item_quantity,
            total: order.item_price * order.item_quantity,
            status: order.order_status
          }))
        });

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart configuration
  const chartData = {
    labels: dashboardData.salesData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Sales ($)',
        data: dashboardData.salesData.map(item => item.amount),
        fill: false,
        borderColor: '#8B26C2',
        tension: 0.2,
        pointBackgroundColor: '#8B26C2',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Sales Overview',
        color: '#2b292b',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#2b292b' },
      },
      x: {
        ticks: { color: '#2b292b' },
      },
    },
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#faf9fc',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle = {
    background: 'linear-gradient(45deg, #D873F5, #8B26C2)',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center',
  };

  const mainContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    flex: '1',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  };

  const statsCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    color: '#2b292b',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    color: '#2b292b',
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Vendor Dashboard</h1>
      </header>

      <div style={mainContentStyle}>
        <div style={statsGridStyle}>
          <div style={statsCardStyle}>
            <h3>${dashboardData.totalSales.toLocaleString()}</h3>
            <p>Total Sales</p>
          </div>
          <div style={statsCardStyle}>
            <h3>{dashboardData.todayOrders}</h3>
            <p>Today's Orders</p>
          </div>
          <div style={statsCardStyle}>
            <h3>{dashboardData.pendingShipments}</h3>
            <p>Pending Shipments</p>
          </div>
          <div style={statsCardStyle}>
            <h3>{dashboardData.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div style={sectionStyle}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div style={sectionStyle}>
          <h3>Recent Orders</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Item</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Quantity</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #eee' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>#{order.id}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{order.date}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{order.item}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{order.quantity}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>${order.total.toFixed(2)}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        background: order.status === 'completed' ? '#e6f9c8' : '#f7c8f9'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dashboardData.recentOrders.length === 0 && 
            <p style={{ padding: '16px', textAlign: 'center' }}>No recent orders found</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;