import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add Cloudflare-specific headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all paths except static files, api routes, and _next internal routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 