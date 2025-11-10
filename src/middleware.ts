import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set<string>(['/', '/login', '/register']);

// 인프라(next.js)
function isInfraRequest(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  return (
    req.method === 'OPTIONS' ||
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch' ||
    req.headers.get('rsc') === '1' ||
    searchParams.has('_rsc') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  );
}

// 인증 없으면 로그인으로
function handleAuthGuard(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('Authorization')?.value;
  // const refreshToken = req.cookies.get('refresh')?.value;

  if (!accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export function middleware(req: NextRequest) {
  // 개발용
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  if (isInfraRequest(req)) return NextResponse.next();
  const { pathname } = req.nextUrl;

  // 공개 경로 통과
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // 인증 가드
  return handleAuthGuard(req);
}

// 보호할 경로: 필요 시 특정 경로만 매칭
// '/((?!_next/static|_next/image|favicon.ico|api).*)', // 전역 가드 예시
export const config = {
  matcher: ['/dashboard/:path*', '/study-rooms/:path*', '/studyrooms/:path*'],
};
