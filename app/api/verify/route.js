import { NextResponse } from 'next/server';

// 데이터베이스 연결을 위한 헬퍼 함수
async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/verification-failed`);
  }

  // --- 디버깅을 위한 로그 추가 ---
  const currentTime = new Date();
  console.log("--- 이메일 인증 요청 수신 ---");
  console.log("URL에서 받은 토큰:", token);
  console.log("현재 서버 시간 (검증 기준):", currentTime);
  // --- 로그 추가 끝 ---

  try {
    const db = await getDb();

    // 1. 전달받은 토큰과 일치하고, 아직 만료되지 않은 사용자를 찾습니다.
    const user = await db.collection('users').findOne({
      verificationToken: token,
      tokenExpires: { $gt: currentTime },
    });

    // 2. 해당하는 사용자가 없으면 실패 처리하고, 원인을 분석하여 로그를 남깁니다.
    if (!user) {
      console.error("인증 실패: 유효하지 않거나 만료된 토큰입니다.");
      
      const tokenExists = await db.collection('users').findOne({ verificationToken: token });
      if (tokenExists) {
        console.error("실패 원인 분석: 토큰은 존재하지만 만료되었습니다.");
        console.error("DB에 저장된 만료 시간:", tokenExists.tokenExpires);
      } else {
        console.error("실패 원인 분석: DB에 해당 토큰이 존재하지 않습니다.");
      }
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
    console.log("인증 성공: 사용자 계정이 활성화되었습니다. User ID:", user._id);
    
    // 4. 성공 페이지로 리디렉션합니다.
    return NextResponse.redirect(`${baseUrl}/verification-success`);

  } catch (error) {
    console.error("인증 처리 중 서버 오류 발생:", error);
    return NextResponse.redirect(`${baseUrl}/verification-failed`);
  }
}

