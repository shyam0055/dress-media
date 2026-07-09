import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { getCart, removeFromCart, checkoutCart } from '../../services/api.js';
import DressGridCard from '../../components/Collection/DressGridCard.jsx';
import './Collection.css';

export default function Cart() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCart();
        setDresses(res.dresses);
      } catch (err) {
        console.error('[Cart] Failed to load:', err);
        setError('Could not load cart.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (dressId) => {
    setDresses(prev => prev.filter(d => d.id !== dressId));
    try {
      await removeFromCart(dressId);
    } catch (err) {
      console.error('[Cart] Failed to remove item:', dressId, err);
      const res = await getCart();
      setDresses(res.dresses);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError('');
    try {
      await checkoutCart();
      setDresses([]);
      setCheckoutSuccess(true);
    } catch (err) {
      console.error('[Cart] Checkout failed:', err);
      setError(err?.message || 'Checkout failed. Please try again.');
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
          <FiCheckCircle style={{ fontSize: '3rem', margin: '0 auto 20px auto', color: '#10b981', display: 'block' }} />
          <h2 className="collection-title" style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Order Placed!</h2>
          <p className="text-muted" style={{ marginBottom: '30px', fontSize: '0.8125rem' }}>
            Thank you for your purchase. The seller has been notified and is preparing your order.
          </p>
          <button className="btn btn-primary w-full" onClick={() => {
            setCheckoutSuccess(false);
            setDresses([]);
          }}>
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

      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

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
                <DressGridCard
                  key={dress.id}
                  dress={dress}
                  showBuy={false}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </motion.div>

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
