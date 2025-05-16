import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { createToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create JWT token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Set token as HttpOnly cookie
    await setTokenCookie(token);
    
    // Create the response
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 