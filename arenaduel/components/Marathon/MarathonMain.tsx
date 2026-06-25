'use client';
import React, { useEffect, useState } from 'react';
import ProblemStatement from '../Code/ProblemStatement';
import { BookOpen, Code, Timer, Trophy, Zap, Target, Clock, X } from 'lucide-react';
import CodeEditor from '../Code/CodeEditor';
import axios from 'axios';
import useMarathon from '@/store/useMarathon';
import { useUserState } from '@/store/useUser';
import { useTimer } from 'react-timer-hook';
import MarathonResultsPopup from './MarathonResult';
import { useRouter } from 'next/navigation';

interface SubmissionResult {
    passed: number;
    total: number;
    time: number;
    memory: number;
    message: any;
    error?: string;
    details?: string;
}

const MarathonMain = () => {
    const [language, setLanguage] = useState('cpp');
    const [fontSize, setFontSize] = useState(13);
    const [code, setCode] = useState('');
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(3600);
    const [problemsSolved, setProblemsSolved] = useState(0);
    const marathonData = useMarathon((state) => state);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const user = useUserState((state) => state.user);
    const router = useRouter();
    const [showResults, setShowResults] = useState(false);
    const [marathonResults, setMarathonResults] = useState<any>(null);


    // Timer setup
    const [isTimeExpired, setIsTimeExpired] = useState(false);
    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 60 * 60); // 60 minutes timer
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
                problemID: marathonData.getProblemID(),
                userID: user?.id,
            });

            if (response.status === 200 || response.status === 201) {
                setSubmissionResult(response.data);

                // Update player stats
                if (response.data) {
                    console.log(response.data);
                }
            }

        } catch (error: any) {
            console.log(error);
            setSubmissionResult({
                error: 'Submission Failed',
                details: error.response?.data?.msg || 'Network error occurred',
                passed: 0,
                total: 0,
                time: 0,
                memory: 0,
                message: null
            });
        } finally {
            setIsLoading(false);
        }
    };


    // runs when users passes all the test cases
    useEffect(() => {
        async function updateProblemsSolved(updatedProblems: any) {
            try {

                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/update-problems-solved`, {
                    userID: user?.id,
                    matchID: marathonData.id,
                    current_problems: updatedProblems
                });

                if (res.status === 200) {

                    console.log(res.data);
                    marathonData.updateProblems(res.data.problem);
                }
            } catch (error) {
                console.log(error);
                throw error;
            }
        }

        console.log(submissionResult);
        if (submissionResult && submissionResult.passed === submissionResult.total) {
            console.log("problem solved");
            const timeTaken = `${60 - minutes}:${seconds < 10 ? `0${seconds}` : 60 - seconds}`
            console.log(timeTaken);
            const updatedProblems = marathonData.updateProblemTime(currentProblemIndex, timeTaken);
            updateProblemsSolved(updatedProblems);
            setProblemsSolved(problemsSolved + 1);
        }
        setCurrentProblemIndex(marathonData.getProblemID());

    }, [submissionResult]);

    async function endGame() {
        try {
            setIsLoading(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/end-marathon`, {
                userID: user?.id,
                matchID: marathonData.id,
                total_time: `${60 - minutes}:${seconds < 10 ? `0${seconds}` : 60 - seconds}`,
                problems: marathonData.problems
            });

            if (res.status === 200) {
                console.log('Game ended:', res.data.matchData);

                // The backend returns an array, take the first element
                const resultData = Array.isArray(res.data.matchData) ? res.data.matchData[0] : res.data.matchData;

                // Make sure problems is properly parsed
                if (resultData.problems && typeof resultData.problems === 'string') {
                    try {
                        resultData.problems = JSON.parse(resultData.problems);
                    } catch (e) {
                        console.error('Failed to parse problems:', e);
                        resultData.problems = [];
                    }
                }

                setMarathonResults(resultData);
                setShowResults(true);
            }

        } catch (error) {
            setIsLoading(false);
            console.log(error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Compact Header */}
            <div className="border-b border-gray-700 bg-gray-900/80 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Code Marathon</h1>
                                <p className="text-sm text-gray-400">Solve problems against the clock</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={endGame}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                End Game
                            </button>
                            <div className="text-center">
                                <div className="text-sm text-gray-400">Time</div>
                                <div className={`text-xl font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-green-400'}`}>
                                    {`${60 - minutes}:${seconds < 10 ? `0${seconds}` : 60 - seconds}`}
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-sm text-gray-400">Solved</div>
                                <div className="text-xl font-bold text-white">{problemsSolved}</div>
                            </div>

                            <div className="text-center">
                                <div className="text-sm text-gray-400">Current</div>
                                <div className="text-xl font-bold text-blue-400">#{currentProblemIndex}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(102vh-104px)]">
                {/* Problem Statement - Clean */}
                <div className="w-1/2 border-r border-gray-700 flex flex-col">
                    <div className="flex-shrink-0 p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-800">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-white">Problem #{currentProblemIndex}</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                                            Medium
                                        </span>
                                        <span className="text-gray-400">• 25 points</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="text-right">
                                <div className="text-sm text-gray-400">Progress</div>
                                <div className="font-medium text-blue-400">{currentProblemIndex}/12</div>
                            </div>
                        </div>
                    </div>

                    {/* Problem Content */}
                    <div className="flex-1 overflow-auto p-6">
                        <ProblemStatement problemID={JSON.stringify(marathonData.problems[marathonData.problems.length - 1].id)} />
                    </div>
                </div>

                {/* Code Editor - Clean */}
                <div className="w-1/2 flex flex-col h-full">
                    <div className="flex-shrink-0 p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-800">
                                    <Code className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-white">Your Solution</h2>
                                    <div className="text-sm text-gray-400">
                                        Language: <span className="font-medium text-blue-400">{language.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-yellow-400">+25 points</span>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
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
                            isMarathon={true}
                        />
                    </div>

                    {/* Submission Section */}
                    <div className="flex-shrink-0 border-t border-gray-700 p-4">
                        {submissionResult ? (
                            <div className={`p-4 rounded-xl ${submissionResult.passed === submissionResult.total
                                ? 'bg-green-500/10 border border-green-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {submissionResult.passed === submissionResult.total ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-red-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-white">
                                                {submissionResult.passed === submissionResult.total
                                                    ? 'All Tests Passed!'
                                                    : 'Try Again'}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {submissionResult.passed}/{submissionResult.total} test cases
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {submissionResult.passed === submissionResult.total ? (
                                            <div className="animate-pulse text-sm text-green-400">
                                                Next problem in 3s
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSubmissionResult(null)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCodeSubmit}
                                    disabled={isLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Submit Solution
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <MarathonResultsPopup
                isOpen={showResults}
                onClose={() => {setShowResults(false); router.push('/')}}
                results={marathonResults}
            />
        </div>
    );
};

export default MarathonMain;