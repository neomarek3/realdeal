import { NextResponse } from 'next/server';

// Mock categories data
const mockCategories = [
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

export async function GET() {
  try {
    // Return mock categories sorted by name
    const sortedCategories = [...mockCategories].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
} 