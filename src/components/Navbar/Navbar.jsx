import { NavLink } from 'react-router-dom';
import { FiHome, FiPlay, FiHeart, FiShoppingBag, FiUser, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import './Navbar.css';

export default function Navbar() {
  const { isSeller, isAdmin } = useAuth();

  return (
    <>
      {/* ── Left Sidebar (Desktop Only — Instagram Web Style) ────────────── */}
      <aside className="desktop-sidebar" aria-label="Sidebar navigation">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-icon">👗</span>
            <span className="brand-name">DressSwipe</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {isSeller ? (
            /* Seller Specific Desktop Items */
            <>
              <NavLink
                to="/dashboard"
                id="sidebar-dashboard"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiTrendingUp className="nav-icon" />
                <span className="nav-label">Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin"
                id="sidebar-seller-catalog"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiShield className="nav-icon" />
                <span className="nav-label">Catalog</span>
              </NavLink>
            </>
          ) : (
            /* Buyer Specific Desktop Items */
            <>
              <NavLink
                to="/home"
                id="sidebar-home"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiHome className="nav-icon" />
                <span className="nav-label">Home</span>
              </NavLink>

              <NavLink
                to="/feed"
                id="sidebar-feed"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiPlay className="nav-icon" />
                <span className="nav-label">Reels</span>
              </NavLink>

              <NavLink
                to="/wishlist"
                id="sidebar-wishlist"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiHeart className="nav-icon" />
                <span className="nav-label">Wishlist</span>
              </NavLink>

              <NavLink
                to="/cart"
                id="sidebar-cart"
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <FiShoppingBag className="nav-icon" />
                <span className="nav-label">Cart</span>
              </NavLink>
            </>
          )}

          {/* Admin link if they are general admin but not specific seller */}
          {isAdmin && !isSeller && (
            <NavLink
              to="/admin"
              id="sidebar-admin"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <FiShield className="nav-icon" />
              <span className="nav-label">Admin</span>
            </NavLink>
          )}

          <NavLink
            to="/profile"
            id="sidebar-profile"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <FiUser className="nav-icon" />
            <span className="nav-label">Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Top Bar (Mobile/Tablet Only) ──────────────────────────────── */}
      <header className="top-bar" role="banner">
        <div className="top-bar-inner">
          <div className="brand">
            <span className="brand-icon">👗</span>
            <span className="brand-name">DressSwipe</span>
          </div>
          <div className="top-bar-actions">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Bottom Navigation (Mobile/Tablet Only) ────────────────────── */}
      <nav className="bottom-nav" aria-label="Bottom navigation">
        {isSeller ? (
          /* Seller Mobile Navigation Links */
          <>
            <NavLink
              to="/dashboard"
              id="nav-dashboard"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiTrendingUp className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin"
              id="nav-seller-catalog"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiShield className="nav-icon" />
              <span className="nav-label">Catalog</span>
            </NavLink>
          </>
        ) : (
          /* Buyer Mobile Navigation Links */
          <>
            <NavLink
              to="/home"
              id="nav-home"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiHome className="nav-icon" />
              <span className="nav-label">Home</span>
            </NavLink>

            <NavLink
              to="/feed"
              id="nav-feed"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiPlay className="nav-icon" />
              <span className="nav-label">Reels</span>
            </NavLink>

            <NavLink
              to="/wishlist"
              id="nav-wishlist"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiHeart className="nav-icon" />
              <span className="nav-label">Wishlist</span>
            </NavLink>

            <NavLink
              to="/cart"
              id="nav-cart"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiShoppingBag className="nav-icon" />
              <span className="nav-label">Cart</span>
            </NavLink>
          </>
        )}

        {isAdmin && !isSeller && (
          <NavLink
            to="/admin"
            id="nav-admin"
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiShield className="nav-icon" />
            <span className="nav-label">Admin</span>
          </NavLink>
        )}

        <NavLink
          to="/profile"
          id="nav-profile"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <FiUser className="nav-icon" />
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
