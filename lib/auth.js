// lib/auth.js

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// .env.local 파일의 JWT_SECRET을 가져와 인코딩합니다.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

/**
 * 쿠키에서 JWT 토큰을 읽고 검증하여 사용자 페이로드를 반환합니다.
 * @returns {Promise<Object|null>} 토큰이 유효하면 사용자 정보, 아니면 null을 반환합니다.
 */
export async function getUserFromToken() {
  const tokenCookie = cookies().get('auth_token');

  if (!tokenCookie) {
    return null; // 토큰이 없으면 null 반환
  }

  try {
    // 토큰의 유효성을 검사합니다.
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return payload; // { userId, email, name } 등이 담긴 객체 반환
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null; // 검증 실패 시 null 반환
  }
}
