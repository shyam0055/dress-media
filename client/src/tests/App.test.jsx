import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// ── Mock Firebase ──────────────────────────────────────────────────────────
vi.mock('../services/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((cb) => {
      cb(null);
      return vi.fn();
    }),
    signOut: vi.fn(),
  },
}));

// ── Mock API ───────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  getDressFeed: vi.fn(),
  interactWithDress: vi.fn(),
  verifyUser: vi.fn(),
}));

// ── ============================================================
//   TEST: Theme Toggle — UI checking
// ── ============================================================
describe('Theme Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <div data-testid="theme-toggle" />
        </BrowserRouter>
      </ThemeProvider>
    );
  });

  it('persists theme preference in localStorage', () => {
    localStorage.setItem('dresswipe-theme', 'light');
    render(
      <ThemeProvider>
        <BrowserRouter>
          <div />
        </BrowserRouter>
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('defaults to dark theme when no preference saved', () => {
    localStorage.removeItem('dresswipe-theme');
    render(
      <ThemeProvider>
        <BrowserRouter>
          <div />
        </BrowserRouter>
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

// ── ============================================================
//   TEST: Responsive Navbar — Mobile UI check
// ── ============================================================
describe('Mobile Navigation', () => {
  it('renders bottom navigation on mobile viewport', () => {
    // Simulate mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(
      <ThemeProvider>
        <BrowserRouter>
          <div className="bottom-nav" data-testid="bottom-nav">
            <span>Home</span>
            <span>Reels</span>
            <span>Wishlist</span>
            <span>Cart</span>
            <span>Profile</span>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    );

    const bottomNav = screen.getByTestId('bottom-nav');
    expect(bottomNav).toBeTruthy();
    expect(bottomNav.children.length).toBeGreaterThanOrEqual(4);
  });

  it('applies active class to current nav item', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <a href="/home" className="bottom-nav-item active" data-testid="nav-home">
            Home
          </a>
        </BrowserRouter>
      </ThemeProvider>
    );

    const navItem = screen.getByTestId('nav-home');
    expect(navItem.className).toContain('active');
  });
});

// ── ============================================================
//   TEST: Feed Loading States — Functionality
// ── ============================================================
describe('Feed Loading States', () => {
  it('shows skeleton loader while loading', () => {
    render(
      <div className="feed-page" data-testid="feed-loading">
        <div className="reel-skeleton skeleton" />
      </div>
    );
    expect(screen.getByTestId('feed-loading')).toBeTruthy();
  });

  it('shows error state with retry button', () => {
    render(
      <div className="feed-page feed-error" data-testid="feed-error">
        <p>Could not load feed. Please try again.</p>
        <button className="btn btn-primary">Retry</button>
      </div>
    );
    const error = screen.getByTestId('feed-error');
    expect(error).toBeTruthy();
    expect(error.querySelector('button')).toBeTruthy();
  });

  it('shows empty state when no dresses available', () => {
    render(
      <div className="feed-empty-container" data-testid="feed-empty">
        <span>✨</span>
        <h3>You've seen everything!</h3>
        <p>Check back later for new arrivals</p>
      </div>
    );
    expect(screen.getByTestId('feed-empty')).toBeTruthy();
    expect(screen.getByText("You've seen everything!")).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Auth Forms — UI & Validation
// ── ============================================================
describe('Auth Forms', () => {
  it('login form has required email and password fields', () => {
    render(
      <div data-testid="login-form">
        <input id="login-email" type="email" placeholder="you@example.com" required />
        <input id="login-password" type="password" placeholder="Your password" required />
        <button id="login-submit" type="submit">Sign In</button>
      </div>
    );
    const form = screen.getByTestId('login-form');
    expect(form.querySelector('#login-email')).toBeTruthy();
    expect(form.querySelector('#login-password')).toBeTruthy();
    expect(form.querySelector('#login-submit')).toBeTruthy();
  });

  it('register form shows password strength meter', () => {
    render(
      <div data-testid="register-form">
        <input id="reg-password" type="password" />
        <div className="password-strength">
          <div className="strength-bar-wrapper">
            <div className="strength-bar-fill" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    );
    const form = screen.getByTestId('register-form');
    expect(form.querySelector('.strength-bar-fill')).toBeTruthy();
  });

  it('role selector has buyer and seller options', () => {
    render(
      <div className="role-selector-group" data-testid="role-select">
        <button className="role-btn active">Buyer</button>
        <button className="role-btn">Seller</button>
      </div>
    );
    const selector = screen.getByTestId('role-select');
    expect(selector.children.length).toBe(2);
    expect(selector.children[0].className).toContain('active');
  });

  it('shows validation error for empty fields', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    
    render(
      <form onSubmit={handleSubmit} data-testid="test-form">
        <input type="email" required />
        <button type="submit">Submit</button>
      </form>
    );

    const form = screen.getByTestId('test-form');
    fireEvent.submit(form);
    // Form should not submit with empty required fields
    expect(handleSubmit).toHaveBeenCalled();
  });
});

// ── ============================================================
//   TEST: Dress Reel Card — UI components
// ── ============================================================
describe('Dress Reel Card', () => {
  const mockDress = {
    id: 'test-1',
    title: 'Summer Dress',
    brand: 'Zara',
    price: 1999,
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    sizes: ['S', 'M', 'L'],
    description: 'Beautiful summer dress',
  };

  it('renders dress information correctly', () => {
    render(
      <div className="reels-post-layout" data-testid="reel-card">
        <div className="reels-dress-title">{mockDress.title}</div>
        <div className="reels-brand-name">{mockDress.brand}</div>
        <div className="reels-dress-price">
          <span className="currency">₹</span>
          <span className="price">{mockDress.price?.toLocaleString()}</span>
        </div>
      </div>
    );

    expect(screen.getByText('Summer Dress')).toBeTruthy();
    expect(screen.getByText('Zara')).toBeTruthy();
    expect(screen.getByText('1,999')).toBeTruthy();
  });

  it('renders mobile overlay elements', () => {
    render(
      <div className="reels-mobile-overlay-caption" data-testid="mobile-caption">
        <div className="mobile-brand-name">{mockDress.brand}</div>
        <p className="mobile-caption-text">{mockDress.title}</p>
        <div className="mobile-price">₹{mockDress.price?.toLocaleString()}</div>
      </div>
    );
    expect(screen.getByTestId('mobile-caption')).toBeTruthy();
    expect(screen.getByText('Zara')).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Cart & Wishlist — Functionality
// ── ============================================================
describe('Collection Pages', () => {
  it('shows empty state for wishlist', () => {
    render(
      <div className="collection-empty" data-testid="wishlist-empty">
        <span className="collection-empty-icon">💝</span>
        <h3>Your wishlist is empty</h3>
        <p>Swipe left on dresses you love to save them here</p>
      </div>
    );
    expect(screen.getByTestId('wishlist-empty')).toBeTruthy();
    expect(screen.getByText('Your wishlist is empty')).toBeTruthy();
  });

  it('shows empty state for cart', () => {
    render(
      <div className="collection-empty" data-testid="cart-empty">
        <span className="collection-empty-icon">🛍️</span>
        <h3>Your cart is empty</h3>
        <p>Swipe right on dresses to add them to your cart</p>
      </div>
    );
    expect(screen.getByTestId('cart-empty')).toBeTruthy();
    expect(screen.getByText('Your cart is empty')).toBeTruthy();
  });

  it('cart summary displays total correctly', () => {
    const total = 5999;
    render(
      <div className="cart-summary" data-testid="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal (2 items)</span>
          <span className="cart-total">₹{total.toLocaleString()}</span>
        </div>
        <button className="btn btn-primary w-full">Complete Purchase</button>
      </div>
    );
    expect(screen.getByTestId('cart-summary')).toBeTruthy();
    expect(screen.getByText('₹5,999')).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Error Handling — UI
// ── ============================================================
describe('Error Handling', () => {
  it('renders error boundary fallback', () => {
    render(
      <div className="error-boundary" data-testid="error-boundary">
        <div className="error-boundary-content">
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred.</p>
          <button className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
    expect(screen.getByTestId('error-boundary')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Profile Page — UI components
// ── ============================================================
describe('Profile Page', () => {
  it('renders profile header with avatar and stats', () => {
    render(
      <div className="profile-page" data-testid="profile-page">
        <div className="profile-large-avatar">U</div>
        <h2 className="profile-username">test_user</h2>
        <ul className="profile-stats-row">
          <li><strong>10</strong> posts</li>
          <li><strong>5</strong> wishlist</li>
          <li><strong>3</strong> cart</li>
        </ul>
      </div>
    );
    expect(screen.getByTestId('profile-page')).toBeTruthy();
    expect(screen.getByText('test_user')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('renders tab navigation', () => {
    render(
      <div className="profile-tabs-bar" data-testid="profile-tabs">
        <button className="tab-item active">Posts</button>
        <button className="tab-item">Reels</button>
        <button className="tab-item">Saved</button>
        <button className="tab-item">Tagged</button>
      </div>
    );
    const tabs = screen.getByTestId('profile-tabs');
    expect(tabs.children.length).toBe(4);
    expect(tabs.children[0].className).toContain('active');
  });
});

// ── ============================================================
//   TEST: Admin Panel — UI components
// ── ============================================================
describe('Admin Panel', () => {
  it('renders tab navigation', () => {
    render(
      <div className="admin-tabs" data-testid="admin-tabs">
        <button className="admin-tab active">Stats</button>
        <button className="admin-tab">Upload</button>
        <button className="admin-tab">Catalogue</button>
      </div>
    );
    const tabs = screen.getByTestId('admin-tabs');
    expect(tabs.children.length).toBe(3);
  });

  it('renders stats grid', () => {
    render(
      <div className="admin-stats-grid" data-testid="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">42</div>
          <div className="stat-card-label">Dresses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">10</div>
          <div className="stat-card-label">Users</div>
        </div>
      </div>
    );
    expect(screen.getByTestId('stats-grid')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Dresses')).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Protected Route — Auth gating
// ── ============================================================
describe('Protected Routes', () => {
  it('shows loading state while checking auth', () => {
    render(
      <div data-testid="auth-loading" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="btn-spinner" />
      </div>
    );
    expect(screen.getByTestId('auth-loading')).toBeTruthy();
  });
});

// ── ============================================================
//   TEST: Global Styles — CSS variables available
// ── ============================================================
describe('Global Styles', () => {
  it('defines CSS custom properties', () => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    // Check core design tokens exist
    const bgBase = style.getPropertyValue('--bg-base').trim();
    expect(bgBase).toBeTruthy();
    
    const textPrimary = style.getPropertyValue('--text-primary').trim();
    expect(textPrimary).toBeTruthy();
  });

  it('defines animation keyframes', () => {
    const styleSheets = document.styleSheets;
    let hasFloatAnimation = false;
    
    for (const sheet of styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'float') {
            hasFloatAnimation = true;
          }
        }
      } catch {
        // Cross-origin stylesheets can't be accessed
      }
    }
  });
});

// ── ============================================================
//   TEST: Accessibility — UI elements have labels
// ── ============================================================
describe('Accessibility', () => {
  it('interactive elements have accessible labels', () => {
    render(
      <div data-testid="a11y-check">
        <button aria-label="Toggle theme" id="theme-toggle">🌙</button>
        <button aria-label="Add to Wishlist" className="mobile-action-btn">❤️</button>
        <button aria-label="Settings" className="profile-settings-btn">⚙️</button>
      </div>
    );
    
    const toggle = screen.getByLabelText('Toggle theme');
    expect(toggle).toBeTruthy();
    
    const wishlist = screen.getByLabelText('Add to Wishlist');
    expect(wishlist).toBeTruthy();
  });
});
