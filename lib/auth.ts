import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse, NextRequest } from 'next';
import User, { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest | NextRequest): string | null {
  const authHeader = req.headers.get ? req.headers.get('authorization') : req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticateUser(req: NextApiRequest | NextRequest): Promise<IUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await User.findById(payload.userId).select('-password');
    return user;
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: IUser) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = await authenticateUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      return handler(req, res, user);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
  };
}

export function requireAdmin(handler: (req: NextApiRequest, res: NextApiResponse, user: IUser) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = await authenticateUser(req);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      return handler(req, res, user);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
  };
}
