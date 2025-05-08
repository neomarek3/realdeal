# Deploying RealDeal to Cloudflare Pages

This guide will help you deploy the RealDeal marketplace application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account
2. Node.js installed on your local machine
3. Wrangler CLI installed: `npm install -g wrangler`
4. A PostgreSQL database accessible from the internet (e.g., Supabase, Railway, etc.)

## Step 1: Configure Your Project

The project has been configured for Cloudflare Pages with:
- `output: 'standalone'` in next.config.js
- `images.unoptimized: true` for Next.js image optimization
- Cloudflare Worker configuration in _worker.js
- Wrangler configuration in wrangler.toml

## Step 2: Set Up Environment Variables

In your Cloudflare Pages dashboard:
1. Go to your project settings
2. Navigate to "Environment variables"
3. Add the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string for session encryption
   - `NEXTAUTH_URL`: Your Cloudflare Pages URL (e.g., https://your-app.pages.dev)
   - Any other environment variables your application needs

## Step 3: Build and Deploy

Run the following commands:

```bash
# Install dependencies
npm install

# Build for Cloudflare
npm run pages:build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

## Step 4: Connect Your GitHub Repository (Optional)

For automatic deployments:
1. In Cloudflare Pages dashboard, create a new project
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run pages:build`
   - Build output directory: `.next/standalone`
4. Add your environment variables
5. Deploy

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Ensure your database is accessible from Cloudflare's network
2. Consider using Prisma Data Proxy for better connection management
3. Check that your DATABASE_URL is correctly formatted
4. Verify that your database allows connections from Cloudflare IP ranges

### Build Errors

If you encounter build errors:

1. Check the build logs in Cloudflare Pages dashboard
2. Ensure all dependencies are correctly installed
3. Verify that the Prisma client is being generated correctly
4. Make sure your Next.js configuration is compatible with Cloudflare

### Runtime Errors

If your application deploys but doesn't work correctly:

1. Check browser console for JavaScript errors
2. Verify environment variables are correctly set
3. Look at Cloudflare Pages function logs
4. Test API endpoints using the browser's network inspector

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [Prisma with Cloudflare](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-cloudflare-workers) 