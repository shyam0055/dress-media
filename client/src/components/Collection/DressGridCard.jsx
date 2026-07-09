import { memo } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTrash2, FiHeart } from 'react-icons/fi';

function DressGridCard({ dress, onRemove, onMoveToBuy, showBuy = false }) {
  return (
    <motion.div
      className="dress-grid-card"
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
    >
      <div className="dress-card-media">
        {dress.thumbnailUrl
          ? <img src={dress.thumbnailUrl} alt={dress.title} loading="lazy" width={300} height={400} />
          : <div className="dress-card-no-thumb">🎬</div>
        }
        <div className="dress-card-price-badge">
          ₹{dress.price?.toLocaleString()}
        </div>
      </div>
      <div className="dress-card-info">
        <h4 className="dress-card-title">{dress.title}</h4>
        <p className="dress-card-brand text-muted">{dress.brand}</p>
        {dress.sizes && (
          <div className="dress-card-sizes">
            {dress.sizes.slice(0, 4).map(s => (
              <span key={s} className="badge badge-accent">{s}</span>
            ))}
          </div>
        )}
        <div className="dress-card-actions">
          {showBuy && (
            <button
              className="btn btn-buy dress-card-btn"
              onClick={() => onMoveToBuy?.(dress.id)}
              aria-label="Move to cart"
            >
              <FiShoppingBag /> Buy
            </button>
          )}
          <button
            className={`btn ${showBuy ? 'btn-ghost' : 'btn-buy'} dress-card-btn`}
            onClick={() => onRemove(dress.id)}
            aria-label="Remove item"
          >
            <FiTrash2 /> {showBuy ? '' : 'Remove'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(DressGridCard);
