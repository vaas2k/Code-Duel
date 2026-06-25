// app/admin/dashboard/components/StatsCards.tsx
import React from 'react';
import { Users, Activity, Gamepad2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: any;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      trend: <TrendingUp className="w-5 h-5 text-green-400" />
    },
    {
      title: 'Active (24h)',
      value: stats?.activeUsers24h || 0,
      icon: Activity,
      color: 'green',
      trend: <Clock className="w-5 h-5 text-yellow-400" />
    },
    {
      title: 'Total Matches',
      value: stats?.totalMatches || 0,
      icon: Gamepad2,
      color: 'purple',
      trend: <TrendingUp className="w-5 h-5 text-green-400" />
    },
    {
      title: 'Feedback Reports',
      value: stats?.totalFeedback || 0,
      icon: AlertTriangle,
      color: 'yellow',
      trend: (
        <div className="flex items-center gap-1">
          <span className="text-green-400">{stats?.feedbackResolved || 0}</span>
          <span className="text-gray-500">/</span>
          <span>{stats?.totalFeedback || 0}</span>
        </div>
      )
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r from-${card.color}-500/10 to-${card.color}-600/10`}>
              <card.icon className={`w-6 h-6 text-${card.color}-400`} />
            </div>
            {card.trend}
          </div>
          <div className="text-3xl font-bold text-white mb-2">{card.value}</div>
          <div className="text-gray-400">{card.title}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;