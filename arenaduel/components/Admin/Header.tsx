// app/admin/dashboard/components/Header.tsx
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'users': return 'User Management';
      case 'feedback': return 'Feedback Reports';
      case 'matches': return 'Match History';
      case 'problems': return 'Problem Management';
      case 'sessions': return 'Active Sessions';
      default: return 'Dashboard';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'overview': return 'Monitor platform performance and statistics';
      case 'users': return 'Manage user accounts and permissions';
      case 'feedback': return 'Review and respond to user feedback';
      case 'matches': return 'View and analyze match data';
      case 'problems': return 'Create, edit, and manage coding problems';
      case 'sessions': return 'Monitor active user sessions';
      default: return '';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{getTabTitle()}</h1>
          <p className="text-gray-400">{getTabDescription()}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => window.location.reload()}
            className="p-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;