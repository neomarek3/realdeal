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

// GET - Fetch messages for a specific chat
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
    
    // Get the "after" timestamp query parameter if it exists
    const url = new URL(req.url);
    const afterParam = url.searchParams.get('after');
    
    // Create the query conditions
    let whereCondition: any = { chatId };
    
    if (afterParam) {
      whereCondition.createdAt = {
        gt: new Date(afterParam)
      };
    }
    
    // Fetch messages
    const messages = await prisma.message.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Format messages
    const formattedMessages = messages.map(message => ({
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      senderName: message.sender.name,
      content: message.content,
      timestamp: message.createdAt,
      isRead: message.isRead
    }));
    
    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message in a chat
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
    
    // Get message content from request body
    const { content } = await req.json();
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Create a new message
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        senderId: user.id,
        content: content.trim(),
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Update the chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });
    
    // Format the message
    const formattedMessage = {
      id: newMessage.id,
      chatId: newMessage.chatId,
      senderId: newMessage.senderId,
      senderName: newMessage.sender.name,
      content: newMessage.content,
      timestamp: newMessage.createdAt,
      isRead: newMessage.isRead
    };
    
    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 