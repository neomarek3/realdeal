"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';

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
  const { t } = useLanguage();
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
      <h1 className="text-2xl font-bold mb-6 text-primary-color">{t('dashboard.welcome')}, {user?.name || 'User'}</h1>
      
      {user && !user.isVerified && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-500 p-4 rounded-md">
          <h2 className="font-medium">{t('dashboard.verifyPrompt')}</h2>
          <Link 
            href="/auth/verification"
            className="mt-2 inline-block bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-300 text-sm px-3 py-1 rounded"
          >
            {t('dashboard.verifyNow')}
          </Link>
        </div>
      )}
      
      {/* Statistics Section */}
      <div className="mb-8 p-6 rounded-lg shadow border bg-card">
        <h2 className="text-lg font-bold mb-4 text-primary-color">{t('dashboard.stats')}</h2>
        
        {listingsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-color">{t('dashboard.activeSales')}</p>
                  <p className="text-2xl font-bold text-primary-color">{stats.activeListing}</p>
                </div>
                <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-color">{t('dashboard.totalSold')}</p>
                  <p className="text-2xl font-bold text-primary-color">{stats.soldItems}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-color">{t('dashboard.totalViews')}</p>
                  <p className="text-2xl font-bold text-primary-color">
                    {Math.floor(Math.random() * 1000)}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-color">{t('dashboard.messages')}</p>
                  <p className="text-2xl font-bold text-primary-color">{chats.length}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg shadow border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary-color">{t('dashboard.recentListings')}</h2>
              <Link href="/marketplace/listings/create" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                + {t('nav.newListing')}
              </Link>
            </div>
            
            {listingsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-4">
                {listings.slice(0, 3).map(listing => (
                  <div key={listing.id} className="flex border rounded-lg p-3 bg-card">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg'} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-primary-color">{listing.title}</h3>
                        <span className="price-tag text-sm">€{listing.price}</span>
                      </div>
                      <p className="text-sm text-muted-color">{formatDate(listing.createdAt)}</p>
                      <div className="mt-1 flex justify-between items-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${listing.isSold ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {listing.isSold ? t('listing.sold') : 'Active'}
                        </span>
                        <Link href={`/marketplace/listings/${listing.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          {t('profile.viewListing')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link href="/dashboard/listings" className="block text-center py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-secondary-color">
                  {t('listing.viewAll')} →
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-secondary-color mb-4">{t('dashboard.noListings')}</p>
                <Link 
                  href="/marketplace/listings/create"
                  className="btn-primary inline-block"
                >
                  {t('dashboard.createFirst')}
                </Link>
              </div>
            )}
          </div>
          
          {/* Recent Messages */}
          <div className="bg-card rounded-lg shadow border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary-color">{t('messages.title')}</h2>
              <Link href="/user/messages" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                {t('dashboard.viewMessages')} →
              </Link>
            </div>
            
            {chatsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : chats.length > 0 ? (
              <div className="space-y-3">
                {chats.slice(0, 3).map(chat => (
                  <div key={chat.id} className="flex items-center border rounded-lg p-3 bg-card">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {chat.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-primary-color">{chat.otherUserName}</h3>
                        <span className="text-xs text-muted-color">{formatTimeAgo(chat.lastMessageTime)}</span>
                      </div>
                      <p className="text-sm text-secondary-color truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
                
                <Link href="/user/messages" className="block text-center py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-secondary-color">
                  {t('listing.viewAll')} →
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-secondary-color">{t('messages.noMessages')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg shadow border p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 text-primary-color">{t('dashboard.quickActions')}</h2>
            
            <div className="space-y-3">
              <Link href="/marketplace/listings/create" className="block w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-lg text-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('dashboard.newListing')}
              </Link>
              
              <Link href="/user/messages" className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {t('dashboard.viewMessages')}
              </Link>
              
              <Link href="/user/profile" className="block w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('dashboard.editProfile')}
              </Link>
              
              <Link href="/marketplace/listings" className="block w-full py-3 px-4 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg text-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('dashboard.browseMarketplace')}
              </Link>
            </div>
          </div>
          
          {/* Revenue Chart Placeholder */}
          <div className="bg-card rounded-lg shadow border p-6">
            <h2 className="text-lg font-bold mb-4 text-primary-color">Revenue</h2>
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
              <p className="text-muted-color">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 