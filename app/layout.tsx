import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

// We'll keep Inter loaded but we'll primarily use Courier Prime from CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RealDeal | Trusted Marketplace",
  description: "A verified-first, escrow-by-default marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-screen`}
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >
        <Providers>
          <Navbar />
          <main className="pt-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
