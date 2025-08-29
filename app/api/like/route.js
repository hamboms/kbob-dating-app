// app/api/like/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { getUserFromToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let likedUserId;
  try {
    const body = await request.json();
    // 클라이언트에서 보내는 'targetUserId'를 받도록 수정했습니다.
    likedUserId = body.targetUserId;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  const likerId = currentUserPayload.userId;

  if (!likedUserId) {
    return NextResponse.json({ error: 'Liked user ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');

    const newLike = {
      from: new ObjectId(likerId),
      to: new ObjectId(likedUserId),
      createdAt: new Date(),
    };

    await db.collection('likes').insertOne(newLike);

    // 상대방도 나를 좋아하는지 확인 (매칭 확인)
    const match = await db.collection('likes').findOne({
      from: new ObjectId(likedUserId),
      to: new ObjectId(likerId),
    });

    if (match) {
      return NextResponse.json({ message: 'Like sent successfully. It\'s a match!', match: true });
    } else {
      return NextResponse.json({ message: 'Like sent successfully.', match: false });
    }
  } catch (error) {
    console.error("Error in 'Like' API:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

