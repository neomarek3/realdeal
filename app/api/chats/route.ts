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
    title: 'iPhone 13 Pro',
    price: 699,
    images: ['/images/placeholder-image.svg'],
    sellerId: 'user2',
  },
  {
    id: 'listing2',
    title: 'MacBook Pro',
    price: 1499,
    images: ['/images/placeholder-image.svg'],
    sellerId: 'user3',
  }
];

// Mock chats data
const mockChats = [
  {
    id: 'chat1',
    listingId: 'listing1',
    buyerId: 'user1',
    sellerId: 'user2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg1',
        content: 'Is this still available?',
        senderId: 'user1',
        createdAt: new Date().toISOString(),
        isRead: true
      }
    ]
  },
  {
    id: 'chat2',
    listingId: 'listing2',
    buyerId: 'user1',
    sellerId: 'user3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg2',
        content: 'Can you lower the price?',
        senderId: 'user1',
        createdAt: new Date().toISOString(),
        isRead: false
      }
    ]
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

// GET - Fetch all chats for the current user
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find all chats where the user is either the buyer or seller
    const userChats = mockChats.filter(chat => 
      chat.buyerId === user.id || chat.sellerId === user.id
    );
    
    // Transform data for the client
    const transformedChats = userChats.map(chat => {
      const otherUserId = chat.buyerId === user.id ? chat.sellerId : chat.buyerId;
      const otherUser = mockUsers.find(u => u.id === otherUserId);
      const listing = mockListings.find(l => l.id === chat.listingId);
      const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;
      
      // Get the first image or a placeholder
      const listingImage = listing?.images && 
        Array.isArray(listing.images) && 
        listing.images.length > 0 
          ? listing.images[0] 
          : '/images/placeholder-image.svg';
      
      // Count unread messages
      const unreadCount = chat.messages?.filter(m => !m.isRead && m.senderId !== user.id).length || 0;
      
      return {
        id: chat.id,
        listingId: chat.listingId,
        listingTitle: listing?.title || 'Unknown Listing',
        listingImage,
        otherUserId: otherUser?.id || 'unknown',
        otherUserName: otherUser?.name || 'Unknown User',
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
    const user = getUserFromAuth(req);
    
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
    const listing = mockListings.find(l => l.id === listingId);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Find seller user
    const seller = mockUsers.find(u => u.id === sellerId);
    
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
    const existingChat = mockChats.find(c => 
      c.listingId === listingId && 
      c.buyerId === user.id && 
      c.sellerId === sellerId
    );
    
    if (existingChat) {
      return NextResponse.json(existingChat);
    }
    
    // Create a new chat
    const newChat = {
      id: `chat-${Date.now()}`,
      listingId,
      buyerId: user.id,
      sellerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    // In a real app, we would save this to the database
    // For mock data, we would push to our array, but since we're using a const array,
    // we'll just return the new chat
    
    return NextResponse.json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 