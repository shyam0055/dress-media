import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import ReelCard from '../../components/ReelCard/ReelCard.jsx';
import { getDressFeed, interactWithDress } from '../../services/api.js';
import './Feed.css';

export default function Feed() {
  const [dresses, setDresses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ hasMore: true, nextCursor: null });
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('swipe_tutorial_seen');
  });

  const containerRef = useRef(null);
  const [pullRefreshY, setPullRefreshY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartRef = useRef(null);

  // ── Pull-to-Refresh for Mobile ──────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY <= 0 && !loading && !loadingMore) {
      touchStartRef.current = e.touches[0].clientY;
    }
  }, [loading, loadingMore]);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;
    const diff = e.touches[0].clientY - touchStartRef.current;
    if (diff > 0) {
      setPullRefreshY(Math.min(diff * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullRefreshY > 60) {
      setIsRefreshing(true);
      loadFeed().finally(() => {
        setIsRefreshing(false);
        setPullRefreshY(0);
      });
    } else {
      setPullRefreshY(0);
    }
    touchStartRef.current = null;
  }, [pullRefreshY, loadFeed]);

  const dismissTutorial = useCallback(() => {
    if (showTutorial) {
      setShowTutorial(false);
      localStorage.setItem('swipe_tutorial_seen', 'true');
    }
  }, [showTutorial]);

  const loadFeed = useCallback(async (cursor = null) => {
    try {
      cursor ? setLoadingMore(true) : setLoading(true);
      const res = await getDressFeed({ cursor, limit: 20 });
      setDresses(prev => cursor ? [...prev, ...res.dresses] : res.dresses);
      setPagination(res.pagination);
    } catch (err) {
      console.error('[Feed] Error loading feed:', err);
      const msg = err?.message || err?.error?.message || 'Could not load feed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSwipeLeft = useCallback(async (dressId) => {
    dismissTutorial();
    showToast('Added to Wishlist ❤️', 'wishlist');
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'wishlist');
    } catch { /* silent fail */ }
  }, [dismissTutorial]);

  const handleSwipeRight = useCallback(async (dressId) => {
    dismissTutorial();
    showToast('Added to Cart 🛒', 'buy');
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'buy');
    } catch { /* silent fail */ }
  }, [dismissTutorial]);

  const handleSkip = useCallback(async (dressId) => {
    dismissTutorial();
    setCurrentIndex(prev => prev + 1);
    try {
      await interactWithDress(dressId, 'skip');
    } catch { /* silent fail */ }
  }, [dismissTutorial]);

  useEffect(() => {
    const handleKey = (e) => {
      const current = dresses[currentIndex];
      if (!current) return;
      if (e.key === 'ArrowDown' || e.key === 's') handleSkip(current.id);
      if (e.key === 'ArrowUp' || e.key === 'w') setCurrentIndex(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowLeft' || e.key === 'a') handleSwipeLeft(current.id);
      if (e.key === 'ArrowRight' || e.key === 'd') handleSwipeRight(current.id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, dresses, handleSkip, handleSwipeLeft, handleSwipeRight]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const currentDress = dresses[currentIndex];

  if (loading && dresses.length === 0) {
    return (
      <div className="feed-page">
        <div className="reels-main-layout">
          <div className="reels-center-viewport">
            <SkeletonReel />
          </div>
        </div>
      </div>
    );
  }

  function SkeletonReel() {
    return <div className="reel-skeleton skeleton" />;
  }

  if (error && dresses.length === 0) {
    return (
      <div className="feed-page feed-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => loadFeed()}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="feed-page" ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullRefreshY > 0 && (
        <div
          className="feed-pull-indicator"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: `${pullRefreshY}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: 'var(--bg-base)',
            transition: 'background 0.2s',
          }}
        >
          {isRefreshing ? (
            <span className="btn-spinner" style={{ borderTopColor: 'var(--text-primary)', width: 20, height: 20 }} />
          ) : pullRefreshY > 60 ? (
            'Release to refresh'
          ) : (
            'Pull to refresh'
          )}
        </div>
      )}
      <div className="reels-main-layout">
        
        {/* ── Center Viewport carrying ReelPost ────────────────────────── */}
        <div className="reels-center-viewport">
          {currentDress ? (
            <AnimatePresence mode="wait">
              <ReelCard
                key={currentDress.id}
                dress={currentDress}
                isActive={true}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            </AnimatePresence>
          ) : (
            <div className="feed-empty-container">
              <span className="feed-empty-icon">✨</span>
              <h3>You've seen everything!</h3>
              <p className="text-muted">Check back later for new arrivals</p>
              <button className="btn btn-secondary" onClick={() => { setCurrentIndex(0); loadFeed(); }}>
                <FiRefreshCw /> Refresh Feed
              </button>
            </div>
          )}
        </div>

        {/* ── Reels Up/Down Navigation Arrows (Desktop Only) ──────────────── */}
        <div className="reels-navigation-arrows">
          <button
            className="reels-nav-arrow"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            aria-label="Previous Reel"
          >
            <FiChevronUp />
          </button>
          <button
            className="reels-nav-arrow"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={currentIndex >= dresses.length - 1}
            aria-label="Next Reel"
          >
            <FiChevronDown />
          </button>
        </div>

      </div>

      {/* Keyboard hint info */}
      <div className="feed-key-hint">
        <span>← Wishlist</span>
        <span>↑ Skip / Back</span>
        <span>→ Buy</span>
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

      {/* Tutorial overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="feed-tutorial-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissTutorial}
          >
            <motion.div
              className="tutorial-content glass-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="tutorial-title">How to Swipe</h3>
              <p className="tutorial-subtitle text-muted">Quick tips to discover fashion</p>
              
              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <span className="step-icon wishlist">❤️</span>
                  <div className="step-text">
                    <strong>Swipe Left</strong> or press <strong>←</strong> key to add a dress to your <strong>Wishlist</strong>.
                  </div>
                </div>
                
                <div className="tutorial-step">
                  <span className="step-icon buy">🛍️</span>
                  <div className="step-text">
                    <strong>Swipe Right</strong> or press <strong>→</strong> key to add a dress to your <strong>Cart</strong>.
                  </div>
                </div>

                <div className="tutorial-step">
                  <span className="step-icon skip">🎬</span>
                  <div className="step-text">
                    <strong>Scroll Down</strong> or press <strong>↓</strong> key to <strong>Skip</strong> to the next reel.
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-full tutorial-btn" onClick={dismissTutorial}>
                Start Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
