import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// 데이터베이스 연결을 위한 헬퍼 함수
async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

export async function DELETE(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userId = new ObjectId(currentUserPayload.userId);

  try {
    const db = await getDb();

    // 1. 현재 사용자의 이메일 정보를 가져옵니다.
    const userToDelete = await db.collection('users').findOne({ _id: userId });
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userEmail = userToDelete.email;

    // 2. 'deleted_users' 컬렉션에 탈퇴 기록을 저장합니다.
    await db.collection('deleted_users').insertOne({
      email: userEmail,
      deletedAt: new Date(),
    });

    // 3. 사용자와 관련된 모든 데이터를 삭제합니다.
    await db.collection('users').deleteOne({ _id: userId });
    await db.collection('likes').deleteMany({ $or: [{ from: userId }, { to: userId }] });
    await db.collection('skips').deleteMany({ $or: [{ from: userId }, { to: userId }] });
    await db.collection('reports').deleteMany({ $or: [{ reporterId: userId }, { targetUserId: userId }] });
    
    // 사용자가 포함된 모든 채팅 메시지를 삭제합니다.
    // roomId에 사용자 ID가 포함된 모든 메시지를 찾아서 삭제합니다.
    const userIdString = userId.toString();
    await db.collection('messages').deleteMany({
      roomId: { $regex: userIdString }
    });

    // 4. 로그아웃 처리를 위해 쿠키를 삭제하라는 응답을 보냅니다.
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });

    return response;

  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

