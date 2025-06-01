const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')

const app = express()
const server = http.createServer(app)

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000", 
      "https://whatchardoing3.netlify.app",
      "https://whatchardoing3-backend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Enable CORS for Express
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://whatchardoing3.netlify.app",
    "https://whatchardoing3-backend.onrender.com"
  ],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatchaDoing3 Socket.IO Server',
    timestamp: new Date().toISOString()
  })
})

// API endpoint to get current poll state
app.get('/api/poll', (req, res) => {
  res.json({
    pollData: pollState.pollData,
    voterCount: pollState.voters.size,
    resetTime: pollState.resetTime.getTime()
  })
})

// Store current poll state in memory
let pollState = {
  pollData: [
    { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
    { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
    { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
  ],
  voters: new Set(), // Track unique voters by socket ID
  resetTime: null
}

// Function to get next Thursday midnight EST
const getNextThursdayMidnightEST = () => {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  
  let nextThursday = new Date(easternTime)
  const isThursday = (date) => date.getDay() === 4
  const isAfter = (date1, date2) => date1.getTime() > date2.getTime()
  
  while (!isThursday(nextThursday) || !isAfter(nextThursday, easternTime)) {
    nextThursday.setDate(nextThursday.getDate() + 1)
  }
  
  nextThursday.setHours(0, 0, 0, 0)
  return nextThursday
}

// Initialize reset time
pollState.resetTime = getNextThursdayMidnightEST()

// Auto-reset poll every Thursday
const checkAndResetPoll = () => {
  const now = new Date()
  if (now >= pollState.resetTime) {
    pollState.pollData = [
      { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
      { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
      { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
    ]
    pollState.voters.clear()
    pollState.resetTime = getNextThursdayMidnightEST()
    
    // Broadcast reset to all clients
    io.emit('pollReset', {
      pollData: pollState.pollData,
      resetTime: pollState.resetTime.getTime()
    })
    
    console.log('Poll automatically reset - new week!')
  }
}

// Check for reset every minute
setInterval(checkAndResetPoll, 60000)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)
  
  // Send current poll state to new user
  socket.emit('pollState', {
    pollData: pollState.pollData,
    hasVoted: pollState.voters.has(socket.id),
    resetTime: pollState.resetTime.getTime()
  })
  
  // Handle voting
  socket.on('vote', (data) => {
    const { optionId } = data
    
    // Check if user already voted
    if (pollState.voters.has(socket.id)) {
      socket.emit('error', { message: 'You have already voted!' })
      return
    }
    
    // Find and update the option
    const option = pollState.pollData.find(opt => opt.id === optionId)
    if (option) {
      option.votes += 1
      pollState.voters.add(socket.id)
      
      // Broadcast updated poll data to all clients
      io.emit('pollUpdate', {
        pollData: pollState.pollData,
        voterCount: pollState.voters.size
      })
      
      console.log(`Vote received for ${option.name} from ${socket.id}`)
    }
  })
  
  // Handle manual reset (admin function)
  socket.on('resetPoll', () => {
    pollState.pollData = [
      { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
      { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
      { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
    ]
    pollState.voters.clear()
    
    // Broadcast reset to all clients
    io.emit('pollReset', {
      pollData: pollState.pollData,
      resetTime: pollState.resetTime.getTime()
    })
    
    console.log(`Poll manually reset by ${socket.id}`)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    // Note: We keep their vote even after disconnect
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📊 Real-time poll system active`)
  console.log(`⏰ Next reset: ${pollState.resetTime.toLocaleString()}`)
}) 