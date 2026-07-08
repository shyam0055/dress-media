import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/globals.css';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/feed');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again in 15 minutes.');
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="animated-bg" />

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">👗</span>
          <h1 className="auth-logo-text gradient-text">DressSwipe</h1>
          <p className="auth-tagline">Discover your perfect style</p>
        </div>

        {/* Form Card */}
        <div className="auth-card glass-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle text-muted">Sign in to continue swiping</p>

          {error && (
            <motion.div
              className="auth-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className={`form-input input-with-icon ${error ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input input-with-icon input-with-icon-right ${error ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-switch text-muted">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
