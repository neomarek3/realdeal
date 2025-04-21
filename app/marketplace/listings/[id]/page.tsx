"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import NewChatButton from '@/components/chat/NewChatButton';
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  const [markingAsSold, setMarkingAsSold] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.status}`);
        }
        
        const data = await response.json();
        setListing(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id]);

  // Preload all images when listing data is available
  useEffect(() => {
    if (!listing || !listing.images) return;
    
    const imageUrls = Array.isArray(listing.images) ? listing.images : [listing.imageUrl];
    
    imageUrls.forEach((url: string, index: number) => {
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setImagesLoaded(prev => ({
          ...prev,
          [index]: true
        }));
      };
    });
  }, [listing]);

  // Helper function to get category name from a listing
  const getCategoryName = (listing: any) => {
    if (typeof listing.category === 'object' && listing.category !== null) {
      return listing.category.name || 'Uncategorized';
    }
    return listing.category || 'Uncategorized';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!listing || !listing.images || isAnimating) return;
    
    setIsAnimating(true);
    setSlideDirection(direction === 'next' ? 'right' : 'left');
    
    const imagesCount = images.length;
    let newIndex;
    if (direction === 'next') {
      newIndex = (activeImage + 1) % imagesCount;
    } else {
      newIndex = (activeImage - 1 + imagesCount) % imagesCount;
    }
    
    // Only change the image when the next image is loaded
    if (imagesLoaded[newIndex]) {
      setActiveImage(newIndex);
    }
    
    // Clear animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      setSlideDirection('none');
    }, 400);
  };

  // Direct thumbnail click - no slide direction
  const selectThumbnail = (index: number) => {
    if (isAnimating || index === activeImage) return;
    setIsAnimating(true);
    setSlideDirection('none');
    setActiveImage(index);
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  const handleMarkAsSold = async () => {
    if (!listing || !user || markingAsSold) return;
    
    try {
      setMarkingAsSold(true);
      setStatusMessage(null);
      
      const response = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        },
        body: JSON.stringify({
          isSold: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark listing as sold');
      }
      
      const updatedListing = await response.json();
      setListing(updatedListing);
      setStatusMessage({
        type: 'success',
        text: 'Listing has been marked as sold!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error marking listing as sold:', error);
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to mark listing as sold'
      });
    } finally {
      setMarkingAsSold(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-8 shadow-sm">
          <p className="font-medium">{error || 'Listing not found'}</p>
        </div>
        <Link href="/marketplace/listings" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t('listing.back')}
        </Link>
      </div>
    );
  }

  // Extract image array or create from single imageUrl if needed
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [listing.imageUrl || '/images/placeholder-image.svg'];

  // Get the animation class based on slide direction
  const getAnimationClass = () => {
    if (slideDirection === 'left') return 'slide-in-left';
    if (slideDirection === 'right') return 'slide-in-right';
    return 'carousel-slide-in';
  };

  // Are all images preloaded?
  const allImagesLoaded = images.length === Object.keys(imagesLoaded).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link href="/marketplace/listings" className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to listings
        </Link>
        
        {user && listing && user.id === listing.sellerId && (
          <div className="flex items-center space-x-3">
            <Link 
              href={`/marketplace/listings/${id}/edit`} 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Listing
            </Link>
            
            {!listing.isSold && (
              <button
                onClick={handleMarkAsSold}
                disabled={markingAsSold}
                className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {markingAsSold ? 'Processing...' : 'Mark as Sold'}
              </button>
            )}
          </div>
        )}
      </div>
      
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <p>{statusMessage.text}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {listing && listing.isSold && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 text-center font-medium border-b border-green-100 dark:border-green-800">
            This item has been sold
          </div>
        )}
        <div className="md:flex flex-col lg:flex-row">
          {/* Image gallery/carousel */}
          <div className="lg:w-3/5">
            {/* Main Image with Navigation Controls */}
            <div className="h-96 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
              {/* Loading indicator */}
              {!allImagesLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-opacity-60 dark:bg-opacity-60 z-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-teal-500 dark:border-teal-400"></div>
                </div>
              )}
              
              {/* Previous Button */}
              {images.length > 1 && (
                <button
                  onClick={() => navigateImage('prev')}
                  className="carousel-nav-button absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 bg-opacity-80 hover:bg-opacity-100 dark:hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
                  aria-label="Previous image"
                  disabled={isAnimating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Preload all images off-screen */}
              <div className="hidden">
                {images.map((img: string, index: number) => (
                  <img 
                    key={`preload-${index}`}
                    src={img} 
                    alt="" 
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Main Image */}
              <div className="carousel-image-container p-4">
                {images.map((img: string, index: number) => (
                  <div 
                    key={`image-${index}`}
                    className={`carousel-image-wrapper ${activeImage === index ? 'carousel-image-active' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="carousel-image w-full h-full object-contain"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                    />
                  </div>
                ))}
              </div>

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  onClick={() => navigateImage('next')}
                  className="carousel-nav-button absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 bg-opacity-80 hover:bg-opacity-100 dark:hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
                  aria-label="Next image"
                  disabled={isAnimating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-sm py-1 px-3 rounded-full z-20">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex overflow-x-auto space-x-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {images.map((img: string, index: number) => (
                    <div 
                      key={index} 
                      className={`thumbnail-hover h-20 w-20 flex-shrink-0 cursor-pointer rounded-md border-2 ${
                        activeImage === index 
                          ? 'thumbnail-active border-teal-500 dark:border-teal-400' 
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => selectThumbnail(index)}
                    >
                      <img 
                        src={img} 
                        alt={`${listing.title} - Thumbnail ${index + 1}`} 
                        className="h-full w-full object-cover rounded-sm" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Listing details */}
          <div className="lg:w-2/5 p-8">
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="listing-category bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded-full mr-2">{getCategoryName(listing)}</span>
                <span className="text-gray-400 dark:text-gray-500 text-sm">Listed on {listing.createdAt ? formatDate(listing.createdAt) : 'Unknown date'}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-typewriter">{listing.title}</h1>
              
              <div className="flex items-center">
                <div className="price-tag bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xl font-bold px-3 py-1 rounded-md mb-4">€{listing.price}</div>
                {listing.isSold && (
                  <span className="ml-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm px-2 py-1 rounded-full font-medium">
                    Sold
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{listing.location}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-lg font-bold mb-3 font-typewriter dark:text-white">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{listing.description || 'No description provided.'}</p>
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mb-6">
              <h2 className="text-lg font-bold mb-3 font-typewriter dark:text-white">Condition</h2>
              <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                {listing.condition || 'Not specified'}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <NewChatButton 
                listingId={listing.id} 
                sellerId={listing.sellerId || ''} 
              />
              <button className="flex items-center justify-center px-4 py-3 border border-teal-600 dark:border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Seller information */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-bold mb-4 font-typewriter dark:text-white">Seller Information</h2>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white font-typewriter">
                {listing.seller?.name || `Seller #${listing.sellerId || 'Unknown'}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member since {listing.createdAt ? formatDate(listing.createdAt) : 'Unknown date'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 