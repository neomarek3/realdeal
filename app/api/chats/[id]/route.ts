import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db/prisma';

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

// GET - Fetch a specific chat by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatId = params.id;
    
    // Find the chat with listing and user details
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
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
            name: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Ensure the user is either the buyer or seller
    if (chat.buyerId !== user.id && chat.sellerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this conversation' },
        { status: 403 }
      );
    }
    
    // Format chat data
    const formattedChat = {
      id: chat.id,
      listingId: chat.listing.id,
      listingTitle: chat.listing.title,
      listingImage: Array.isArray(chat.listing.images) && chat.listing.images.length > 0 
        ? chat.listing.images[0] 
        : null,
      listingPrice: chat.listing.price,
      sellerId: chat.sellerId,
      sellerName: chat.seller.name,
      buyerId: chat.buyerId,
      buyerName: chat.buyer.name,
      createdAt: chat.createdAt
    };
    
    return NextResponse.json(formattedChat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat details' },
      { status: 500 }
    );
  }
} 