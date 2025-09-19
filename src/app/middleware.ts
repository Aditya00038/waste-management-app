import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware runs before page navigation
  const response = NextResponse.next();
  
  // Add cache control headers to improve performance for static content
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    response.headers.set(
      'Cache-Control', 
      'public, max-age=31536000, immutable'
    );
  }
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

// Match all routes except for static files and API routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
