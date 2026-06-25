'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import useMatchStore from '@/store/useMatch';
import { useRouter } from 'next/navigation';
import { Users, Clock, X, Target, AlertCircle, Swords, Trophy, Sparkles } from 'lucide-react';

interface MatchmakingQueueProps {
  mode: 'rated' | 'unrated';
  socket: any;
  userID: any;
  username: any;
  timestamp: any;
  rating: any;
  playersInQueue: number;
  handleCancelMatchmaking?: () => void;
}

interface MatchDetails {
  roomID: string;
  player1: any;
  player2: any;
  [key: string]: any;
}

interface MatchFoundData {
  matchDetails: MatchDetails;
}

const MatchmakingQueue: React.FC<MatchmakingQueueProps> = ({
  mode,
  socket,
  userID,
  username,
  timestamp,
  rating,
  handleCancelMatchmaking,
  playersInQueue
}) => {
  const [foundMatch, setFoundMatch] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [opponentInfo, setOpponentInfo] = useState<any>(null);
  const [searchTime, setSearchTime] = useState(0);
  const { setMatchState } = useMatchStore();
  const router = useRouter();

  // Handle match found and countdown
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: MatchFoundData) => {
      // Determine which player is the opponent
      let opponent;
      let matchDetails = { ...data.matchDetails };



      if (data.matchDetails.player1.userID === userID) {
        opponent = data.matchDetails.player2;
      } else {
        opponent = data.matchDetails.player1;
        matchDetails.player1 = data.matchDetails.player2;
        matchDetails.player2 = data.matchDetails.player1;
      }

      console.log(data);
      console.log(opponent);

      setOpponentInfo(opponent);
      setMatchState(matchDetails);
      setFoundMatch(true);

      // Start countdown
      let count = 3;
      setCountdown(count);

      const countdownInterval = setInterval(() => {
        count -= 1;
        setCountdown(count);

        if (count <= 0) {
          clearInterval(countdownInterval);
          router.push('/match/' + data.matchDetails.roomID);
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    };

    socket.on(`matchFound:${userID}`, handleMatchFound);

    return () => {
      socket.off(`matchFound:${userID}`, handleMatchFound);
    };
  }, [socket, userID, router, setMatchState]);

  // Search time tracking
  useEffect(() => {
    if (!foundMatch) {
      const timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [foundMatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  async function onCancel() {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cancel-matchmaking`,
        { userID, timestamp, rating, mode },
        { withCredentials: true }
      );

      if (res.status === 200 && handleCancelMatchmaking) {
        handleCancelMatchmaking();
      }
    } catch (error) {
      console.error('Cancel matchmaking error:', error);
    }
  }

  const getOpponentDisplayName = (opponent: any) => {
    if (!opponent) return 'Opponent';
    return opponent.username || opponent.name || 'Code Champion';
  };

  const getOpponentAvatar = (opponent: any) => {
    if (!opponent) return 'C';
    const name = opponent.username || opponent.name || 'C';
    return name.charAt(0).toUpperCase();
  };

  const getOpponentRating = (opponent: any) => {
    if (!opponent) return '???';
    return opponent.rating || opponent.rating || '???';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {foundMatch ? 'Match Found! 🎯' : 'Finding Opponent'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {foundMatch 
                ? `Starting in ${countdown}s...` 
                : `${mode.charAt(0).toUpperCase() + mode.slice(1)} Matchmaking`
              }
            </p>
          </div>
          {/* {!foundMatch && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          )} */}
        </div>

        {/* Main Content */}
        {!foundMatch ? (
          <div className="space-y-6">
            {/* Search Animation */}
            <div className="relative flex justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 animate-pulse">
                {/* <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent w"></div> */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Swords className="w-12 h-12 text-blue-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Search Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">In Queue</span>
                </div>
                <div className="text-2xl font-bold text-white">{playersInQueue}</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Search Time</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(searchTime)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Searching for opponents...</span>
                <span className="text-blue-400 font-medium">
                  {Math.min(90, 10 + (searchTime % 90))}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(90, 10 + (searchTime % 90))}%` }}
                />
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              Cancel Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* VS Display */}
            <div className="flex items-center justify-center gap-8">
              {/* You */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg border-2 border-blue-400">
                  <span className="text-2xl font-bold text-white">Y</span>
                </div>
                <div className="font-medium text-white">{username}</div>
                <div className="flex items-center justify-center gap-1 text-sm text-yellow-400 mt-1">
                  <Trophy className="w-4 h-4" />
                  <span>{rating}</span>
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-yellow-400 animate-pulse mb-2">
                  {countdown}
                </div>
                <div className="px-4 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full">
                  <span className="text-white font-bold text-sm">VS</span>
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg border-2 border-red-400">
                  <span className="text-2xl font-bold text-white">
                    {getOpponentAvatar(opponentInfo)}
                  </span>
                </div>
                <div className="font-medium text-white">
                  {getOpponentDisplayName(opponentInfo)}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-yellow-400 mt-1">
                  <Trophy className="w-4 h-4" />
                  <span>{getOpponentRating(opponentInfo)}</span>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Match Type</span>
                </div>
                <div className={`px-3 py-1 rounded-full ${mode === 'rated' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </div>
              </div>
              {mode === 'rated' && (
                <div className="text-sm text-center text-gray-300 mt-2">
                  <Sparkles className="w-4 h-4 inline mr-2 text-yellow-400" />
                  Rating at stake: <span className="font-bold text-yellow-400">±25 points</span>
                </div>
              )}
            </div>

            {/* Countdown Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Match starting...</span>
                <span className="text-green-400 font-medium">{countdown}s</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>Preparing battle environment...</span>
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>💡</span>
            <span>
              {!foundMatch 
                ? "Stay ready! The match will begin immediately when found."
                : "Get ready! The battle interface will load automatically."
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingQueue;