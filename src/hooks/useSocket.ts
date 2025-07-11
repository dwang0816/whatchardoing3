import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface PollData {
  id: string
  name: string
  votes: number
  color: string
}

export interface PollState {
  pollData: PollData[]
  hasVoted: boolean
  resetTime: number
}

export interface Comment {
  text: string
  timestamp: number
}

export interface SocketHook {
  pollState: PollState | null
  isConnected: boolean
  voterCount: number
  comments: Comment[]
  vote: (optionId: string) => void
  resetPoll: () => void
  addComment: (text: string) => void
}

export const useSocket = (): SocketHook => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [pollState, setPollState] = useState<PollState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [voterCount, setVoterCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    // Get server URL from environment variable or fallback
    const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 
                     (import.meta.env.PROD 
                       ? 'https://whatchardoing3.onrender.com' 
                       : 'http://localhost:3001')

    console.log('🔌 Connecting to Socket.IO server:', serverUrl)

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('pollState', (data: PollState) => {
      console.log('📊 Received poll state:', data)
      setPollState(data)
    })

    newSocket.on('pollUpdate', (data: { pollData: PollData[], voterCount: number }) => {
      console.log('🔄 Poll updated:', data)
      setPollState((prev: PollState | null) => prev ? { ...prev, pollData: data.pollData } : null)
      setVoterCount(data.voterCount)
    })

    newSocket.on('pollReset', (data: { pollData: PollData[], resetTime: number }) => {
      console.log('🔄 Poll reset:', data)
      setPollState((prev: PollState | null) => prev ? { 
        pollData: data.pollData, 
        hasVoted: false, 
        resetTime: data.resetTime 
      } : null)
      setVoterCount(0)
      // Clear comments when poll resets
      setComments([])
    })

    newSocket.on('comments', (data: Comment[]) => {
      console.log('💬 Received comments:', data)
      setComments(data)
    })

    newSocket.on('commentAdded', (comment: Comment) => {
      console.log('💬 New comment added:', comment)
      setComments((prev: Comment[]) => [...prev, comment])
    })

    newSocket.on('error', (data: { message: string }) => {
      console.error('❌ Server error:', data.message)
      alert(data.message)
    })

    // Handle reset success/error messages
    newSocket.on('resetSuccess', (data: { message: string }) => {
      console.log('✅ Reset successful:', data.message)
      alert(data.message)
    })

    newSocket.on('resetError', (data: { message: string }) => {
      console.error('❌ Reset failed:', data.message)
      alert(data.message)
    })

    setSocket(newSocket)

    return () => {
      console.log('🔌 Cleaning up socket connection')
      newSocket.disconnect()
    }
  }, [])

  const vote = (optionId: string) => {
    if (socket && isConnected) {
      console.log('🗳️ Voting for:', optionId)
      socket.emit('vote', { optionId })
    } else {
      console.error('❌ Cannot vote: not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const resetPoll = () => {
    if (socket && isConnected) {
      // Prompt for password
      const password = prompt('Enter admin password to reset the poll:')
      
      if (password === null) {
        // User cancelled
        return
      }
      
      console.log('🔄 Attempting to reset poll with password')
      socket.emit('resetPoll', { password })
    } else {
      console.error('❌ Cannot reset: not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  const addComment = (text: string) => {
    if (socket && isConnected) {
      console.log('💬 Adding comment:', text)
      socket.emit('addComment', { text })
    } else {
      console.error('❌ Cannot add comment: not connected')
      alert('Not connected to server. Please refresh the page.')
    }
  }

  return {
    pollState,
    isConnected,
    voterCount,
    comments,
    vote,
    resetPoll,
    addComment
  }
} 