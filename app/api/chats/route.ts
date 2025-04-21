import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db/prisma';

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

// GET - Fetch all chats for the current user
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find all chats where the user is either the buyer or seller
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Transform data for the client
    const transformedChats = chats.map(chat => {
      const otherUser = chat.buyerId === user.id ? chat.seller : chat.buyer;
      const lastMessage = chat.messages[0];
      
      // Get the first image or a placeholder
      const listingImage = chat.listing.images && 
        Array.isArray(chat.listing.images) && 
        chat.listing.images.length > 0 
          ? chat.listing.images[0] 
          : null;
      
      // Count unread messages
      const unreadCount = 0; // This would normally be calculated from the database
      
      return {
        id: chat.id,
        listingId: chat.listingId,
        listingTitle: chat.listing.title,
        listingImage,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
        lastMessageTime: lastMessage ? lastMessage.createdAt : chat.createdAt,
        unreadCount
      };
    });
    
    return NextResponse.json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { listingId, sellerId } = data;
    
    if (!listingId || !sellerId) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, sellerId' },
        { status: 400 }
      );
    }
    
    // Check if the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Find seller user
    const seller = await prisma.user.findUnique({
      where: { id: sellerId }
    });
    
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }
    
    // Prevent users from messaging their own listings
    if (user.id === sellerId) {
      return NextResponse.json(
        { error: 'You cannot message your own listing' },
        { status: 400 }
      );
    }
    
    // Check if a chat already exists for this listing and these users
    const existingChat = await prisma.chat.findFirst({
      where: {
        listingId,
        buyerId: user.id,
        sellerId
      }
    });
    
    if (existingChat) {
      return NextResponse.json(existingChat);
    }
    
    // Create a new chat
    const newChat = await prisma.chat.create({
      data: {
        listingId,
        buyerId: user.id,
        sellerId
      }
    });
    
    return NextResponse.json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 