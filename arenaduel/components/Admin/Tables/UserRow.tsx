// app/admin/dashboard/components/tables/UserRow.tsx
import React from 'react';
import { Eye, Trash2, Ban, Unlock, CheckCircle, Trophy } from 'lucide-react';

interface UserRowProps {
  user: any;
  onBanUser: (userId: string, ban: boolean) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onBanUser }) => {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">{user.username[0]}</span>
          </div>
          <div>
            <div className="font-medium text-white">{user.username}</div>
            <div className="text-sm text-gray-400">
              {user.verified ? 'Verified' : 'Unverified'}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-gray-300">{user.email}</div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="font-medium text-yellow-400">{user.rating}</span>
        </div>
      </td>
      <td className="p-4">
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
          user.banned
            ? 'bg-red-500/20 text-red-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          {user.banned ? (
            <>
              <Ban className="w-4 h-4" />
              Banned
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Active
            </>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="text-gray-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBanUser(user.id, !user.banned)}
            className={`p-2 rounded-lg transition-colors ${
              user.banned
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
            title={user.banned ? 'Unban User' : 'Ban User'}
          >
            {user.banned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          </button>
          {/* <button className="p-2 bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 bg-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete User">
            <Trash2 className="w-4 h-4" />
          </button> */}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;