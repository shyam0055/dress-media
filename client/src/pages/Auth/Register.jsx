import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import './Auth.css';

// Password strength checker
const checkPasswordStrength = (password) => {
  const rules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(p) },
  ];
  const passed = rules.filter(r => r.test(password)).length;
  return { rules, passed, strength: passed / rules.length };
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [role, setRole] = useState('buyer'); // 'buyer' | 'seller'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { rules, passed, strength } = checkPasswordStrength(form.password);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passed];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][passed];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (passed < 5) {
      setError('Please meet all password requirements.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password, username: form.username, role });
      if (role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.msg || err?.message || '';
      if (msg.includes('email-already-exists') || msg.includes('already exists')) {
        setError('An account with this email already exists.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
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
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo — Bounce entrance */}
        <motion.div 
          className="auth-logo"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        >
          <span className="auth-logo-icon">👗</span>
          <h1 className="auth-logo-text gradient-text">DressSwipe</h1>
          <p className="auth-tagline">Start your fashion journey</p>
        </motion.div>

        <div className="auth-card glass-card">
          <motion.h2 
            className="auth-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Create account
          </motion.h2>
          <p className="auth-subtitle text-muted">Join thousands of fashion lovers</p>

          {error && (
            <motion.div
              className="auth-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Role Selector Segment Control */}
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="form-label text-xs uppercase letter-spacing">Account Type</label>
              <div className="role-selector-group">
                <button
                  type="button"
                  className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
                  onClick={() => setRole('buyer')}
                >
                  👗 Buyer
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'seller' ? 'active' : ''}`}
                  onClick={() => setRole('seller')}
                >
                  💼 Seller
                </button>
              </div>
            </motion.div>

            {/* Username */}
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  className="form-input input-with-icon"
                  placeholder="fashionista"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="form-input input-with-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input input-with-icon input-with-icon-right"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="new-password"
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

              {/* Strength Meter */}
              <AnimatePresence>
                {(passwordFocused || form.password) && (
                  <motion.div
                    className="password-strength"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="strength-bar-wrapper">
                      <div
                        className="strength-bar-fill"
                        style={{ width: `${strength * 100}%`, background: strengthColor }}
                      />
                    </div>
                    {form.password && (
                      <span className="strength-label" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </span>
                    )}
                    <ul className="strength-rules">
                      {rules.map((rule) => (
                        <li
                          key={rule.label}
                          className={`strength-rule ${rule.test(form.password) ? 'passed' : ''}`}
                        >
                          <FiCheck className="rule-icon" />
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  className={`form-input input-with-icon ${
                    form.confirm && form.password !== form.confirm ? 'error' : ''
                  }`}
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="form-error"><FiAlertCircle /> Passwords don't match</p>
              )}
            </motion.div>

            <motion.button
              id="register-submit"
              type="submit"
              className="btn btn-primary w-full auth-submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </motion.button>
          </form>

          <p className="auth-switch text-muted">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
