"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import ChatConversation from '@/components/chat/ChatConversation';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-[calc(100vh-200px)]">
        <ChatConversation chatId={chatId} />
      </div>
    </div>
  );
} 