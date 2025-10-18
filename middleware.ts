import { type NextRequest, NextResponse } from 'next/server';
import { encode, getToken } from 'next-auth/jwt';
import { MAX_AGE } from './lib/auth';

const REFRESH_THREDSHOLD = 10 * 60 * 1000; //쿠키 굽는 단
// const REFRESH_THREDSHOLD = 10 * 1000; //쿠키 굽는 단
const SALT = 'authjs.session-token';
const SECRET = process.env.AUTH_SECRET || '';
const NEED_COOKIES = ['/'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });
  console.log('🚀 ~ token:', token);
  // const ctoken = req.cookies.get(SALT)?.value;
  // console.log('🚀 ~ ctoken:', ctoken);
  // if (ctoken) {
  //   const decToken = await decode({
  //     token: ctoken,
  //     secret: SECRET,
  //     salt: SALT,
  //   });
  //   console.log('🚀 ~ decToken:', decToken);
  // }
  const pathname = req.nextUrl.pathname;
  if (!token && NEED_COOKIES.includes(pathname)) return NextResponse.next();
  if (!token)
    return NextResponse.redirect(
      new URL(`/sign?redirectTo=${req.nextUrl.pathname}`, req.url)
    );

  // const session = await auth();
  // const didLogin = !!session?.user?.email;
  // if (!didLogin) {
  //   return NextResponse.redirect(
  //     new URL(`/sign?redirectTo=${pathname}`, req.url)
  //   );
  // }
  const exp = token.exp ? token.exp * 1000 : 0;
  console.log('🚀------ ~ exp:', new Date(exp).toLocaleString());
  if (exp - Date.now() < MAX_AGE * 1000 - REFRESH_THREDSHOLD) {
    const res = NextResponse.next();
    const newJWT = await encode({
      token, // same as token: decodedToken,
      secret: SECRET,
      salt: SALT,
      maxAge: MAX_AGE,
    });

    res.cookies.set({
      name: SALT,
      value: newJWT,
      maxAge: MAX_AGE, // undefined면 브라우저 닫을 때 까지!
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  }
  return NextResponse.next();
}

export const config = {
  // runtime: 'nodejs',
  matcher: [
    '/((?!sign|_next/static|_next/image|api/auth|api/sendmail|forgotpasswd|registcheck|favicon.ico|robots.txt|.well-known|$).*)',
    // '/api/:path*',
    '/',
  ],
};
