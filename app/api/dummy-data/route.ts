import { NextResponse } from 'next/server';

// Dummy categories data
const dummyCategories = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Clothing & Fashion' },
  { id: 'cat-3', name: 'Home & Garden' },
  { id: 'cat-4', name: 'Sports & Leisure' },
  { id: 'cat-5', name: 'Vehicles' },
  { id: 'cat-6', name: 'Real Estate' },
  { id: 'cat-7', name: 'Jobs' },
  { id: 'cat-8', name: 'Services' },
  { id: 'cat-9', name: 'Other' }
];

// Dummy user data
const dummyUsers = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    password: 'hashed_password',
    phone: '+385 91 234 5678',
    isVerified: true,
    verificationLevel: 'BASIC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    password: 'hashed_password',
    phone: '+385 95 876 5432',
    isVerified: true,
    verificationLevel: 'FULL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user3',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'demo_password_hash',
    phone: '+385 99 111 2222',
    isVerified: true,
    verificationLevel: 'NONE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Dummy listings data
const dummyListings = [
  {
    id: 'listing1',
    title: 'iPhone 12 Pro - Mint Condition',
    description: 'Selling my iPhone 12 Pro 128GB in excellent condition. Comes with original box, charger, and a silicone case. Battery health at 91%.',
    price: 699.99,
    images: ['/images/placeholder-image.svg'],
    categoryId: 'cat-1',
    condition: 'Like New',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
    sellerId: 'user3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing2',
    title: 'Vintage Wooden Desk',
    description: 'Beautiful solid oak desk from the 1970s. Some minor signs of use but in excellent overall condition. Dimensions: 120x60x75cm.',
    price: 299.50,
    images: ['/images/placeholder-image.svg'],
    categoryId: 'cat-3',
    condition: 'Good',
    location: 'Split',
    isActive: true,
    isSold: false,
    sellerId: 'user3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing3',
    title: 'Mountain Bike - Trek Marlin 7',
    description: 'Trek Marlin 7 mountain bike, size L. Bought last year, lightly used. Perfect for beginners and intermediate riders.',
    price: 650,
    images: ['/images/placeholder-image.svg'],
    categoryId: 'cat-4',
    condition: 'Like New',
    location: 'Rijeka',
    isActive: true,
    isSold: false,
    sellerId: 'user3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET() {
  try {
    // In a real app, this would seed the database
    // Here we just return success with mock data
    
    return NextResponse.json({
      success: true,
      message: 'Dummy data loaded successfully',
      details: {
        categories: dummyCategories.length,
        users: dummyUsers.length,
        listings: dummyListings.length,
        total: dummyCategories.length + dummyUsers.length + dummyListings.length
      }
    });
  } catch (error) {
    console.error('Error generating dummy data:', error);
    return NextResponse.json(
      { error: 'Failed to generate dummy data' },
      { status: 500 }
    );
  }
} 