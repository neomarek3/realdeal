import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/db/prisma';

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const email = authHeader.split(' ')[1];
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  return user;
}

// PATCH - Update listing status (mark as sold)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromAuth(req);
    
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
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the listing
    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      );
    }
    
    // Update the listing status
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: { isSold }
    });
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
} 