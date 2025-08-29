// app/api/profile/route.js

import { NextResponse } from 'next/server';
import { getUserFromToken } from '../../../lib/auth';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import cloudinary from '../../../lib/cloudinary';

// GET 함수는 변경 없음...
export async function GET(request) {
  const userPayload = await getUserFromToken();
  if (!userPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('datingApp');
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userPayload.userId) },
      { projection: { password: 0, verificationToken: 0, tokenExpires: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// PUT: 프로필 정보와 이미지를 업데이트합니다.
export async function PUT(request) {
  const userPayload = await getUserFromToken();
  if (!userPayload) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const age = formData.get('age');
    const bio = formData.get('bio');
    const gender = formData.get('gender'); // 성별 정보 가져오기
    const profileImageFile = formData.get('profileImage');

    if (!name || !age || !gender) {
      return NextResponse.json({ error: 'Name, age, and gender are required.' }, { status: 400 });
    }

    let profileImageUrl = '';

    if (profileImageFile) {
      const fileBuffer = await profileImageFile.arrayBuffer();
      const mime = profileImageFile.type;
      const encoding = 'base64';
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

      const result = await cloudinary.uploader.upload(fileUri, {
        folder: 'dating-app-profiles',
      });
      profileImageUrl = result.secure_url;
    }

    const client = await clientPromise;
    const db = client.db('datingApp');

    const updateData = {
      name,
      age: Number(age),
      bio,
      gender, // DB에 저장할 데이터에 성별 추가
    };

    if (profileImageUrl) {
      updateData.profileImage = profileImageUrl;
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userPayload.userId) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
