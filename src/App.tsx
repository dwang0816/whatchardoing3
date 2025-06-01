import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { isThursday, isAfter } from 'date-fns'
import { Vote, RotateCcw, Users, Clock } from 'lucide-react'
import './App.css'

interface PollData {
  id: string
  name: string
  votes: number
  color: string
}

const POLL_OPTIONS: PollData[] = [
  { id: 'movie', name: 'Movie', votes: 0, color: '#8884d8' },
  { id: 'game', name: 'Game', votes: 0, color: '#82ca9d' },
  { id: 'friend-choose', name: 'Let Char choose', votes: 0, color: '#ffc658' }
]

// Function to get next Thursday midnight EST
const getNextThursdayMidnightEST = (): Date => {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
  
  // Find next Thursday
  let nextThursday = new Date(easternTime)
  while (!isThursday(nextThursday) || !isAfter(nextThursday, easternTime)) {
    nextThursday.setDate(nextThursday.getDate() + 1)
  }
  
  // Set to midnight
  nextThursday.setHours(0, 0, 0, 0)
  
  return nextThursday
}

function App() {
  const [pollData, setPollData] = useState<PollData[]>(() => {
    const saved = localStorage.getItem('pollData')
    return saved ? JSON.parse(saved) : POLL_OPTIONS
  })
  
  const [hasVoted, setHasVoted] = useState(() => {
    return localStorage.getItem('hasVoted') === 'true'
  })
  
  const [nextReset, setNextReset] = useState<Date>(getNextThursdayMidnightEST())
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = nextReset.getTime() - now.getTime()
      
      if (diff <= 0) {
        // Reset the poll
        setPollData(POLL_OPTIONS)
        setHasVoted(false)
        localStorage.removeItem('hasVoted')
        localStorage.removeItem('pollData')
        setNextReset(getNextThursdayMidnightEST())
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilReset(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [nextReset])
  
  // Save poll data to localStorage
  useEffect(() => {
    localStorage.setItem('pollData', JSON.stringify(pollData))
  }, [pollData])

  const handleVote = (optionId: string) => {
    if (hasVoted) return
    
    setPollData(prev => 
      prev.map(option => 
        option.id === optionId 
          ? { ...option, votes: option.votes + 1 }
          : option
      )
    )
    
    setHasVoted(true)
    localStorage.setItem('hasVoted', 'true')
  }

  const totalVotes = pollData.reduce((sum, option) => sum + option.votes, 0)

  const resetPoll = () => {
    setPollData(POLL_OPTIONS)
    setHasVoted(false)
    localStorage.removeItem('hasVoted')
    localStorage.removeItem('pollData')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <Vote className="title-icon" />
            What Char Doing? Poll
          </h1>
          <div className="reset-info">
            <Clock className="clock-icon" />
            <span>Resets in: {timeUntilReset}</span>
            <button onClick={resetPoll} className="reset-btn" title="Manual Reset">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="poll-container">
          <div className="vote-section">
            <h2>Cast Your Vote!</h2>
            <div className="vote-options">
              {pollData.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : '0'
                
                return (
                  <button
                    key={option.id}
                    className={`vote-option ${hasVoted ? 'disabled' : ''}`}
                    onClick={() => handleVote(option.id)}
                    disabled={hasVoted}
                    style={{ '--option-color': option.color } as React.CSSProperties}
                  >
                    <span className="option-name">{option.name}</span>
                    <div className="vote-stats">
                      <span className="vote-count">{option.votes} votes</span>
                      <span className="vote-percentage">{percentage}%</span>
                    </div>
                    <div 
                      className="vote-bar" 
                      style={{ width: `${percentage}%` }}
                    />
                  </button>
                )
              })}
            </div>
            
            {hasVoted && (
              <div className="voted-message">
                ✓ Thanks for voting! Results update in real-time.
              </div>
            )}
            
            <div className="total-votes">
              <Users size={20} />
              <span>Total Votes: {totalVotes}</span>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h3>Results - Pie Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pollData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => 
                      value > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {pollData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Results - Bar Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" fill="#8884d8">
                    {pollData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
