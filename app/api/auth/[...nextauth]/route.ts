import { NextResponse } from 'next/server';

// A simple in-memory store for valid credentials (in a real app, this would use a database)
const validCredentials = [
  { email: 'user@example.com', password: 'password123', name: 'Test User' }
];

// This is a temporary placeholder until next-auth and Prisma are properly installed
export async function GET() {
  return NextResponse.json(
    { 
      message: 'NextAuth route placeholder',
      user: null,
      authenticated: false 
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.email && body.password) {
      // Check if credentials match any valid user
      const validUser = validCredentials.find(
        user => user.email === body.email && user.password === body.password
      );
      
      if (validUser) {
        // Mock successful authentication response
        return NextResponse.json(
          { 
            user: {
              id: 'mock_user_id',
              name: validUser.name,
              email: validUser.email,
              isVerified: false
            },
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
    return NextResponse.json(
      { 
        error: 'Internal server error',
        authenticated: false
      },
      { status: 500 }
    );
  }
} 