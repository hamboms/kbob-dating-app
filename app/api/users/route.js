import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

async function getDb() {
  const { default: clientPromise } = await import('@/lib/mongodb');
  const client = await clientPromise;
  return client.db('datingApp');
}

// GET 함수 (Discover 페이지용)
export async function GET(request) {
  const currentUserPayload = await getUserFromToken();
  if (!currentUserPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const currentUserId = new ObjectId(currentUserPayload.userId);

  try {
    const db = await getDb();
    
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    
    // 3시간이 지난 스킵 기록을 삭제하는 유지보수 작업을 수행합니다.
    await db.collection('skips').deleteMany({ from: currentUserId, createdAt: { $lt: threeHoursAgo } });

    // 💥 수정: 스킵한 사용자 목록을 가져올 때 '3시간 이내'라는 시간 조건을 명시적으로 추가했습니다.
    const skippedUserIds = (await db.collection('skips').find({ 
      from: currentUserId, 
      createdAt: { $gte: threeHoursAgo } 
    }).toArray()).map(skip => skip.to);
    
    // '좋아요'를 보낸 사용자 목록은 기존 로직을 유지합니다.
    const likedUserIds = (await db.collection('likes').find({ 
      from: currentUserId, 
      createdAt: { $gte: threeHoursAgo } 
    }).toArray()).map(like => like.to);
    
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

// POST 함수 (회원가입 로직)는 기존과 동일하게 유지됩니다.
export async function POST(request) {
  // ... (기존 POST 함수의 코드는 여기에 그대로 유지됩니다)
  const bcrypt = await import('bcryptjs');
  const crypto = await import('crypto');
  
  try {
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

    // 4. 새로운 사용자를 데이터베이스에 저장합니다.
    await db.collection('users').insertOne(newUser);

    // 5. 인증 이메일을 발송합니다.
    const { sendVerificationEmail } = await import('@/lib/email');
    
    const host = request.headers.get('host');
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const verificationUrl = `${baseUrl}/api/verify?token=${verificationToken}`;

    await sendVerificationEmail(email, name, verificationUrl);

    return NextResponse.json({ message: '회원가입 성공! 이메일을 확인하여 계정을 활성화해주세요.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
