import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiGrid, FiPlay, FiBookmark, FiUser, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getWishlist, getCart } from '../../services/api.js';
import './Profile.css';

export default function Profile() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [wishRes, cartRes] = await Promise.all([getWishlist(), getCart()]);
        setWishlist(wishRes.wishlist || []);
        setCart(cartRes.cart || []);
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const getGridItems = () => {
    if (activeTab === 'saved') return wishlist;
    if (activeTab === 'tagged') return cart;
    if (activeTab === 'posts') return [...wishlist, ...cart];
    return wishlist.filter(d => d.videoUrl);
  };

  const gridItems = getGridItems();

  return (
    <div className="profile-page page-enter">
      
      {/* ── Header Section — staggered entrance ───────────────────── */}
      <motion.header 
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="profile-avatar-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
        >
          <div className="profile-avatar-wrapper">
            <div className="profile-large-avatar">
              {(userProfile?.username || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="profile-note-bubble">
              <span>Note...</span>
            </div>
          </div>
        </motion.div>

        <div className="profile-info-panel">
          <motion.div 
            className="profile-username-row"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="profile-username">{userProfile?.username || 'user_guest'}</h2>
            <motion.button 
              className="profile-settings-btn" 
              aria-label="Settings"
              whileHover={{ rotate: 30 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiSettings />
            </motion.button>
          </motion.div>

          <motion.div 
            className="profile-actions-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button className="btn btn-secondary profile-action-btn">Edit profile</button>
            <button
              className="btn btn-secondary profile-action-btn logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </motion.div>

          <motion.ul 
            className="profile-stats-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <li>
              <strong>{wishlist.length + cart.length}</strong> posts
            </li>
            <li>
              <strong>{wishlist.length}</strong> wishlist
            </li>
            <li>
              <strong>{cart.length}</strong> cart
            </li>
          </motion.ul>

          <motion.div 
            className="profile-bio-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <span className="profile-display-name">{userProfile?.username || 'Dress Curator'}</span>
            <p className="profile-bio-text">👗 Curating premium black & white fashion aesthetics on DressSwipe.</p>
            {user?.email && (
              <a href={`mailto:${user.email}`} className="profile-bio-link">
                @{user.email.split('@')[0]}
              </a>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* ── Highlights Section — staggered ────────────────────────── */}
      <motion.section 
        className="profile-highlights"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { emoji: '🕶️', label: 'eminence 2k26' },
          { emoji: '🧥', label: "winter '26" },
        ].map((h, i) => (
          <motion.div 
            key={h.label} 
            className="highlight-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.08 }}
          >
            <div className="highlight-ring">
              <span className="highlight-emoji">{h.emoji}</span>
            </div>
            <span className="highlight-label">{h.label}</span>
          </motion.div>
        ))}
        <motion.div 
          className="highlight-item creator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="highlight-ring new-ring">
            <span className="highlight-plus">+</span>
          </div>
          <span className="highlight-label">New</span>
        </motion.div>
      </motion.section>

      {/* ── Navigation Tabs ────────────────────────────────────── */}
      <div className="profile-tabs-bar">
        {[
          { key: 'posts', icon: FiGrid, label: 'POSTS' },
          { key: 'reels', icon: FiPlay, label: 'REELS' },
          { key: 'saved', icon: FiBookmark, label: 'SAVED' },
          { key: 'tagged', icon: FiUser, label: 'TAGGED' },
        ].map(tab => (
          <motion.button
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Grid View Content — animated transitions ────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            className="profile-grid-loading"
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="btn-spinner" />
          </motion.div>
        ) : gridItems.length > 0 ? (
          <motion.div 
            className="profile-grid" 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {gridItems.map((item, i) => (
              <motion.div 
                key={item.id} 
                className="grid-thumbnail-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <img
                  src={item.thumbnailUrl || '/placeholder.jpg'}
                  alt={item.title}
                  className="grid-thumbnail-image"
                />
                <div className="grid-thumbnail-badge">
                  <FiPlay />
                </div>
                <div className="grid-hover-overlay">
                  <div className="hover-stat">
                    <FiHeart /> <span>Like</span>
                  </div>
                  <div className="hover-stat">
                    <FiShoppingBag /> <span>Buy</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="profile-empty-grid"
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="empty-icon">
              {activeTab === 'saved' ? <FiBookmark /> : <FiGrid />}
            </div>
            <h3>No Items Found</h3>
            <p className="text-muted">
              {activeTab === 'saved'
                ? 'Dresses you wishlist will show up here.'
                : 'Dresses in your cart will show up here.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
