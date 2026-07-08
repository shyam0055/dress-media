import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Feed from './pages/Feed/Feed.jsx';
import Wishlist from './pages/Collection/Wishlist.jsx';
import Cart from './pages/Collection/Cart.jsx';
import Profile from './pages/Profile/Profile.jsx';
import AdminPanel from './pages/Admin/AdminPanel.jsx';
import Home from './pages/Feed/Home.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import './styles/globals.css';

// ── Protected Route Wrapper ────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <span style={{ fontSize: '3rem' }}>👗</span>
        <div className="btn-spinner" style={{ borderTopColor: 'var(--accent-primary)', width: 32, height: 32 }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// ── Seller Route Wrapper ───────────────────────────────────────────────────
function SellerRoute({ children }) {
  const { user, loading, isSeller, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSeller && !isAdmin) return <Navigate to="/home" replace />;
  return children;
}

// ── Admin/Seller Route Wrapper ─────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, loading, isAdmin, isSeller } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !isSeller) return <Navigate to="/home" replace />;
  return children;
}

// ── App Layout (with Navbar) ───────────────────────────────────────────────
function AppLayout() {
  return (
    <>
      <div className="animated-bg" aria-hidden="true" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><SellerRoute><Dashboard /></SellerRoute></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (no navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected routes (with navbar) */}
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
