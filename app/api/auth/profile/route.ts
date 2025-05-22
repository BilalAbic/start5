import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Define custom types for prisma select fields to address TypeScript errors
type UserProfileSelect = {
  id: boolean;
  email: boolean;
  username: boolean;
  firstName: boolean;
  lastName: boolean;
  profileImage: boolean;
  usernameLastChanged: boolean;
  bio: boolean;
  website: boolean;
  github: boolean;
  twitter: boolean;
  role: boolean;
  createdAt: boolean;
};

type UserProfileData = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  twitter?: string | null;
};

// GET current user profile
export async function GET(req: NextRequest) {
  try {
    // Get user from JWT token
    console.log('Profile route: Checking authentication');
    const payload = await getCurrentUser(req);
    
    if (!payload) {
      console.log('Profile route: No authenticated user found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log('Profile route: User authenticated, fetching details for userId:', payload.userId);
    
    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        usernameLastChanged: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        role: true,
        createdAt: true,
      } as UserProfileSelect,
    });
    
    if (!user) {
      console.log('Profile route: User not found in database for id:', payload.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('Profile route: Successfully retrieved user profile');
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Profile route error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile information' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(req: NextRequest) {
  try {
    // Get user from JWT token
    const payload = await getCurrentUser(req);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { 
      email, 
      firstName, 
      lastName, 
      profileImage,
      bio,
      website,
      github,
      twitter
    } = await req.json();
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if email is already taken by another user
    if (email !== payload.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser && existingUser.id !== payload.userId) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Validate website URL if provided
    if (website) {
      try {
        // Basic URL validation
        new URL(website);
      } catch (error) {
        return NextResponse.json(
          { error: 'Website URL is invalid' },
          { status: 400 }
        );
      }
    }
    
    // Prepare the data object with type assertion
    const userData: UserProfileData = {
      email,
      firstName,
      lastName,
      profileImage,
      bio,
      website,
      github,
      twitter
    };
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: userData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        usernameLastChanged: true,
        bio: true,
        website: true,
        github: true,
        twitter: true,
        role: true,
        createdAt: true,
      } as UserProfileSelect,
    });
    
    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully' 
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile information' },
      { status: 500 }
    );
  }
} 