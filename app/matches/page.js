'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// MatchCard 컴포넌트를 페이지 파일 안에 함께 둡니다.
function MatchCard({ user, currentUserId }) {
  const router = useRouter();

  const handleChatClick = () => {
    const partnerId = user._id;
    const partnerName = user.name;
    let partnerImageUrl = user.profileImage || '';

    // 이미지 캐싱 문제를 방지하기 위해 타임스탬프를 추가합니다.
    if (partnerImageUrl) {
      partnerImageUrl = `${partnerImageUrl}?t=${new Date().getTime()}`;
    }

    // 두 사용자의 ID를 정렬하여 고유한 채팅방 ID를 생성합니다.
    const roomId = [currentUserId, partnerId].sort().join('_');
    
    router.push(`/chat/${roomId}?partnerName=${encodeURIComponent(partnerName)}&partnerImageUrl=${encodeURIComponent(partnerImageUrl)}`);
  };

  const fallbackChar = user.name?.charAt(0) || '?';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="aspect-w-1 aspect-h-1 relative">
        <img
          src={user.profileImage || `https://placehold.co/300x300/E2E8F0/4A5568?text=${fallbackChar}`}
          alt={`${user.name}의 프로필 사진`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h2 className="text-xl font-bold">{user.name} <span className="font-light">{user.age}</span></h2>
        </div>
      </div>
      <div className="p-4">
        <button
          onClick={handleChatClick}
          className="w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition duration-300"
        >
          채팅하기
        </button>
      </div>
    </div>
  );
}


export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 현재 사용자 정보와 매치 목록을 함께 불러옵니다.
        const [profileRes, matchesRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/matches')
        ]);

        if (!profileRes.ok || !matchesRes.ok) {
          if (profileRes.status === 401 || matchesRes.status === 401) {
            router.push('/login');
          }
          throw new Error('Failed to fetch data');
        }
        
        const profileData = await profileRes.json();
        const matchesData = await matchesRes.json();

        setCurrentUser(profileData);
        setMatches(matchesData);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <Link href="/users" className="text-sm text-blue-500 hover:underline">
              &larr; Discover로 돌아가기
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">나의 매치</h1>
            <div className="w-20"></div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center text-gray-500">
                <p>로딩 중...</p>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(user => (
                  <MatchCard key={user._id} user={user} currentUserId={currentUser?._id} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">아직 매치된 상대가 없습니다.</p>
                <p className="mt-2 text-sm">Discover 페이지에서 새로운 사람에게 '좋아요'를 보내보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

