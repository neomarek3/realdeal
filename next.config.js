/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true,
  },
  output: 'standalone',
};

module.exports = nextConfig; 