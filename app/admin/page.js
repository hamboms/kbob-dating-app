// app/admin/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const profileRes = await fetch('/api/profile');
        if (!profileRes.ok) {
          router.push('/login');
          return;
        }
        const profileData = await profileRes.json();

        if (!profileData.isAdmin) {
          router.push('/users');
          return;
        }
        
        setIsAuthorized(true);
        const response = await fetch('/api/admin/flagged-users');
        if (!response.ok) {
          throw new Error('Failed to fetch flagged users data.');
        }
        const data = await response.json();
        setFlaggedUsers(data);

      } catch (error) {
        console.error("Admin page error:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [router]);

  // 계정 정지 버튼 클릭 핸들러
  const handleSanction = async (userId) => {
    // confirm()은 iframe 환경에서 작동하지 않을 수 있으므로, 바로 실행하도록 변경합니다.
    // 실제 서비스에서는 커스텀 모달로 확인 절차를 만드는 것이 좋습니다.
    
    try {
        const response = await fetch('/api/admin/sanction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to sanction user.');
        }

        // 성공적으로 제재 후, 목록에서 해당 사용자를 제거하여 UI를 업데이트합니다.
        setFlaggedUsers(prevUsers => prevUsers.filter(user => user.userId !== userId));
        alert('사용자 계정을 정지했습니다.');

    } catch (error) {
        console.error('Failed to sanction user:', error);
        alert('계정 정지 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">권한 확인 및 데이터 로딩 중...</div>;
  }
  
  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">접근 권한이 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">관리자 페이지 - 신고된 사용자 목록</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">사용자</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">신고 횟수</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">조치</th>
              </tr>
            </thead>
            <tbody>
              {flaggedUsers.length > 0 ? (
                flaggedUsers.map((user) => (
                  <tr key={user.userId}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img className="w-full h-full rounded-full object-cover" src={user.profileImage || `https://placehold.co/100x100/E2E8F0/4A5568?text=${user.name.charAt(0)}`} alt="" />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap font-semibold">{user.name}</p>
                          <p className="text-gray-600 whitespace-no-wrap text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                        <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                        <span className="relative">{user.reportCount} 회</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                      <button onClick={() => handleSanction(user.userId)} className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-full">
                        계정 정지
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">3번 이상 신고된 사용자가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
