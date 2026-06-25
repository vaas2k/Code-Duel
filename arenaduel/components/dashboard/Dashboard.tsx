'use client';
import React, { useEffect, useState } from 'react';
import { useUserState } from '@/store/useUser';
import MatchmakingQueue from '../Match/MatchQueue';
import BattleModeSelector from '../Match/BattleMode';
import useSocket from '@/store/useSocket';
import axios, { AxiosError } from 'axios';
import { Trophy, Users, Sword, TrendingUp, Clock, Zap } from 'lucide-react';
import useStats from '@/store/useStats';
import useMarathon from '@/store/useMarathon';
import { useRouter } from 'next/navigation';
import Loader from '../ui/Loader';

const Dashboard = () => {
  const [showBattleSelector, setShowBattleSelector] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [battleMode, setBattleMode] = useState<'rated' | 'unrated'>('rated');
  const { socket, isConnected } = useSocket();
  const [timeStamp, setTimeStamp] = useState<string | number | null>(null);
  const [playersInQueue, setPlayersInQueue] = useState<number>(0);
  const [stats, setStats] = useState<any>({
    wins: 0,
    losses: 0,
    total: 0,
    rating: 0,
    winRate: 0
  });
  const router = useRouter();
  const { user } = useUserState((state) => state);
  const { setUserStats } = useStats((state) => state);
  const [loading, setLoading] = useState(false);
  const setMarathon = useMarathon((state) => state.setMarathon);

  async function getStats() {
    try {
      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-stats`, {
        userID: user?.id,
      });
      if (req.status === 200) {
        setStats((prev: any) => {
          return {
            ...prev,
            ...req.data.stats
          }
        });
        setUserStats(req.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  useEffect(() => {

    if (!isConnected || !socket) return;

    getStats();

    socket.on(`create-match:${user?.id}`, (message: string) => {
      const data = JSON.parse(message);
      setShowMatchmaking(true);
    });

    socket.on('playersInQueue', (data: any) => {
      setPlayersInQueue(data.players);
    });

    return () => {
      socket.off(`create-match:${user?.id}`);
      socket.off('playersInQueue');
    };
  }, [socket, isConnected, user?.id]);

  const handleBattleModeSelect = async (mode: 'rated' | 'unrated') => {
    setBattleMode(mode);
    setShowBattleSelector(false);

    try {
      const data = {
        username: user?.username,
        userID: user?.id,
        rating: user?.rating,
        mode: mode,

      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/queue-for-match`,
        data,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setShowMatchmaking(true);
        setTimeStamp(res.data.timestamp);
      }
    } catch (error) {
      console.error('Matchmaking error:', error);
      if (error instanceof AxiosError) {
        console.error('Axios Error:', error.response?.data);
      }
    }
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
  };

  const startMarathon = async () => {
    try {

      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/start-marathon`,
        { userID: user?.id },
        { withCredentials: true });

        if(res.status === 200) {

          console.log(res.data)
          setMarathon(res.data.matchData);
          setLoading(false);
          router.push(`/marathon/${res.data.matchData.id}`);
        }


    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-400 mt-2">Ready for your next coding challenge?</p>
      </div>

      {/* Main Battle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Solo Practice */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Solo Practice</h3>
              <p className="text-gray-400 text-sm mt-2">
                Sharpen your skills with curated problems
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]">
            {loading ? <Loader /> : 'Coming Soon'}
          </button>
        </div>

        {/* 1v1 Battle */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sword className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">1v1 Battle</h3>
              <p className="text-gray-400 text-sm mt-2">
                Real-time coding duels against opponents
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBattleSelector(true)}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
          >
            Find Opponent
          </button>
        </div>

        {/* Team Rooms */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Team Rooms</h3>
              <p className="text-gray-400 text-sm mt-2">
                Collaborate and compete with friends
              </p>
            </div>
          </div>
          <button disabled className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Stats</h2>
          <Zap className="w-5 h-5 text-yellow-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.rating}</div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.wins}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.winRate ? stats.winRate.toFixed(2) : 0} %  </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Sword className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Battles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Mode Selector Modal */}
      {showBattleSelector && (
        <BattleModeSelector
          onModeSelect={handleBattleModeSelect}
          onClose={() => setShowBattleSelector(false)}
        />
      )}

      {/* Matchmaking Queue Modal */}
      {showMatchmaking && (
        <MatchmakingQueue
          mode={battleMode}
          socket={socket}
          userID={user?.id}
          username={user?.username}
          timestamp={timeStamp}
          rating={user?.rating}
          playersInQueue={playersInQueue}
          handleCancelMatchmaking={handleCancelMatchmaking}
        />
      )}
    </div>
  );
};

export default Dashboard;