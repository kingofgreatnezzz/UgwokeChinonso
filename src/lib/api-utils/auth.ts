// ================================================================
// Auth middleware for Next.js API routes
// ================================================================

import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { config } from './config';
import type { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  createdAt: Date;
}

/**
 * Extract and verify JWT from request, return user or null.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns user or Response (401).
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | { error: Response }> {
  const user = await authenticateRequest(request);
  if (!user) {
    return {
      error: Response.json(
        { success: false, message: 'Access denied. No valid token provided.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Require admin role. Must be called after requireAuth.
 */
export function requireAdmin(
  user: AuthenticatedUser
): { ok: true } | { error: Response } {
  if (user.role !== 'admin') {
    return {
      error: Response.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      ),
    };
  }
  return { ok: true };
}
