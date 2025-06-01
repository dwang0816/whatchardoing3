import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface PollData {
  id: string
  name: string
  votes: number
  color: string
}

interface SocketData {
  pollData: PollData[]
  hasVoted: boolean
  resetTime: number
  voterCount?: number
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [pollData, setPollData] = useState<PollData[]>([
    { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
    { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
    { id: 'friend-choose', name: 'Char', votes: 0, color: '#ffc658' }
  ])
  const [hasVoted, setHasVoted] = useState(false)
  const [resetTime, setResetTime] = useState<Date>(new Date())
  const [isConnected, setIsConnected] = useState(false)
  const [voterCount, setVoterCount] = useState(0)

  useEffect(() => {
    // Connect to Socket.IO server
    const serverUrl = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001'
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    })

    setSocket(newSocket)

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setIsConnected(false)
    })

    // Poll state handlers
    newSocket.on('pollState', (data: SocketData) => {
      console.log('📊 Received poll state:', data)
      setPollData(data.pollData)
      setHasVoted(data.hasVoted)
      setResetTime(new Date(data.resetTime))
      if (data.voterCount !== undefined) {
        setVoterCount(data.voterCount)
      }
    })

    newSocket.on('pollUpdate', (data: SocketData) => {
      console.log('⚡ Poll updated:', data)
      setPollData(data.pollData)
      if (data.voterCount !== undefined) {
        setVoterCount(data.voterCount)
      }
    })

    newSocket.on('pollReset', (data: SocketData) => {
      console.log('🔄 Poll reset:', data)
      setPollData(data.pollData)
      setHasVoted(false)
      setResetTime(new Date(data.resetTime))
      setVoterCount(0)
    })

    newSocket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error.message)
      alert(error.message)
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [])

  // Vote function
  const vote = useCallback((optionId: string) => {
    if (socket && !hasVoted) {
      console.log('🗳️ Voting for:', optionId)
      socket.emit('vote', { optionId })
      setHasVoted(true)
    }
  }, [socket, hasVoted])

  // Reset function
  const resetPoll = useCallback(() => {
    if (socket) {
      console.log('🔄 Resetting poll')
      socket.emit('resetPoll')
    }
  }, [socket])

  return {
    pollData,
    hasVoted,
    resetTime,
    isConnected,
    voterCount,
    vote,
    resetPoll
  }
} 