import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiGrid, FiPlay, FiBookmark, FiUser, FiLogOut, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getWishlist, getCart } from '../../services/api.js';
import './Profile.css';

export default function Profile() {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // States for lists
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('saved'); // 'posts' | 'reels' | 'saved' | 'tagged'

  // Fetch lists
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

  // Combine lists for different tabs
  const getGridItems = () => {
    if (activeTab === 'saved') return wishlist;
    if (activeTab === 'tagged') return cart;
    if (activeTab === 'posts') return [...wishlist, ...cart];
    // reels tab returns mock uploaded dresses or brand reels
    return wishlist.filter(d => d.videoUrl);
  };

  const gridItems = getGridItems();

  return (
    <div className="profile-page page-enter">
      
      {/* ── Header Section (Instagram Desktop layout) ───────────────────── */}
      <header className="profile-header">
        
        {/* Left column: Avatar */}
        <div className="profile-avatar-container">
          <div className="profile-avatar-wrapper">
            <div className="profile-large-avatar">
              {(userProfile?.username || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="profile-note-bubble">
              <span>Note...</span>
            </div>
          </div>
        </div>

        {/* Right column: Info & actions */}
        <div className="profile-info-panel">
          <div className="profile-username-row">
            <h2 className="profile-username">{userProfile?.username || 'user_guest'}</h2>
            <button className="profile-settings-btn" aria-label="Settings">
              <FiSettings />
            </button>
          </div>

          <div className="profile-actions-row">
            <button className="btn btn-secondary profile-action-btn">Edit profile</button>
            <button
              className="btn btn-secondary profile-action-btn logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>

          <ul className="profile-stats-row">
            <li>
              <strong>{wishlist.length + cart.length}</strong> posts
            </li>
            <li>
              <strong>{wishlist.length}</strong> wishlist
            </li>
            <li>
              <strong>{cart.length}</strong> cart
            </li>
          </ul>

          <div className="profile-bio-details">
            <span className="profile-display-name">{userProfile?.username || 'Dress Curator'}</span>
            <p className="profile-bio-text">👗 Curating premium black & white fashion aesthetics on DressSwipe.</p>
            {user?.email && (
              <a href={`mailto:${user.email}`} className="profile-bio-link">
                @{user.email.split('@')[0]}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Highlights Section ────────────────────────────────────────── */}
      <section className="profile-highlights">
        <div className="highlight-item">
          <div className="highlight-ring">
            <span className="highlight-emoji">🕶️</span>
          </div>
          <span className="highlight-label">eminence 2k26</span>
        </div>
        <div className="highlight-item">
          <div className="highlight-ring">
            <span className="highlight-emoji">🧥</span>
          </div>
          <span className="highlight-label">winter '26</span>
        </div>
        <div className="highlight-item creator">
          <div className="highlight-ring new-ring">
            <span className="highlight-plus">+</span>
          </div>
          <span className="highlight-label">New</span>
        </div>
      </section>

      {/* ── Navigation Tabs ────────────────────────────────────────────── */}
      <div className="profile-tabs-bar">
        <button
          className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FiGrid className="tab-icon" />
          <span className="tab-label">POSTS</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveTab('reels')}
        >
          <FiPlay className="tab-icon" />
          <span className="tab-label">REELS</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <FiBookmark className="tab-icon" />
          <span className="tab-label">SAVED</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'tagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagged')}
        >
          <FiUser className="tab-icon" />
          <span className="tab-label">TAGGED</span>
        </button>
      </div>

      {/* ── Grid View Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="profile-grid-loading">
          <div className="btn-spinner" />
        </div>
      ) : gridItems.length > 0 ? (
        <div className="profile-grid">
          {gridItems.map((item) => (
            <div key={item.id} className="grid-thumbnail-card">
              <img
                src={item.thumbnailUrl || '/placeholder.jpg'}
                alt={item.title}
                className="grid-thumbnail-image"
              />
              {/* Play icon in top right to indicate reel/video */}
              <div className="grid-thumbnail-badge">
                <FiPlay />
              </div>
              {/* Hover overlay with likes/cart counts */}
              <div className="grid-hover-overlay">
                <div className="hover-stat">
                  <FiHeart /> <span>Like</span>
                </div>
                <div className="hover-stat">
                  <FiShoppingBag /> <span>Buy</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-empty-grid">
          <div className="empty-icon">
            {activeTab === 'saved' ? <FiBookmark /> : <FiGrid />}
          </div>
          <h3>No Items Found</h3>
          <p className="text-muted">
            {activeTab === 'saved'
              ? 'Dresses you wishlist will show up here.'
              : 'Dresses in your cart will show up here.'}
          </p>
        </div>
      )}

    </div>
  );
}
