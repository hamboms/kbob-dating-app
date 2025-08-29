import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const currentUserId = new ObjectId(currentUserPayload.userId);

  try {
    const db = (await clientPromise).db('datingApp');

    // 내가 '좋아요'를 보낸 사용자들의 ID 목록을 가져옵니다.
    const myLikes = await db.collection('likes').find({ from: currentUserId }).project({ to: 1 }).toArray();
    const likedByUserIds = myLikes.map(like => like.to);

    // 나를 '좋아요'했고, 나도 '좋아요'한 사용자(매치)를 찾습니다.
    const matches = await db.collection('likes').aggregate([
      {
        $match: {
          to: currentUserId,
          from: { $in: likedByUserIds },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'matchedUser',
        },
      },
      {
        $unwind: '$matchedUser'
      },
      { // 💥 추가: 필요한 사용자 정보만 명확하게 선택합니다.
        $project: {
          'matchedUser._id': 1,
          'matchedUser.name': 1,
          'matchedUser.age': 1,
          'matchedUser.profileImage': 1,
        }
      }
    ]).toArray();

    // 최종적으로 사용자 객체의 배열 형태로 응답합니다.
    return NextResponse.json(matches.map(m => m.matchedUser));
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
