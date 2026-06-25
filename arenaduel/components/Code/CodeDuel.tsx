'use client';
import React, { useState, useEffect, useRef } from 'react';
import ProblemStatement from './ProblemStatement';
import CodeEditor from './CodeEditor';
import axios from 'axios';
import useMatchStore from '@/store/useMatch';
import { useUserState } from '@/store/useUser';
import { createSocket } from '@/lib/socket';
import MatchAbortedModal from './MatchAbortedModal';
import WinLossModal from './WinLoss';
import {
  Trophy,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Zap,
  Cpu,
  Swords,
  Code,
  BookOpen,
  Handshake
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTimer } from 'react-timer-hook';
import { set } from 'zod';

interface TestCaseResult {
  testCase: number;
  status: string;
  statusId: number;
  time: string;
  memory: number;
  errorMessage?: string;
  compileOutput?: string;
}

interface SubmissionResult {
  passed: number;
  total: number;
  time: number;
  memory: number;
  message: any;
  detailedSummary?: {
    correct: number;
    wrong: number;
    runtime: string;
    memory: string;
  };
  error?: string;
  details?: string;
  testCaseDetails?: TestCaseResult[];
}

interface BattleResult {
  result: 'win' | 'loss' | 'draw';
  winner?: any;
  loser?: any;
  player1: any;
  player2: any;
  problem: any;
  solution: string;
  reason?: 'timeout' | 'all_cases' | 'opponent_wins' | 'score';
  playerStats?: {
    player1: { passed: number; total: number; time: string };
    player2: { passed: number; total: number; time: string };
  };
}

