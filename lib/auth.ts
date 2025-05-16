import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Types
export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
};

// Get JWT secret from environment variables
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    // Fallback için geçici bir sır kullanılabilir, geliştirme ortamında
    return new TextEncoder().encode('temporary_secret_for_development');
  }
  return new TextEncoder().encode(secret);
};

// Create JWT token
export const createToken = async (payload: JWTPayload): Promise<string> => {
  try {
    const secret = getJwtSecret();
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null; // Hata fırlatma yerine null dön
  }
};

// Set JWT token as cookie
export const setTokenCookie = async (token: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });
  } catch (error) {
    console.error('Error setting token cookie:', error);
  }
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
      if (!token) {
        return null;
      }
      const user = await verifyToken(token);
      if (!user) {
        return null;
      }
      return user;
    }
    
    // For server components using the cookies() function
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return null;
    }
    const user = await verifyToken(token);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated (middleware helper)
export const isAuthenticated = async (req: NextRequest): Promise<JWTPayload | null> => {
  const user = await getCurrentUser(req);
  if (!user) return null;
  return user;
}; 