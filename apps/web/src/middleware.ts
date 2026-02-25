/**
 * Minimal middleware — passes all requests through.
 * Auth is enforced in individual Server Components and API routes
 * via `getServerUser()` from `@/lib/auth`.
 */
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
