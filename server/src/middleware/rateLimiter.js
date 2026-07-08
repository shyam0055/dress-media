import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants.js';

// ── Global API Rate Limiter ──────────────────────────────────────────────────
export const globalRateLimiter = rateLimit({
  windowMs: CONSTANTS.GLOBAL_RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: CONSTANTS.GLOBAL_RATE_LIMIT_MAX,             // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

// ── Auth-Specific Rate Limiter (stricter) ────────────────────────────────────
export const authRateLimiter = rateLimit({
  windowMs: CONSTANTS.AUTH_RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: CONSTANTS.AUTH_RATE_LIMIT_MAX,             // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// ── Upload Rate Limiter ──────────────────────────────────────────────────────
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                   // 20 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Please try again in an hour.',
  },
});
