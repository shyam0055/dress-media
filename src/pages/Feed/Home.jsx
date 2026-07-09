import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import ReelCard from '../../components/ReelCard/ReelCard.jsx';
import { getDressFeed, interactWithDress } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './Home.css';

const MOCK_STORIES = [
  { id: 'all', name: 'All', emoji: '✨' },
  { id: 'zara', name: 'Zara', emoji: '👗' },
  { id: 'chanel', name: 'Chanel', emoji: '👜' },
  { id: 'balenciaga', name: 'Balenciaga', emoji: '🧥' },
  { id: 'gucci', name: 'Gucci', emoji: '🕶️' },
  { id: 'prada', name: 'Prada', emoji: '👠' },
  { id: 'dior', name: 'Dior', emoji: '💄' }
];

const MOCK_SUGGESTIONS = [
  { username: 'louis_vuitton', label: 'Louis Vuitton · Official' },
  { username: 'hypebeast_style', label: 'Hypebeast · Style & Design' },
  { username: 'voguerunway', label: 'Vogue Runway · Trending' }
];

export default function Home() {
  const { user, userProfile } = useAuth();
  const [dresses, setDresses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('all');

  const containerRef = useRef(null);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDressFeed({ limit: 20 });
      setDresses(res.dresses);
    } catch (err) {
      setError('Could not load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSwipeLeft = useCallback(async (dressId) => {
    showToast('Added to Wishlist ❤️', 'wishlist');
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'wishlist');
    } catch { /* silent fail */ }
  }, []);

  const handleSwipeRight = useCallback(async (dressId) => {
    showToast('Added to Cart 🛒', 'buy');
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'buy');
    } catch { /* silent fail */ }
  }, []);

  const handleSkip = useCallback(async (dressId) => {
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'skip');
    } catch { /* silent fail */ }
  }, []);

  // Filter dresses based on brand selection
  const filteredDresses = dresses.filter(dress => {
    if (selectedBrand === 'all') return true;
    return dress.brand?.toLowerCase() === selectedBrand;
  });

  useEffect(() => {
    const handleKey = (e) => {
      const current = filteredDresses[currentIndex];
      if (!current) return;
      if (e.key === 'ArrowDown' || e.key === 's') handleSkip(current.id);
      if (e.key === 'ArrowLeft' || e.key === 'a') handleSwipeLeft(current.id);
      if (e.key === 'ArrowRight' || e.key === 'd') handleSwipeRight(current.id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, filteredDresses, handleSkip, handleSwipeLeft, handleSwipeRight]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (currentIndex >= filteredDresses.length && filteredDresses.length > 0) {
      setCurrentIndex(0);
    }
  }, [selectedBrand, filteredDresses, currentIndex]);

  const currentDress = filteredDresses[currentIndex];

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-layout-grid">
          <div className="home-center-column">
            <div className="home-viewport">
              <div className="reel-skeleton skeleton" style={{ width: '100%', maxWidth: '440px', height: '600px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page home-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => loadFeed()}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home-page" ref={containerRef}>
      <div className="home-layout-grid">
        
        {/* ── Left/Center Column (Stories + Post Card) ────────────────── */}
        <div className="home-center-column">
          
          {/* Stories row */}
          <div className="home-stories-container">
            {MOCK_STORIES.map(story => (
              <button
                key={story.id}
                className={`story-circle-btn ${selectedBrand === story.id ? 'active' : ''}`}
                onClick={() => setSelectedBrand(story.id)}
              >
                <div className="story-avatar-ring">
                  <span className="story-emoji">{story.emoji}</span>
                </div>
                <span className="story-name">{story.name}</span>
              </button>
            ))}
          </div>

          {/* Active Post card container */}
          <div className="home-viewport">
            {currentDress ? (
              <AnimatePresence mode="wait">
                <ReelCard
                  key={currentDress.id}
                  dress={currentDress}
                  isActive={true}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  layout="home"
                />
              </AnimatePresence>
            ) : (
              <div className="home-empty-container">
                <span className="home-empty-icon">✨</span>
                <h3>No posts found</h3>
                <p className="text-muted">Try selecting a different brand story above</p>
                <button className="btn btn-secondary" onClick={() => setSelectedBrand('all')}>
                  View All Brands
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar (User Meta + Suggestions) ─────────────────── */}
        <aside className="home-right-sidebar">
          
          {/* User profile card */}
          <div className="sidebar-profile-card">
            <div className="profile-card-avatar">
              {userProfile?.username ? userProfile.username[0].toUpperCase() : 'U'}
            </div>
            <div className="profile-card-info">
              <span className="profile-card-username">{userProfile?.username || 'user_guest'}</span>
              <span className="profile-card-name">{user?.email || 'Guest Session'}</span>
            </div>
            <button className="profile-switch-btn">Switch</button>
          </div>

          {/* Suggestions Header */}
          <div className="suggestions-header">
            <span className="suggestions-title">Suggested for you</span>
            <button className="suggestions-see-all">See All</button>
          </div>

          {/* Suggestions List */}
          <div className="suggestions-list">
            {MOCK_SUGGESTIONS.map(s => (
              <div key={s.username} className="suggestion-item">
                <div className="suggestion-avatar">
                  {s.username[0].toUpperCase()}
                </div>
                <div className="suggestion-info">
                  <span className="suggestion-username">{s.username}</span>
                  <span className="suggestion-label">{s.label}</span>
                </div>
                <button className="suggestion-follow-btn">Follow</button>
              </div>
            ))}
          </div>

          {/* Footer credit links */}
          <footer className="sidebar-footer-links">
            <p>About · Help · Press · API · Jobs · Privacy · Terms</p>
            <p>© 2026 DRESSSWIPE FROM TEAM</p>
          </footer>
        </aside>

      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`feed-toast feed-toast-${toast.type}`}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
