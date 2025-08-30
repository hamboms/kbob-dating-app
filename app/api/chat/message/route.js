// app/chat/[roomId]/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
      try {
        // 1. 현재 사용자 정보 가져오기
        const userRes = await fetch('/api/profile');
        const userData = await userRes.json();
        setCurrentUser(userData);

        // 2. 이전 대화 기록 가져오기
        const historyRes = await fetch(`/api/chat/${roomId}`);
        const historyData = await historyRes.json();
        setMessages(historyData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchUserAndHistory();
  }, [roomId]);

  // Pusher 실시간 연결 설정
  useEffect(() => {
    if (!roomId) return;

    // .env.local에 NEXT_PUBLIC_PUSHER_KEY가 필요합니다.
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
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

    // 컴포넌트가 사라질 때 연결을 해제합니다.
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

  // ... (handleReportSubmit, handleLeaveChat 함수들은 기존과 동일하게 유지)

  const fallbackChar = partnerName?.charAt(0) || '?';

  return (
    <>
      {/* ... (기존 채팅방 JSX 코드는 여기에 그대로 유지됩니다) */}
    </>
  );
}
