import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for CampAi chat endpoint.
 * Limits each authenticated user to 30 chat requests per 15 minutes.
 * Keyed by user ID (from JWT) so the limit is per-user, not per-IP.
 */
export const aiChatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  keyGenerator: (req) => {
    // Key by authenticated user ID so limits are per-user
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Too many requests to CampAi. Please wait a few minutes before trying again.',
  },
  skipFailedRequests: true, // Don't count failed requests against the limit
});

/**
 * Rate limiter for the flashcard generation endpoint.
 * PDF parsing and AI generation is expensive — limit to 10 requests per hour.
 */
export const flashcardRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Flashcard generation limit reached. You can generate up to 10 decks per hour.',
  },
  skipFailedRequests: true,
});
