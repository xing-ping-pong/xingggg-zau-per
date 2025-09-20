import { NextApiRequest, NextApiResponse } from 'next';

interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

const defaultOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

export function cors(options: CorsOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const origin = req.headers.origin;

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', 
        opts.origin === true ? (origin || '*') : 
        Array.isArray(opts.origin) ? opts.origin.join(', ') : 
        opts.origin || '*'
      );
      res.setHeader('Access-Control-Allow-Methods', opts.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', opts.allowedHeaders?.join(', ') || 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', opts.credentials ? 'true' : 'false');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(200).end();
    }

    // Set CORS headers for actual requests
    res.setHeader('Access-Control-Allow-Origin', 
      opts.origin === true ? (origin || '*') : 
      Array.isArray(opts.origin) ? opts.origin.join(', ') : 
      opts.origin || '*'
    );
    res.setHeader('Access-Control-Allow-Credentials', opts.credentials ? 'true' : 'false');

    next();
  };
}
