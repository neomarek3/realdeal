"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
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
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-typewriter text-gray-900 dark:text-white">Welcome to RealDeal</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-typewriter text-gray-700 dark:text-gray-300">
              A trusted marketplace for buying and selling goods, with authentication and real users.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/auth/register" 
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link 
                    href="/marketplace/listings" 
                    className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors"
                  >
                    Browse Listings
                  </Link>
                </>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link 
                    href="/dashboard" 
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    href="/marketplace/listings" 
                    className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors"
                  >
                    Browse Listings
                  </Link>
                  <Link 
                    href="/marketplace/listings/create" 
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors"
                  >
                    Create Listing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-gray-900 dark:text-white">Featured Listings</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-typewriter">Check out some of our latest items for sale</p>
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
                  <div className="p-4 flex-grow dark:bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-typewriter">{listing.title}</h3>
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold text-lg">€{listing.price}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2 font-typewriter">
                      {listing.description || 'No description provided'}
                    </p>
                    <div className="mt-auto pt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 font-typewriter">
                      <span>{listing.location}</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 font-typewriter">No listings available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              href="/marketplace/listings" 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors inline-block"
            >
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-gray-900 dark:text-white">Categories</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-typewriter">Browse items by category</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="spinner h-16 w-16"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/marketplace/listings?category=${category.name}`} 
                  className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                >
                  <div className="h-40 bg-blue-50 dark:bg-blue-900/20 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-lg font-bold font-typewriter">{category.name}</h3>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-bold text-blue-600/30 dark:text-blue-400/30 font-typewriter">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 font-typewriter">No categories available.</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-typewriter text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-typewriter">Simple steps to buy and sell items</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-typewriter text-gray-900 dark:text-white">Create an Account</h3>
              <p className="text-gray-600 dark:text-gray-400 font-typewriter">Sign up and complete your profile to start using RealDeal marketplace.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-typewriter text-gray-900 dark:text-white">Buy or Sell</h3>
              <p className="text-gray-600 dark:text-gray-400 font-typewriter">Browse listings or create your own to sell items you no longer need.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-typewriter text-gray-900 dark:text-white">Connect & Complete</h3>
              <p className="text-gray-600 dark:text-gray-400 font-typewriter">Message sellers, arrange meetups, and complete your transactions safely.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            {!isAuthenticated ? (
              <Link 
                href="/auth/register" 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors inline-block"
              >
                Get Started
              </Link>
            ) : (
              <Link 
                href="/marketplace/listings/create" 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-typewriter transition-colors inline-block"
              >
                Create a Listing
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
