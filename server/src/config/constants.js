export const CONSTANTS = {
  // Auth
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes

  // Rate Limiting
  GLOBAL_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  GLOBAL_RATE_LIMIT_MAX: 100,
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX: 10,

  // Feed Pagination
  FEED_PAGE_SIZE: 10,

  // User Roles
  ROLES: {
    BUYER: 'buyer',
    SELLER: 'seller',
    ADMIN: 'admin',
    USER: 'user',
  },

  // Interaction Types
  INTERACTIONS: {
    WISHLIST: 'wishlist',
    BUY: 'buy',
    SKIP: 'skip',
  },

  // Dress Categories
  CATEGORIES: ['casual', 'formal', 'party', 'ethnic', 'western', 'bridal', 'sports'],

  // Sizes
  SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};
