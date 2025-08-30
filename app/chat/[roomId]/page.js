// app/chat/[roomId]/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Pusher from 'pusher-js';
import ReportModal from '@/components/ReportModal';

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { roomId } = params;
  const partnerName = searchParams.get('partnerName');
  const partnerImageUrl = searchParams.get('partnerImageUrl');
  const partnerId = roomId.split('_').find(id => currentUser && id !== currentUser._id);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const userRes = await fetch('/api/profile');
        if (!userRes.ok) throw new Error('Failed to fetch user profile');
        const userData = await userRes.json();
        setCurrentUser(userData);

        const historyRes = await fetch(`/api/chat/${roomId}`);
        if (!historyRes.ok) throw new Error('Failed to fetch chat history');
        const historyData = await historyRes.json();
        setMessages(historyData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    if (roomId) {
      fetchUserAndHistory();
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSher_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`chat-${roomId}`);

    channel.bind('new-message', (newMessage) => {
      setMessages((prevMessages) => {
        if (!prevMessages.find(msg => msg._id === newMessage._id)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() === '' || !currentUser) return;

    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentMessage,
          roomId: roomId,
          authorName: currentUser.name,
        }),
      });
      setCurrentMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleReportSubmit = async (reason) => {
    if (!partnerId) return;
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: partnerId, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Report submission failed');
      setReportMessage('신고가 성공적으로 접수되었습니다.');
      setIsReportModalOpen(false);
      setTimeout(() => setReportMessage(''), 3000);
    } catch (err) {
      setReportMessage(`신고 접수 중 오류: ${err.message}`);
      setTimeout(() => setReportMessage(''), 3000);
    }
  };

  const handleLeaveChat = async () => {
    if (!partnerId) return;
    try {
      await fetch('/api/chat/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      router.push('/matches');
    } catch (error) {
      console.error('Failed to leave chat', error);
    }
  };

  const fallbackChar = partnerName?.charAt(0) || '?';

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-md p-4 flex items-center justify-between z-10">
          <Link href="/matches" className="text-blue-500 hover:text-blue-700">
            &larr; 뒤로가기
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img src={partnerImageUrl || `https://placehold.co/100x100/E2E8F0/4A5568?text=${fallbackChar}`} alt={`${partnerName} 프로필 사진`} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{partnerName}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsReportModalOpen(true)} className="text-xs text-gray-400 hover:text-red-500">신고</button>
            <button onClick={() => setShowLeaveConfirm(true)} className="text-xs text-gray-400 hover:text-red-500">나가기</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingHistory ? (
            <div className="text-center text-gray-500">대화 기록을 불러오는 중...</div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id || msg.timestamp} className={`flex ${msg.authorId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.authorId === currentUser?._id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-white p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400" disabled={!currentMessage.trim()}>
              전송
            </button>
          </form>
        </footer>
      </div>

      {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} onReport={handleReportSubmit} />}
      {reportMessage && <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg">{reportMessage}</div>}

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">정말 채팅방을 나가시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-6">나가시면 매칭이 해제되고 모든 대화 내용이 삭제됩니다.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">취소</button>
              <button onClick={handleLeaveChat} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">나가기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}