import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

export async function POST(request) {
  console.log("--- [Message API] 메시지 전송 요청 수신 ---");
  try {
    const currentUserPayload = await getUserFromToken();
    if (!currentUserPayload) {
      console.error("[Message API] 인증 실패: 사용자가 로그인하지 않았습니다.");
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.log("[Message API] 인증 성공. 사용자 ID:", currentUserPayload.userId);

    const { text, roomId, authorName } = await request.json();
    console.log("[Message API] 요청 데이터 파싱 성공:", { text, roomId, authorName });

    if (!text || !roomId || !authorName) {
      console.error("[Message API] 유효성 검사 실패: 요청 데이터에 누락된 정보가 있습니다.");
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    console.log("[Message API] 데이터베이스 연결 성공.");

    const savedMessage = {
      text,
      roomId,
      authorId: new ObjectId(currentUserPayload.userId),
      authorName,
      timestamp: new Date(),
    };

    const result = await db.collection('messages').insertOne(savedMessage);
    console.log("[Message API] 메시지가 데이터베이스에 저장되었습니다. Inserted ID:", result.insertedId);

    const messageToSend = { ...savedMessage, _id: result.insertedId };

    console.log("[Message API] Pusher 이벤트를 전송합니다...");
    // Pusher.trigger는 인증 정보가 틀리면 여기서 오류를 발생시킬 수 있습니다.
    await pusherServer.trigger(`chat-${roomId}`, 'new-message', messageToSend);
    console.log("[Message API] Pusher 이벤트 전송 성공.");

    return NextResponse.json({ success: true, message: messageToSend });
  } catch (error) {
    // try 블록 안에서 발생하는 모든 오류(Pusher 오류 포함)는 여기서 잡힙니다.
    console.error("[Message API] 처리 중 오류 발생:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
