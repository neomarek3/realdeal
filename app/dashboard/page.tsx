"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {session?.user && !session.user.isVerified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
          <h2 className="font-medium">Your account is not verified</h2>
          <p className="text-sm mt-1">Verify your account to start selling items</p>
          <Link 
            href="/auth/verification"
            className="mt-2 inline-block bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded"
          >
            Verify Now
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/marketplace/listings/create"
                className="text-blue-600 hover:text-blue-800"
              >
                Create New Listing
              </Link>
            </li>
            <li>
              <Link 
                href="/user/messages"
                className="text-blue-600 hover:text-blue-800"
              >
                View Messages
              </Link>
            </li>
            <li>
              <Link 
                href="/user/profile"
                className="text-blue-600 hover:text-blue-800"
              >
                Edit Profile
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Your Listings</h2>
          <p className="text-gray-500 text-sm">You haven't created any listings yet.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-sm">No recent activity.</p>
        </div>
      </div>
    </div>
  );
} 