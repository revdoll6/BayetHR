import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/app/lib/store/auth';

// Define public paths that don't require authentication
const publicPaths = {
  candidate: ['/candidate/login', '/candidate/signup'],
  admin: ['/admin/login', '/admin/signup'],
};

// Define dashboard paths for each role
const dashboardPaths = {
  candidate: '/candidate/dashboard',
  admin: '/admin/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = request.cookies.get('user')?.value;
  const role: Role = pathname.startsWith('/admin') ? 'admin' : 'candidate';

  // Allow access to public paths without authentication
  if (publicPaths[role].includes(pathname)) {
    if (user) {
      // If user is already logged in, redirect to dashboard
      return NextResponse.redirect(new URL(dashboardPaths[role], request.url));
    }
    return NextResponse.next();
  }

  // Require authentication for protected paths
  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL(`/${role}/login`, request.url));
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
  matcher: ['/candidate/:path*', '/admin/:path*'],
};
