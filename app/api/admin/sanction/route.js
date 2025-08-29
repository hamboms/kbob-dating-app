// app/api/admin/sanction/route.js

import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getUserFromToken } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');

    // 관리자 권한 확인
    const adminUser = await db.collection('users').findOne({ _id: new ObjectId(currentUserPayload.userId) });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // 대상 사용자의 계정을 정지 상태로 업데이트합니다.
    await db.collection('users').updateOne(
      { _id: new ObjectId(targetUserId) },
      { $set: { isBanned: true } }
    );

    return NextResponse.json({ message: 'User sanctioned successfully' });

  } catch (error) {
    console.error('Failed to sanction user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
