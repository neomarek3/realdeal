import { NextRequest, NextResponse } from 'next/server';

// Helper to check admin status
async function isAdmin(req: NextRequest) {
  // For now, we'll use a simplified check
  const adminEmail = 'neosiphonese@gmail.com';
  
  // Get the session from a cookie or header
  // This is a simplified version - in a real app, verify the token/session
  const authHeader = req.headers.get('authorization');
  const userEmail = authHeader ? authHeader.split(' ')[1] : null;
  
  return userEmail === adminEmail;
}

// Mock data for listings
const mockListings = [
  {
    id: 'listing1',
    title: 'iPhone 13 Pro',
    description: 'Like new iPhone 13 Pro',
    price: 699,
    images: ['https://example.com/iphone.jpg'],
    categoryId: 'cat1',
    category: { id: 'cat1', name: 'Electronics' },
    condition: 'Like New',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
    sellerId: 'user1',
    seller: { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing2',
    title: 'MacBook Pro 16"',
    description: 'MacBook Pro with M1 Pro chip',
    price: 1899,
    images: ['https://example.com/macbook.jpg'],
    categoryId: 'cat1',
    category: { id: 'cat1', name: 'Electronics' },
    condition: 'Excellent',
    location: 'Split',
    isActive: true,
    isSold: false,
    sellerId: 'user1',
    seller: { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    // If ID is provided, get single listing
    if (id) {
      const listing = mockListings.find(listing => listing.id === id);

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      return NextResponse.json(listing);
    }

    // Get all listings
    return NextResponse.json(mockListings);
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this would delete from the database
    // Here we just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();

    // In a real app, this would update the database
    // Here we just return the data
    const updatedListing = {
      ...mockListings.find(listing => listing.id === id),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
} 