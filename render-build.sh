#!/bin/bash
# Render.com build script for WhatchaDoing3 Socket.IO server

echo "🔨 Starting Render.com build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Skip frontend build - we only need the backend server
echo "⚠️ Skipping frontend build (backend only deployment)"
echo "✅ Build completed successfully!"
echo "🚀 Ready to start Socket.IO server..." 