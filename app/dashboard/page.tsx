"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from '@/app/providers';

type Listing = {
  id: string;
  title: string;
  price: number;
  images: string[];
  createdAt: string;
  isSold: boolean;
};

type ChatPreview = {
  id: string;
  listingTitle: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

type Statistics = {
  totalListings: number;
  activeListing: number;
  soldItems: number;
  totalRevenue: number;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [stats, setStats] = useState<Statistics>({
    totalListings: 0,
    activeListing: 0,
    soldItems: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      setLoading(false);
      
      // Fetch user's listings
      const fetchListings = async () => {
        try {
          setListingsLoading(true);
          const response = await fetch(`/api/listings?sellerId=${user?.id}`, {
            headers: {
              'Authorization': `Bearer ${user?.email}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch listings');
          }
          
          const data = await response.json();
          setListings(data);
          
          // Calculate statistics
          const totalListings = data.length;
          const soldItems = data.filter((listing: Listing) => listing.isSold).length;
          const activeListing = totalListings - soldItems;
          const totalRevenue = data
            .filter((listing: Listing) => listing.isSold)
            .reduce((sum: number, listing: Listing) => sum + listing.price, 0);
          
          setStats({
            totalListings,
            activeListing,
            soldItems,
            totalRevenue
          });
          
        } catch (error) {
          console.error('Error fetching listings:', error);
        } finally {
          setListingsLoading(false);
        }
      };
      
      // Fetch user's chats
      const fetchChats = async () => {
        try {
          setChatsLoading(true);
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
        } finally {
          setChatsLoading(false);
        }
      };
      
      if (user) {
        fetchListings();
        fetchChats();
      }
    }
  }, [isAuthenticated, router, user]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time ago for messages
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Welcome, {user?.name || 'User'}</h1>
      
      {user && !user.isVerified && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 p-4 rounded-md">
          <h2 className="font-medium">Your account is not verified</h2>
          <p className="text-sm mt-1">Verify your account to start selling items</p>
          <Link 
            href="/auth/verification"
            className="mt-2 inline-block bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-300 text-sm px-3 py-1 rounded"
          >
            Verify Now
          </Link>
        </div>
      )}
      
      {/* Statistics Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Your Sales Statistics</h2>
        
        {listingsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Listings</p>
              <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{stats.totalListings}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Listings</p>
              <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{stats.activeListing}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Items Sold</p>
              <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{stats.soldItems}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Listings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">My Listings</h2>
          
          {listingsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : listings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any listings yet.</p>
          ) : (
            <div className="space-y-4 mb-4">
              {listings.slice(0, 3).map(listing => (
                <Link 
                  key={listing.id} 
                  href={`/marketplace/listings/${listing.id}`}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mr-3 flex-shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{listing.title}</h3>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(listing.price)}</span>
                        <span className="text-gray-500 dark:text-gray-400">{formatDate(listing.createdAt)}</span>
                      </div>
                    </div>
                    {listing.isSold && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">Sold</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <Link 
            href="/dashboard/listings" 
            className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View all listings →
          </Link>
        </div>
        
        {/* Messages */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Messages</h2>
          
          {chatsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : chats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any messages yet.</p>
          ) : (
            <div className="space-y-4 mb-4">
              {chats.slice(0, 3).map(chat => (
                <Link 
                  key={chat.id} 
                  href={`/user/messages/${chat.id}`}
                  className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start">
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {chat.otherUserName}
                          {chat.unreadCount > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">{formatTimeAgo(chat.lastMessageTime)}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{chat.lastMessage}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">Re: {chat.listingTitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <Link 
            href="/user/messages" 
            className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View all messages →
          </Link>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link 
              href="/marketplace/listings/create"
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Create New Listing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sell an item on the marketplace</p>
              </div>
            </Link>
            
            <Link 
              href="/user/profile"
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
              </div>
            </Link>
            
            <Link 
              href="/marketplace"
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Browse Marketplace</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find items to purchase</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 