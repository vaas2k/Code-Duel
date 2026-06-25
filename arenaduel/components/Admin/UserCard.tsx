// app/admin/dashboard/components/cards/UserCard.tsx
import React from 'react';

interface UserCardProps {
  user: any;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold">{user.username[0]}</span>
        </div>
        <div>
          <div className="font-medium text-white">{user.username}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-yellow-400">{user.rating} rating</div>
        <div className="text-xs text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default UserCard;