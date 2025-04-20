import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to RealDeal</h1>
        <p className="text-xl mb-8">A trusted marketplace for buying and selling goods</p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Sign Up
          </Link>
          <Link 
            href="/login" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
