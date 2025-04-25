// Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const creditRef = useRef(null);
  const debitRef  = useRef(null);

  useEffect(() => {
    fetchData();
    fetchPayments();
  }, []);

  // 1. fetch dashboard metrics & chart data
  const fetchData = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) throw new Error('Vendor not authenticated');

      const [itemsRes, ordersRes] = await Promise.all([
        fetch(`http://localhost:3000/api/vendor/${vendorId}/items`),
        fetch(`http://localhost:3000/api/orders/vendor/${vendorId}`)
      ]);

      const parseOrEmpty = async (res) => {
        if (!res.ok) {
          if (res.status === 404) return [];
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      };

      const items  = await parseOrEmpty(itemsRes);
      const orders = await parseOrEmpty(ordersRes);

      const totalSales = orders.reduce(
        (sum, o) => sum + o.item_price * o.item_quantity,
        0
      );

      const pendingShipments = orders.filter(o =>
        ['processing', 'shipped'].includes(o.order_status?.toLowerCase())
      ).length;

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o =>
        o.order_date?.startsWith(today)
      ).length;

      const salesMap = orders.reduce((acc, o) => {
        const date = o.order_date
          ? new Date(o.order_date).toLocaleDateString()
          : 'Unknown';
        acc[date] = (acc[date] || 0) + o.item_price * o.item_quantity;
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
        recentOrders: orders.slice(0, 5).map(o => ({
          id: o.order_id,
          date: new Date(o.order_date).toLocaleDateString(),
          item: o.item_name,
          quantity: o.item_quantity,
          total: o.item_price * o.item_quantity,
          status: o.order_status
        }))
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. fetch & normalize payments
  const fetchPayments = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) throw new Error('Vendor not authenticated');

      const res = await fetch(`http://localhost:3000/api/orders/payments`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const all = await res.json();

      // only keep this vendor, and parse string amounts → numbers
      const normalized = all
        .filter(p => String(p.vendor_id) === vendorId)
        .map(p => ({
          ...p,
          payment_amount: parseFloat(p.payment_amount),
          total_balance_vendor: parseFloat(p.total_balance_vendor)
        }));

      setPayments(normalized);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  // split into credit vs. debit
  const creditPayments = payments.filter(p => p.payment_type === 'credit');
  const debitPayments  = payments.filter(p => p.payment_type === 'debit');

  // 3. PDF download helper
  const downloadPDF = (ref, title) => {
    if (!ref.current) return;
    html2canvas(ref.current, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF('p', 'pt', 'a4');
      const pageW   = pdf.internal.pageSize.getWidth();
      const imgW    = pageW - 40;
      const imgH    = (canvas.height * imgW) / canvas.width;
      pdf.setFontSize(14);
      pdf.text(title, 20, 30);
      pdf.addImage(imgData, 'PNG', 20, 50, imgW, imgH);
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    });
  };

  // 4. chart config
  const chartData = {
    labels: dashboardData.salesData.map(x => x.date),
    datasets: [{
      label: 'Daily Sales ($)',
      data: dashboardData.salesData.map(x => x.amount),
      fill: false,
      borderColor: '#000',
      tension: 0.3,
      pointBackgroundColor: '#000'
    }]
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
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#1e1e1e' } },
      x: { ticks: { color: '#1e1e1e' } }
    }
  };

  if (loading) return <div style={{ padding: 30 }}>Loading dashboard...</div>;
  if (error)   return <div style={{ padding: 30, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.containerStyle}>
      {/* Metrics */}
      <div style={styles.gridStyle}>
        <div style={styles.cardStyle}>
          <h3>${dashboardData.totalSales.toLocaleString()}</h3>
          <p>Total Sales</p>
        </div>
        <div style={styles.cardStyle}>
          <h3>{dashboardData.todayOrders}</h3>
          <p>Today's Orders</p>
        </div>
        <div style={styles.cardStyle}>
          <h3>{dashboardData.pendingShipments}</h3>
          <p>Pending Shipments</p>
        </div>
        <div style={styles.cardStyle}>
          <h3>{dashboardData.totalProducts}</h3>
          <p>Total Products</p>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.sectionStyle}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Payments */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={styles.sectionStyle}>
          <h3>Credit Payments</h3>
          <button onClick={() => downloadPDF(creditRef, 'Credit Payments')}>
            Download PDF
          </button>
          <table ref={creditRef} style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {creditPayments.map(p => (
                <tr key={p.payment_id}>
                  <td style={styles.td}>#{p.payment_id}</td>
                  <td style={styles.td}>
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    ${p.payment_amount.toFixed(2)} <span style={{ color: 'green' }}>▲</span>
                  </td>
                  <td style={styles.td}>{p.payment_method}</td>
                  <td style={styles.td}>
                    ${p.total_balance_vendor.toFixed(2)}
                  </td>
                </tr>
              ))}
              {creditPayments.length === 0 && (
                <tr><td style={styles.td} colSpan={5}>No credit payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.sectionStyle}>
          <h3>Debit Payments</h3>
          <button onClick={() => downloadPDF(debitRef, 'Debit Payments')}>
            Download PDF
          </button>
          <table ref={debitRef} style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {debitPayments.map(p => (
                <tr key={p.payment_id}>
                  <td style={styles.td}>#{p.payment_id}</td>
                  <td style={styles.td}>
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    ${p.payment_amount.toFixed(2)} <span style={{ color: 'red' }}>▼</span>
                  </td>
                  <td style={styles.td}>{p.payment_method}</td>
                  <td style={styles.td}>
                    ${p.total_balance_vendor.toFixed(2)}
                  </td>
                </tr>
              ))}
              {debitPayments.length === 0 && (
                <tr><td style={styles.td} colSpan={5}>No debit payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  containerStyle: {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  sectionStyle: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    flex: 1,
  },
  cardStyle: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    color: '#1e1e1e',
  },
  gridStyle: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 20,
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 10,
  },
  th: {
    textAlign: 'left',
    padding: 8,
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: 8,
    borderBottom: '1px solid #eee',
  },
};

export default Dashboard;
