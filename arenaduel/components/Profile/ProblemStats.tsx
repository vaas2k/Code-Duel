import React from 'react';
import { Code2, Target, TrendingUp, Zap } from 'lucide-react';

interface ProblemStatsProps {
  userId?: string;
}

const ProblemStats: React.FC<ProblemStatsProps> = ({ userId }) => {
  // This would fetch actual problem stats from your backend
  // For now, using placeholder data
  
  const stats = {
    totalSolved: 342,
    easy: 156,
    medium: 132,
    hard: 54,
    streak: 15
  };

  const calculatePercentages = () => {
    const total = stats.totalSolved;
    return {
      easy: Math.round((stats.easy / total) * 100) || 0,
      medium: Math.round((stats.medium / total) * 100) || 0,
      hard: Math.round((stats.hard / total) * 100) || 0
    };
  };

  const percentages = calculatePercentages();

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Code2 className="w-5 h-5 text-green-400" />
        Problem Solving
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-2">{stats.totalSolved}</div>
          <div className="text-sm text-gray-400">Total Solved</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">{stats.easy}</div>
          <div className="text-sm text-gray-400">Easy</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.medium}</div>
          <div className="text-sm text-gray-400">Medium</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400 mb-2">{stats.hard}</div>
          <div className="text-sm text-gray-400">Hard</div>
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Easy ({percentages.easy}%)</span>
            <span className="text-gray-400">{stats.easy} problems</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              style={{ width: `${percentages.easy}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-yellow-400">Medium ({percentages.medium}%)</span>
            <span className="text-gray-400">{stats.medium} problems</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
              style={{ width: `${percentages.medium}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-red-400">Hard ({percentages.hard}%)</span>
            <span className="text-gray-400">{stats.hard} problems</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full"
              style={{ width: `${percentages.hard}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
        <div>
          <div className="text-lg font-semibold text-white">Current Streak</div>
          <div className="text-sm text-gray-400">{stats.streak} days</div>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-orange-400">
          <Zap className="w-6 h-6" />
          {stats.streak}
        </div>
      </div>
    </div>
  );
};

export default ProblemStats;