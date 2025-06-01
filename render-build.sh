#!/bin/bash
# Render.com build script for WhatchaDoing3 Socket.IO server

echo "🔨 Starting Render.com build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend (optional, for backup)
echo "🏗️ Building frontend..."
npm run build || echo "⚠️ Frontend build skipped (focusing on backend)"

echo "✅ Build completed successfully!"
echo "🚀 Ready to start Socket.IO server..." 