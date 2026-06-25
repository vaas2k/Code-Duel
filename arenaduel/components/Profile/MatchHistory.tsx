import React, { useState } from 'react';
import { 
  Clock, 
  Swords, 
  Trophy, 
  Award, 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  ChevronDown,
  ChevronUp,
  Code,
  Users,
  Target,
  Zap,
  Eye,
  X,
  Copy,
  Check,
  FileCode,
  Terminal,
  Cpu,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

interface MatchHistoryProps {
  matches: Match[];
  loading: boolean;
  userId?: string;
}

interface MatchDetailsModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'solution'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getUserMatchData = () => {
    if (!userId) return null;
    
    const isPlayer1 = match.player1?.userID === userId;
    const isPlayer2 = match.player2?.userID === userId;
    
    if (!isPlayer1 && !isPlayer2) return null;
    
    const currentPlayer = isPlayer1 ? match.player1 : match.player2;
    const opponent = isPlayer1 ? match.player2 : match.player1;
    const isWinner = match.winner === currentPlayer.userID;
    const isDraw = match.status === 'draw' || match.winner === null;
    
    return {
      currentPlayer,
      opponent,
      isWinner,
      isDraw,
      result: isDraw ? 'draw' : isWinner ? 'win' : 'loss'
    };
  };

  const copySolutionToClipboard = () => {
    if (match.solution) {
      navigator.clipboard.writeText(match.solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageFromSolution = () => {
    const solution = match.solution || '';
    if (solution.includes('#include')) return 'cpp';
    if (solution.includes('def ') || solution.includes('import ')) return 'python';
    if (solution.includes('function ') || solution.includes('const ') || solution.includes('let ')) return 'javascript';
    if (solution.includes('class ') && solution.includes('public static void main')) return 'java';
    return 'cpp';
  };

  const matchData = getUserMatchData();
  const solutionLanguage = getLanguageFromSolution();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Match Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                match.rated 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-600'
              }`}>
                {match.rated ? 'RATED' : 'UNRATED'}
              </div>
              <div className="text-sm text-gray-400">
                Room: {match.roomID.slice(0, 8)}...
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {formatDate(match.createdAt)}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'solution'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Solution
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {matchData ? (
                  <>
                    {/* Result Banner */}
                    <div className={`p-4 rounded-xl text-center ${
                      matchData.result === 'win' 
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'
                        : matchData.result === 'loss'
                        ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20'
                        : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20'
                    }`}>
                      <div className="text-lg font-bold">
                        {matchData.result === 'win' ? '🎉 VICTORY' : 
                         matchData.result === 'loss' ? '😔 DEFEAT' : '🤝 DRAW'}
                      </div>
                      <div className="text-sm text-gray-300 mt-1">
                        vs {matchData.opponent.username}
                      </div>
                    </div>

                    {/* Players Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Current Player */}
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-white">You</span>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded ${
                            matchData.result === 'win' ? 'bg-green-500/20 text-green-400' :
                            matchData.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {matchData.result.toUpperCase()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Username</span>
                            <span className="text-white">{matchData.currentPlayer.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rating</span>
                            <span className="text-yellow-400">{matchData.currentPlayer.rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Language</span>
                            <span className="text-blue-400">{matchData.currentPlayer.language}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cases Passed</span>
                            <span className="text-green-400">{matchData.currentPlayer.casesPassed}/{match.totalCases}</span>
                          </div>
                        </div>
                      </div>

                      {/* Opponent */}
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="font-medium text-white">Opponent</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {matchData.opponent.rating} rating
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Username</span>
                            <span className="text-white">{matchData.opponent.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Language</span>
                            <span className="text-blue-400">{matchData.opponent.language}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cases Passed</span>
                            <span className="text-green-400">{matchData.opponent.casesPassed}/{match.totalCases}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-2">
                          <Hash className="w-5 h-5" />
                          {match.problemID}
                        </div>
                        <div className="text-sm text-gray-400">Problem ID</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                          <Target className="w-5 h-5" />
                          {match.totalCases}
                        </div>
                        <div className="text-sm text-gray-400">Test Cases</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          {matchData.currentPlayer.casesPassed}
                        </div>
                        <div className="text-sm text-gray-400">Cases Passed</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                          <Cpu className="w-5 h-5" />
                          {solutionLanguage.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-400">Solution</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setActiveTab('solution')}
                        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                      >
                        <FileCode className="w-4 h-4" />
                        View Solution
                      </button>
                      <button
                        onClick={copySolutionToClipboard}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Solution
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">Match details unavailable</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="solution"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Solution Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-green-400" />
                      Solution Code
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Problem #{match.problemID} • {solutionLanguage.toUpperCase()} • {match.totalCases} test cases
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copySolutionToClipboard}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                        copied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        solution.{solutionLanguage}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {matchData?.currentPlayer.username || 'Player'} • {match.totalCases} cases
                    </div>
                  </div>

                  {/* Code Display */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {match.solution ? (
                      <SyntaxHighlighter
                        language={solutionLanguage}
                        style={atomOneDark}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          background: 'transparent',
                          fontSize: '0.9rem'
                        }}
                        showLineNumbers
                        lineNumberStyle={{ color: '#666', minWidth: '3em' }}
                      >
                        {match.solution}
                      </SyntaxHighlighter>
                    ) : (
                      <div className="p-8 text-center">
                        <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">Solution not available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solution Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
                        <Code className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Language</div>
                        <div className="font-medium text-white">{solutionLanguage.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-600/10 flex items-center justify-center border border-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Completion</div>
                        <div className="font-medium text-white">
                          {matchData?.currentPlayer.casesPassed || 0}/{match.totalCases} cases
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-600/10 flex items-center justify-center border border-purple-500/20">
                        <Hash className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Problem</div>
                        <div className="font-medium text-white">#{match.problemID}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back to Overview */}
                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Back to Overview
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Match ID: {match.id}
            </div>
            <div className="flex gap-3">
              {matchData && (
                <button
                  onClick={copySolutionToClipboard}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Solution'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, loading, userId }) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      if (diffHours === 0) return 'Just now';
      if (diffHours === 1) return '1 hour ago';
      return `${diffHours} hours ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserMatchResult = (match: Match) => {
    if (!userId) return { result: 'unknown', opponent: null };
    
    const isPlayer1 = match.player1?.userID === userId;
    const isPlayer2 = match.player2?.userID === userId;
    
    if (!isPlayer1 && !isPlayer2) return { result: 'unknown', opponent: null };
    
    const opponent = isPlayer1 ? match.player2 : match.player1;
    const isWinner = match.winner === (isPlayer1 ? match.player1?.userID : match.player2?.userID);
    const isDraw = match.status === 'draw' || match.winner === null;
    
    return {
      result: isDraw ? 'draw' : isWinner ? 'win' : 'loss',
      opponent: opponent?.username || 'Unknown',
      ratingChange: isPlayer1 ? match.player1?.rating : match.player2?.rating,
      casesPassed: isPlayer1 ? match.player1?.casesPassed : match.player2?.casesPassed,
      language: isPlayer1 ? match.player1?.language : match.player2?.language
    };
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'loss': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'draw': return <MinusCircle className="w-5 h-5 text-blue-400" />;
      default: return <Swords className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'loss': return 'text-red-400';
      case 'draw': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getResultBg = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-500/10 border-green-500/20';
      case 'loss': return 'bg-red-500/10 border-red-500/20';
      case 'draw': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-gray-500/10 border-gray-600';
    }
  };

  const displayMatches = showAll ? matches : matches.slice(0, 5);
  const hasMore = matches.length > 5;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Match History
          </h2>
          {matches.length > 0 && (
            <div className="text-sm text-gray-400">
              {matches.length} total matches
            </div>
          )}
        </div>
        
        {matches.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Swords className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No matches played yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start battling to see your history here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {displayMatches.map((match) => {
                const { result, opponent, language } = getUserMatchResult(match);
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group"
                  >
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="w-full text-left flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${getResultBg(result)}`}>
                          {getResultIcon(result)}
                        </div>
                        
                        <div>
                          <div className="font-medium text-white mb-1">
                            vs {opponent}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Problem #{match.problemID}
                            </span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              match.rated 
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                              {match.rated ? 'Rated' : 'Unrated'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FileCode className="w-3 h-3" />
                              {language || 'cpp'}
                            </span>
                            {match.solution && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-green-400">
                                  <Code className="w-3 h-3" />
                                  Solution
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`text-right ${getResultColor(result)}`}>
                          <div className="font-bold">
                            {result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'DRAW'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(match.createdAt)}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show More/Less Button */}
            {hasMore && (
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAll ? (
                    <>
                      Show Less
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View All Matches ({matches.length} total)
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          userId={userId}
        />
      )}
    </>
  );
};

export default MatchHistory;