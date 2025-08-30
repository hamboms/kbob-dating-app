import { NextResponse } from 'next/server';

// 데이터베이스 연결을 위한 헬퍼 함수
async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

export async function GET(request) {
  // --- 최종 인증 URL 생성 로직 ---
  // 요청 헤더에서 직접 호스트를 가져와서 리디렉션 URL을 만듭니다. 이 방식이 가장 안정적입니다.
  const host = request.headers.get('host');
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  // --- 수정 끝 ---

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/verification-failed`);
  }

  try {
    const db = await getDb();

    // 1. 전달받은 토큰과 일치하고, 아직 만료되지 않은 사용자를 찾습니다.
    const user = await db.collection('users').findOne({
      verificationToken: token,
      tokenExpires: { $gt: new Date() },
    });

    // 2. 해당하는 사용자가 없으면 실패 처리합니다.
    if (!user) {
      console.error("인증 실패: 유효하지 않거나 만료된 토큰입니다.");
      return NextResponse.redirect(`${baseUrl}/verification-failed`);
    }

    // 3. 사용자를 찾았다면, 계정을 활성화하고 인증 관련 정보를 삭제합니다.
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: "", tokenExpires: "" },
      }
    );

    // 4. 성공 페이지로 리디렉션합니다.
    return NextResponse.redirect(`${baseUrl}/verification-success`);

  } catch (error) {
    console.error("인증 처리 중 서버 오류 발생:", error);
    return NextResponse.redirect(`${baseUrl}/verification-failed`);
  }
}
