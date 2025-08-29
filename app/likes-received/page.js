'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LikerCard from '@/components/LikerCard';

export default function LikesReceivedPage() {
  const [likers, setLikers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLikers = async () => {
      try {
        const response = await fetch('/api/likes-received');
        if (!response.ok) {
          if (response.status === 401) {
             router.push('/login');
          }
          throw new Error('Failed to fetch likers');
        }
        const data = await response.json();
        setLikers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikers();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
             <Link href="/users" className="text-sm text-blue-500 hover:underline">
                &larr; Discover로 돌아가기
              </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">나에게 좋아요를 보낸 사람</h1>
            <div className="w-20"></div> {/* 오른쪽 정렬을 위한 공간 확보 */}
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center text-gray-500">
                <p>로딩 중...</p>
              </div>
            ) : likers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {likers.map(liker => (
                  <LikerCard key={liker._id} liker={liker} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">아직 받은 '좋아요'가 없습니다.</p>
                <p className="mt-2 text-sm">Discover 페이지에서 새로운 사람들을 만나보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

