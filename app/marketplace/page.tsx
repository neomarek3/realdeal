"use client";

import { useState } from "react";
import Link from "next/link";

export default function MarketplacePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDummyData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const response = await fetch('/api/dummy-data');
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to load dummy data');
      }
    } catch (error) {
      console.error('Error loading dummy data:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        <div className="flex space-x-4">
          <Link
            href="/marketplace/listings"
            className="bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Browse Listings
          </Link>
          <Link
            href="/marketplace/listings/create"
            className="bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Create Listing
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Load Dummy Data</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Click the button below to populate the marketplace with dummy data for testing purposes.
          This will create sample categories, users, and listings.
        </p>
        
        <button
          onClick={loadDummyData}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          {loading ? 'Loading...' : 'Load Dummy Data'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
            <p className="font-medium">Success!</p>
            <p>{result.message}</p>
            {result.details && (
              <div className="mt-2">
                <p>Added {result.details.categories} categories</p>
                <p>Added {result.details.users} users</p>
                <p>Added {result.details.listings} listings</p>
                <p>Total: {result.details.total} items</p>
                {result.details.errors && result.details.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Warnings:</p>
                    <ul className="list-disc list-inside">
                      {result.details.errors.map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Buy</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Browse thousands of listings to find what you need.</p>
            <Link href="/marketplace/listings" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Browse listings →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Sell</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Create a listing and sell your items quickly and easily.</p>
            <Link href="/marketplace/listings/create" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Create a listing →
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Connect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Message other users and negotiate deals securely.</p>
            <Link href="/user/messages" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              View messages →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 