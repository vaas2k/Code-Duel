'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useUserState } from '@/store/useUser';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { 
  Home, 
  Swords, 
  Trophy, 
  MessageSquare, 
  Bell, 
  User, 
  Settings, 
  Award, 
  LogOut,
  ChevronDown,
  Search
} from 'lucide-react';
import useStats from '@/store/useStats';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const user = useUserState((state) => state.user);
  const clearUser = useUserState((state) => state.clearUser);
  const router = useRouter();
  const pathname = usePathname();
  
  const {rating} = useStats((state) => state);

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  // Function to get link styles based on active state
  const getLinkStyles = (path: string) => {
    const baseStyles = "transition-all font-medium flex items-center gap-2 px-4 py-2.5 rounded-xl";
    if (isActiveLink(path)) {
      return `${baseStyles} text-white bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400/20`;
    }
    return `${baseStyles} text-gray-300 hover:text-white hover:bg-gray-800/50`;
  };

  async function handleLogout() {
    try {
      const req = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/logout-account`,
        { userID: user?.id },
        { withCredentials: true }
      );

      if (req.status === 200) {
        clearUser();
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left side - Logo & Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
            >
              <Swords className="w-6 h-6 text-blue-400" />
              <span>CodeDuel</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className={getLinkStyles('/')}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link href="/dashboard" className={getLinkStyles('/dashboard')}>
                <Swords className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link href="/ranking" className={getLinkStyles('/ranking')}>
                <Trophy className="w-4 h-4" />
                <span>Ranking</span>
              </Link>
              
              <Link href="/feedback" className={getLinkStyles('/feedback')}>
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </Link>
            </div>
          </div>

          {/* Right side - Search & User actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            {/* <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div> */}
            {/* </div> */}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all rounded-xl relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-gray-900">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {[
                      { 
                        message: "New battle challenge from Alex", 
                        time: "2 min ago", 
                        type: "battle",
                        unread: true 
                      },
                      { 
                        message: "You advanced to Gold Tier", 
                        time: "1 hour ago", 
                        type: "achievement",
                        unread: true 
                      },
                      { 
                        message: "Weekly ranking updated", 
                        time: "3 hours ago", 
                        type: "ranking",
                        unread: false 
                      },
                    ].map((notification, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 hover:bg-gray-800/50 cursor-pointer border-l-2 ${
                          notification.unread 
                            ? 'bg-blue-500/5 border-l-blue-500' 
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'battle' ? 'bg-red-500/10' :
                            notification.type === 'achievement' ? 'bg-yellow-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            {notification.type === 'battle' && <Swords className="w-4 h-4 text-red-400" />}
                            {notification.type === 'achievement' && <Award className="w-4 h-4 text-yellow-400" />}
                            {notification.type === 'ranking' && <Trophy className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-800">
                    <button className="text-sm text-blue-400 hover:text-blue-300 w-full text-center font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 px-3 py-2 rounded-xl transition-all border border-gray-700 hover:border-gray-600"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border border-blue-400/30">
                  <span className="text-white text-sm font-bold">
                    {user?.username ? user.username[0].toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-white text-sm font-medium block">
                    {user?.username || 'User'}
                  </span>
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {rating || 0}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        Gold Tier
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-green-400">{rating || 0} rating</span>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-all mx-1 rounded-lg"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-all mx-1 rounded-lg"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    
                    <Link
                      href="/achievements"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 transition-all mx-1 rounded-lg"
                    >
                      <Award className="w-4 h-4" />
                      <span>Achievements</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-1">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800/50 transition-all mx-1 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for closing dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
