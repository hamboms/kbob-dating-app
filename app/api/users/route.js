import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 데이터베이스 연결을 위한 헬퍼 함수
async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

// GET 함수는 기존과 동일하게 유지합니다. (Discover 페이지용)
export async function GET(request) {
  const { getUserFromToken } = await import('@/lib/auth');
  const { ObjectId } = await import('mongodb');

  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const currentUserId = new ObjectId(currentUserPayload.userId);

  try {
    const db = await getDb();
    
    // 3시간이 지난 스킵 기록을 삭제합니다.
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await db.collection('skips').deleteMany({ from: currentUserId, createdAt: { $lt: threeHoursAgo } });

    // 3시간 이내에 스킵한 사용자 ID 목록을 가져옵니다.
    const skippedUserIds = (await db.collection('skips').find({ from: currentUserId }).toArray()).map(skip => skip.to);
    
    // 3시간 이내에 '좋아요'를 보낸 사용자 ID 목록을 가져옵니다.
    const likedUserIds = (await db.collection('likes').find({ from: currentUserId, createdAt: { $gte: threeHoursAgo } }).toArray()).map(like => like.to);
    
    const excludedIds = [currentUserId, ...skippedUserIds, ...likedUserIds];

    const users = await db.collection('users').aggregate([
      {
        $match: {
          _id: { $nin: excludedIds },
          emailVerified: true,
          isBanned: { $ne: true },
        },
      },
      { $sample: { size: 50 } }, // 랜덤으로 50명을 샘플링합니다.
      {
        $project: {
          password: 0,
          verificationToken: 0,
          tokenExpires: 0,
          emailVerified: 0,
          isBanned: 0,
          isAdmin: 0
        },
      },
    ]).toArray();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// POST 함수 (회원가입 로직)
export async function POST(request) {
  try {
    console.log("\n--- 회원가입 API 시작 ---");
    const db = await getDb();
    const { name, email, password, age, gender, bio } = await request.json();

    // 1. 이미 가입된 이메일인지 확인합니다.
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }

    // 2. 탈퇴한 지 7일이 지나지 않았는지 확인합니다.
    const deletedUser = await db.collection('deleted_users').findOne({ email });
    if (deletedUser) {
      const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      if (deletedUser.deletedAt > sevenDaysAgo) {
        return NextResponse.json({ message: '탈퇴 후 7일 동안 재가입할 수 없습니다.' }, { status: 403 });
      }
    }

    // 3. 비밀번호를 암호화하고 토큰을 생성합니다.
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(new Date().getTime() + 3600000); // 1시간 후 만료

    // --- 디버깅 로그 1: 생성된 토큰 확인 ---
    console.log("1. 생성된 인증 토큰:", verificationToken);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      age: parseInt(age, 10),
      gender,
      bio,
      profileImage: '',
      createdAt: new Date(),
      emailVerified: false,
      verificationToken,
      tokenExpires,
      isBanned: false,
      isAdmin: false
    };

    // --- 디버깅 로그 2: DB에 저장될 사용자 객체 확인 ---
    console.log("2. 데이터베이스에 저장될 사용자 정보:", JSON.stringify(newUser, null, 2));


    // 4. 새로운 사용자를 데이터베이스에 저장합니다.
    await db.collection('users').insertOne(newUser);
    console.log("사용자 정보 DB 저장 완료.");

    // 5. 인증 이메일을 발송합니다.
    const { sendVerificationEmail } = await import('@/lib/email');
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/verify?token=${verificationToken}`;
    
    // --- 디버깅 로그 3: 이메일로 발송될 인증 URL 확인 ---
    console.log("3. 이메일로 발송될 URL:", verificationUrl);

    await sendVerificationEmail(email, name, verificationUrl);
    console.log("인증 이메일 발송 완료.");
    console.log("--- 회원가입 API 종료 ---\n");


    return NextResponse.json({ message: '회원가입 성공! 이메일을 확인하여 계정을 활성화해주세요.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

