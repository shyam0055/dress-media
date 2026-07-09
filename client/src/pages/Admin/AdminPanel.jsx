import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiBarChart2, FiUsers, FiFilm, FiHeart, FiShoppingBag } from 'react-icons/fi';
import {
  adminGetStats, adminGetAllDresses, adminCreateDress, adminDeleteDress
} from '../../services/api.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';
import { CONSTANTS } from '../../constants.js';
import './Admin.css';

const TABS = ['stats', 'upload', 'catalogue'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [form, setForm] = useState({
    title: '', brand: '', description: '', price: '',
    category: '', sizes: [], colors: '', tags: '',
    videoFile: null, thumbnailFile: null,
  });

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
    if (activeTab === 'catalogue') loadDresses();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminGetStats();
      setStats(res.stats);
    } finally {
      setLoading(false);
    }
  };

  const loadDresses = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllDresses();
      setDresses(res.dresses);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSizeToggle = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const uploadFile = (file, resourceType = 'video') =>
    uploadToCloudinary(file, resourceType, setUploadProgress);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!form.videoFile) {
      setUploadError('Please select a video file.');
      return;
    }
    if (form.videoFile.size > 100 * 1024 * 1024) {
      setUploadError('Video must be under 100MB.');
      return;
    }

    setUploading(true);
    try {
      const videoResult = await uploadFile(form.videoFile, 'video');
      const videoUrl = videoResult.url;

      let thumbnailUrl = videoResult.thumbnailUrl;
      if (form.thumbnailFile) {
        const thumbResult = await uploadFile(form.thumbnailFile, 'image');
        thumbnailUrl = thumbResult.url;
      }

      await adminCreateDress({
        title: form.title,
        brand: form.brand,
        description: form.description,
        price: form.price,
        category: form.category,
        sizes: form.sizes,
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        videoUrl,
        thumbnailUrl,
      });

      setUploadSuccess('🎉 Dress reel uploaded successfully!');
      setForm({
        title: '', brand: '', description: '', price: '',
        category: '', sizes: [], colors: '', tags: '',
        videoFile: null, thumbnailFile: null,
      });
      setUploadProgress(0);
    } catch (err) {
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this dress from the feed?')) return;
    setDresses(prev => prev.filter(d => d.id !== id));
    try { await adminDeleteDress(id); } catch (err) {
      console.error('[Admin] Failed to delete dress:', id, err);
      loadDresses(); // refresh from server on failure
    }
  };

  return (
    <div className="admin-page page-enter">
      <motion.div 
        className="admin-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="admin-title gradient-text">Admin Panel</h1>
        <p className="text-muted">Manage the DressSwipe catalogue</p>
      </motion.div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <motion.button
            key={tab}
            id={`admin-tab-${tab}`}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileTap={{ scale: 0.96 }}
          >
            {tab === 'stats' && <FiBarChart2 />}
            {tab === 'upload' && <FiPlus />}
            {tab === 'catalogue' && <FiFilm />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* STATS TAB — staggered entrance */}
      {activeTab === 'stats' && (
        <motion.div 
          className="admin-stats-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats ? (
            <>
              {[
                { icon: FiUsers, value: stats.totalUsers, label: 'Total Users' },
                { icon: FiFilm, value: stats.totalDresses, label: 'Active Reels' },
                { icon: FiHeart, value: stats.wishlists, label: 'Wishlisted', extra: 'wishlist' },
                { icon: FiShoppingBag, value: stats.buys, label: 'Bought', extra: 'buy' },
              ].map((card) => (
                <motion.div 
                  key={card.label} 
                  className="stat-card glass-card"
                  variants={itemVariants}
                >
                  <card.icon className={`stat-card-icon ${card.extra || ''}`} />
                  <div className="stat-card-value">{card.value}</div>
                  <div className="stat-card-label text-muted">{card.label}</div>
                </motion.div>
              ))}
            </>
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="stat-card skeleton" style={{ height: 140 }} />
            ))
          )}
        </motion.div>
      )}

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
        <motion.form 
          className="admin-upload-form glass-card" 
          onSubmit={handleUpload}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="admin-section-title">Upload New Reel</h3>

          {uploadError && <div className="admin-alert admin-alert-error">{uploadError}</div>}
          {uploadSuccess && <div className="admin-alert admin-alert-success">{uploadSuccess}</div>}

          <div className="upload-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-title">Title *</label>
              <input id="admin-title" name="title" className="form-input" value={form.title}
                onChange={handleFormChange} placeholder="Floral Summer Dress" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-brand">Brand</label>
              <input id="admin-brand" name="brand" className="form-input" value={form.brand}
                onChange={handleFormChange} placeholder="Zara, H&M..." />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-price">Price (₹) *</label>
              <input id="admin-price" name="price" type="number" className="form-input"
                value={form.price} onChange={handleFormChange} placeholder="1999" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-category">Category *</label>
              <select id="admin-category" name="category" className="form-input"
                value={form.category} onChange={handleFormChange} required>
                <option value="">Select category</option>
                {CONSTANTS.CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-description">Description</label>
            <textarea id="admin-description" name="description" className="form-input admin-textarea"
              value={form.description} onChange={handleFormChange}
              placeholder="Describe the dress, fabric, occasion..." rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Sizes</label>
            <div className="size-selector">
              {CONSTANTS.SIZES.map(size => (
                <motion.button
                  key={size}
                  type="button"
                  className={`size-btn ${form.sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeToggle(size)}
                  whileTap={{ scale: 0.92 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="upload-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-colors">Colors (comma-separated)</label>
              <input id="admin-colors" name="colors" className="form-input"
                value={form.colors} onChange={handleFormChange} placeholder="red, blue, white" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-tags">Tags (comma-separated)</label>
              <input id="admin-tags" name="tags" className="form-input"
                value={form.tags} onChange={handleFormChange} placeholder="summer, floral, casual" />
            </div>
          </div>

          <div className="upload-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="admin-video">Video Reel * (max 100MB)</label>
              <input id="admin-video" name="videoFile" type="file"
                className="form-input file-input" accept="video/mp4,video/webm"
                onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-thumbnail">Thumbnail (optional)</label>
              <input id="admin-thumbnail" name="thumbnailFile" type="file"
                className="form-input file-input" accept="image/*"
                onChange={handleFormChange} />
            </div>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span>{uploadProgress}% uploaded</span>
            </div>
          )}

          <motion.button
            id="admin-upload-submit"
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
            style={{ height: 52 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? <span className="btn-spinner" /> : <><FiPlus /> Upload Reel</>}
          </motion.button>
        </motion.form>
      )}

      {/* CATALOGUE TAB */}
      {activeTab === 'catalogue' && (
        <div className="admin-catalogue">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="admin-dress-row skeleton" style={{ height: 80 }} />
            ))
          ) : dresses.length === 0 ? (
            <div className="collection-empty">
              <span>🎬</span>
              <h3>No reels uploaded yet</h3>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {dresses.map(dress => (
                <motion.div
                  key={dress.id}
                  className={`admin-dress-row glass-card ${!dress.isActive ? 'inactive' : ''}`}
                  layout
                  variants={itemVariants}
                >
                  <div className="admin-dress-thumb">
                    {dress.thumbnailUrl
                      ? <img src={dress.thumbnailUrl} alt={dress.title} />
                      : <span>🎬</span>
                    }
                  </div>
                  <div className="admin-dress-info">
                    <span className="admin-dress-title">{dress.title}</span>
                    <span className="text-muted admin-dress-meta">
                      {dress.brand} · ₹{dress.price?.toLocaleString()} · {dress.category}
                    </span>
                    <div className="admin-dress-stats">
                      <span>👁 {dress.viewCount || 0}</span>
                      <span>❤️ {dress.likeCount || 0}</span>
                      {!dress.isActive && <span className="badge badge-danger">Removed</span>}
                    </div>
                  </div>
                  <motion.button
                    className="btn btn-ghost btn-icon"
                    onClick={() => handleDelete(dress.id)}
                    aria-label="Remove dress"
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiTrash2 />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
