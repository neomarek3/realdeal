"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    location: '',
    categoryId: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is authenticated and has admin email
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user?.email !== 'neosiphonese@gmail.com') {
      router.push('/marketplace');
      return;
    }

    // Fetch all listings
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/listings', {
          headers: {
            'Authorization': `Bearer ${user?.email}` // Send email as bearer token for simplified auth
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch categories for the edit form
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchListings();
    fetchCategories();
  }, [isAuthenticated, router, user]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.email}` // Send email as bearer token for simplified auth
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Remove the listing from state
      setListings(listings.filter(listing => listing.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError('Failed to delete listing. Please try again.');
    }
  };

  const openEditModal = (listing: any) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price?.toString() || '',
      condition: listing.condition || '',
      location: listing.location || '',
      categoryId: listing.category?.id || listing.categoryId || '',
    });
    // Setup images
    const images = Array.isArray(listing.images) && listing.images.length > 0 
      ? listing.images 
      : listing.imageUrl ? [listing.imageUrl] : [];
    setListingImages(images);
    setNewImages([]);
  };

  const closeEditModal = () => {
    setEditingListing(null);
    setUpdateSuccess(false);
    setListingImages([]);
    setNewImages([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image operations
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    // Validate size and type
    const validFiles = filesArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index: number) => {
    setListingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (startIndex: number, endIndex: number) => {
    const result = Array.from(listingImages);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setListingImages(result);
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    reorderImages(index, index - 1);
  };

  const moveImageDown = (index: number) => {
    if (index === listingImages.length - 1) return;
    reorderImages(index, index + 1);
  };

  // Upload new images
  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];
    
    setUploadProgress(true);
    
    try {
      const formData = new FormData();
      newImages.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    } finally {
      setUploadProgress(false);
    }
  };

  const updateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingListing) return;
    
    try {
      setUpdateLoading(true);
      setError(null);
      
      // Upload any new images first
      let allImages = [...listingImages];
      
      if (newImages.length > 0) {
        try {
          const uploadedImageUrls = await uploadNewImages();
          allImages = [...allImages, ...uploadedImageUrls];
        } catch (error) {
          setError('Failed to upload new images. Please try again.');
          setUpdateLoading(false);
          return;
        }
      }
      
      const updatedData = {
        ...formData,
        price: parseFloat(formData.price),
        images: allImages,
      };
      
      const response = await fetch(`/api/admin/listings?id=${editingListing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing');
      }
      
      const updatedListing = await response.json();
      
      // Update the listing in the local state
      setListings(listings.map(listing => 
        listing.id === updatedListing.id ? updatedListing : listing
      ));
      
      setUpdateSuccess(true);
      
      // Close the modal after a short delay
      setTimeout(() => {
        closeEditModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('Failed to update listing. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <Link 
          href="/marketplace" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Back to Marketplace
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {editingListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Listing</h2>
              <button onClick={closeEditModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {updateSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded">
                <p>Listing updated successfully!</p>
              </div>
            )}
            
            <form onSubmit={updateListing} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (€)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Existing Images */}
              {listingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                          <img src={image} alt={`Listing image ${index + 1}`} className="object-cover w-full h-full" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="flex space-x-1 ml-2">
                            <button
                              type="button"
                              onClick={() => moveImageUp(index)}
                              disabled={index === 0}
                              className={`p-1 bg-blue-600 text-white rounded-full ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImageDown(index)}
                              disabled={index === listingImages.length - 1}
                              className={`p-1 bg-blue-600 text-white rounded-full ${index === listingImages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add New Images</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Select Images
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Max 5MB per image</p>
                </div>
                
                {newImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`New image ${index + 1}`} 
                            className="object-cover w-full h-full" 
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading || uploadProgress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-500"
                >
                  {updateLoading || uploadProgress ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Listings ({listings.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Listing</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Seller</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {listings.map(listing => (
                <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={listing.images[0]} 
                            alt={listing.title} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <Link href={`/marketplace/listings/${listing.id}`} className="hover:underline">
                            {listing.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {listing.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      listing.isSold 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    }`}>
                      {listing.isSold ? 'Sold' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {listing.category?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    €{typeof listing.price === 'number' ? listing.price.toFixed(2) : listing.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{listing.seller?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{listing.seller?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(listing.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(listing)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      {deleteConfirm === listing.id ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirm(listing.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 