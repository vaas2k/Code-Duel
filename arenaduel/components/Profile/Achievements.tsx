import React from 'react';
import { Trophy, Award, Zap, Target, Star } from 'lucide-react';

interface AchievementsProps {
  rating: number;
  totalWins: number;
  totalMatches: number;
}

const Achievements: React.FC<AchievementsProps> = ({
  rating,
  totalWins,
  totalMatches
}) => {
  const achievements = [
    {
      id: 1,
      name: "First Win",
      icon: <Trophy className="w-6 h-6" />,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      unlocked: totalWins >= 1,
      description: "Win your first battle"
    },
    {
      id: 2,
      name: "Gold Tier",
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      unlocked: rating >= 1200,
      description: "Reach Gold tier (1200+ rating)"
    },
    {
      id: 3,
      name: "10 Wins",
      icon: <Target className="w-6 h-6" />,
      color: "text-green-400",
      bg: "bg-green-500/10",
      unlocked: totalWins >= 10,
      description: "Achieve 10 battle wins"
    },
    {
      id: 4,
      name: "Battle Veteran",
      icon: <Zap className="w-6 h-6" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      unlocked: totalMatches >= 50,
      description: "Complete 50 battles"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-400" />
        Achievements
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              achievement.unlocked
                ? `${achievement.bg} border-gray-600`
                : 'bg-gray-800/50 border-gray-700 opacity-50'
            }`}
          >
            <div className={`mb-2 ${achievement.color}`}>
              {achievement.icon}
            </div>
            <div className="text-sm font-medium text-white">{achievement.name}</div>
            <div className="text-xs text-gray-400 mt-1">{achievement.description}</div>
            {!achievement.unlocked && (
              <div className="text-xs text-gray-500 mt-2">Locked</div>
            )}
          </div>
        ))}
      </div>
      
      {achievements.filter(a => a.unlocked).length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          Start battling to unlock achievements!
        </div>
      )}
    </div>
  );
};

export default Achievements;