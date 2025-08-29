// app/api/admin/flagged-users/route.js

import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { getUserFromToken } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

// 이 API는 관리자만 접근해야 합니다. 실제 서비스에서는 미들웨어에서 관리자 여부를 확인해야 합니다.
export async function GET(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');

    // 관리자 권한 확인
    const adminUser = await db.collection('users').findOne({
      _id: new ObjectId(currentUserPayload.userId)
    });

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // MongoDB Aggregation을 사용하여 신고된 횟수를 계산합니다.
    const flaggedUsers = await db.collection('reports').aggregate([
      // 1. 신고된 사용자(reportedId)를 기준으로 그룹화하고, 각 그룹의 신고 횟수(reportCount)를 계산합니다.
      {
        $group: {
          _id: "$reportedId",
          reportCount: { $sum: 1 }
        }
      },
      // 2. 신고 횟수가 3번 이상인 사용자만 필터링합니다.
      {
        $match: {
          reportCount: { $gte: 3 }
        }
      },
      // 3. 'users' 컬렉션과 조인하여 해당 사용자들의 상세 정보를 가져옵니다.
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      // 4. 조인된 결과(배열)를 펼칩니다.
      {
        $unwind: "$userInfo"
      },
      // 5. 최종적으로 필요한 정보만 선택하여 반환합니다.
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          profileImage: "$userInfo.profileImage",
          reportCount: "$reportCount"
        }
      },
      // 6. 신고 횟수가 많은 순서대로 정렬합니다.
      {
        $sort: {
          reportCount: -1
        }
      }
    ]).toArray();

    return NextResponse.json(flaggedUsers);
  } catch (error) {
    console.error('Failed to fetch flagged users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
