"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';

type Listing = {
  id: string;
  title: string;
  price: number;
  images: string[];
  imageUrl?: string;
  createdAt: string;
  isSold: boolean;
  isActive: boolean;
  views?: number;
  messages?: number;
};

export default function DashboardListingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    const fetchListings = async () => {
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
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchListings();
    }
  }, [isAuthenticated, router, user]);

  const filteredListings = () => {
    switch (filter) {
      case 'active':
        return listings.filter(l => l.isActive && !l.isSold);
      case 'sold':
        return listings.filter(l => l.isSold);
      case 'all':
      default:
        return listings;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify({ isSold: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing');
      }
      
      // Update the local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, isSold: true } 
            : listing
        )
      );
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Listings</h1>
        <Link 
          href="/dashboard" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')} 
              className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('sold')} 
              className={`px-3 py-1 rounded ${filter === 'sold' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Sold
            </button>
          </div>
          <Link 
            href="/marketplace/listings/create" 
            className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            + New Listing
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4">
            <p>{error}</p>
          </div>
        )}
        
        {filteredListings().length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any {filter !== 'all' ? filter : ''} listings yet.</p>
            <Link
              href="/marketplace/listings/create"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Date Listed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredListings().map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                          <img
                            src={listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg')}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Link href={`/marketplace/listings/${listing.id}`} className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400">
                          {listing.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {formatCurrency(listing.price)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {formatDate(listing.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {listing.isSold ? (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          Sold
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/marketplace/listings/${listing.id}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          View
                        </Link>
                        {!listing.isSold && (
                          <>
                            <Link
                              href={`/marketplace/listings/${listing.id}/edit`}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleMarkAsSold(listing.id)}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Mark as Sold
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 