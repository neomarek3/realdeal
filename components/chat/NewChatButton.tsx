"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';

type NewChatButtonProps = {
  listingId: string;
  sellerId: string;
};

export default function NewChatButton({ listingId, sellerId }: NewChatButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStartChat = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Prevent users from messaging themselves
    if (user?.id === sellerId) {
      setError('You cannot message your own listing');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify({
          listingId,
          sellerId,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
      
      const data = await response.json();
      
      // Redirect to the chat page
      router.push(`/user/messages/${data.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start conversation. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleStartChat}
        disabled={isLoading}
        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting Chat...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Contact Seller
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 