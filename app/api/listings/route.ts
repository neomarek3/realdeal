import { NextRequest, NextResponse } from 'next/server';

// Mock data for listings
const mockListings = [
  {
    id: 'placeholder-1',
    title: 'Vintage Typewriter',
    description: 'Beautiful vintage typewriter in working condition, perfect for collectors or decoration.',
    price: 120,
    images: ['/images/placeholder-image.svg'],
    category: { id: 'cat-1', name: 'Collectibles' },
    condition: 'Good',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'demo-user',
    seller: { id: 'demo-user', name: 'Demo User', email: 'demo@example.com', isVerified: true }
  },
  {
    id: 'placeholder-2',
    title: 'Mountain Bike',
    description: 'High-quality mountain bike with front suspension, perfect for trails and city rides.',
    price: 350,
    images: ['/images/placeholder-image.svg'],
    category: { id: 'cat-2', name: 'Sports & Leisure' },
    condition: 'Like New',
    location: 'Split',
    isActive: true,
    isSold: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'demo-user',
    seller: { id: 'demo-user', name: 'Demo User', email: 'demo@example.com', isVerified: true }
  },
  {
    id: 'placeholder-3',
    title: 'MacBook Pro 2021',
    description: 'Apple MacBook Pro with M1 chip, 16GB RAM and 512GB SSD. Perfect condition.',
    price: 1500,
    images: ['/images/placeholder-image.svg'],
    category: { id: 'cat-3', name: 'Electronics' },
    condition: 'Like New',
    location: 'Rijeka',
    isActive: true,
    isSold: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 'demo-user',
    seller: { id: 'demo-user', name: 'Demo User', email: 'demo@example.com', isVerified: true }
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get filters from query params
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const sellerId = searchParams.get('sellerId');
    const id = searchParams.get('id');
    const limit = searchParams.get('limit');

    // If looking for a specific listing by ID
    if (id) {
      const listing = mockListings.find(item => item.id === id);
      
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(listing);
    }
    
    // Filter listings based on query parameters
    let filteredListings = [...mockListings];
    
    if (category) {
      filteredListings = filteredListings.filter(
        listing => listing.category.name.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (minPrice) {
      filteredListings = filteredListings.filter(
        listing => listing.price >= parseFloat(minPrice)
      );
    }
    
    if (maxPrice) {
      filteredListings = filteredListings.filter(
        listing => listing.price <= parseFloat(maxPrice)
      );
    }
    
    if (condition) {
      filteredListings = filteredListings.filter(
        listing => listing.condition.toLowerCase() === condition.toLowerCase()
      );
    }
    
    if (sellerId) {
      filteredListings = filteredListings.filter(
        listing => listing.sellerId === sellerId
      );
    }
    
    // Apply limit if specified
    if (limit) {
      filteredListings = filteredListings.slice(0, parseInt(limit));
    }
    
    return NextResponse.json(filteredListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.price || !body.description || !body.categoryId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a mock listing with the provided data
    const mockListing = {
      id: `listing-${Date.now()}`,
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      images: body.images || ['/images/placeholder-image.svg'],
      categoryId: body.categoryId,
      category: { id: body.categoryId, name: 'Mock Category' },
      condition: body.condition || 'Good',
      location: body.location || 'Unknown',
      isActive: true,
      isSold: false,
      sellerId: body.sellerId || 'anonymous',
      seller: { 
        id: body.sellerId || 'anonymous', 
        name: 'Mock User', 
        email: 'mock@example.com', 
        isVerified: true 
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, we would save this to the database
    // For now, just return the mock listing
    return NextResponse.json(mockListing, { status: 201 });
  } catch (error) {
    console.error('Failed to create listing:', error);
    return NextResponse.json(
      { message: 'Failed to create listing' },
      { status: 500 }
    );
  }
} 