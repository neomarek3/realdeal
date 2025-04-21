# RealDeal Marketplace

A trusted marketplace platform built with Next.js, Tailwind CSS, and Prisma, featuring a beautiful dark mode interface.

## Features

- **User Authentication**: Secure login, registration, and user verification
- **Multilingual Support**: English and Croatian languages
- **Dark Mode**: Beautiful dark mode implementation with smooth transitions
- **Listings Management**: Create, edit, and manage product listings
- **Messaging System**: Built-in chat for buyer-seller communication
- **Dashboard**: User dashboard for managing listings and tracking activity
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Prisma ORM
- **UI Components**: Custom components built with Radix UI primitives
- **Authentication**: Custom authentication system

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A PostgreSQL database (or configure Prisma for your preferred database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/realdeal.git
cd realdeal
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your database connection and other configuration values.

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## License

This project is licensed under the MIT License

## Acknowledgments

- UI inspired by modern marketplace platforms
- Built with love for a better commerce experience
