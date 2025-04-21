import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

// A simple in-memory store for valid credentials (in a real app, this would use a database)
const validCredentials = [
  { email: 'user@example.com', password: 'password123', name: 'Test User' }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.email && body.password) {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });
      
      if (user && await bcrypt.compare(body.password, user.password)) {
        // Successful authentication
        const { password, ...userWithoutPassword } = user;
        
        return NextResponse.json(
          { 
            user: userWithoutPassword,
            authenticated: true
          },
          { status: 200 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Invalid credentials',
        authenticated: false
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        authenticated: false
      },
      { status: 500 }
    );
  }
} 