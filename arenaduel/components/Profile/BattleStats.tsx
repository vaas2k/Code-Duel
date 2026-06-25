import React from 'react';
import { Swords, TrendingUp, TrendingDown, MinusCircle, Trophy, BarChart } from 'lucide-react';

interface BattleStatsProps {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rating: number;
}

const BattleStats: React.FC<BattleStatsProps> = ({
  totalMatches,
  wins,
  losses,
  draws,
  winRate,
  rating
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Swords className="w-5 h-5 text-blue-400" />
        Battle Statistics
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-2">{totalMatches}</div>
          <div className="text-sm text-gray-400">Total Matches</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">{wins}</div>
          <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Wins
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400 mb-2">{losses}</div>
          <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
            <TrendingDown className="w-4 h-4" />
            Losses
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-2">{draws}</div>
          <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
            <MinusCircle className="w-4 h-4" />
            Draws
          </div>
        </div>
      </div>

      {/* Win Rate and Rating Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Win Rate</span>
            <span className="font-bold text-green-400">{winRate.toFixed(2)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              style={{ width: `${winRate.toFixed(2)}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Current Rating</span>
            <span className="font-bold text-yellow-400 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {rating}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
              style={{ width: `${Math.min((rating / 2000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleStats;