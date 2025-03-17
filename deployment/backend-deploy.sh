#!/bin/bash
# Backend deployment script for Calendar Bridge

echo "========================================"
echo "Calendar Bridge Backend Deployment"
echo "========================================"

# Navigate to backend directory from the deployment directory
cd ../calendar-bridge-backend

# Install dependencies
echo "Installing dependencies..."
npm install

# Create Render deployment configuration
echo "Creating Render deployment configuration..."
cat > render.yaml << EOL
services:
  - type: web
    name: calendar-bridge-api
    env: node
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: PORT
        value: 8080
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: CLIENT_URL
        value: https://your-frontend-url.vercel.app
EOL

echo "========================================"
echo "Deployment Instructions:"
echo "========================================"
echo "To deploy to Render:"
echo "1. Create a Render account at https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect to your GitHub repository"
echo "4. Configure the following environment variables:"
echo "   PORT=8080"
echo "   NODE_ENV=production"
echo "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calendar-bridge"
echo "   JWT_SECRET=[generate a secure random string]"
echo "   GOOGLE_CLIENT_ID=[your Google OAuth client ID]"
echo "   GOOGLE_CLIENT_SECRET=[your Google OAuth client secret]"
echo "   CLIENT_URL=https://your-frontend-url.vercel.app"
echo "========================================"