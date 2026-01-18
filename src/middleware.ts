import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/legal/privacy',
  '/legal/terms',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/status',
  '/api/tiktok/callback', // OAuth callback needs to be public
];

// Routes that start with these prefixes are public
const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublicRoute || isPublicPrefix) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('aegis_auth');

  if (!authCookie?.value) {
    // Redirect to login for page requests
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify token matches expected format
  const password = process.env.AEGIS_PASSWORD;
  if (password) {
    const expectedToken = Buffer.from(`aegis:${password}`).toString('base64');
    if (authCookie.value !== expectedToken) {
      // Invalid token - redirect to login
      if (!pathname.startsWith('/api/')) {
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('aegis_auth');
        return response;
      }

      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
