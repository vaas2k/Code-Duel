// app/admin/dashboard/components/tabs/SessionsTab.tsx
import React from 'react';
import { Clock } from 'lucide-react';

const SessionsTab: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-red-400" />
        Active Sessions
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">0</div>
            <div className="text-gray-400">Active Now</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">24.5m</div>
            <div className="text-gray-400">Avg Session Duration</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">87%</div>
            <div className="text-gray-400">Session Retention</div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Clock className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Session Analytics Coming Soon</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Detailed session analytics and real-time monitoring will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionsTab;