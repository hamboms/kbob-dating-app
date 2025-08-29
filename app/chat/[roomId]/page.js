'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import Link from 'next/link';
import ReportModal from '@/components/ReportModal';

let socket;

// 확인 모달 컴포넌트
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatRoom() {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [partnerId, setPartnerId] = useState('');
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const params = useParams();
  const { roomId } = params;
  const searchParams = useSearchParams();
  const partnerName = searchParams.get('partnerName');
  const partnerImageUrl = searchParams.get('partnerImageUrl');
  const router = useRouter();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const profileRes = await fetch('/api/profile');
        if (!profileRes.ok) throw new Error('Auth failed');
        const profileData = await profileRes.json();
        setCurrentUser(profileData);

        const ids = roomId.split('_');
        const pId = ids.find(id => id !== profileData._id);
        setPartnerId(pId);
        
        const historyRes = await fetch(`/api/chat/${roomId}`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setMessages(historyData);
        }

        await fetch('/api/socket');
        socket = io();
        socket.emit('join-room', roomId);
        socket.on('receive-message', (newMessage) => {
          setMessages((prevMessages) => {
              if (prevMessages.some(msg => msg._id === newMessage._id || (msg.timestamp === newMessage.timestamp && msg.authorId === newMessage.authorId))) {
                  return prevMessages;
              }
              return [...prevMessages, newMessage];
          });
        });
      } catch (error) {
        console.error(error);
        router.push('/login');
      }
    };

    if (roomId) {
      initChat();
    }

    return () => {
      if (socket) {
        socket.emit('leave-room', roomId);
        socket.disconnect();
      }
    };
  }, [roomId, router]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() && currentUser) {
      const newMessage = {
        roomId,
        text: currentMessage,
        authorId: currentUser._id,
        authorName: currentUser.name,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send-message', newMessage);
      setCurrentMessage('');
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
    } catch (error) {
      setReportMessage(`신고 접수 중 오류: ${error.message}`);
    } finally {
      setIsReportModalOpen(false);
      setTimeout(() => setReportMessage(''), 3000);
    }
  };

  const handleConfirmLeave = async () => {
    try {
      const response = await fetch('/api/chat/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      if (!response.ok) throw new Error('Failed to leave chat');
      router.push('/matches');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLeaveConfirmOpen(false);
    }
  };

  const fallbackChar = partnerName ? partnerName.charAt(0) : '?';

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <Link href="/matches" className="text-sm text-blue-500 hover:underline">
            &larr; 매치 목록으로
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              <img
                src={partnerImageUrl || `https://placehold.co/100x100/E2E8F0/4A5568?text=${fallbackChar}`}
                alt={`${partnerName} 프로필 사진`}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{partnerName}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={() => setIsReportModalOpen(true)} className="text-xs text-gray-400 hover:text-red-500">
              신고
            </button>
            <button onClick={() => setIsLeaveConfirmOpen(true)} className="text-xs text-gray-400 hover:text-red-500">
              나가기
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
             <div key={msg._id || msg.timestamp} className={`flex ${msg.authorId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.authorId === currentUser?._id ? 'bg-pink-500 text-white' : 'bg-white text-gray-800 shadow'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>
        
        <footer className="bg-white p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-4 items-center">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="bg-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-600 transition duration-300"
            >
              전송
            </button>
          </form>
        </footer>
      </div>

      {isReportModalOpen && (
        <ReportModal 
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleReportSubmit}
        />
      )}
      
      <ConfirmationModal
        isOpen={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        onConfirm={handleConfirmLeave}
        title="채팅방 나가기"
        message="정말로 채팅방을 나가시겠습니까? 모든 대화 기록이 삭제되고 매치가 해제됩니다."
      />
      
      {reportMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
          {reportMessage}
        </div>
      )}
    </>
  );
}
