import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUsers = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    name: 'John Doe',
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
  },
  {
    id: 'user3',
    email: 'demo@example.com',
    name: 'Demo User',
  }
];

// Mock listings data
const mockListings = [
  {
    id: 'listing1',
    title: 'iPhone 12 Pro',
    sellerId: 'user3',
    isSold: false
  },
  {
    id: 'listing2',
    title: 'Wooden Desk',
    sellerId: 'user3',
    isSold: false
  }
];

// Helper function to get user from authorization header
function getUserFromAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const email = authHeader.split(' ')[1];
  
  // Find user by email
  return mockUsers.find(user => user.email === email);
}

// PATCH - Update listing status (mark as sold)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const listingId = params.id;
    
    // Get status data from request body
    const data = await req.json();
    const { isSold } = data;
    
    if (typeof isSold !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Find the listing
    const listingIndex = mockListings.findIndex(listing => listing.id === listingId);
    
    if (listingIndex === -1) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    const listing = mockListings[listingIndex];
    
    // Check if the user is the owner of the listing
    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      );
    }
    
    // Update the listing status
    mockListings[listingIndex] = {
      ...listing,
      isSold
    };
    
    return NextResponse.json(mockListings[listingIndex]);
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
} 