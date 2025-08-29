// app/users/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import React from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data.users);
        setCurrentIndex(data.users.length - 1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const canInteract = currentIndex >= 0;

  const handleButtonClick = (direction) => {
    if (!canInteract || isExiting) return;

    const user = users[currentIndex];
    setExitDirection(direction);
    setIsExiting(true);

    if (direction === 'right') {
      fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user._id }),
      });
    } else if (direction === 'left') {
      fetch('/api/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user._id }),
      });
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setIsExiting(false);
      setExitDirection('');
    }, 500);
  };
  
  const currentUserCard = canInteract ? users[currentIndex] : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="w-full max-w-lg mx-auto p-4 flex justify-between items-center">
        <Link href="/profile">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Discover</h1>
        <div className="flex items-center space-x-4">
            <Link href="/likes-received" title="Who Likes Me">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 hover:text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
            </Link>
            <Link href="/matches" title="My Matches">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
            </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative w-full">
        <div className="w-full max-w-sm h-[70vh] relative flex items-center justify-center">
          {isLoading ? (
            <div className="text-slate-500">로딩 중...</div>
          ) : currentUserCard ? (
            <div
              className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
                isExiting 
                  ? (exitDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : '-translate-x-full -rotate-12 opacity-0') 
                  : 'translate-x-0 rotate-0 opacity-100'
              }`}
            >
              <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white">
                <img
                  src={currentUserCard.profileImage || `https://placehold.co/400x600/E2E8F0/4A5568?text=${currentUserCard.name}`}
                  alt={currentUserCard.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h2 className="text-3xl font-bold">{currentUserCard.name} <span className="font-light">{currentUserCard.age}</span></h2>
                  <p className="text-md mt-1">{currentUserCard.bio || ''}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="mt-4 text-2xl font-bold text-slate-800">모든 카드를 확인했어요!</h2>
              <p className="mt-2 text-slate-500">
                새로운 사용자가 나타나면 알려드릴게요. <br/>
                '나의 매치'에서 새로운 대화를 시작해보세요.
              </p>
              <Link href="/matches" className="mt-6 inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
                My Matches 보러가기
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-lg mx-auto p-4 flex justify-around items-center">
        <button onClick={() => handleButtonClick('left')} disabled={!canInteract || isExiting} className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-100 transition-all transform hover:scale-110 disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button onClick={() => handleButtonClick('right')} disabled={!canInteract || isExiting} className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-all transform hover:scale-110 disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </button>
      </footer>
    </div>
  );
}
