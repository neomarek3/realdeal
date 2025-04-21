import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Function to seed initial categories if none exist
async function seedCategories() {
  const count = await prisma.category.count();
  
  if (count === 0) {
    const categories = [
      { name: 'Electronics' },
      { name: 'Clothing & Fashion' },
      { name: 'Home & Garden' },
      { name: 'Sports & Leisure' },
      { name: 'Vehicles' },
      { name: 'Real Estate' },
      { name: 'Jobs' },
      { name: 'Services' },
      { name: 'Other' }
    ];
    
    await prisma.category.createMany({
      data: categories
    });
  }
}

export async function GET() {
  try {
    // Ensure we have categories
    await seedCategories();
    
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
} 