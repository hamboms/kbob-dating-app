// app/api/chat/leave/route.js
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// 동적으로 clientPromise를 import합니다.
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

  let partnerId;
  try {
    const body = await request.json();
    partnerId = body.partnerId;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!partnerId) {
    return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
  }
  
  const currentUserId = new ObjectId(currentUserPayload.userId);
  const partnerIdObj = new ObjectId(partnerId);

  try {
    const db = await getDb();
    
    // 1. 매칭 기록을 양방향으로 모두 삭제하여 관계를 완전히 정리합니다.
    await db.collection('likes').deleteMany({
      $or: [
        { from: currentUserId, to: partnerIdObj },
        { from: partnerIdObj, to: currentUserId }
      ]
    });
    
    // 2. 두 사용자의 ID로 생성된 채팅방의 모든 대화 내역을 삭제합니다.
    // 💥 수정: 채팅방 ID를 생성할 때 하이픈(-) 대신 밑줄(_)을 사용합니다.
    const roomId = [currentUserId.toString(), partnerIdObj.toString()].sort().join('_');
    
    await db.collection('messages').deleteMany({ roomId: roomId });

    return NextResponse.json({ message: 'Chat left successfully, match and all messages removed.' });
  } catch (error) {
    console.error("Error leaving chat:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

