import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShoppingBag, FiLayers, FiCheck, FiTruck, FiClock } from 'react-icons/fi';
import { getUserOrders, updateOrderStatus, adminGetAllDresses } from '../../services/api.js';
import './Dashboard.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, dressesRes] = await Promise.all([
          getUserOrders(),
          adminGetAllDresses(),
        ]);
        setOrders(ordersRes.orders || []);
        setDresses(dressesRes || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.dressPrice || 0), 0);

  if (loading) {
    return (
      <div className="dashboard-page flex items-center justify-center" style={{ minHeight: '60dvh' }}>
        <div className="btn-spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-page page-enter">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dashboard-title">Seller Dashboard</h1>
        <p className="text-muted">Manage your catalog, sales metrics, and delivery status</p>
      </motion.div>

      {/* ── Key Metrics Cards — staggered entrance ──────────────── */}
      <motion.div 
        className="dashboard-metrics"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: FiTrendingUp, label: 'Total Sales', value: `₹${totalRevenue.toLocaleString()}` },
          { icon: FiShoppingBag, label: 'Total Orders', value: orders.length },
          { icon: FiLayers, label: 'Active Listings', value: dresses.length },
        ].map((m) => (
          <motion.div key={m.label} className="metric-card glass-card" variants={itemVariants}>
            <div className="metric-icon revenue"><m.icon /></div>
            <div className="metric-details">
              <span className="metric-label text-muted">{m.label}</span>
              <h3 className="metric-value">{m.value}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── SVG Sales Chart & Order Queue split ─────────────────── */}
      <div className="dashboard-content-grid">
        
        {/* Sales performance chart */}
        <motion.div 
          className="dashboard-chart-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="card-title">Weekly Performance</h3>
          <div className="chart-wrapper">
            <svg viewBox="0 0 400 200" className="sales-svg-chart">
              <line x1="40" y1="30" x2="380" y2="30" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="380" y2="80" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="380" y2="130" stroke="var(--border-color)" strokeDasharray="4 4" />
              <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" />

              <path
                d="M 60 160 Q 110 120 160 140 T 260 70 T 360 40"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="3"
              />

              <circle cx="60" cy="160" r="4" fill="var(--text-primary)" />
              <circle cx="160" cy="140" r="4" fill="var(--text-primary)" />
              <circle cx="260" cy="70" r="4" fill="var(--text-primary)" />
              <circle cx="360" cy="40" r="4" fill="var(--text-primary)" />

              <text x="60" y="190" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Mon</text>
              <text x="160" y="190" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Wed</text>
              <text x="260" y="190" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Fri</text>
              <text x="360" y="190" fontSize="10" fill="var(--text-muted)" textAnchor="middle">Sun</text>
            </svg>
          </div>
        </motion.div>

        {/* Orders List / Tracker */}
        <motion.div 
          className="dashboard-orders-card glass-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="card-title">Order Fulfillment</h3>
          
          {orders.length === 0 ? (
            <div className="orders-empty text-center">
              <span className="empty-icon">📦</span>
              <p className="text-muted">No orders received yet.</p>
            </div>
          ) : (
            <div className="orders-queue-list">
              {orders.map(order => (
                <div key={order.id} className="order-fulfillment-item">
                  <div className="order-item-header">
                    <span className="order-item-title">{order.dressTitle}</span>
                    <span className="order-item-price">₹{order.dressPrice?.toLocaleString()}</span>
                  </div>
                  
                  <div className="order-item-buyer">
                    <span className="text-muted">Buyer:</span> {order.buyerUsername} · <span className="text-muted">Size:</span> {order.size}
                  </div>

                  <div className="order-item-footer">
                    <div className="order-status-badge">
                      {order.status === 'delivered' ? (
                        <span className="status-badge delivered"><FiCheck /> Delivered</span>
                      ) : order.status === 'shipped' ? (
                        <span className="status-badge shipped"><FiTruck /> Shipped</span>
                      ) : (
                        <span className="status-badge pending"><FiClock /> Pending</span>
                      )}
                    </div>

                    {order.status !== 'delivered' && (
                      <div className="order-action-dropdown">
                        <select
                          className="status-selector-input"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
