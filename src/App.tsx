import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useSocket } from './hooks/useSocket'
import { Clock, Users, Wifi, WifiOff } from 'lucide-react'

function App() {
  const { pollState, isConnected, voterCount, vote, resetPoll } = useSocket()

  const formatTimeUntilReset = (resetTime: number) => {
    const now = Date.now()
    const timeDiff = resetTime - now
    
    if (timeDiff <= 0) return 'Resetting...'
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${days}d ${hours}h ${minutes}m`
  }

  const totalVotes = pollState?.pollData.reduce((sum, option) => sum + option.votes, 0) || 0

  // Prepare pie chart data with better handling for zero votes
  const pieChartData = pollState?.pollData.map(option => ({
    ...option,
    percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
  })) || []

  // Custom label formatter for pie chart
  const renderCustomLabel = ({ name, votes, percentage }: { name: string, votes: number, percentage: number }) => {
    if (votes === 0 && totalVotes === 0) return `${name}`
    if (votes === 0) return ''
    return `${name}: ${votes} (${percentage}%)`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            What Char Doing? 🎮
          </h1>
          <p className="text-lg text-purple-200 mb-6">
            Vote for what we should do this week! Resets every Thursday at midnight EST.
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Users size={16} />
              <span className="text-sm font-medium">{voterCount} voters</span>
            </div>
            
            {pollState && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  Resets in {formatTimeUntilReset(pollState.resetTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {!pollState ? (
          <div className="text-center text-purple-300 text-xl">
            <div className="animate-pulse">Loading poll data...</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Voting Section */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Cast Your Vote</h2>
              <div className="space-y-4">
                {pollState.pollData.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => vote(option.id)}
                    disabled={pollState.hasVoted || !isConnected}
                    className={`w-full p-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      pollState.hasVoted || !isConnected
                        ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {option.name} {pollState.hasVoted && `(${option.votes} votes)`}
                  </button>
                ))}
              </div>
              
              {pollState.hasVoted && (
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-center">
                  <p className="text-green-300 font-medium">✅ Thank you for voting!</p>
                  <p className="text-green-200 text-sm mt-1">Total votes: {totalVotes}</p>
                </div>
              )}
              
              {!isConnected && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
                  <p className="text-red-300 font-medium">❌ Connection lost</p>
                  <p className="text-red-200 text-sm mt-1">Please refresh the page</p>
                </div>
              )}
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Vote Distribution</h3>
                {totalVotes === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center text-purple-200">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-lg font-medium">No votes yet!</p>
                      <p className="text-sm opacity-75">Be the first to cast your vote</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={20}
                        dataKey="votes"
                        label={renderCustomLabel}
                        labelLine={false}
                        fontSize={12}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value} votes (${Math.round((value / totalVotes) * 100)}%)`,
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ color: 'white', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Bar Chart */}
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Vote Count</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pollState.pollData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'white', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'white', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {pollState.pollData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Admin Reset Button */}
        <div className="text-center mt-8">
          <button
            onClick={resetPoll}
            disabled={!isConnected}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔄 Reset Poll (Admin)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
