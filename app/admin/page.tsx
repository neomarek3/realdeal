"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
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
      return data.urls || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      setUploadProgress(false);
    }
  };

  const updateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingListing) return;
    
    try {
      setUpdateLoading(true);
      
      // Upload any new images first
      const newImageUrls = await uploadNewImages();
      
      // Combine existing and new image URLs
      const updatedImages = [...listingImages, ...newImageUrls];
      
      const updatedListing = {
        ...formData,
        price: parseFloat(formData.price),
        images: updatedImages,
      };
      
      const response = await fetch(`/api/admin/listings?id=${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`
        },
        body: JSON.stringify(updatedListing)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing');
      }
      
      const data = await response.json();
      
      // Update the listing in the state
      setListings(listings.map(listing => 
        listing.id === editingListing.id ? { ...listing, ...data } : listing
      ));
      
      setUpdateSuccess(true);
      
      // Close modal after a delay
      setTimeout(() => {
        closeEditModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('Failed to update listing. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-color">{t('admin.dashboard')}</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary-color">{t('admin.listings')}</h2>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center py-8 text-secondary-color">No listings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-secondary-color">{t('admin.title')}</th>
                  <th className="px-4 py-3 text-left text-secondary-color">{t('listing.price')}</th>
                  <th className="px-4 py-3 text-left text-secondary-color">{t('listing.category')}</th>
                  <th className="px-4 py-3 text-left text-secondary-color">{t('listing.location')}</th>
                  <th className="px-4 py-3 text-left text-secondary-color">Date</th>
                  <th className="px-4 py-3 text-left text-secondary-color">Status</th>
                  <th className="px-4 py-3 text-left text-secondary-color">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-primary-color">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mr-3">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{listing.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-primary-color">€{listing.price}</td>
                    <td className="px-4 py-3 text-primary-color">{listing.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-primary-color">{listing.location || '-'}</td>
                    <td className="px-4 py-3 text-primary-color">{formatDate(listing.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        listing.isSold 
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {listing.isSold ? t('listing.sold') : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(listing)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {t('admin.edit')}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(listing.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          {t('admin.delete')}
                        </button>
                        {deleteConfirm === listing.id && (
                          <div className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-10 border border-gray-200 dark:border-gray-700">
                            <p className="mb-3 text-primary-color">{t('admin.deleteConfirm')}</p>
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-gray-200"
                              >
                                {t('admin.cancel')}
                              </button>
                              <button
                                onClick={() => handleDelete(listing.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                              >
                                {t('admin.confirm')}
                              </button>
                            </div>
                          </div>
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
      
      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary-color">{t('admin.editListing')}</h2>
                <button 
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {updateSuccess && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-3 rounded">
                  Listing updated successfully!
                </div>
              )}
              
              <form onSubmit={updateListing}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="title" className="block text-secondary-color mb-1">{t('admin.title')}</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-secondary-color mb-1">{t('admin.price')}</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="condition" className="block text-secondary-color mb-1">{t('admin.condition')}</label>
                    <input
                      type="text"
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-secondary-color mb-1">{t('admin.location')}</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="categoryId" className="block text-secondary-color mb-1">{t('admin.category')}</label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="form-input"
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
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-secondary-color mb-1">{t('admin.description')}</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input min-h-[100px]"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary-color mb-2">{t('admin.images')}</label>
                  
                  {/* Existing images */}
                  {listingImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {listingImages.map((image, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img 
                            src={image} 
                            alt={`Listing image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => moveImageUp(index)}
                                disabled={index === 0}
                                className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                              >
                                {t('admin.moveUp')}
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImageDown(index)}
                                disabled={index === listingImages.length - 1}
                                className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                              >
                                {t('admin.moveDown')}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                {t('admin.removeImage')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* New images preview */}
                  {newImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`New image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              {t('admin.removeImage')}
                            </button>
                          </div>
                          <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add images button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary"
                    >
                      {t('admin.addImages')}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn-secondary mr-2"
                    disabled={updateLoading}
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading || uploadProgress ? t('admin.uploading') : t('admin.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 