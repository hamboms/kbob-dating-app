// app/api/skip/route.js
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { getUserFromToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { skippedUserId } = await request.json();
  const skipperId = currentUserPayload.userId;

  if (!skippedUserId) {
    return NextResponse.json({ error: 'Skipped user ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');

    const newSkip = {
      from: new ObjectId(skipperId),
      to: new ObjectId(skippedUserId),
      createdAt: new Date(),
    };

    await db.collection('skips').insertOne(newSkip);
    return NextResponse.json({ message: 'Skip recorded successfully.' });

  } catch (error) {
    console.error('Error recording skip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
