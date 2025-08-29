// components/LogoutButton.js
'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // 로그아웃 성공 시, 로그인 페이지로 이동하고 페이지를 새로고침하여
        // 서버의 리디렉션 로직이 다시 실행되도록 합니다.
        router.push('/login');
        router.refresh(); 
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
    >
      로그아웃
    </button>
  );
}
