// app/api/login/route.js (전체 코드)

import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("datingApp");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // --- 계정 정지 확인 로직 ---
    if (user.isBanned) {
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60,
      path: '/',
    });

    return NextResponse.json({ message: "Login successful" }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}