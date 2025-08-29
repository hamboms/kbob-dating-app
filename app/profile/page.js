'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TermsModal from '@/components/TermsModal';
import DeleteAccountModal from '@/components/DeleteAccountModal'; // 새로 만든 모달을 import 합니다.

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 회원 탈퇴 모달 상태
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 회원 탈퇴를 확인했을 때 실행되는 함수
  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch('/api/account', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      // 탈퇴 성공 시 홈페이지로 이동
      router.push('/'); 
    } catch (error) {
      console.error('Account deletion failed:', error);
      // 사용자에게 에러 알림을 보여주는 로직을 추가할 수 있습니다.
    } finally {
      setIsDeleteModalOpen(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>프로필 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const fallbackChar = user?.name?.charAt(0) || '?';
  const imageUrlWithCacheBust = user.profileImage 
    ? `${user.profileImage}?t=${new Date().getTime()}` 
    : `https://placehold.co/200x200/E2E8F0/4A5568?text=${fallbackChar}`;


  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <Link href="/users" className="text-sm text-blue-500 hover:underline">
                &larr; Discover로 돌아가기
              </Link>
              <Link href="/profile/edit" className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300">
                프로필 수정
              </Link>
            </div>
            <div className="md:flex">
              <div className="md:w-1/3 p-8 flex justify-center items-start">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <img
                    key={user.profileImage} 
                    src={imageUrlWithCacheBust}
                    alt={`${user.name}의 프로필 사진`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/200x200/E2E8F0/4A5568?text=${fallbackChar}`}}
                  />
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{user.name}</h1>
                <p className="text-xl text-gray-500 mb-6">{user.age}세</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">성별</h3>
                    <p className="text-lg text-gray-800">{user.gender === 'male' ? '남성' : '여성'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">이메일</h3>
                    <p className="text-lg text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">자기소개</h3>
                    <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">{user.bio || '자기소개가 아직 없습니다.'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center">
               <button onClick={() => setIsTermsModalOpen(true)} className="text-sm text-gray-500 hover:underline">
                이용약관 보기
              </button>
              <div className="flex items-center space-x-4">
                 <button 
                  onClick={() => setIsDeleteModalOpen(true)} 
                  className="text-sm text-red-500 hover:underline"
                >
                  회원 탈퇴
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full sm:w-auto bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition duration-300"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} />}
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

