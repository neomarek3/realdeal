"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('authenticated') === 'true';
      
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch listings from API
        const response = await fetch(`/api/listings?sellerId=${user?.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        
        const listingsData = await response.json();
        setListings(listingsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('profile.title')}</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">{user?.name || 'User'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email || 'No email available'}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">{t('profile.accountDetails')}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.name')}</p>
                  <p className="font-medium dark:text-white">{user?.name || t('profile.notProvided')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                  <p className="font-medium dark:text-white">{user?.email || t('profile.notProvided')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.verificationStatus')}</p>
                <p className="font-medium">
                  {user?.isVerified ? (
                    <span className="text-green-600 dark:text-green-400">{t('profile.verified')}</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">{t('profile.notVerified')}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <Link 
              href="/user/profile/edit" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              {t('profile.editProfile')}
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              {t('profile.backToDashboard')}
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="active">{t('profile.activeListings')}</TabsTrigger>
          <TabsTrigger value="sold">{t('profile.soldItems')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('profile.favorites')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.filter(l => l.isActive && !l.isSold).length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">{t('profile.noActiveListings')}</p>
              </div>
            ) : (
              listings.filter(l => l.isActive && !l.isSold).map((listing) => (
                <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg')}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{listing.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                      {t('profile.listedOn')} {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-lg font-bold dark:text-white">€{listing.price}</p>
                      <div className="flex space-x-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{listing.views || 0} {t('profile.views')}</span>
                        <span>{listing.messages || 0} {t('profile.messages')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/marketplace/listings/${listing.id}/edit`}
                        className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-200"
                      >
                        {t('profile.edit')}
                      </Link>
                      <button className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40">
                        {t('profile.markAsSold')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="sold">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.filter(l => l.isSold).length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">{t('profile.noSoldItems')}</p>
              </div>
            ) : (
              listings.filter(l => l.isSold).map((listing) => (
                <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden opacity-75">
                  <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    <img
                      src={listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg')}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-sm">
                      {t('listing.sold')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{listing.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                      {t('profile.listedOn')} {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold dark:text-white">€{listing.price}</p>
                      <Link
                        href={`/marketplace/listings/${listing.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {t('profile.view')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('profile.noFavorites')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 