// app/admin/dashboard/components/tabs/OverviewTab.tsx
import React from 'react';
import { Activity, Clock, Mail } from 'lucide-react';
import UserCard from './UserCard';
import FeedbackCard from './FeedbackCard';


interface OverviewTabProps {
  users: any[];
  feedback: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ users, feedback }) => {
  return (
    <>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Platform Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">User Growth</span>
              <span className="text-green-400">+12.5%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Match Activity</span>
              <span className="text-blue-400">+8.2%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Response Time</span>
              <span className="text-yellow-400">2.4h</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            Recent Feedback
          </h3>
          <div className="space-y-3">
            {feedback.slice(0, 5).map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;