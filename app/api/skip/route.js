import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

export async function POST(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const skipperId = currentUserPayload.userId;
  let skippedUserId;

  try {
    const body = await request.json();
    // 💥 수정: 클라이언트에서 보내는 'targetUserId'를 받도록 수정했습니다.
    skippedUserId = body.targetUserId;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!skippedUserId) {
    return NextResponse.json({ error: 'Skipped user ID is required' }, { status: 400 });
  }

  try {
    const db = await getDb();

    const newSkip = {
      from: new ObjectId(skipperId),
      to: new ObjectId(skippedUserId),
      createdAt: new Date(),
    };

    // 동일한 스킵 기록이 있는지 확인하여 중복 저장을 방지합니다.
    await db.collection('skips').updateOne(
      { from: new ObjectId(skipperId), to: new ObjectId(skippedUserId) },
      { $set: { createdAt: new Date() } },
      { upsert: true } // 기록이 없으면 새로 생성, 있으면 시간만 업데이트
    );

    return NextResponse.json({ message: 'User skipped successfully.' });
  } catch (error) {
    console.error('Skip API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
