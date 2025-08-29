// app/api/report/route.js

import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const currentUser = await getUserFromToken();
  if (!currentUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { targetUserId, reason } = await request.json();
  if (!targetUserId || !reason) {
    return NextResponse.json({ error: 'Target user ID and reason are required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');
    const reportsCollection = db.collection('reports');

    const reporterId = new ObjectId(currentUser.userId);
    const reportedId = new ObjectId(targetUserId);

    // --- 추가된 중복 신고 확인 로직 ---
    const existingReport = await reportsCollection.findOne({
      reporterId: reporterId,
      reportedId: reportedId,
    });

    if (existingReport) {
      return NextResponse.json({ message: 'You have already reported this user.' }, { status: 409 }); // 409 Conflict
    }
    // --- 로직 끝 ---

    // 'reports' 컬렉션에 신고 기록을 저장합니다.
    await reportsCollection.insertOne({
      reporterId: reporterId,
      reportedId: reportedId,
      reason,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Report submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
