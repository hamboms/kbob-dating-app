// app/verification-success/page.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function VerificationSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/users'; // 0초가 되면 사용자 목록 페이지로 이동
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">인증 성공!</h1>
        <p className="text-gray-600 mb-6">회원가입이 완료되었습니다. 환영합니다!</p>
        <p className="text-sm text-gray-500 mb-4">
          {countdown}초 후에 사용자 목록 페이지로 자동 이동합니다.
        </p>
        <Link href="/users" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          지금 바로 이동하기
        </Link>
      </div>
    </div>
  );
}
