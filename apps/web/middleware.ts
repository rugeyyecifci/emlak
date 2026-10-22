import { NextResponse, type NextRequest } from 'next/server';

// Giriş yapmamış biri /panel'e girerse giriş sayfasına yönlendir.
export function middleware(req: NextRequest) {
  const loggedIn = req.cookies.has('emlak_oturum');
  const isLogin = req.nextUrl.pathname.startsWith('/panel/giris');

  if (!loggedIn && !isLogin) {
    const url = new URL('/panel/giris', req.url);
    url.searchParams.set('sonra', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (loggedIn && isLogin) return NextResponse.redirect(new URL('/panel', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/panel/:path*'] };
