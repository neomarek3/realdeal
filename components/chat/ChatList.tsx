"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';

type ChatPreview = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function ChatList() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chats', {
          headers: {
            'Authorization': `Bearer ${user?.email}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [isAuthenticated, router, user]);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="border-b dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
      </div>
      
      {chats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">No conversations yet</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">When you contact sellers or receive messages, they'll appear here.</p>
          <Link
            href="/marketplace/listings"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y dark:divide-gray-700">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/user/messages/${chat.id}`}
              className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 mr-3">
                  <img 
                    src={chat.listingImage || '/images/placeholder-image.svg'} 
                    alt={chat.listingTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.otherUserName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(chat.lastMessageTime)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    Re: {chat.listingTitle}
                  </p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.lastMessage}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 