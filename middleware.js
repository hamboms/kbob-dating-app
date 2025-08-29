// middleware.js

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // jose 라이브러리 사용

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('auth_token');

  // 로그인, 회원가입 페이지는 항상 접근 가능해야 합니다.
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }
  
  // 보호하려는 페이지에 접근 시 토큰 확인
  if (pathname.startsWith('/users')) {
    if (!tokenCookie) {
      // 토큰이 없으면 로그인 페이지로 리디렉션
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    try {
      // 토큰 유효성 검사
      await jwtVerify(tokenCookie.value, JWT_SECRET);
      // 유효하면 요청 계속 진행
      return NextResponse.next();
    } catch (error) {
      // 토큰이 유효하지 않으면 로그인 페이지로 리디렉션
      console.error('JWT verification failed:', error.message);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로를 지정합니다.
export const config = {
  matcher: ['/users/:path*', '/login', '/signup'],
};
