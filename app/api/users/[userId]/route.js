// app/api/users/[userId]/route.js

import { NextResponse } from 'next/server';
// 💥 수정: 상대 경로를 절대 경로 별칭으로 변경하여 안정성을 높입니다.
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  const { userId } = params;

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      // 민감한 정보는 제외하고 반환합니다.
      { projection: { password: 0, verificationToken: 0, tokenExpires: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

