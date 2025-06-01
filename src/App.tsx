import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Vote, RotateCcw, Users, Clock, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from './hooks/useSocket'
import './App.css'

function App() {
  const { 
    pollData, 
    hasVoted, 
    resetTime, 
    isConnected, 
    voterCount,
    vote, 
    resetPoll 
  } = useSocket()

  const [timeUntilReset, setTimeUntilReset] = useState<string>('')

  // Update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = resetTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeUntilReset('Resetting...')
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
  }, [resetTime])

  const handleVote = (optionId: string) => {
    if (!hasVoted && isConnected) {
      vote(optionId)
    }
  }

  const handleReset = () => {
    if (isConnected) {
      resetPoll()
    }
  }

  const totalVotes = pollData.reduce((sum, option) => sum + option.votes, 0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">
            <Vote className="title-icon" />
            What Char Doing? Poll
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
            </span>
          </h1>
          <div className="reset-info">
            <Clock className="clock-icon" />
            <span>Resets in: {timeUntilReset}</span>
            <button 
              onClick={handleReset} 
              className="reset-btn" 
              title="Manual Reset"
              disabled={!isConnected}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="poll-container">
          <div className="vote-section">
            <h2>Cast Your Vote!</h2>
            {!isConnected && (
              <div className="connection-warning">
                ⚠️ Disconnected from server. Trying to reconnect...
              </div>
            )}
            <div className="vote-options">
              {pollData.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : '0'
                
                return (
                  <button
                    key={option.id}
                    className={`vote-option ${hasVoted || !isConnected ? 'disabled' : ''}`}
                    onClick={() => handleVote(option.id)}
                    disabled={hasVoted || !isConnected}
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
                ✓ Thanks for voting! Results update in real-time for everyone.
              </div>
            )}
            
            <div className="total-votes">
              <Users size={20} />
              <span>Total Votes: {totalVotes}</span>
              <span className="voter-count">({voterCount} voters)</span>
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
