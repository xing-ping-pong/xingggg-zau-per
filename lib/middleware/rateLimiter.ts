import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests', skipSuccessfulRequests = false } = options;

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const key = req.headers['x-forwarded-for'] as string || 
                req.connection.remoteAddress || 
                'unknown';
    
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) {
        rateLimitMap.delete(k);
      }
    }

    const current = rateLimitMap.get(key);
    
    if (!current) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.resetTime < now) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
    }

    current.count++;
    next();
  };
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later'
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 contact messages per hour
  message: 'Too many contact messages, please try again later'
});
