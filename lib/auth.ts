import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Types
export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
};

// Get JWT secret from environment variables
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

// Create JWT token
export const createToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Set JWT token as cookie
export const setTokenCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
};

// Remove JWT token cookie
export const removeTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

// Get current user from request
export const getCurrentUser = async (req?: NextRequest): Promise<JWTPayload | null> => {
  try {
    // For API routes that receive a request object
    if (req) {
      const token = req.cookies.get('token')?.value;
      if (!token) return null;
      return verifyToken(token);
    }
    
    // For server components using the cookies() function
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated (middleware helper)
export const isAuthenticated = async (req: NextRequest): Promise<JWTPayload | null> => {
  const user = await getCurrentUser(req);
  if (!user) return null;
  return user;
}; 