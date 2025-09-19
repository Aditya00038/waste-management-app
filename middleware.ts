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
  // Dynamic pages - short cache for faster navigation
  else if (request.nextUrl.pathname.startsWith('/dashboard') || 
           request.nextUrl.pathname.startsWith('/report') ||
           request.nextUrl.pathname.startsWith('/profile')) {
    // Use a short cache for frequently updated pages
    response.headers.set(
      'Cache-Control', 
      'public, max-age=60, stale-while-revalidate=300'
    );
  }
  // Images and static assets
  else if (/\.(jpg|jpeg|png|webp|svg|gif)$/.test(request.nextUrl.pathname)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800'
    );
  }
  
  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable early hints for improved loading performance
  response.headers.set('Link', '</fonts/PT_Sans-400.woff2>; rel=preload; as=font; crossorigin=anonymous');
  
  return response;
}

// Match both page routes and static assets for proper caching
export const config = {
  matcher: [
    // Match all routes except for API and static Next.js assets that are handled by Next.js automatically
    '/((?!api|_next/static|favicon.ico).*)',
    // Include _next/image explicitly to apply our caching rules
    '/_next/image(.*)' 
  ],
};
