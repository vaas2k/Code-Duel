'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserState } from '@/store/useUser';
import {
    Trophy,
    TrendingUp,
    Target,
    Calendar,
    Swords,
    Zap,
    Code2,
    Award,
    Clock,
    Star,
    TrendingDown,
    CheckCircle,
    XCircle,
    MinusCircle
} from 'lucide-react';

import ProfileHeader from './ProfileHeader';
import MatchHistory from './MatchHistory';
import BattleStats from './BattleStats';
import ProblemStats from './ProblemStats';
import LanguageSkills from './LanguageSkills';
import Achievements from './Achievements';
import useStats from '@/store/useStats';

interface UserStatsx {
    username: string;
    rating: number;
    wins: number;
    losses: number;
    total: number;
    draws: number;
    timestamp: string;
    createdAt?: string;
}

interface Match {
    id: number;
    roomID: string;
    problemID: number;
    winner: string | null;
    loser: string | null;
    player1: any;
    player2: any;
    rated: boolean;
    totalCases: number;
    solution: any;
    status: string;
    createdAt?: string;
}

const Profile = () => {
    const { user } = useUserState();
    const [matchHistory, setMatchHistory] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [matchLoading, setMatchLoading] = useState(true);
    const userStats = useStats((state) => state);

    

    useEffect(() => {
        const fetchMatchHistory = async () => {
            try {
                if (user?.id) {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/match-history`, {
                        userID: user.id
                    },
                        { withCredentials: true }
                    );
                    setMatchHistory(response.data.history);
                }
            } catch (error) {
                console.error('Error fetching match history:', error);
            } finally {
                setMatchLoading(false);
            }
        };

        if (user?.id) {
            Promise.all([fetchMatchHistory()]).then(() => {
                setLoading(false);
            });
        }
    }, [user?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading profile data...</p>
                </div>
            </div>
        );
    }


    // Calculate current tier based on rating
    const getTier = (rating: number) => {
        if (rating >= 2000) return { name: 'Diamond', color: 'text-purple-400', bg: 'bg-purple-500/10' };
        if (rating >= 1600) return { name: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
        if (rating >= 1200) return { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        if (rating >= 800) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-500/10' };
        return { name: 'Bronze', color: 'text-yellow-800', bg: 'bg-yellow-800/10' };
    };

    const tier = getTier(userStats?.rating || 50);
    //@ts-ignore
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <ProfileHeader
                    username={user?.username || 'Player'}
                    rating={userStats?.rating || 50}
                    tier={tier}
                    joinDate={joinDate}
                    totalMatches={userStats.total || 0}
                    globalRank={245} // You might want to fetch this from backend
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left Column - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Battle Statistics */}
                        <BattleStats
                            totalMatches={userStats.total || 0}
                            wins={userStats?.wins || 0}
                            losses={userStats?.losses || 0}
                            draws={userStats?.draws || 0}
                            winRate={userStats.winRate}
                            rating={userStats?.rating || 50}
                        />

                        {/* Match History */}
                        <MatchHistory
                            matches={matchHistory}
                            loading={matchLoading}
                            userId={user?.id}
                        />

                        {/* Problem Statistics later stages*/}
                        {/* <ProblemStats
                            userId={user?.id}
                        /> */}
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">
                        {/* Language & Skills */}
                        <LanguageSkills
                            userId={user?.id}
                        />

                        {/* Achievements */}
                        <Achievements
                            rating={userStats?.rating || 50}
                            totalWins={userStats?.wins || 0}
                            totalMatches={userStats.total || 0}
                        />

                        {/* Quick Stats */}
                        {/* <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Quick Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Total Battles</span>
                                    <span className="font-bold text-white">{userStats.total || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Win Rate</span>
                                    <span className="font-bold text-green-400">{userStats?.winRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Current Rating</span>
                                    <span className="font-bold text-yellow-400">{user?.rating || 50}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Member Since</span>
                                    <span className="text-gray-300">{joinDate}</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;