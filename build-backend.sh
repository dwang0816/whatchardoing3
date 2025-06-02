#!/bin/bash

echo "🔍 Initial directory contents:"
ls -la

echo "🧹 Aggressively cleaning ALL frontend files..."

# Remove all frontend-related files and directories with force
rm -rf src/
rm -rf public/
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/
rm -rf node_modules/.cache/
rm -f vite.config.ts
rm -f vite.config.js
rm -f vite-env.d.ts
rm -f tsconfig*.json
rm -f netlify.toml
rm -f index.html
rm -f tailwind.config.js
rm -f postcss.config.js

# Also remove any hidden vite files
find . -name "*vite*" -type f -delete 2>/dev/null || true
find . -name "*.vite*" -type f -delete 2>/dev/null || true

echo "🔍 Directory contents after cleanup:"
ls -la

echo "📦 Setting up backend-only package.json..."
cp package.production.json package.json

echo "🔍 Final package.json contents:"
cat package.json

echo "⬇️ Installing backend dependencies..."
npm install --production --no-optional

echo "✅ Backend build complete!"
echo "📋 Installed packages:"
npm list --depth=0

echo "🔍 Final directory structure:"
find . -maxdepth 2 -type f | head -20 