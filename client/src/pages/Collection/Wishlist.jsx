import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { getWishlist, removeFromWishlist, interactWithDress } from '../../services/api.js';
import DressGridCard from '../../components/Collection/DressGridCard.jsx';
import './Collection.css';

export default function Wishlist() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWishlist();
        setDresses(res.dresses);
      } catch (err) {
        console.error('[Wishlist] Failed to load:', err);
        setError('Could not load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try {
      await removeFromWishlist(dressId);
    } catch (err) {
      console.error('[Wishlist] Failed to remove:', dressId, err);
      const res = await getWishlist();
      setDresses(res.dresses);
    }
  };

  const handleMoveToBuy = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try {
      await interactWithDress(dressId, 'buy');
    } catch (err) {
      console.error('[Wishlist] Failed to move to cart:', dressId, err);
      const res = await getWishlist();
      setDresses(res.dresses);
    }
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
                showBuy={true}
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
