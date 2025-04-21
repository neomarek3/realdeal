"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    condition: "",
    query: "",
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/listings");
        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        const data = await response.json();
        setListings(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to load listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      condition: "",
      query: "",
    });
  };

  const filteredListings = listings.filter(listing => {
    // Filter by search query
    if (filters.query && 
        !listing.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !listing.description?.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (filters.category) {
      const categoryName = typeof listing.category === 'object' 
        ? listing.category?.name 
        : listing.category;
        
      if (categoryName !== filters.category) {
        return false;
      }
    }
    
    // Filter by price range
    if (filters.minPrice && listing.price < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && listing.price > parseFloat(filters.maxPrice)) {
      return false;
    }
    
    // Filter by condition
    if (filters.condition && listing.condition !== filters.condition) {
      return false;
    }
    
    return true;
  });

  // Helper function to get category name from a listing
  const getCategoryName = (listing: any) => {
    if (typeof listing.category === 'object' && listing.category !== null) {
      return listing.category.name || 'Uncategorized';
    }
    return listing.category || 'Uncategorized';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-typewriter">Marketplace Listings</h1>
        <Link 
          href="/marketplace/listings/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Listing
        </Link>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1 font-typewriter">Search</label>
          <input
            type="text"
            id="query"
            name="query"
            value={filters.query}
            onChange={handleFilterChange}
            placeholder="Search by title or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 font-typewriter">Category</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing & Fashion">Clothing & Fashion</option>
              <option value="Sports & Leisure">Sports & Leisure</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1 font-typewriter">Min Price (€)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1 font-typewriter">Max Price (€)</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1 font-typewriter">Condition</label>
            <select
              id="condition"
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={resetFilters} 
            className="text-gray-600 hover:text-gray-800 mr-4 font-typewriter"
          >
            Reset Filters
          </button>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-typewriter"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 font-typewriter">
              {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
            </p>
            <div>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                defaultValue="newest"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-gray-50 rounded-lg py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-typewriter">No listings found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
              <button 
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Link 
                  key={listing.id} 
                  href={`/marketplace/listings/${listing.id}`} 
                  className="listing-card"
                >
                  <div className="relative h-60 bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0] : '/images/placeholder-image.svg')}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="listing-category">{getCategoryName(listing)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 font-typewriter">{listing.title}</h3>
                      <span className="price-tag">€{listing.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {listing.description || 'No description provided'}
                    </p>
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <span>{listing.location}</span>
                      <span>{listing.createdAt ? formatDate(listing.createdAt) : 'No date'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 