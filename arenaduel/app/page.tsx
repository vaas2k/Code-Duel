'use client';

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUserState } from "@/store/useUser";
import { 
  Swords, 
  Trophy, 
  Users, 
  Zap, 
  Code2, 
  Shield, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles
} from "lucide-react";

export default function Home() {
  const { setTheme } = useTheme();
  const [auth, setAuth] = useState<boolean | null>(null);
  const userID = useUserState((state) => state.user?.id);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function verify() {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth-verify`,
          {},
          { withCredentials: true }
        );

        if (res.status == 200) {
          setAuth(true);
          setLoading(false);
          router.push('/dashboard');
        } else {
          setAuth(false);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    })();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex-col gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Swords className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-300 mb-2">Preparing Your Battle Station</h1>
          <p className="text-gray-400 text-sm">Loading competitive environment...</p>
        </div>
      </div>
    );
  }

  if (!loading && !auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Navigation */}
        <nav className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    CodeArena
                  </h1>
                  <p className="text-xs text-gray-400">Competitive Coding Platform</p>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Link href={"/signin"}>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/20">
                    Sign In
                  </button>
                </Link>
                <Link href={"/create-account"}>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 border border-gray-600">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-blue-400 font-medium">New Season Launch</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Code & Conquer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Where developers battle for supremacy in real-time coding duels. 
              Prove your skills, climb the ranks, and join the elite.
            </p>
            
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href={"/signin"}>
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-blue-500/30 flex items-center gap-3">
                  <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  Enter the Arena
                </button>
              </Link>
              <Link href={"/create-account"}>
                <button className="group px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 border border-gray-600 flex items-center gap-3">
                  <Target className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  Join the Battle
                </button>
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">10K+</div>
                <div className="text-sm text-gray-400 mt-1">Active Players</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
                <div className="text-2xl font-bold text-green-400">50K+</div>
                <div className="text-sm text-gray-400 mt-1">Duels Won</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">100+</div>
                <div className="text-sm text-gray-400 mt-1">Challenges</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
                <div className="text-2xl font-bold text-yellow-400">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Live Battles</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Battle Features</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Everything you need to compete and grow as a developer
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 1v1 Battles */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Swords className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">1v1 Live Duels</h3>
                <p className="text-gray-400 mb-4">
                  Real-time coding battles against opponents of similar skill level. 
                  Prove your abilities in head-to-head competition.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>Real-time matching</span>
                </div>
              </div>

              {/* Competitive Ranking */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Elite Ranking System</h3>
                <p className="text-gray-400 mb-4">
                  Earn rating points, unlock tiers, and compete for the top spot on 
                  the global leaderboard.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Progressive ranking</span>
                </div>
              </div>

              {/* Team Rooms */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-green-500/10">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
                <p className="text-gray-400 mb-4">
                  Create or join team rooms for collaborative practice 
                  and team-based tournaments.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>Team challenges</span>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Start competing in just three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Choose Your Battle</h3>
                <p className="text-gray-400 text-sm">
                  Select from rated or unrated matches and enter the matchmaking queue
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Code Your Solution</h3>
                <p className="text-gray-400 text-sm">
                  Solve the problem faster and more efficiently than your opponent
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Claim Victory</h3>
                <p className="text-gray-400 text-sm">
                  Earn rating points, climb the leaderboard, and unlock achievements
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 mb-20">
            <div className="text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Swords className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Test Your Skills?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Join thousands of developers who are already competing, 
                learning, and growing together in the ultimate coding arena.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/create-account"}>
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-blue-500/30">
                    Start Free Today
                  </button>
                </Link>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                No credit card required • Free to play forever
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Swords className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  CodeArena
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Built for developers who thrive on competition • Join the battle today
              </p>
              <div className="flex justify-center gap-6 text-sm text-gray-400">
                <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
                <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
                <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}