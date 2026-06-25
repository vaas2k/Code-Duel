// app/admin/dashboard/components/tables/MatchRow.tsx
import React from 'react';
import { Eye, Code } from 'lucide-react';

interface MatchRowProps {
  match: any;
}

const MatchRow: React.FC<MatchRowProps> = ({ match }) => {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="p-4">
        <div className="font-mono text-sm text-gray-300">{match.roomID?.slice(0, 8) || 'N/A'}...</div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="text-sm text-white">
            {match.player1?.username || 'Player 1'} vs {match.player2?.username || 'Player 2'}
          </div>
          <div className="text-xs text-gray-400">
            Winner: {match.winner ? (match.player1?.userID === match.winner ? match.player1?.username : match.player2?.username) : 'Draw'}
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm">#{match.problemID}</span>
        </div>
      </td>
      <td className="p-4">
        <div className={`px-3 py-1 rounded-full text-xs ${
          match.rated
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-gray-700 text-gray-400'
        }`}>
          {match.rated ? 'Rated' : 'Unrated'}
        </div>
      </td>
      <td className="p-4">
        <div className={`px-3 py-1 rounded-full text-xs ${
          match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          match.status === 'aborted' ? 'bg-red-500/20 text-red-400' :
          match.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {match.status}
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-400">
          {new Date(match.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="p-4">
        <button className="p-2 bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default MatchRow;