'use client';
import React, { useState, useEffect } from 'react';
import {
  Trophy, Frown, Clock, CheckCircle, Code, User, X,
  Handshake, Timer, TrendingUp, TrendingDown, Copy,
  Check, AlertTriangle, Target, BarChart
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Problem {
  id: string | number;
  title?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface BattleResult {
  result: 'win' | 'loss' | 'draw';
  winner?: any;
  loser?: any;
  player1: any;
  player2: any;
  problem: Problem;
  solution: string;
  reason?: 'timeout' | 'all_cases' | 'opponent_wins' | 'score' | 'forfeit';
}

interface WinLossModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  result: BattleResult;
  problem: Problem;
  solution: string;
  matchDuration: string;
  battleMode: string;
  totalCases: number;
  playerStats?: any;
  onRematch?: () => void;
  onNextProblem?: () => void;
  onViewSolution?: (code: string, language: string) => void;
}

const WinLossModal: React.FC<WinLossModalProps> = ({
  user,
  isOpen,
  onClose,
  result,
  problem,
  solution,
  matchDuration,
  battleMode,
  totalCases,
  onRematch,
  onNextProblem,
  onViewSolution,
  playerStats
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'solution'>('stats');
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract data from backend response
  const isWinner = result.result === 'win';
  const isDraw = result.result === 'draw';
  const isLoss = result.result === 'loss';
  const isTimeout = result.reason === 'timeout';
  const isForfeit = result.reason === 'opponent_wins';
  const isAllCases = result.reason === 'all_cases';

  // Get player data from backend
  const player1 = result.player1;
  const player2 = result.player2;

  // Determine which player is current user
  const currentUser = user?.id === player1?.info?.userID ? player1 : player2;
  const opponent = user?.id === player1?.info?.userID ? player2 : player1;

  // Get passed cases from backend data
  const player1Cases = player1?.casesPassed || player1?.passed || 0;
  const player2Cases = player2?.casesPassed || player2?.passed || 0;

  // Current user's passed cases
  console.log('Player Stats:', playerStats);
  
  const currentUserCases = playerStats.player2.passed; 
  const opponentCases = playerStats.player1.passed ;

  console.log('Current User Cases:', currentUserCases);
  console.log('Opponent Cases:', opponentCases);

  // Calculate percentages
  const currentUserPercentage = totalCases > 0 ? Math.round((currentUserCases / totalCases) * 100) : 0;
  const opponentPercentage = totalCases > 0 ? Math.round((opponentCases / totalCases) * 100) : 0;

  // Rating changes from backend or default
  const winnerId = result.winner;
  const currentUserRatingChange = user?.id === winnerId ? 25 :
    (isDraw ? 0 : -15);
  const opponentRatingChange = user?.id === winnerId ? -15 :
    (isDraw ? 0 : 25);

  // Get ratings from backend or user object
  const currentUserRating = currentUser?.info?.rating || user?.rating || 1500;
  const opponentRating = opponent?.info?.rating || 1500;

  useEffect(() => {
    if (isOpen && isWinner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isWinner]);

  if (!isOpen) return null;

  const getResultMessage = () => {
    if (isDraw) {
      if (isTimeout) return "Time's Up - Draw!";
      return "It's a Draw!";
    }
    if (isWinner) {
      if (isAllCases) return "Victory! All Tests Passed!";
      if (isTimeout) return "Victory! Time's Up";
      return "Victory!";
    }
    return "Defeat";
  };

  const getResultColor = () => {
    if (isDraw) return 'text-blue-400';
    if (isWinner) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getResultIcon = () => {
    if (isDraw) return <Handshake className="w-12 h-12 text-blue-400" />;
    if (isWinner) return <Trophy className="w-12 h-12 text-yellow-500" />;
    return <Frown className="w-12 h-12 text-red-400" />;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWinReason = () => {
    if (isAllCases) return "Solved all test cases";
    if (isTimeout) return "More test cases passed when time expired";
    if (isForfeit) return "Better performance";
    return "Better performance";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti for win */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 3)],
                borderRadius: '50%'
              }}
              initial={{ y: -100, rotate: 0, opacity: 1 }}
              animate={{
                y: '120vh',
                rotate: 720,
                x: Math.sin(i * 0.5) * 100,
                opacity: 0
              }}
              transition={{
                duration: 2 + Math.random(),
                ease: "easeOut",
                delay: i * 0.02
              }}
            />
          ))}
        </div>
      )}

      {/* Main Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {getResultIcon()}
                <div>
                  <h1 className={`text-2xl font-bold ${getResultColor()}`}>
                    {getResultMessage()}
                  </h1>
                  <p className="text-gray-300 text-sm">
                    {getWinReason()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{matchDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{totalCases} Test Cases</span>
              </div>
              {isTimeout && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Timer className="w-4 h-4" />
                  <span>Time Expired</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 font-medium ${activeTab === 'stats'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart className="w-4 h-4" />
                  <span>Statistics</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('solution')}
                className={`flex-1 py-3 font-medium ${activeTab === 'solution'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Solution</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[50vh] overflow-y-auto">
            {activeTab === 'stats' ? (
              <div className="space-y-6">
                {/* Player Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Current User */}
                  <div className={`p-4 rounded-lg ${isWinner
                      ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30'
                      : isDraw
                        ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30'
                        : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30'
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold truncate">{currentUser?.info?.username || 'You'}</h3>
                        <div className="text-xs text-gray-400">
                          Rating: {currentUserRating}
                          {!isDraw && (
                            <span className={`ml-2 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                              {currentUserRatingChange > 0 ? '+' : ''}{currentUserRatingChange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Test Cases</span>
                        <span className="font-bold text-green-400">
                          {currentUserCases}/{totalCases}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isWinner
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                              : isDraw
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                : 'bg-gradient-to-r from-red-500 to-pink-400'
                            }`}
                          style={{ width: `${currentUserPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Opponent */}
                  <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold truncate">{opponent?.info?.username || 'Opponent'}</h3>
                        <div className="text-xs text-gray-400">
                          Rating: {opponentRating}
                          {!isDraw && (
                            <span className={`ml-2 ${isLoss ? 'text-green-400' : 'text-red-400'}`}>
                              {opponentRatingChange > 0 ? '+' : ''}{opponentRatingChange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Test Cases</span>
                        <span className="font-bold text-green-400">
                          {opponentCases}/{totalCases}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${opponentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Match Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Problem</div>
                      <div className="font-medium">#{problem.id}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm">Difficulty</div>
                      <div className={`font-medium ${problem.difficulty === 'Easy' ? 'text-green-400' :
                          problem.difficulty === 'Medium' ? 'text-yellow-400' :
                            'text-red-400'
                        }`}>
                        {problem.difficulty}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm">Winner</div>
                      <div className="font-medium">
                        {isDraw ? 'Draw' : (result.winner === user?.id ? 'You' : 'Opponent')}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm">Loser</div>
                      <div className="font-medium">
                        {isDraw ? 'None' : (result.loser === user?.id ? 'You' : 'Opponent')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Solution Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">Winning Solution</h4>
                    <p className="text-gray-400 text-sm">
                      by {isWinner ? currentUser?.info?.username : opponent?.info?.username || 'Winner'}
                    </p>
                  </div>

                  {solution && (
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>

                      {/* {onViewSolution && (
                        <button
                          onClick={() => onViewSolution(solution,'py')}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm flex items-center gap-2"
                        >
                          Open
                        </button>
                      )} */}
                    </div>
                  )}
                </div>

                {/* Solution Code */}
                {solution ? (
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-sm">solution</span>
                      <span className="text-gray-400 text-xs">
                        {solution.split('\n').length} lines
                      </span>
                    </div>
                    <pre className="text-gray-300 text-sm font-mono overflow-x-auto">
                      {solution}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="w-12 h-12 mx-auto mb-2" />
                    <p>No solution available</p>
                  </div>
                )}

                {/* Outcome Analysis */}
                <div className={`p-4 rounded-lg border ${isWinner
                    ? 'bg-green-500/10 border-green-500/30'
                    : isDraw
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                  <h5 className="font-bold mb-2">
                    {isWinner ? 'What Went Well' :
                      isDraw ? 'Match Analysis' :
                        'Areas for Improvement'}
                  </h5>
                  <p className="text-sm text-gray-300">
                    {isAllCases
                      ? 'You solved all test cases perfectly! Great work!'
                      : isTimeout
                        ? `You ${isWinner ? 'passed more cases' : 'needed to pass more cases'} within the time limit.`
                        : isForfeit
                          ? `Review the winning solution to improve your approach`
                          : isDraw
                            ? 'Both players performed equally well in this match.'
                            : 'Review the winning solution to improve your approach.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3">
              {/* {onRematch && (
                <button
                  onClick={onRematch}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
                >
                  Rematch
                </button>
              )}

              {onNextProblem && (
                <button
                  onClick={onNextProblem}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                >
                  Next Problem
                </button>
              )} */}

              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WinLossModal;