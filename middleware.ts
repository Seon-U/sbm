import { type NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const session = await auth();
  const didLogin = !!session?.user?.email;
  if (!didLogin) {
    return NextResponse.redirect(
      new URL(`/sign?redirectTo=${pathname}`, req.url)
    );
  }
  return NextResponse.next();
}
//TODO: remove nodejs runtime!!
export const config = {
  // runtime: 'nodejs',
  matcher: [
    '/((?!sign|_next/static|_next/image|api/auth|forgotpasswd|registcheck|favicon.ico|robots.txt|.well-known|$).*)',
    // '/api/:path*',
  ],
};
