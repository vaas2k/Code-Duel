// app/admin/dashboard/components/tabs/MatchesTab.tsx
import React from 'react';
import { Gamepad2, DownloadCloud, Code } from 'lucide-react';
import MatchRow from './Tables/MatchRow';
MatchRow

interface MatchesTabProps {
  matches: any[];
}

const MatchesTab: React.FC<MatchesTabProps> = ({ matches }) => {
  const handleExportData = () => {
    console.log('Exporting matches data');
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            Match History
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-gray-600 hover:to-gray-500 transition-all"
            >
              <DownloadCloud className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">{matches.filter(m => m.status === 'completed').length}</div>
            <div className="text-sm text-gray-400">Matches Today</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {matches.filter(m => m.rated).length}
            </div>
            <div className="text-sm text-gray-400">Rated Matches</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {matches.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {matches.filter(m => m.status === 'aborted').length}
            </div>
            <div className="text-sm text-gray-400">Aborted</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">Match ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Players</th>
              <th className="text-left p-4 text-gray-400 font-medium">Problem</th>
              <th className="text-left p-4 text-gray-400 font-medium">Type</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-left p-4 text-gray-400 font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.slice(0, 10).map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchesTab;