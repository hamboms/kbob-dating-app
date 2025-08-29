// app/api/likes-received/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { getUserFromToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const currentUserId = new ObjectId(currentUserPayload.userId);

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    // 만료된 '좋아요' 기록 삭제
    await db.collection('likes').deleteMany({
      to: currentUserId,
      createdAt: { $lt: twentyFourHoursAgo },
    });
    
    // 내가 '좋아요'를 보낸 사용자 ID 목록 조회
    const myLikes = await db.collection('likes').find({ from: currentUserId }).project({ to: 1 }).toArray();
    const myLikedUserIds = myLikes.map(like => like.to.toString());

    // 나를 좋아했지만, 아직 내가 '좋아요'를 보내지 않은 (매칭되지 않은) 사용자 목록 조회
    const likers = await db.collection('likes').aggregate([
      {
        $match: {
          to: currentUserId,
          createdAt: { $gte: twentyFourHoursAgo },
          from: { $not: { $in: myLikedUserIds.map(id => new ObjectId(id)) } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          'user._id': 1,
          'user.name': 1,
          'user.age': 1,
          'user.profileImage': 1,
        },
      },
    ]).toArray();

    return NextResponse.json(likers);

  } catch (error) {
    console.error('Failed to fetch likers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
