"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, trigger the dummy data API to ensure we have some data
        await fetch('/api/dummy-data');
        
        // Fetch listings
        const listingsResponse = await fetch('/api/listings?limit=6');
        const listingsData = await listingsResponse.json();
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        
        setFeaturedListings(listingsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Placeholder images for categories if needed
  const getCategoryImage = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      'Electronics': '/images/categories/electronics.jpg',
      'Furniture': '/images/categories/furniture.jpg',
      'Clothing': '/images/categories/clothing.jpg',
      'Books': '/images/categories/books.jpg',
      'Sports & Leisure': '/images/categories/sports.jpg',
      'Vehicles': '/images/categories/vehicles.jpg',
      'Real Estate': '/images/categories/real-estate.jpg',
      'Services': '/images/categories/services.jpg',
      'Jobs': '/images/categories/jobs.jpg'
    };
    
    return categoryMap[category] || '/images/placeholder-image.svg';
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-typewriter text-primary-color">
              {t('home.welcome')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-typewriter text-secondary-color">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/auth/register" 
                    className="px-6 py-3 rounded-lg text-lg font-typewriter transition-colors btn-primary"
                  >
                    {t('home.signup')}
                  </Link>
                  <Link 
                    href="/marketplace/listings" 
                    className="px-6 py-3 rounded-lg text-lg font-typewriter transition-colors btn-secondary"
                  >
                    {t('home.browse')}
                  </Link>
                </>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link 
                    href="/dashboard" 
                    className="px-6 py-3 rounded-lg text-lg font-typewriter transition-colors btn-primary"
                  >
                    {t('home.dashboard')}
                  </Link>
                  <Link 
                    href="/marketplace/listings" 
                    className="px-6 py-3 rounded-lg text-lg font-typewriter transition-colors btn-secondary"
                  >
                    {t('home.browse')}
                  </Link>
                  <Link 
                    href="/marketplace/listings/create" 
                    className="px-6 py-3 rounded-lg text-lg font-typewriter transition-colors btn-primary"
                  >
                    {t('home.create')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-primary-color">{t('home.featuredListings')}</h2>
            <p className="text-secondary-color mt-2 font-typewriter">{t('home.featuredSubtitle')}</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="spinner h-16 w-16"></div>
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <Link key={listing.id} href={`/marketplace/listings/${listing.id}`} className="listing-card">
                  <div className="relative h-60 bg-gray-200 dark:bg-gray-800">
                    <img
                      src={listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg')}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">{listing.category?.name || 'Item'}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-primary-color font-typewriter">{listing.title}</h3>
                      <span className="price-tag">€{listing.price}</span>
                    </div>
                    <p className="text-secondary-color text-sm mb-2 line-clamp-2 font-typewriter">
                      {listing.description || t('listing.noDescription')}
                    </p>
                    <div className="mt-auto pt-2 flex justify-between items-center text-sm text-muted-color font-typewriter">
                      <span>{listing.location}</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-color font-typewriter">{t('home.noListings')}</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              href="/marketplace/listings" 
              className="btn-primary inline-block"
            >
              {t('home.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-primary-color">{t('home.categories')}</h2>
            <p className="text-secondary-color mt-2 font-typewriter">{t('home.categoriesSubtitle')}</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="spinner h-16 w-16"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/marketplace/listings?category=${category.id}`} 
                  className="group relative overflow-hidden rounded-lg shadow-md h-40 flex items-center justify-center bg-card"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  <img 
                    src={getCategoryImage(category.name)} 
                    alt={category.name} 
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <h3 className="text-white text-xl font-bold z-20 font-typewriter">{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-primary-color">{t('home.howItWorks')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.step1')}</h3>
              <p className="text-secondary-color">Sign up with your email and create a secure password</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.step2')}</h3>
              <p className="text-secondary-color">Complete our verification process to confirm your identity</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.step3')}</h3>
              <p className="text-secondary-color">Browse listings or create your own to start selling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-primary-color">{t('home.whyChoose')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.reason1')}</h3>
              <p className="text-secondary-color">All users are verified with ID checks to prevent fraud</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.reason2')}</h3>
              <p className="text-secondary-color">Our escrow service protects both buyers and sellers</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold mb-2 text-primary-color">{t('home.reason3')}</h3>
              <p className="text-secondary-color">Our AI detection system flags suspicious listings automatically</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
