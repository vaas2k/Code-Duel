// app/admin/dashboard/components/Sidebar.tsx (updated)
import React from 'react';
import { 
  Shield, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Gamepad2, 
  Clock, 
  Settings,
  FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'users' | 'feedback' | 'matches' | 'sessions' | 'problems') => void;
  stats: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, stats }) => {
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', color: 'blue' },
    { id: 'users', icon: Users, label: 'Users', color: 'green', count: stats?.totalUsers },
    { id: 'feedback', icon: AlertTriangle, label: 'Feedback', color: 'yellow', count: stats?.totalFeedback },
    { id: 'matches', icon: Gamepad2, label: 'Matches', color: 'purple', count: stats?.totalMatches },
    { id: 'problems', icon: FileText, label: 'Problems', color: 'indigo', count: stats?.totalProblems },
    { id: 'sessions', icon: Clock, label: 'Sessions', color: 'red', count: stats?.activeUsers24h },
  ];
  const router = useRouter();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 border-r border-gray-700 hidden md:block">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">CodeArena Management</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? `bg-gradient-to-r from-${item.color}-500/20 to-${item.color}-600/20 text-${item.color}-400 border border-${item.color}-500/30`
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all">
          <Settings className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;