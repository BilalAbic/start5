import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from './lib/auth';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/profile',
];

// Paths that are accessible only for admins
const adminPaths = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  );
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Verify user authentication
  const user = await isAuthenticated(request);
  
  // Redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check admin access
  if (isAdminPath && user.role !== 'ADMIN') {
    // Redirect non-admin users to home page
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api/auth/ (authentication API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 