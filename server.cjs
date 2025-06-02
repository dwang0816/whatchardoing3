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
      "https://whatchardoing3.onrender.com"
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
    "https://whatchardoing3.onrender.com"
  ],
  credentials: true
}))
app.use(express.json())

// Health check endpoint for Render.com
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatchaDoing3 Socket.IO Server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeVoters: pollState.voters.size,
    totalVotes: pollState.pollData.reduce((sum, option) => sum + option.votes, 0),
    commentsCount: pollState.comments.length
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

// API endpoint to get comments for debugging
app.get('/api/comments', (req, res) => {
  res.json({
    comments: pollState.comments,
    count: pollState.comments.length
  })
})

// API endpoint for health checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// Store current poll state in memory
let pollState = {
  pollData: [
    { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
    { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
    { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
  ],
  voters: new Set(), // Track unique voters by socket ID
  resetTime: null,
  comments: [] // Store comments/suggestions
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
    pollState.comments = [] // Clear comments on auto-reset
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

  // Send current comments to new user
  console.log(`💬 Sending ${pollState.comments.length} comments to ${socket.id}`)
  socket.emit('comments', pollState.comments)
  
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

  // Handle adding comments
  socket.on('addComment', (data) => {
    console.log(`💬 Received comment request from ${socket.id}:`, data)
    const { text } = data
    
    // Validate comment
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      socket.emit('error', { message: 'Comment cannot be empty' })
      return
    }
    
    if (text.length > 500) {
      socket.emit('error', { message: 'Comment too long (max 500 characters)' })
      return
    }
    
    // Create comment object
    const comment = {
      text: text.trim(),
      timestamp: Date.now()
    }
    
    // Add to comments array
    pollState.comments.push(comment)
    console.log(`💬 Comment stored. Total comments: ${pollState.comments.length}`)
    
    // Broadcast new comment to all clients
    io.emit('commentAdded', comment)
    console.log(`💬 Broadcasted comment to all clients`)
    
    console.log(`💬 Comment added from ${socket.id}: "${comment.text}"`)
  })
  
  // Handle manual reset (admin function) - NOW WITH PASSWORD PROTECTION
  socket.on('resetPoll', (data) => {
    const { password } = data || {}
    const correctPassword = 'charwednesday'
    
    // Log all reset attempts (for security monitoring)
    console.log(`🔐 Poll reset attempt from ${socket.id} at ${new Date().toISOString()}`)
    
    if (password !== correctPassword) {
      console.log(`❌ Invalid password attempt from ${socket.id}`)
      socket.emit('resetError', { message: 'Invalid password. Reset denied.' })
      return
    }
    
    // Password is correct - proceed with reset
    pollState.pollData = [
      { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
      { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
      { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
    ]
    pollState.voters.clear()
    pollState.comments = [] // Clear comments on manual reset
    
    // Broadcast reset to all clients
    io.emit('pollReset', {
      pollData: pollState.pollData,
      resetTime: pollState.resetTime.getTime()
    })
    
    // Confirm success to the person who reset
    socket.emit('resetSuccess', { message: 'Poll reset successfully!' })
    
    console.log(`✅ Poll manually reset by ${socket.id} with correct password`)
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
    // Note: We keep their vote even after disconnect
  })
})

// Use Render.com's PORT environment variable
const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📊 Real-time poll system active`)
  console.log(`⏰ Next reset: ${pollState.resetTime.toLocaleString()}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
}) 