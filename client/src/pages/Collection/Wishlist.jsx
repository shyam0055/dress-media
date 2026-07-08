import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { getWishlist, removeFromWishlist, interactWithDress } from '../../services/api.js';
import './Collection.css';

function DressGridCard({ dress, onRemove, onMoveToBuy }) {
  return (
    <motion.div
      className="dress-grid-card glass-card"
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
    >
      <div className="dress-card-media">
        {dress.thumbnailUrl
          ? <img src={dress.thumbnailUrl} alt={dress.title} loading="lazy" />
          : <div className="dress-card-no-thumb">🎬</div>
        }
        <div className="dress-card-price-badge">
          ₹{dress.price?.toLocaleString()}
        </div>
      </div>
      <div className="dress-card-info">
        <h4 className="dress-card-title">{dress.title}</h4>
        <p className="dress-card-brand text-muted">{dress.brand}</p>
        <div className="dress-card-sizes">
          {dress.sizes?.slice(0, 4).map(s => (
            <span key={s} className="badge badge-accent">{s}</span>
          ))}
        </div>
        <div className="dress-card-actions">
          <button
            className="btn btn-buy dress-card-btn"
            onClick={() => onMoveToBuy(dress.id)}
            aria-label="Move to cart"
          >
            <FiShoppingBag /> Buy
          </button>
          <button
            className="btn btn-ghost dress-card-btn"
            onClick={() => onRemove(dress.id)}
            aria-label="Remove from wishlist"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Wishlist() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWishlist();
        setDresses(res.dresses);
      } catch {
        setError('Could not load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try { await removeFromWishlist(dressId); } catch { /* silent */ }
  };

  const handleMoveToBuy = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try { await interactWithDress(dressId, 'buy'); } catch { /* silent */ }
  };

  return (
    <div className="collection-page page-enter">
      <div className="collection-header">
        <FiHeart className="collection-header-icon wishlist-icon" />
        <div>
          <h1 className="collection-title">Wishlist</h1>
          <p className="text-muted">{dresses.length} saved {dresses.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {loading ? (
        <div className="collection-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="dress-grid-card skeleton" style={{ height: 300 }} />
          ))}
        </div>
      ) : error ? (
        <p className="collection-error text-muted">{error}</p>
      ) : dresses.length === 0 ? (
        <div className="collection-empty">
          <span className="collection-empty-icon">💝</span>
          <h3>Your wishlist is empty</h3>
          <p className="text-muted">Swipe left on dresses you love to save them here</p>
        </div>
      ) : (
        <motion.div className="collection-grid" layout>
          <AnimatePresence>
            {dresses.map(dress => (
              <DressGridCard
                key={dress.id}
                dress={dress}
                onRemove={handleRemove}
                onMoveToBuy={handleMoveToBuy}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
