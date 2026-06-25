'use client';
import React from 'react';
import { Trophy, Shield, X, Zap, Target, TrendingUp } from 'lucide-react';

interface BattleModeSelectorProps {
  onModeSelect: (mode: 'rated' | 'unrated') => void;
  onClose: () => void;
}

const BattleModeSelector: React.FC<BattleModeSelectorProps> = ({ onModeSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Battle Mode</h2>
            <p className="text-gray-400 text-sm mt-1">Choose how you want to compete</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Battle Modes */}
        <div className="space-y-4 mb-8">
          {/* Rated Battle */}
          <button
            onClick={() => onModeSelect('rated')}
            className="w-full p-5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-blue-900/20 hover:to-blue-800/10 border border-gray-700 hover:border-blue-500 rounded-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Trophy className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Rated Battle</h3>
                  <p className="text-gray-400 text-sm">Affects your ranking score</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Ranked</span>
              </div>
            </div>
          </button>

          {/* Unrated Battle */}
          <button
            onClick={() => onModeSelect('unrated')}
            className="w-full p-5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-green-900/20 hover:to-green-800/10 border border-gray-700 hover:border-green-500 rounded-xl transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Unrated Battle</h3>
                  <p className="text-gray-400 text-sm">Practice without risk</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Practice</span>
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-300">
                <span className="font-semibold text-blue-400">Rated battles</span> affect your ranking and leaderboard position.
                <span className="font-semibold text-green-400 ml-1">Unrated battles</span> are perfect for practice and experimentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleModeSelector;