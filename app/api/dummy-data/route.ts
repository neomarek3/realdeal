import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// Dummy categories data
const dummyCategories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing & Fashion' },
  { id: '3', name: 'Home & Garden' },
  { id: '4', name: 'Sports & Leisure' },
  { id: '5', name: 'Vehicles' },
  { id: '6', name: 'Real Estate' },
  { id: '7', name: 'Jobs' },
  { id: '8', name: 'Services' },
  { id: '9', name: 'Other' }
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
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'user2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    password: 'hashed_password',
    phone: '+385 95 876 5432',
    isVerified: true,
    verificationLevel: 'FULL',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-02-20'),
  },
  {
    id: 'user3',
    email: 'mark.johnson@example.com',
    name: 'Mark Johnson',
    password: 'hashed_password',
    phone: '+385 99 111 2222',
    isVerified: true,
    verificationLevel: 'NONE',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
  }
];

// Dummy listings data
const dummyListings = [
  {
    title: 'iPhone 12 Pro - Mint Condition',
    description: 'Selling my iPhone 12 Pro 128GB in excellent condition. Comes with original box, charger, and a silicone case. Battery health at 91%.',
    price: 699.99,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Electronics',
    condition: 'Like New',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
  },
  {
    title: 'Vintage Wooden Desk',
    description: 'Beautiful solid oak desk from the 1970s. Some minor signs of use but in excellent overall condition. Dimensions: 120x60x75cm.',
    price: 299.50,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Furniture',
    condition: 'Good',
    location: 'Split',
    isActive: true,
    isSold: false,
  },
  {
    title: 'Mountain Bike - Trek Marlin 7',
    description: 'Trek Marlin 7 mountain bike, size L. Bought last year, lightly used. Perfect for beginners and intermediate riders.',
    price: 650,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Sports & Leisure',
    condition: 'Like New',
    location: 'Rijeka',
    isActive: true,
    isSold: false,
  },
  {
    title: 'Designer Leather Jacket',
    description: 'Genuine leather jacket by Croatian designer. Size M, only worn a few times. Perfect for autumn weather.',
    price: 180,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Clothing & Fashion',
    condition: 'Like New',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
  },
  {
    title: 'Professional Camera Kit - Canon EOS R6',
    description: 'Complete Canon EOS R6 kit including body, 24-105mm lens, extra battery, bag, and more. Perfect for professional photography.',
    price: 2800,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Electronics',
    condition: 'Good',
    location: 'Osijek',
    isActive: true,
    isSold: false,
  },
  {
    title: 'Apartment for Rent - City Center',
    description: 'Modern 2-bedroom apartment in the heart of Zagreb. Fully furnished, pets allowed. Available from next month.',
    price: 750,
    images: ['/images/placeholder-image.svg'],
    categoryName: 'Real Estate',
    condition: 'New',
    location: 'Zagreb',
    isActive: true,
    isSold: false,
  }
];

// Categories to ensure exist
const essentialCategories = [
  { name: 'Electronics' },
  { name: 'Furniture' },
  { name: 'Clothing & Fashion' },
  { name: 'Sports & Leisure' },
  { name: 'Vehicles' },
  { name: 'Real Estate' },
  { name: 'Jobs' },
  { name: 'Services' },
  { name: 'Other' }
];

export async function GET() {
  try {
    // Check if we need to seed data
    const listingsCount = await prisma.listing.count();
    const categoriesCount = await prisma.category.count();
    
    // Create a demo user if none exists
    let demoUser = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    });
    
    if (!demoUser) {
      // Create demo user
      demoUser = await prisma.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'demo_password_hash', // In a real app, this would be hashed
          isVerified: true
        }
      });
    }
    
    // Seed categories if needed
    if (categoriesCount === 0) {
      await prisma.category.createMany({
        data: essentialCategories
      });
    }
    
    // Get created categories
    const categories = await prisma.category.findMany();
    
    // Seed listings if needed
    let createdListings = [];
    if (listingsCount === 0 && demoUser) {
      // Create dummy listings
      const dummyData = [
        {
          title: 'iPhone 12 Pro - Mint Condition',
          description: 'Selling my iPhone 12 Pro 128GB in excellent condition. Comes with original box, charger, and a silicone case. Battery health at 91%.',
          price: 699.99,
          images: ['/images/placeholder-image.svg'],
          categoryName: 'Electronics',
          condition: 'Like New',
          location: 'Zagreb',
          isActive: true,
          isSold: false,
        },
        {
          title: 'Vintage Wooden Desk',
          description: 'Beautiful solid oak desk from the 1970s. Some minor signs of use but in excellent overall condition. Dimensions: 120x60x75cm.',
          price: 299.50,
          images: ['/images/placeholder-image.svg'],
          categoryName: 'Furniture',
          condition: 'Good',
          location: 'Split',
          isActive: true,
          isSold: false,
        },
        {
          title: 'Mountain Bike - Trek Marlin 7',
          description: 'Trek Marlin 7 mountain bike, size L. Bought last year, lightly used. Perfect for beginners and intermediate riders.',
          price: 650,
          images: ['/images/placeholder-image.svg'],
          categoryName: 'Sports & Leisure',
          condition: 'Like New',
          location: 'Rijeka',
          isActive: true,
          isSold: false,
        },
      ];
      
      // Create each listing
      for (const item of dummyData) {
        // Find category
        const categoryRecord = categories.find(c => c.name === item.categoryName);
        if (!categoryRecord) continue;
        
        try {
          // Create listing
          const listing = await prisma.listing.create({
            data: {
              title: item.title,
              description: item.description,
              price: item.price,
              images: item.images,
              condition: item.condition,
              location: item.location,
              isActive: item.isActive,
              isSold: item.isSold,
              sellerId: demoUser.id,
              categoryId: categoryRecord.id,
            }
          });
          
          createdListings.push(listing);
        } catch (e) {
          console.error(`Failed to create listing ${item.title}:`, e);
        }
      }
    }
    
    return NextResponse.json({
      message: 'Seeding completed successfully',
      demoUser: demoUser ? { id: demoUser.id, email: demoUser.email } : null,
      categoriesCreated: categoriesCount === 0,
      listingsCreated: createdListings.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
} 