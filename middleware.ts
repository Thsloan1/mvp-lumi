import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes and dashboard
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return !!token;
        }
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/((?!auth|webhook).)*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
};