import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // 개발용
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();

  const { pathname } = req.nextUrl;
  const hasAuth = req.cookies.get('Authorization');

  if (pathname.startsWith('/login')) return NextResponse.next();

  if (pathname.startsWith('/dashboard') && !hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 필요 시 특정 경로만 매칭
// '/((?!_next/static|_next/image|favicon.ico|api).*)', // 전역 가드 예시
export const config = {
  matcher: ['/dashboard/:path*'],
};
