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
          fetch(`http://localhost:3000/api/vendor/${vendorId}/items`),
          fetch(`http://localhost:3000/api/orders/vendor/${vendorId}`)
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

  const chartData = {
    labels: dashboardData.salesData.map(item => item.date),
    datasets: [
      {
        label: 'Daily Sales ($)',
        data: dashboardData.salesData.map(item => item.amount),
        fill: false,
        borderColor: '#000000',
        tension: 0.3,
        pointBackgroundColor: '#000000',
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
        color: '#1e1e1e',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#1e1e1e' }
      },
      x: {
        ticks: { color: '#1e1e1e' }
      }
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#ffffff',
    minHeight: '100vh'
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    color: '#1e1e1e'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  };

  if (loading) return <div style={{ padding: '30px' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '30px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <h2 style={{ textAlign: 'center', color: '#1e1e1e' }}>Vendor Dashboard</h2>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}><h3>${dashboardData.totalSales.toLocaleString()}</h3><p>Total Sales</p></div>
        <div style={cardStyle}><h3>{dashboardData.todayOrders}</h3><p>Today's Orders</p></div>
        <div style={cardStyle}><h3>{dashboardData.pendingShipments}</h3><p>Pending Shipments</p></div>
        <div style={cardStyle}><h3>{dashboardData.totalProducts}</h3><p>Total Products</p></div>
      </div>

      <div style={sectionStyle}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '16px', color: '#1e1e1e' }}>Recent Orders</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Order ID</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Date</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Item</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Total</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #cccccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recentOrders.map(order => (
              <tr key={order.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>#{order.id}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>{order.date}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>{order.item}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>{order.quantity}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>${order.total.toFixed(2)}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #cccccc' }}>
                  <span style={{
                    backgroundColor: order.status === 'completed' ? '#000000' : '#888888',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dashboardData.recentOrders.length === 0 && <p style={{ padding: '20px', textAlign: 'center' }}>No recent orders found</p>}
      </div>
    </div>
  );
};

export default Dashboard;