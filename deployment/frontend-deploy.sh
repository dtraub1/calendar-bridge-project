#!/bin/bash
# Frontend deployment script for Calendar Bridge

echo "========================================"
echo "Calendar Bridge Frontend Deployment"
echo "========================================"

# Navigate to frontend directory from the deployment directory
cd ../calendar-bridge-frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

echo "========================================"
echo "Deployment Instructions:"
echo "========================================"
echo "To deploy to Vercel:"
echo "1. Install Vercel CLI: npm install -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"
echo ""
echo "Alternative: Use Vercel GitHub integration"
echo "1. Push code to GitHub"
echo "2. Connect repository in Vercel dashboard"
echo "3. Configure environment variables in Vercel dashboard:"
echo "   REACT_APP_API_URL=https://your-backend-url.onrender.com"
echo "========================================"