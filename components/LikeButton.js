// components/LikeButton.js
'use client';

import { useState } from 'react';

export default function LikeButton({ targetUserId }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      
      const data = await response.json();
      setMessage(data.message || data.error);

    } catch (error) {
      setMessage('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleLike}
        disabled={isLoading || message}
        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '전송 중...' : '❤️ 좋아요 보내기'}
      </button>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
