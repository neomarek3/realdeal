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

// POST - Mark messages as read in a chat
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatId = params.id;
    
    // Find the chat to ensure the user has access
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
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
    
    // Update all unread messages sent by the other user
    const result = await prisma.message.updateMany({
      where: {
        chatId,
        senderId: {
          not: user.id // Only mark messages from the other user as read
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    return NextResponse.json({
      success: true,
      messagesMarkedAsRead: result.count
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
} 