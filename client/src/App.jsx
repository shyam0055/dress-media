import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Feed from './pages/Feed/Feed.jsx';
import Wishlist from './pages/Collection/Wishlist.jsx';
import Cart from './pages/Collection/Cart.jsx';
import Profile from './pages/Profile/Profile.jsx';
import AdminPanel from './pages/Admin/AdminPanel.jsx';
import Home from './pages/Feed/Home.jsx';
import Dashboard from './pages/Admin/Dashboard.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';
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

// ── Role Route Wrapper (Seller & Admin) ───────────────────────────────────
function RoleRoute({ children }) {
  const { user, loading, isAdmin, isSeller } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !isSeller) return <Navigate to="/home" replace />;
  return children;
}

// ── App Layout (with Navbar) ───────────────────────────────────────────────
function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppLayout() {
  const location = useLocation();
  
  return (
    <>
      <div className="animated-bg" aria-hidden="true" />
      <Navbar />
      <main>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/dashboard" element={<ProtectedRoute><RoleRoute><AnimatedPage><Dashboard /></AnimatedPage></RoleRoute></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><AnimatedPage><Home /></AnimatedPage></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><AnimatedPage><Feed /></AnimatedPage></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><AnimatedPage><Wishlist /></AnimatedPage></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><AnimatedPage><Cart /></AnimatedPage></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
              <Route path="/admin" element={<RoleRoute><AnimatedPage><AdminPanel /></AnimatedPage></RoleRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
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
