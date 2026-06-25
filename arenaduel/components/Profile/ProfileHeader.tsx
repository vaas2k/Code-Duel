import React from 'react';
import { Trophy, Calendar, Target, Star } from 'lucide-react';

interface ProfileHeaderProps {
  username: string;
  rating: number;
  tier: {
    name: string;
    color: string;
    bg: string;
  };
  joinDate: string;
  totalMatches: number;
  globalRank: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  rating,
  tier,
  joinDate,
  totalMatches,
  globalRank
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-sm font-bold ${tier.bg} ${tier.color} border border-gray-700`}>
            {tier.name}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{username}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">{rating}</span>
                  <span className="text-gray-400">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span>{totalMatches} matches</span>
                </div>
              </div>
            </div>

            {/* Global Rank */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">#{globalRank}</div>
              <div className="text-sm text-gray-400">Global Rank</div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress to next tier</span>
              <span className="text-yellow-400">{rating} / 2000</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${Math.min((rating / 2000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;