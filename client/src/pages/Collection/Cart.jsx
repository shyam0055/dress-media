import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { getCart, removeFromCart, checkoutCart } from '../../services/api.js';
import './Collection.css';

export default function Cart() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCart();
        setDresses(res.dresses);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try { await removeFromCart(dressId); } catch { /* silent */ }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await checkoutCart();
      setDresses([]);
      setCheckoutSuccess(true);
    } catch (err) {
      console.error('Checkout failed', err);
    } finally {
      setCheckingOut(false);
    }
  };

  const total = dresses.reduce((sum, d) => sum + (d.price || 0), 0);

  if (checkoutSuccess) {
    return (
      <div className="collection-page page-enter flex flex-column items-center justify-center text-center" style={{ minHeight: '60dvh' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card"
          style={{ padding: '40px', maxWidth: '400px' }}
        >
          <FiCheckCircle className="collection-header-icon buy-icon" style={{ fontSize: '3rem', margin: '0 auto 20px auto', color: '#10b981' }} />
          <h2 className="collection-title" style={{ fontSize: '1.618rem', marginBottom: '10px' }}>Order Placed!</h2>
          <p className="text-muted" style={{ marginBottom: '30px', fontSize: '0.875rem' }}>
            Thank you for your purchase. The seller has been notified and is preparing your order.
          </p>
          <button className="btn btn-primary w-full" onClick={() => setCheckoutSuccess(false)}>
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="collection-page page-enter">
      <div className="collection-header">
        <FiShoppingBag className="collection-header-icon buy-icon" />
        <div>
          <h1 className="collection-title">Cart</h1>
          <p className="text-muted">{dresses.length} {dresses.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {loading ? (
        <div className="collection-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="dress-grid-card skeleton" style={{ height: 300 }} />
          ))}
        </div>
      ) : dresses.length === 0 ? (
        <div className="collection-empty">
          <span className="collection-empty-icon">🛍️</span>
          <h3>Your cart is empty</h3>
          <p className="text-muted">Swipe right on dresses to add them to your cart</p>
        </div>
      ) : (
        <>
          <motion.div className="collection-grid" layout>
            <AnimatePresence>
              {dresses.map(dress => (
                <motion.div
                  key={dress.id}
                  className="dress-grid-card glass-card"
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                >
                  <div className="dress-card-media">
                    {dress.thumbnailUrl
                      ? <img src={dress.thumbnailUrl} alt={dress.title} loading="lazy" />
                      : <div className="dress-card-no-thumb">🎬</div>
                    }
                    <div className="dress-card-price-badge buy-badge">
                      ₹{dress.price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="dress-card-info">
                    <h4 className="dress-card-title">{dress.title}</h4>
                    <p className="dress-card-brand text-muted">{dress.brand}</p>
                    <div className="dress-card-actions">
                      <button
                        className="btn btn-ghost dress-card-btn"
                        onClick={() => handleRemove(dress.id)}
                        aria-label="Remove from cart"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Checkout Summary */}
          <div className="cart-summary glass-card">
            <div className="cart-summary-row">
              <span className="text-muted">Subtotal ({dresses.length} items)</span>
              <span className="cart-total">₹{total.toLocaleString()}</span>
            </div>
            <button
              id="checkout-btn"
              className="btn btn-primary w-full"
              style={{ height: 52 }}
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                'Processing...'
              ) : (
                <><FiCreditCard /> Complete Purchase</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
