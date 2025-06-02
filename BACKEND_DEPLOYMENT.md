# Backend-Only Deployment

## Changes Made

1. **Main package.json is now backend-only** - Contains only Express, Socket.io, and CORS dependencies
2. **Frontend package.json saved separately** - Available as `package.frontend.json` for development
3. **Simplified Render deployment** - Uses basic `npm install --production` without complex build scripts
4. **Removed complex build scripts** - No more bash scripts or cleanup processes needed

## How to Use

### For Backend Development (Current State)
```bash
npm run dev          # Starts backend server
npm start           # Production start
```

### For Frontend Development
```bash
npm run frontend:dev    # Switches to frontend package.json and starts Vite dev server
npm run frontend:build  # Switches to frontend package.json and builds for production
```

### For Deployment
- **Backend (Render)**: Will automatically use the backend-only package.json
- **Frontend (Netlify)**: Use `package.frontend.json` by copying it to `package.json` in the build process

## Why This Approach

- **Eliminates Vite detection issues** - Render sees only backend dependencies
- **Cleaner separation** - Backend and frontend concerns are completely separated
- **Simpler deployment** - No complex build scripts or cleanup needed
- **Faster builds** - Backend deployment only installs necessary dependencies 