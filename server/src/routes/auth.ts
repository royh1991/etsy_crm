import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { getEtsyAuthUrl, exchangeCodeForTokens } from '../services/etsy.js';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  shopName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Helper to generate JWT
function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  return jwt.sign(
    { userId },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, shopName } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create shop and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          etsyShopId: `temp-${Date.now()}`, // Placeholder until Etsy OAuth
          shopName
        }
      });

      const user = await tx.user.create({
        data: {
          shopId: shop.id,
          email,
          passwordHash,
          name,
          role: 'OWNER'
        }
      });

      return { shop, user };
    });

    const token = generateToken(result.user.id);

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role
      },
      shop: {
        id: result.shop.id,
        shopName: result.shop.shopName
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { shop: true }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      shop: {
        id: user.shop.id,
        shopName: user.shop.shopName,
        etsyConnected: !!user.shop.etsyAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { shop: true }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      shop: {
        id: user.shop.id,
        shopName: user.shop.shopName,
        etsyConnected: !!user.shop.etsyAccessToken,
        lastSyncAt: user.shop.lastSyncAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/etsy/connect - Get Etsy OAuth URL
authRouter.get('/etsy/connect', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, state, codeVerifier } = getEtsyAuthUrl();

    // Store state and code verifier in session/db for verification
    // For now, encode in state (not ideal for production)
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/etsy/callback - Handle Etsy OAuth callback
authRouter.get('/etsy/callback', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      throw new AppError(400, 'Missing authorization code');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, state as string);

    // Update shop with tokens
    await prisma.shop.update({
      where: { id: req.user!.shopId },
      data: {
        etsyAccessToken: tokens.access_token,
        etsyRefreshToken: tokens.refresh_token,
        etsyTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        etsyUserId: tokens.user_id?.toString()
      }
    });

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/settings?etsy=connected`);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = generateToken(req.user!.id);
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', requireAuth, async (req: Request, res: Response) => {
  // In a real app, you might want to invalidate the token in a blacklist
  res.json({ message: 'Logged out successfully' });
});
