// Update your MarathonResultsPopup.tsx file with this improved version
'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Clock, CheckCircle, XCircle, Award, Star, TrendingUp } from 'lucide-react';

interface ProblemResult {
  id: number;
  title: string;
  time_taken: string | null; // Can be null or undefined
  points?: number;
}

interface MarathonResults {
  id: number;
  userID: string;
  problems: ProblemResult[];
  total_time: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MarathonResultsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  results: MarathonResults | null;
}

const MarathonResultsPopup: React.FC<MarathonResultsPopupProps> = ({ 
  isOpen, 
  onClose, 
  results 
}) => {
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    averageTime: '00:00',
    totalScore: 0,
    efficiency: 0,
  });

  // Helper function to safely parse time string
  const parseTimeString = (timeStr: string | null | undefined): number => {
    if (!timeStr || timeStr === '00:00' || timeStr === 'null' || timeStr === 'undefined') {
      return 0;
    }
    
    try {
      // Handle different time formats
      if (typeof timeStr === 'string') {
        // If time is in format "minutes:seconds"
        const parts = timeStr.split(':');
        
        if (parts.length === 2) {
          const minutes = parseInt(parts[0], 10) || 0;
          const seconds = parseInt(parts[1], 10) || 0;
          return minutes * 60 + seconds;
        }
        
        // If time is in format "hours:minutes:seconds"
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10) || 0;
          const minutes = parseInt(parts[1], 10) || 0;
          const seconds = parseInt(parts[2], 10) || 0;
          return hours * 3600 + minutes * 60 + seconds;
        }
      }
      
      // If it's a number (already in seconds)
      if (typeof timeStr === 'number') {
        return timeStr;
      }
      
      return 0;
    } catch (error) {
      console.error('Error parsing time:', timeStr, error);
      return 0;
    }
  };

  useEffect(() => {
    if (results?.problems) {
      const solvedProblems = results.problems.filter(p => {
        const time = p.time_taken;
        return time && time !== '00:00' && time !== 'null' && time !== 'undefined';
      });
      
      const totalProblems = results.problems.length;
      
      // Calculate average time - safely
      const totalSeconds = solvedProblems.reduce((acc, problem) => {
        return acc + parseTimeString(problem.time_taken);
      }, 0);
      
      const avgSeconds = solvedProblems.length > 0 ? totalSeconds / solvedProblems.length : 0;
      const avgMinutes = Math.floor(avgSeconds / 60);
      const avgSecs = Math.floor(avgSeconds % 60);
      const averageTime = `${avgMinutes}:${avgSecs.toString().padStart(2, '0')}`;
      
      // Calculate score (25 points per solved problem)
      const totalScore = solvedProblems.length * 25;
      
      // Calculate efficiency percentage
      const efficiency = totalProblems > 0 
        ? Math.round((solvedProblems.length / totalProblems) * 100) 
        : 0;

      setStats({
        totalProblems,
        solvedProblems: solvedProblems.length,
        averageTime,
        totalScore,
        efficiency,
      });
    }
  }, [results]);

  if (!isOpen || !results) return null;

  // Calculate performance rating
  const getPerformanceRating = () => {
    const percentage = (stats.solvedProblems / stats.totalProblems) * 100;
    if (percentage >= 80) return { text: 'Excellent', color: 'text-green-400' };
    if (percentage >= 60) return { text: 'Good', color: 'text-yellow-400' };
    if (percentage >= 40) return { text: 'Average', color: 'text-orange-400' };
    return { text: 'Needs Practice', color: 'text-red-400' };
  };

  const performance = getPerformanceRating();

  // Helper to format time display
  const formatTimeDisplay = (time: string | null | undefined): string => {
    if (!time || time === '00:00' || time === 'null' || time === 'undefined') {
      return 'Not solved';
    }
    return time;
  };

  // Check if problem is solved
  const isProblemSolved = (time: string | null | undefined): boolean => {
    return !!time && time !== '00:00' && time !== 'null' && time !== 'undefined';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-white/10"></div>
        
        {/* Main content */}
        <div className="relative bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Marathon Complete!</h2>
                  <p className="text-gray-400">Your coding challenge results</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="p-6 bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.solvedProblems}</div>
                    <div className="text-sm text-gray-400">Solved</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{results.total_time || '00:00'}</div>
                    <div className="text-sm text-gray-400">Total Time</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalScore}</div>
                    <div className="text-sm text-gray-400">Points</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.efficiency}%</div>
                    <div className="text-sm text-gray-400">Efficiency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Rating */}
          <div className="p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Performance Rating</div>
                <div className={`text-2xl font-bold ${performance.color}`}>
                  {performance.text}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(stats.efficiency / 20)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Problems List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Problems Summary</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {results.problems && results.problems.length > 0 ? (
                results.problems.map((problem, index) => {
                  const solved = isProblemSolved(problem.time_taken);
                  return (
                    <div
                      key={`${problem.id}-${index}`}
                      className={`p-4 rounded-xl border transition-all ${
                        solved
                          ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                          : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            solved 
                              ? 'bg-green-500/20' 
                              : 'bg-red-500/20'
                          }`}>
                            {solved ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              Problem #{problem.id}
                            </div>
                            <div className="text-sm text-gray-400">
                              {problem.title || `Problem ${problem.id}`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${
                            solved ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {solved ? '25 points' : '0 points'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatTimeDisplay(problem.time_taken)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400 border border-gray-700 rounded-xl">
                  No problems data available
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                {stats.solvedProblems === stats.totalProblems 
                  ? 'Perfect score! Amazing work! 🎉'
                  : stats.solvedProblems >= stats.totalProblems * 0.7
                  ? 'Great job! You\'re doing well!'
                  : 'Keep practicing to improve your rank!'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Add functionality to restart or share results
                    const shareText = `I just completed a coding marathon! Solved ${stats.solvedProblems}/${stats.totalProblems} problems in ${results.total_time}. Score: ${stats.totalScore} points!`;
                    navigator.clipboard.writeText(shareText);
                    alert('Results copied to clipboard!');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  Share Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarathonResultsPopup;