"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";

type AuthCheckProps = {
  children: React.ReactNode;
};

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/user",
  "/marketplace/listings/create",
];

export default function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if current route requires authentication
    const requiresAuth = PROTECTED_ROUTES.some((route) => 
      pathname?.startsWith(route)
    );

    if (requiresAuth && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [pathname, router, isAuthenticated]);

  return <>{children}</>;
} 