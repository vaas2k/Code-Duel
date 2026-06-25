'use client';
import React, { useEffect, useState } from 'react'
import { Search, ChevronUp, ChevronDown, Minus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import axios, { AxiosError } from 'axios';
import { useUserState } from '@/store/useUser';
import toast, {Toaster} from 'react-hot-toast';

interface Ranking {
    rank: number,
    username: string,
    title: string,
    rating: number,
    wins: number,
    losses: number,
    winRate: number,
    draws: number,
    total: number,
    change?: string,
    color: string
}

const Ranking = () => {
  const filters = [
    { name: 'Rankings', active: true },
    // { name: 'Season', active: false },
    // { name: 'This Week', active: false }
  ]

  const [players, setPlayers] = useState<Ranking[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Ranking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const user = useUserState((state) => state.user);

  // Determine title based on rating
  const getTitle = (rating: number) => {
    if (rating >= 2500) return 'Grandmaster';
    if (rating >= 2200) return 'Master';
    if (rating >= 1900) return 'Diamond';
    if (rating >= 1600) return 'Platinum';
    if (rating >= 1300) return 'Gold';
    if (rating >= 1000) return 'Silver';
    return 'Bronze';
  };

  // Determine color based on rating
  const getColor = (rating: number) => {
    if (rating >= 2500) return 'bg-red-500';
    if (rating >= 2200) return 'bg-purple-500';
    if (rating >= 1900) return 'bg-cyan-500';
    if (rating >= 1600) return 'bg-blue-500';
    if (rating >= 1300) return 'bg-green-500';
    if (rating >= 1000) return 'bg-gray-400';
    return 'bg-yellow-700';
  };

  // Format player data
  const formatPlayers = (data: any[]) => {
    const sorted = [...data]
      .sort((a, b) => b.rating - a.rating)
      .map((player, index) => ({
        rank: index + 1,
        username: player.username || 'Unknown',
        title: getTitle(player.rating),
        rating: Math.round(player.rating),
        wins: player.wins || 0,
        losses: player.losses || 0,
        draws: player.draws || 0,
        total: player.total || 0,
        winRate: player.total > 0 ? Math.round((player.wins / player.total) * 100 * 10) / 10 : 0,
        change: '—', // You can implement change tracking later
        color: getColor(player.rating)
      }));
    return sorted;
  };

  // Fetch rankings
  const fetchRankings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-rankings`, {
        userID: user?.id,
        page: page,
        limit: itemsPerPage
      }
    );

      if (req.status === 200 || req.status === 201) {
        const formattedPlayers = formatPlayers(req.data.rankings);
        setPlayers(formattedPlayers);
        setFilteredPlayers(formattedPlayers);
        setTotalPlayers(req.data.total || formattedPlayers.length);
        setCurrentPage(page);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 429 || error.response?.data.message.includes('Too Many Requests')) {
          toast.error(error.response?.data.message || 'Too many requests');
        } else {
          toast.error('Failed to fetch rankings');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchRankings(1);
    }
  }, [user?.id]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalPlayers / itemsPerPage)) {
      fetchRankings(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchRankings(currentPage - 1);
    }
  };

  const handlePageClick = (pageNum: number) => {
    fetchRankings(pageNum);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalPlayers / itemsPerPage);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push('...');
      
      if (totalPages > 1) pages.push(totalPages);
    }
    
    return pages;
  };

  // Get current page data
  const currentPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Find user's position
  const userRank = players.findIndex(p => p.username === user?.username) + 1;
  const userData = players.find(p => p.username === user?.username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Global Rankings
        </h1>
        <p className="text-gray-400 mb-8">
          See how you stack up against the best competitive coders in the world.
        </p>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white">Global Rankings</h2>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((filter, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter.active
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Filters Button */}
          {/* <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-cyan-400" />
            <span className="font-medium">Filters</span>
          </div> */}

          {/* Rankings Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900/80">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">RANK</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">PLAYER</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">RATING</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">W/L/D</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">WIN RATE</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">CHANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Loading rankings...
                    </td>
                  </tr>
                ) : currentPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No players found
                    </td>
                  </tr>
                ) : (
                  currentPlayers.map((player) => (
                    <tr
                      key={`${player.rank}-${player.username}`}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${player.color} rounded-full`}></div>
                          <span className="font-bold text-lg">{player.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-white">
                            {player.username}
                            {user?.username === player.username && (
                              <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">You</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{player.title}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-cyan-300">{player.rating}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">
                          {player.wins} / {player.losses} / {player.draws}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.winRate}%</span>
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                              style={{ width: `${Math.min(player.winRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {player.change === '—' ? (
                          <div className="flex items-center text-gray-400">
                            <Minus className="h-4 w-4" />
                            <span className="ml-1">—</span>
                          </div>
                        ) : player.change?.startsWith('▲') ? (
                          <div className="flex items-center text-green-400">
                            <ChevronUp className="h-4 w-4" />
                            <span className="ml-1 font-medium">{player.change}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-400">
                            <ChevronDown className="h-4 w-4" />
                            <span className="ml-1 font-medium">{player.change}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-700/50 gap-4">
            <div className="text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalPlayers)} of {totalPlayers} players
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center px-4 py-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              {getPageNumbers().map((pageNum, idx) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageClick(pageNum as number)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-gray-900/50 hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="flex items-center px-4 py-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Your Ranking Card - Only show if user is logged in */}
        {user && userData && (
          <div className="mt-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-cyan-700/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Your Position</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-white">#{userRank || 'N/A'}</div>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-300">{userData.title}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-300">{userData.rating}</div>
                <div className="text-sm text-gray-300">ELO Rating</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {userRank <= 10 ? 'You are in the top 10! Amazing!' :
               userRank <= 50 ? `You're in the top ${userRank} players. Keep going!` :
               userRank <= 100 ? `You're in the top 100. Great work!` :
               `You're in the top ${Math.round((userRank / totalPlayers) * 100)}% of all players. Keep coding!`}
            </div>
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  )
}

export default Ranking