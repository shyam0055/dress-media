import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiUsers, FiFilm, FiHeart, FiShoppingBag } from 'react-icons/fi';
import {
  adminGetStats, adminGetAllDresses, adminCreateDress, adminDeleteDress
} from '../../services/api.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';
import { CONSTANTS } from '../../constants.js';
import './Admin.css';

const TABS = ['stats', 'upload', 'catalogue'];

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

  // Upload via Cloudinary with real progress tracking
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
      // Upload video — Cloudinary auto-generates thumbnail from first frame
      const videoResult = await uploadFile(form.videoFile, 'video');
      const videoUrl = videoResult.url;

      // Use auto-generated thumbnail OR upload a custom one if provided
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
    try { await adminDeleteDress(id); } catch { /* silent */ }
  };

  return (
    <div className="admin-page page-enter">
      <div className="admin-header">
        <h1 className="admin-title gradient-text">Admin Panel</h1>
        <p className="text-muted">Manage the DressSwipe catalogue</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`admin-tab-${tab}`}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'stats' && <FiBarChart2 />}
            {tab === 'upload' && <FiPlus />}
            {tab === 'catalogue' && <FiFilm />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="admin-stats-grid">
          {stats ? (
            <>
              <div className="stat-card glass-card">
                <FiUsers className="stat-card-icon" />
                <div className="stat-card-value">{stats.totalUsers}</div>
                <div className="stat-card-label text-muted">Total Users</div>
              </div>
              <div className="stat-card glass-card">
                <FiFilm className="stat-card-icon" />
                <div className="stat-card-value">{stats.totalDresses}</div>
                <div className="stat-card-label text-muted">Active Reels</div>
              </div>
              <div className="stat-card glass-card" style={{ '--card-color': 'var(--wishlist-color)' }}>
                <FiHeart className="stat-card-icon wishlist" />
                <div className="stat-card-value">{stats.wishlists}</div>
                <div className="stat-card-label text-muted">Wishlisted</div>
              </div>
              <div className="stat-card glass-card" style={{ '--card-color': 'var(--buy-color)' }}>
                <FiShoppingBag className="stat-card-icon buy" />
                <div className="stat-card-value">{stats.buys}</div>
                <div className="stat-card-label text-muted">Bought</div>
              </div>
            </>
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="stat-card skeleton" style={{ height: 140 }} />
            ))
          )}
        </div>
      )}

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
        <form className="admin-upload-form glass-card" onSubmit={handleUpload}>
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

          {/* Sizes */}
          <div className="form-group">
            <label className="form-label">Sizes</label>
            <div className="size-selector">
              {CONSTANTS.SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-btn ${form.sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </button>
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

          {/* File uploads */}
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

          <button
            id="admin-upload-submit"
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
            style={{ height: 52 }}
          >
            {uploading ? <span className="btn-spinner" /> : <><FiPlus /> Upload Reel</>}
          </button>
        </form>
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
            dresses.map(dress => (
              <motion.div
                key={dress.id}
                className={`admin-dress-row glass-card ${!dress.isActive ? 'inactive' : ''}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => handleDelete(dress.id)}
                  aria-label="Remove dress"
                >
                  <FiTrash2 />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
