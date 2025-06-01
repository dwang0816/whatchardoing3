# 🗳️ What Char Doing? Poll - Real-Time Edition

A beautiful, **real-time** polling application built with React, TypeScript, Socket.IO, and modern web technologies. When one friend votes, **everyone sees the update instantly**!

![Poll Application Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=What+Char+Doing%3F+Real-Time+Poll)

## ✨ Features

### 🎯 **Real-Time Interactive Voting**
- **Instant Updates**: When anyone votes, all connected users see results immediately
- **Three Options**: Movie, Game, or Char (let Char decide)
- **Socket.IO Powered**: True real-time communication between all participants
- **Connection Status**: Live indicator showing server connection status
- **Unique Voting**: One vote per connected session, tracked server-side

### 📊 **Live Data Visualization**
- **Real-Time Charts**: Pie and bar charts update instantly across all devices
- **Live Vote Counts**: See total votes and active voter count in real-time
- **Smooth Animations**: Beautiful transitions when votes are cast
- **Dynamic Colors**: Each option has its own distinctive color scheme

### ⏰ **Automatic Reset System**
- **Server-Side Reset**: Centralized Thursday midnight EST reset for all users
- **Live Countdown**: Real-time timer synced across all connected clients
- **Automatic Sync**: All users see reset happen simultaneously
- **Manual Admin Reset**: Server-controlled reset button

### 🌐 **Multi-User Real-Time Features**
- **Live User Count**: See how many people are currently voting
- **Instant Synchronization**: Vote results appear immediately on all screens
- **Connection Recovery**: Automatic reconnection if network drops
- **Cross-Device Sync**: Vote on phone, see results on laptop instantly

### 🎨 **Modern UI/UX**
- **Connection Indicators**: Visual status showing server connection health
- **Glassmorphism Design**: Beautiful gradient backgrounds with blur effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Real-Time Animations**: Charts and UI update smoothly with live data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatchardoing3.git
   cd whatchardoing3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the real-time server**
   ```bash
   npm run server
   ```

4. **In a new terminal, start the frontend**
   ```bash
   npm run dev
   ```

5. **Open multiple browser tabs/windows**
   ```
   http://localhost:5173
   ```

6. **Test real-time voting**
   - Vote in one tab, watch other tabs update instantly!

### Production Deployment

#### Option 1: Full-Stack Deployment (Recommended)
Deploy both the Socket.IO server and React app together:

```bash
# Build the frontend
npm run build

# Start the production server (serves both API and static files)
npm start
```

#### Option 2: Separate Deployments
- **Frontend**: Deploy to Vercel/Netlify (static hosting)
- **Backend**: Deploy Socket.IO server to Railway/Render/Heroku

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript
- **Socket.IO Client** for real-time communication
- **Recharts** for live data visualization
- **Lucide React** for modern icons
- **Vite** for blazing-fast development

### Backend
- **Node.js** + Express server
- **Socket.IO** for WebSocket communication
- **CORS** enabled for cross-origin requests
- **Real-time state management** in memory

## 📱 How Real-Time Works

1. **Connect**: Open the app and connect to the Socket.IO server
2. **Vote**: Click any option - your vote broadcasts to all users instantly
3. **Watch**: See real-time updates as friends vote from their devices
4. **Sync**: Charts, counters, and percentages update live for everyone
5. **Reset**: Thursday midnight EST reset happens simultaneously for all users

## 🔧 Socket.IO Events

### Client → Server
- `vote` - Cast a vote for an option
- `resetPoll` - Manually reset the poll (admin)

### Server → Client  
- `pollState` - Initial poll data when connecting
- `pollUpdate` - Real-time vote updates
- `pollReset` - Poll reset notification
- `error` - Error messages (e.g., already voted)

## 🔒 Real-Time Voting System

- **Server-Side Tracking**: Unique voters tracked by Socket.IO session ID
- **Memory-Based State**: Poll data stored in server memory for real-time access
- **One Vote Per Session**: Each Socket.IO connection can vote once
- **Live Validation**: Server prevents duplicate voting in real-time
- **Connection Recovery**: Voting state persists through brief disconnections

## 📂 Project Structure

```
├── server.js              # Socket.IO server with real-time logic
├── src/
│   ├── App.tsx            # Main React component with Socket.IO integration
│   ├── hooks/
│   │   └── useSocket.ts   # Custom hook for Socket.IO connection
│   ├── App.css           # Real-time UI styling
│   └── main.tsx          # React entry point
└── package.json          # Dependencies including Socket.IO
```

## 🎨 Customization

### Adding New Poll Options

Update both server and client poll options:

**Server** (`server.js`):
```javascript
pollData: [
  { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
  { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
  { id: 'custom', name: 'Your Option', votes: 0, color: '#ff7c7c' }
]
```

**Client** (`useSocket.ts`):
```typescript
const [pollData, setPollData] = useState<PollData[]>([
  { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
  { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
  { id: 'custom', name: 'Your Option', votes: 0, color: '#ff7c7c' }
])
```

### Environment Configuration

Create `.env` file for custom server URLs:
```bash
VITE_SOCKET_SERVER_URL=wss://your-server.com
```

## 📜 Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start Socket.IO backend server  
npm run dev:full     # Start Socket.IO server (alias)
npm start           # Start production server
npm run build       # Build frontend for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🚀 Deployment Options

### Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set `PORT` environment variable (optional - defaults to 3001)
3. Railway will auto-detect and deploy the Node.js server

### Heroku
```bash
# Add Heroku remote
heroku create your-poll-app

# Deploy
git push heroku main
```

### Render
1. Connect GitHub repo to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-realtime-feature`)
3. Test with multiple browser tabs for real-time functionality
4. Commit your changes (`git commit -m 'Add amazing real-time feature'`)
5. Push to the branch (`git push origin feature/amazing-realtime-feature`)
6. Open a Pull Request

## 🧪 Testing Real-Time Features

1. **Open multiple browser tabs** to the same poll URL
2. **Vote in one tab** and watch others update instantly
3. **Test connection recovery** by briefly disconnecting WiFi
4. **Try mobile + desktop** simultaneously
5. **Test manual reset** to see synchronized clearing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO** for real-time WebSocket communication
- **React** + **Vite** for modern frontend development
- **Recharts** for beautiful, live-updating charts
- **Lucide** for clean, modern icons
- Real-time architecture inspired by modern collaborative tools

---

<div align="center">
  
**🎉 Now your friends can vote together in real-time! 🎉**

Made with ❤️ and ⚡ for instant collaboration

</div>
