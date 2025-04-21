import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';

// Helper to check admin status
async function isAdmin(req: NextRequest) {
  // For now, we'll use a simplified check since NextAuth is not fully set up
  // In a production app, you would use getServerSession from next-auth
  const adminEmail = 'neosiphonese@gmail.com';
  
  // Get the session from a cookie or header
  // This is a simplified version - in a real app, verify the token/session
  const authHeader = req.headers.get('authorization');
  const userEmail = authHeader ? authHeader.split(' ')[1] : null;
  
  return userEmail === adminEmail;
}

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
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      return NextResponse.json(listing);
    }

    // Get all listings
    const listings = await prisma.listing.findMany({
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(listings);
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

    // Delete the listing
    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
} 