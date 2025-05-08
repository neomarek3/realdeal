#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Cloudflare Pages deployment preparation...');

// Ensure the script runs from the project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

try {
  // Step 1: Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Step 2: Build Next.js app with standalone output
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  // Step 3: Copy necessary files to the standalone output
  console.log('📋 Copying configuration files to standalone output...');
  
  // Ensure public directory exists in standalone output
  if (fs.existsSync(path.join(projectRoot, 'public'))) {
    execSync('cp -r public .next/standalone/public', { stdio: 'inherit' });
  }
  
  // Copy _worker.js to standalone output
  if (fs.existsSync(path.join(projectRoot, '_worker.js'))) {
    execSync('cp _worker.js .next/standalone/', { stdio: 'inherit' });
  }
  
  console.log('✅ Deployment preparation complete!');
  console.log('');
  console.log('To deploy to Cloudflare Pages, run:');
  console.log('npx wrangler pages deploy .next/standalone');
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
} 