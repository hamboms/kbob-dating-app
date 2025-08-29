// app/api/logout/route.js

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // 'auth_token' 쿠키를 삭제하여 로그아웃 처리합니다.
    cookies().delete('auth_token');

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
