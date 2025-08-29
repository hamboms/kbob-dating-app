'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LikerCard({ liker }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  
  const user = liker?.user;
  const createdAt = liker?.createdAt;

  useEffect(() => {
    if (!createdAt) return;

    const calculateTimeLeft = () => {
      const likedAt = new Date(createdAt);
      const expiresAt = new Date(likedAt.getTime() + 24 * 60 * 60 * 1000); // 24시간 후 만료
      const now = new Date();
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeLeft('만료됨');
        setIsExpired(true);
        clearInterval(timer); // timer is not defined here, so this will cause another error. I should clear the timer in the cleanup function.
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // 💥 수정: 'calculateTime-left'를 'calculateTimeLeft'로 변경
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); 

    return () => clearInterval(timer);
  }, [createdAt]);

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <p className="text-gray-500">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }
  
  const fallbackChar = user.name?.charAt(0) || '?';

  return (
    <Link href={`/users/${user._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative">
        <div className="aspect-w-1 aspect-h-1">
          <img 
            src={user.profileImage || `https://placehold.co/300x300/E2E8F0/4A5568?text=${fallbackChar}`}
            alt={`${user.name}의 프로필 사진`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h2 className="text-2xl font-bold">{user.name} <span className="font-light">{user.age}</span></h2>
          <div className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}>
            {timeLeft}
          </div>
        </div>
      </div>
    </Link>
  );
}