export default function CodeDuel() {
  const [language, setLanguage] = useState('cpp');
  const [fontSize, setFontSize] = useState(13);
  const [code, setCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    player1: { passed: 0, total: 0, time: '00:00' },
    player2: { passed: 0, total: 0, time: '00:00' }
  });
  const playerStatsRef = useRef(playerStats);
  const [matchAborted, setMatchAborted] = useState(false);
  const router = useRouter();

  // Match Details
  const { roomID, problemID, player1, player2, totalCases, solution } = useMatchStore();
  const { user } = useUserState();
  const socket = createSocket(user!);

  // WinLoss
  const [showResultModal, setShowResultModal] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  // Timer setup
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 1 * 60); // 15 minutes timer
  const { seconds, minutes, isRunning, start, pause } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      setIsTimeExpired(true);
      console.log('Timer expired');
    },
    interval: 20
  });
 
  const handleCodeSubmit = async () => {
    try {
      setIsLoading(true);
      setSubmissionResult(null);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/all-test-check`, {
        language: language,
        code: code,
        problemID: problemID,
        userID: user?.id,
        roomID: roomID,
      });

      if (response.status === 200 || response.status === 201) {
        setSubmissionResult(response.data);

        // Update player stats
        if (response.data) {
          setPlayerStats(prev => ({
            ...prev,
            player2: {
              passed: response.data.passed,
              total: totalCases || response.data.total,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          }));
        }
      }

    } catch (error: any) {
      console.log(error);
      setSubmissionResult({
        error: 'Submission Failed',
        details: error.response?.data?.msg || 'Network error occurred',
        passed: 0,
        total: totalCases || 20,
        time: 0,
        memory: 0,
        message: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBattleComplete = (result: BattleResult) => {
    setBattleResult(result);
    setShowResultModal(true);
    pause(); // Stop the timer when battle completes
  };

  const notifyTimeExpiry = async () => {
    try {
      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/time-expiry`, {
        userID: user?.id,
        roomID: roomID,
        passedCases: playerStats.player2.passed,
      });

      if (req.status === 200 || req.status === 201) {
        console.log("Notified backend of time expiry successfully.");
      }
    } catch (error) {
      console.log('Error notifying backend of time expiry:', error);
    }
  };

  const notifyPassedAll = async () => {
    try {
      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notify-passed-all`, {
        userID: user?.id,
        roomID: roomID,
        problemID: problemID,
        player1,
        player2,
        solution: code,
        language,
        rating: user?.rating,
        // passedCases: playerStats.player2.passed,
      });

      if (req.status === 200 || req.status === 201) {
        const matchData = req.data.matchData;
        const isWinner = matchData.winner === user?.id;
        const isDraw = matchData.status === 'draw';

        if (isDraw) {
          handleBattleComplete({
            result: 'draw',
            player1: matchData.player1,
            player2: matchData.player2,
            problem: {
              id: problemID,
              difficulty: 'Medium',
              tags: ['Algorithms', 'Mathematics', 'Simulation']
            },
            solution: matchData.solution || code,
            reason: 'score',
            playerStats: playerStats
          });
        } else if (isWinner) {

          console.log('User is the winner, handling battle complete as win.');
          console.log('Match Data:', matchData);
          handleBattleComplete({
            result: 'win',
            winner: user?.id === matchData.player1.userID ? matchData.player1 : matchData.player2,
            loser: user?.id === matchData.player1.userID ? matchData.player2 : matchData.player1,
            player1: matchData.player1,
            player2: matchData.player2,
            problem: {
              id: problemID,
              difficulty: 'Medium',
              tags: ['Algorithms', 'Mathematics', 'Simulation']
            },
            solution: code,
            reason: 'all_cases',
            playerStats: playerStats
          });
        } else {

          console.log('User is the loser, handling battle complete as loss.');
          console.log('Match Data:', matchData);
          handleBattleComplete({
            result: 'loss',
            winner: user?.id === matchData.player1.userID ? matchData.player2 : matchData.player1,
            loser: user?.id === matchData.player1.userID ? matchData.player1 : matchData.player2,
            player1: matchData.player1,
            player2: matchData.player2,
            problem: {
              id: problemID,
              difficulty: 'Medium',
              tags: ['Algorithms', 'Mathematics', 'Simulation']
            },
            solution: matchData.solution || code,
            reason: 'score',
            playerStats: playerStats
          });
        }
      }
    } catch (error) {
      console.log('Error notifying passed all:', error);
    }
  };

  useEffect(() => {
    start();
    if (!socket) return;

    socket.on(`codeCheckResult:${roomID}`, (data) => {
      if (data.userID !== user?.id) {
        console.log('Received code check result for opponent:', data);
        // playerStatsRef.current = data;
        setPlayerStats(prev => {
          const updatedStats = {
            ...prev,
            player1: {
              passed: data.passed,
              total: data.total,  // Use data.total instead of totalCases
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
          console.log("Player Stats Updated (inside setter):", updatedStats);
          
          playerStatsRef.current = updatedStats;
          return updatedStats;
        });  
      }

      console.log('Player Stats:', playerStatsRef.current);
    });

    socket.on(`toLoser_${user?.id}:${roomID}`, async (data) => {
      console.log('Notified as Loser:', data.message);
      const matchData = data.matchData;

      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notify-loss`, {
          userID: user?.id,
          roomID: roomID,
          problemID: problemID,
          player1,
          player2,
          solution: code,
          language,
          rating: user?.rating
        });
      } catch (error) {
        console.log('Error notifying loss:', error);
      }


      setTimeout(() => {
        handleBattleComplete({
          result: 'loss',
          winner: matchData.player1.userID === user?.id ? matchData.player2 : matchData.player1,
          loser: matchData.player1.userID === user?.id ? matchData.player1 : matchData.player2,
          player1: matchData.player1,
          player2: matchData.player2,
          problem: {
            id: problemID,
            difficulty: 'Medium',
            tags: ['Algorithms', 'Mathematics', 'Simulation']
          },
          solution: matchData.solution,
          reason: 'opponent_wins',
          playerStats: playerStats
        });
      }, 3000);
    });
    

    socket.on(`toWinner_${user?.id}:${roomID}`, (data) => {
      console.log('Match Aborted by Opponent:', data);
      setMatchAborted(true);
    });

    socket.on(`matchTimeExpired:${roomID}:${user?.id}`, (data) => {
      const matchData = data.matchData;
      const resultType = data.resultType; // 'win', 'loss', or 'draw'

      if (resultType === 'draw') {
        handleBattleComplete({
          result: 'draw',
          player1: matchData.player1,
          player2: matchData.player2,
          problem: {
            id: problemID,
            difficulty: 'Medium',
            tags: ['Algorithms', 'Mathematics', 'Simulation']
          },
          solution: matchData.solution || code,
          reason: 'timeout',
          playerStats: playerStats
        });
      } else if (resultType === 'win') {
        handleBattleComplete({
          result: 'win',
          winner: matchData.player1.userID === user?.id ? matchData.player1 : matchData.player2,
          loser: matchData.player1.userID === user?.id ? matchData.player2 : matchData.player1,
          player1: matchData.player1,
          player2: matchData.player2,
          problem: {
            id: problemID,
            difficulty: 'Medium',
            tags: ['Algorithms', 'Mathematics', 'Simulation']
          },
          solution: matchData.solution || code,
          reason: 'timeout',
          playerStats: playerStats
        });
      } else {
        handleBattleComplete({
          result: 'loss',
          winner: matchData.player1.userID === user?.id ? matchData.player2 : matchData.player1,
          loser: matchData.player1.userID === user?.id ? matchData.player1 : matchData.player2,
          player1: matchData.player1,
          player2: matchData.player2,
          problem: {
            id: problemID,
            difficulty: 'Medium',
            tags: ['Algorithms', 'Mathematics', 'Simulation']
          },
          solution: matchData.solution || code,
          reason: 'timeout',
          playerStats: playerStats
        });
      }
    });

    return () => {
      socket.off(`codeCheckResult:${roomID}`);
      socket.off(`toLoser_${user?.id}:${roomID}`);
      socket.off(`toWinner_${user?.id}:${roomID}`);
      socket.off(`matchTimeExpired:${roomID}:${user?.id}`);
    };
  }, [socket, roomID, user?.id]);
  // console.log(playerStats);
  useEffect(() => {

    playerStatsRef.current = playerStats;
    if (playerStats.player2.passed === totalCases && totalCases > 0) {
      console.log('Player passed all test cases, notifying backend...');
      notifyPassedAll();
    }
  }, [playerStats.player2.passed, totalCases]);

  useEffect(() => {
    if (!isRunning && isTimeExpired) {
      console.log('Timer expired, notifying backend...');
      notifyTimeExpiry();
    }
  }, [isRunning, isTimeExpired]);
  const getTimeColor = () => {
    if (minutes < 2) return 'text-red-500 animate-pulse';
    if (minutes < 5) return 'text-yellow-500';
    return 'text-white';
  };


  // useEffect(() => {
  //   async function handleTabChanges() { 
  //     if (document.hidden) {
  //       // Tab switched away or browser minimized
  //       console.log('Tab is hidden/inactive');
  //       // Add your logic here - pause videos, stop animations, etc.
  //     } else {
  //       // Tab is active again
  //       console.log('Tab is visible/active');
  //       // Add your logic here - resume activities
  //     }
  //   } 

  //   async function tabBack () {
  //     console.log('Back/Forward button clicked!');
  //     console.log('Current URL:', window.location.href);
      
  //     // You can prevent navigation if needed
  //     const userConfirmed = window.confirm('Are you sure you want to leave?');
  //     if (!userConfirmed) {
  //         console.log('User cancelled navigation');
  //         return;
  //     }
      
  //     // Perform cleanup or state updates
  //   }
    
  //   window.addEventListener('popstate', tabBack);

  //   document.addEventListener('visibilitychange', handleTabChanges);
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleTabChanges);
  //   };

  // },[]);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Code Duel
              </h1>
            </div>
            <span className="text-sm text-gray-400">|</span>
            <div className="text-sm">
              <span className="text-gray-400">Room: </span>
              <span className="font-medium">{roomID?.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{player1.userID === user?.id ? player2?.username : player1?.username }</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {playerStats.player1.passed}/{playerStats.player1.total}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className={`font-bold ${getTimeColor()}`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.username || 'You'}</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {playerStats.player2.passed}/{playerStats.player2.total}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Problem Statement */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="flex-shrink-0 p-4 bg-gray-800/30 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Problem Statement
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm font-medium text-yellow-400">
                  Medium
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ProblemStatement problemID={JSON.stringify(problemID)} />
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-shrink-0 p-4 bg-gray-800/30 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-green-400" />
                Code Editor
              </h2>
              <div className="text-sm text-gray-400">
                Language: <span className="font-medium text-blue-400">{language}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              language={language}
              fontSize={fontSize}
              code={code}
              onLanguageChange={setLanguage}
              onCodeChange={setCode}
              onFontSizeChange={setFontSize}
              onCodeSubmit={handleCodeSubmit}
              submissionResult={submissionResult}
              isLoading={isLoading}
              activeTab={'output'}
              onTabChange={() => { }}
              isMarathon={false}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <MatchAbortedModal
        isOpen={matchAborted}
        onClose={() => {
          setMatchAborted(false);
          router.push('/');
        }}
        opponentName={player1?.username || 'Opponent'}
        onReturnHome={() => router.push('/')}
        onFindNewMatch={() => router.push('/duel')}
      />

      {showResultModal && battleResult && (
        <WinLossModal
          user={user}
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            router.push('/dashboard');
          }}
          result={battleResult}
          problem={battleResult.problem}
          solution={battleResult.solution}
          matchDuration={`${minutes}:${seconds.toString().padStart(2, '0')}`}
          battleMode="1v1 Duel"
          totalCases={totalCases}
          playerStats={playerStatsRef.current}
          onRematch={() => {
            setShowResultModal(false);
            setSubmissionResult(null);
            router.push('/duel');
          }}
          onNextProblem={() => {
            setShowResultModal(false);
            router.push('/problems');
          }}
          onViewSolution={(code, lang) => {
            setShowResultModal(false);
            setCode(code);
            setLanguage(lang);
          }}
        />
      )}
    </div>
  );
}