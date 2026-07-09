import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiVolume2, FiVolumeX } from 'react-icons/fi';
import './ReelCard.css';

const SWIPE_THRESHOLD = 80;

export default function ReelCard({ dress, onSwipeLeft, onSwipeRight, isActive, layout = 'reels' }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [swipeHint, setSwipeHint] = useState(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.5, 1, 1, 1, 0.5]);

  const wishlistOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const buyOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleDragEnd = useCallback((_e, info) => {
    const { offset } = info;

    if (offset.x < -SWIPE_THRESHOLD) {
      animate(x, -500, { duration: 0.25 });
      setTimeout(() => onSwipeLeft(dress.id), 250);
    } else if (offset.x > SWIPE_THRESHOLD) {
      animate(x, 500, { duration: 0.25 });
      setTimeout(() => onSwipeRight(dress.id), 250);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 25 });
    }
    setSwipeHint(null);
  }, [dress.id, onSwipeLeft, onSwipeRight, x]);

  const handleDrag = useCallback((_e, info) => {
    if (info.offset.x < -20) setSwipeHint('wishlist');
    else if (info.offset.x > 20) setSwipeHint('buy');
    else setSwipeHint(null);
  }, []);

  // ── Layout 1: Home Feed Post Style (stories-adjacent card layout) ──────
  if (layout === 'home') {
    return (
      <motion.div
        className="home-post-card"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        {/* Post Header */}
        <div className="post-header">
          <div className="post-avatar">
            {dress.brand ? dress.brand[0].toUpperCase() : 'D'}
          </div>
          <div className="post-meta">
            <span className="post-brand-name">{dress.brand || 'DRESSSWIPE'}</span>
            <span className="post-location">Sponsored · Shop Now</span>
          </div>
          <button className="post-options-btn" aria-label="More options">•••</button>
        </div>

        {/* Video Area (4/5 aspect ratio for home posts) */}
        <div className="post-media-area home-aspect">
          <video
            ref={videoRef}
            className="reel-video"
            src={dress.videoUrl}
            poster={dress.thumbnailUrl}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            aria-label={`Video post for ${dress.title}`}
            onClick={() => setMuted(p => !p)}
          />

          {/* Swipe Overlays inside video */}
          <motion.div
            className="swipe-overlay swipe-overlay-wishlist"
            style={{ opacity: wishlistOpacity }}
          >
            <FiHeart className="overlay-icon" />
            <span>Wishlist</span>
          </motion.div>

          <motion.div
            className="swipe-overlay swipe-overlay-buy"
            style={{ opacity: buyOpacity }}
          >
            <FiShoppingBag className="overlay-icon" />
            <span>Buy Now</span>
          </motion.div>

          <button
            className="reels-inner-mute-btn"
            onClick={(e) => { e.stopPropagation(); setMuted(p => !p); }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <FiVolumeX /> : <FiVolume2 />}
          </button>
        </div>

        {/* Post Caption Footer */}
        <div className="post-caption-section">
          <div className="post-caption-header">
            <span className="caption-brand">{dress.brand || 'DRESSSWIPE'}</span>
            <span className="caption-title">{dress.title}</span>
          </div>
          <div className="post-caption-price">
            <span className="currency-symbol">₹</span>
            <span className="price-amount">{dress.price?.toLocaleString()}</span>
          </div>
          {dress.description && <p className="caption-text">{dress.description}</p>}
          <div className="caption-details-row">
            <div className="caption-sizes">
              {dress.sizes?.map(size => (
                <span key={size} className="badge badge-accent">{size}</span>
              ))}
            </div>
            <div className="home-card-actions">
              <button className="btn btn-wishlist" onClick={() => onSwipeLeft(dress.id)}><FiHeart /> Wishlist</button>
              <button className="btn btn-buy" onClick={() => onSwipeRight(dress.id)}><FiShoppingBag /> Buy</button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Layout 2: Reels Section Style (caption on left, actions on right) ──
  return (
    <div className="reels-post-layout">
      
      {/* Left Caption Area (Desktop Only — aligned to bottom left of video) */}
      <div className="reels-desktop-caption-panel">
        <div className="reels-brand-header">
          <div className="reels-brand-avatar">
            {dress.brand ? dress.brand[0].toUpperCase() : 'D'}
          </div>
          <span className="reels-brand-name">{dress.brand || 'DRESSSWIPE'}</span>
        </div>
        
        <div className="reels-caption-body">
          <h4 className="reels-dress-title">{dress.title}</h4>
          {dress.description && (
            <p className="reels-dress-desc">{dress.description}</p>
          )}
          <div className="reels-dress-price">
            <span className="currency">₹</span>
            <span className="price">{dress.price?.toLocaleString()}</span>
          </div>
          <div className="reels-dress-sizes">
            {dress.sizes?.map(size => (
              <span key={size} className="badge badge-accent">{size}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Center 9:16 Video Card */}
      <motion.div
        className="reels-video-card"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        <video
          ref={videoRef}
          className="reel-video"
          src={dress.videoUrl}
          poster={dress.thumbnailUrl}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          aria-label={`Reel for ${dress.title}`}
          onClick={() => setMuted(p => !p)}
        />

        {/* Swipe Overlays inside video */}
        <motion.div
          className="swipe-overlay swipe-overlay-wishlist"
          style={{ opacity: wishlistOpacity }}
        >
          <FiHeart className="overlay-icon" />
          <span>Wishlist</span>
        </motion.div>

        <motion.div
          className="swipe-overlay swipe-overlay-buy"
          style={{ opacity: buyOpacity }}
        >
          <FiShoppingBag className="overlay-icon" />
          <span>Buy Now</span>
        </motion.div>

        {/* Mute Overlay Button inside video */}
        <button
          className="reels-inner-mute-btn"
          onClick={(e) => { e.stopPropagation(); setMuted(p => !p); }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>

        {/* Mobile Overlay Caption & Actions (Hidden on Desktop) */}
        <div className="reels-mobile-overlay-caption">
          <div className="mobile-brand-row">
            <div className="mobile-avatar">
              {dress.brand ? dress.brand[0].toUpperCase() : 'D'}
            </div>
            <span className="mobile-brand-name">{dress.brand || 'DRESSSWIPE'}</span>
          </div>
          <p className="mobile-caption-text">{dress.title}</p>
          <div className="mobile-price">₹{dress.price?.toLocaleString()}</div>
        </div>

        <div className="reels-mobile-overlay-actions">
          <button
            className="mobile-action-btn wishlist"
            onClick={(e) => { e.stopPropagation(); onSwipeLeft(dress.id); }}
          >
            <FiHeart />
          </button>
          <button
            className="mobile-action-btn buy"
            onClick={(e) => { e.stopPropagation(); onSwipeRight(dress.id); }}
          >
            <FiShoppingBag />
          </button>
        </div>
      </motion.div>

      {/* Right Actions Toolbar (Desktop Only — aligned to right of video) */}
      <div className="reels-desktop-actions-panel">
        <button
          className="reels-action-btn-circle wishlist-btn"
          onClick={() => onSwipeLeft(dress.id)}
          aria-label="Add to Wishlist"
        >
          <FiHeart />
        </button>
        <span className="reels-action-label">Wishlist</span>

        <button
          className="reels-action-btn-circle buy-btn"
          onClick={() => onSwipeRight(dress.id)}
          aria-label="Buy Now"
        >
          <FiShoppingBag />
        </button>
        <span className="reels-action-label">Buy Now</span>

        <button
          className="reels-action-btn-circle mute-btn"
          onClick={() => setMuted(p => !p)}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <span className="reels-action-label">{muted ? 'Muted' : 'Sound'}</span>
      </div>

    </div>
  );
}
