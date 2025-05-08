"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';

type Message = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};

type ChatDetails = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: number;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  createdAt: string;
};

type ChatConversationProps = {
  chatId: string;
};

export default function ChatConversation({ chatId }: ChatConversationProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchChatData = async () => {
      try {
        setLoading(true);
        
        // Fetch chat details
        const detailsResponse = await fetch(`/api/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${user?.email}`
          }
        });
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch chat details');
        }
        
        const chatData = await detailsResponse.json();
        setChatDetails(chatData);
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/chats/${chatId}/messages`, {
          headers: {
            'Authorization': `Bearer ${user?.email}`
          }
        });
        
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
        
        // Mark messages as read
        await fetch(`/api/chats/${chatId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.email}`
          }
        });
        
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setError('Failed to load conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
    
    // Set up polling for new messages
    const pollInterval = setInterval(() => {
      fetchNewMessages();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(pollInterval);
  }, [chatId, isAuthenticated, router, user]);
  
  // Fetch only new messages
  const fetchNewMessages = async () => {
    if (!chatId || messages.length === 0) return;
    
    try {
      const lastMessageTimestamp = messages[messages.length - 1].timestamp;
      
      const response = await fetch(`/api/chats/${chatId}/messages?after=${lastMessageTimestamp}`, {
        headers: {
          'Authorization': `Bearer ${user?.email}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch new messages');
      }
      
      const newMessages = await response.json();
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
        
        // Mark new messages as read
        await fetch(`/api/chats/${chatId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.email}`
          }
        });
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId || !user) return;
    
    try {
      setSending(true);
      
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      
      // Clear the input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const messageDate = formatDate(message.timestamp);
      const existingGroup = groups.find(group => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message]
        });
      }
    });
    
    return groups;
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !chatDetails) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          <p>{error || 'Conversation not found'}</p>
        </div>
        <Link
          href="/user/messages"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to messages
        </Link>
      </div>
    );
  }
  
  const otherUser = user?.id === chatDetails.sellerId ? 
    { id: chatDetails.buyerId, name: chatDetails.buyerName } : 
    { id: chatDetails.sellerId, name: chatDetails.sellerName };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      {/* Chat header */}
      <div className="border-b dark:border-gray-700 p-4">
        <div className="flex items-center">
          <Link href="/user/messages" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <div className="flex-1">
            <h2 className="text-lg font-semibold truncate text-gray-900 dark:text-white">{otherUser.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Re: {chatDetails.listingTitle}</p>
          </div>
          
          <Link
            href={`/marketplace/listings/${chatDetails.listingId}`}
            className="flex-shrink-0 ml-4"
          >
            <div className="h-10 w-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={chatDetails.listingImage || '/images/placeholder-image.svg'} 
                alt={chatDetails.listingTitle}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            
            {group.messages.map((message) => {
              const isCurrentUser = message.senderId === user?.id;
              
              return (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isCurrentUser 
                        ? 'bg-blue-600 dark:bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div 
                      className={`text-xs mt-1 flex items-center ${
                        isCurrentUser ? 'text-blue-100 justify-end' : 'text-gray-500 dark:text-gray-300'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                      {isCurrentUser && (
                        <span className="ml-1">
                          {message.isRead ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="ml-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 