// app/api/chat/[roomId]/route.js

import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getUserFromToken } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const { roomId } = params;
  const currentUser = await getUserFromToken();

  if (!currentUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 본인이 참여한 채팅방이 맞는지 확인하여 보안을 강화합니다.
  if (!roomId.includes(currentUser.userId)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');
    const messages = await db
      .collection('messages')
      .find({ roomId })
      .sort({ timestamp: 1 }) // 시간 순서대로 정렬
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
