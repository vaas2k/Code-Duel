// app/admin/dashboard/components/tabs/UsersTab.tsx
import React from 'react';
import { Users, DownloadCloud, Eye, Trash2, Ban, Unlock, CheckCircle, Trophy } from 'lucide-react';
import UserRow from './Tables/UserRow';


interface UsersTabProps {
  users: any[];
  onBanUser: (userId: string, ban: boolean) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onBanUser }) => {
  const handleExportData = () => {
    console.log('Exporting users data');
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          User Management
        </h2>
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleExportData}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-gray-600 hover:to-gray-500 transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            Export
          </button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">User</th>
              <th className="text-left p-4 text-gray-400 font-medium">Email</th>
              <th className="text-left p-4 text-gray-400 font-medium">Rating</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} onBanUser={onBanUser} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;