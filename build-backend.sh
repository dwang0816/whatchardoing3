#!/bin/bash

echo "🧹 Cleaning frontend files from backend deployment..."

# Remove all frontend-related files and directories
rm -rf src/
rm -rf public/
rm -rf dist/
rm -f vite.config.ts
rm -f vite-env.d.ts
rm -f tsconfig*.json
rm -f netlify.toml
rm -f index.html
rm -f tailwind.config.js
rm -f postcss.config.js
rm -rf .vite/
rm -rf node_modules/.vite/
rm -rf node_modules/.cache/

echo "📦 Setting up backend-only package.json..."
cp package.production.json package.json

echo "⬇️ Installing backend dependencies..."
npm install

echo "✅ Backend build complete!"
echo "📋 Installed packages:"
npm list --depth=0 