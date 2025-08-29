// app/users/[userId]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LikeButton from '../../../components/LikeButton';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { userId } = params;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUserRes = await fetch('/api/profile');
        if (currentUserRes.ok) {
          setCurrentUser(await currentUserRes.json());
        }

        const userRes = await fetch(`/api/users/${userId}`);
        if (userRes.ok) {
          setUser(await userRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">사용자를 찾을 수 없습니다.</div>;

  const isMyProfile = currentUser?._id === user._id;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-8 border-b flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{user.name}님의 프로필</h1>
        </div>
        <div className="p-8 space-y-5">
          <div className="flex justify-center">
              <img 
                src={user.profileImage || `https://placehold.co/150x150/E2E8F0/4A5568?text=${user.name}`} 
                alt={user.name} 
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
          </div>
          <div>
              <label className="text-sm font-bold text-gray-600">이름</label>
              <p className="text-lg text-gray-800 p-3 bg-gray-50 rounded-md mt-1">{user.name}</p>
          </div>
          <div>
              <label className="text-sm font-bold text-gray-600">나이</label>
              <p className="text-lg text-gray-800 p-3 bg-gray-50 rounded-md mt-1">{user.age}</p>
          </div>
          <div>
              <label className="text-sm font-bold text-gray-600">자기소개</label>
              <p className="text-lg text-gray-800 p-3 bg-gray-50 rounded-md mt-1 min-h-[100px] whitespace-pre-wrap">{user.bio || '자기소개가 없습니다.'}</p>
          </div>
        </div>
        {!isMyProfile && (
          <div className="p-8 border-t">
            <LikeButton targetUserId={user._id.toString()} />
          </div>
        )}
        <div className="p-6 bg-gray-50 text-right">
            <Link href="/users" className="text-blue-500 hover:underline">
              &larr; Discover로 돌아가기
            </Link>
        </div>
      </div>
    </div>
  );
}
