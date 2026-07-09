import axios from 'axios';
import { auth } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: attach Firebase ID token ─────────────────────────
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle token expiry ─────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true); // force refresh
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        // Token refresh failed — let auth context handle redirect
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ── API Service Functions ─────────────────────────────────────────────────

// Auth
export const registerUser = (data) => api.post('/api/auth/register', data);
export const verifyUser = (data) => api.post('/api/auth/verify', data);

// Dress Feed
export const getDressFeed = (params) => api.get('/api/dresses/feed', { params });
export const getDress = (id) => api.get(`/api/dresses/${id}`);
export const interactWithDress = (id, action) =>
  api.post(`/api/dresses/${id}/interact`, { action });

// User
export const getUserProfile = () => api.get('/api/user/profile');
export const updateUserProfile = (data) => api.put('/api/user/profile', data);
export const getWishlist = () => api.get('/api/user/wishlist');
export const removeFromWishlist = (dressId) => api.delete(`/api/user/wishlist/${dressId}`);
export const getCart = () => api.get('/api/user/cart');
export const removeFromCart = (dressId) => api.delete(`/api/user/cart/${dressId}`);

// Checkout & Orders
export const checkoutCart = () => api.post('/api/user/checkout');
export const getUserOrders = () => api.get('/api/user/orders');
export const updateOrderStatus = (orderId, status) => api.put(`/api/user/orders/${orderId}`, { status });

// Admin
export const adminGetAllDresses = () => api.get('/api/admin/dresses');
export const adminCreateDress = (data) => api.post('/api/admin/dress', data);
export const adminUpdateDress = (id, data) => api.put(`/api/admin/dress/${id}`, data);
export const adminDeleteDress = (id) => api.delete(`/api/admin/dress/${id}`);
export const adminGetStats = () => api.get('/api/admin/stats');

export default api;
