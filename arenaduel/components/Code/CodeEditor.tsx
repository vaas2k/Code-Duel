'use client';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Send,
  Maximize2,
  Minimize2,
  GripVertical,
  ChevronDown,
  Type,
  Power,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axios from 'axios';
import { useUserState } from '@/store/useUser';
import useMatchStore from '@/store/useMatch';
import { useRouter } from 'next/navigation';

interface TestCaseResult {
  testCase: number;
  status: string;
  statusId: number;
  time: string | number;
  memory: number;
  errorMessage?: string;
  compileOutput?: string;
  message?: any;
  stderr?: string;
}

interface SubmissionResult {
  passed?: number;
  total?: number;
  time?: number | string;
  memory?: number | string;
  message?: any;
  detailedSummary?: {
    correct?: number;
    wrong?: number;
    runtime?: string;
    memory?: string;
  };
  error?: string;
  details?: string;
  testCaseDetails?: TestCaseResult[];
  hasCriticalError?: boolean;
  primaryError?: string;
  errorDetails?: string;
}

interface CodeEditorProps {
  language: string;
  fontSize: number;
  code: string;
  onLanguageChange: (language: string) => void;
  onCodeChange: (code: string) => void;
  onFontSizeChange: (size: number) => void;
  onCodeSubmit: () => void;
  submissionResult: SubmissionResult | null;
  isLoading: boolean;
  activeTab: 'test-cases' | 'output';
  onTabChange: (tab: 'test-cases' | 'output') => void;
  isMarathon: boolean
}

// Constants and configuration
const LANGUAGE_CONFIGS = {
  cpp: { name: 'C++ 17', icon: '⚡', color: 'text-blue-400' },
  python: { name: 'Python 3', icon: '🐍', color: 'text-green-400' },
  javascript: { name: 'JavaScript', icon: '📜', color: 'text-yellow-400' },
  java: { name: 'Java 17', icon: '☕', color: 'text-red-400' }
} as const;

type LanguageKey = keyof typeof LANGUAGE_CONFIGS;

const CODE_ERROR_SUGGESTIONS = {
  CE: [
    'Check for syntax errors, missing semicolons, or typos',
    'Verify all variables are declared before use',
    'Ensure all required imports/includes are present'
  ],
  RTE: [
    'Check for array index out of bounds or segmentation faults',
    'Look for null pointer access or division by zero',
    'Verify infinite loops or recursion depth'
  ],
  TLE: [
    'Optimize your algorithm\'s time complexity',
    'Check for infinite loops or inefficient nested loops',
    'Consider using more efficient data structures'
  ]
} as const;

// Helper functions
const safeToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const formatTime = (time: any): string => {
  const num = safeToNumber(time);
  return num.toFixed(3);
};

const getStatusIcon = (statusId: number): string => {
  switch (statusId) {
    case 3: return '✅';
    case 4: return '❌';
    case 5: return '⏱️';
    case 6: return '🔨';
    case 7: return '❌';
    case 8: return '⏱️';
    case 9: return '🔨';
    case 10: return '💥';
    case 11: return '⚡';
    case 12: return '📁';
    case 13: return '🔧';
    default: return '⏳';
  }
};

// Sub-components
const LanguageSelector: React.FC<{
  language: string;
  onLanguageChange: (lang: string) => void;
  onFontSizeChange: (size: number) => void;
  fontSize: number;
}> = ({ language, onLanguageChange, onFontSizeChange, fontSize }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-200 flex items-center space-x-3 border border-slate-600 hover:border-slate-500"
      >
        <span className="text-xl">{LANGUAGE_CONFIGS[language as LanguageKey]?.icon}</span>
        <div className="text-left">
          <div className="text-sm font-medium">{LANGUAGE_CONFIGS[language as LanguageKey]?.name}</div>
          <div className="text-xs text-slate-400">Change Language</div>
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {showOptions && (
        <>
          <div className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50">
            <div className="p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">Select Language</h3>
              <div className="space-y-2">
                {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onLanguageChange(key);
                      setShowOptions(false);
                    }}
                    className={`w-full p-3 rounded-lg transition-all ${language === key
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/40'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{config.icon}</span>
                      <div className="text-left">
                        <div className={`font-medium ${config.color}`}>{config.name}</div>
                        <div className="text-xs text-slate-400">Standard version</div>
                      </div>
                      {language === key && (
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="font-semibold text-white mb-3 text-sm flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <span>Editor Settings</span>
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Font Size</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-sm">A-</span>
                    </button>
                    <span className="w-12 text-center font-medium">{fontSize}px</span>
                    <button
                      onClick={() => onFontSizeChange(Math.min(20, fontSize + 1))}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-sm">A+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
        </>
      )}
    </div>
  );
};

const EditorStatusBar: React.FC<{
  language: string;
  code: string;
  editorHeight: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}> = ({ language, code, editorHeight, fontSize, onFontSizeChange }) => {
  const lines = code.split('\n');
  const currentLine = lines.length;
  const currentCol = lines[lines.length - 1]?.length || 1;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <span className="text-slate-400">
          {LANGUAGE_CONFIGS[language as LanguageKey]?.name}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">
          Ln {currentLine}, Col {currentCol}
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">
          Editor: {Math.round(editorHeight)}%
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs"
        >
          A-
        </button>
        <button
          onClick={() => onFontSizeChange(Math.min(20, fontSize + 1))}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs"
        >
          A+
        </button>
      </div>
    </div>
  );
};

const TestCaseVisualizer: React.FC<{ testCaseDetails: TestCaseResult[] }> = ({ testCaseDetails }) => {
  const passedCount = testCaseDetails.filter(tc => tc.statusId === 3).length;
  const total = testCaseDetails.length;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300">
            Test Progress: {passedCount}/{total} Passed
          </span>
          <span className="text-sm font-bold text-slate-300">
            {total > 0 ? Math.round((passedCount / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${total > 0 ? (passedCount / total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {testCaseDetails.map((testCase, index) => (
          <div
            key={index}
            className={`
              relative p-4 rounded-xl transition-all duration-300
              ${testCase.statusId === 3
                ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-2 border-green-500/40 shadow-lg shadow-green-500/10'
                : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/40 shadow-lg shadow-red-500/10'
              }
            `}
          >
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
              <span className="text-lg">{getStatusIcon(testCase.statusId)}</span>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${testCase.statusId === 3 ? 'text-green-400' : 'text-red-400'}`}>
                #{testCase.testCase}
              </div>
              <div className="text-xs text-slate-300 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span>Time:</span>
                  <span className="font-mono">{formatTime(testCase.time)}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory:</span>
                  <span className="font-mono">{safeToNumber(testCase.memory)}KB</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Correct</div>
          <div className="text-2xl font-bold text-green-400">{passedCount}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Wrong</div>
          <div className="text-2xl font-bold text-red-400">{total - passedCount}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-yellow-400">
            {total > 0 ? Math.round((passedCount / total) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{
  submissionResult: SubmissionResult;
  getSafeStats: () => { passed: number; total: number; time: number; memory: number }
}> = ({ submissionResult, getSafeStats }) => {
  const errorType = submissionResult.primaryError || submissionResult.error || 'RTE';
  const errorDetails = submissionResult.errorDetails || submissionResult.details || 'Unknown error occurred';
  const truncatedError = errorDetails.length > 300
    ? errorDetails.substring(0, 300) + '...'
    : errorDetails;
  const suggestions = CODE_ERROR_SUGGESTIONS[errorType as keyof typeof CODE_ERROR_SUGGESTIONS] || [];

  return (
    <div className="space-y-4">
      {/* Critical Error Banner */}
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💥</span>
          <div>
            <div className="font-bold text-lg text-red-400">
              {errorType === 'CE' ? 'Compilation Error' :
                errorType === 'TLE' ? 'Time Limit Exceeded' :
                  errorType === 'RTE' ? 'Runtime Error' :
                    'Error'}
            </div>
            <div className="text-red-300 text-sm mt-1 font-mono">
              {truncatedError}
            </div>
          </div>
        </div>
      </div>

      {/* Test Case Summary */}
      {submissionResult.testCaseDetails && (
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <h4 className="font-bold text-slate-300 mb-3">Test Case Summary</h4>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <div className="text-lg font-bold text-red-400">
                {submissionResult.testCaseDetails.filter(tc => tc.statusId !== 3).length}
              </div>
              <div className="text-xs text-slate-400">Failed Cases</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                {submissionResult.testCaseDetails.filter(tc => tc.statusId === 3).length}
              </div>
              <div className="text-xs text-slate-400">Passed Cases</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-lg font-bold text-yellow-400">
                {submissionResult.testCaseDetails.length}
              </div>
              <div className="text-xs text-slate-400">Total Cases</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Fix Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>Quick Fix Suggestions:</span>
          </h4>
          <ul className="text-blue-300 text-sm space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OutputDisplay: React.FC<{ submissionResult: SubmissionResult }> = ({ submissionResult }) => {
  const { passed, total, time, memory } = (() => {
    if (!submissionResult) return { passed: 0, total: 0, time: 0, memory: 0 };
    return {
      passed: safeToNumber(submissionResult.passed),
      total: safeToNumber(submissionResult.total),
      time: safeToNumber(submissionResult.time),
      memory: safeToNumber(submissionResult.memory)
    };
  })();

  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  const hasError = submissionResult.error || submissionResult.hasCriticalError;

  if (hasError) {
    return (
      <ErrorDisplay
        submissionResult={submissionResult}
        getSafeStats={() => ({ passed, total, time, memory })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 flex flex-col ">
        <div className="gap-2 mb-2 flex flex-col ">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {passed}/{total}
            </div>
            <div className="text-xs text-slate-400 mt-1">Test Cases</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {formatTime(time)}s
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Time</div>
          </div>
          <div className="text-center p-3 bg-purple-500/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {memory}KB
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Memory</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {percentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Score</div>
          </div>
        </div>

        {passed === total && total > 0 ? (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">🎉 All test cases passed! Perfect solution!</span>
            </div>
          </div>
        ) : passed === 0 && total > 0 ? (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-bold">No test cases passed. Check your algorithm.</span>
            </div>
          </div>
        ) : total > 0 ? (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">{passed}/{total} test cases passed. Keep trying!</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Messages/Warnings */}
      {submissionResult.message && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Performance Notes</span>
          </div>
          <div className="text-yellow-300 text-sm">
            {typeof submissionResult.message === 'string'
              ? submissionResult.message
              : submissionResult.message.warnings ? submissionResult.message.warnings.join(', ')
                : JSON.stringify(submissionResult.message)}
          </div>
        </div>
      )}
    </div>
  );
};

const ResizeHandle: React.FC<{
  isResizing: boolean;
  startResizing: (e: React.MouseEvent) => void;
  editorHeight: number;
}> = ({ isResizing, startResizing, editorHeight }) => (
  <div
    className={`h-2 bg-slate-700 hover:bg-blue-500/50 cursor-ns-resize flex items-center justify-center relative transition-colors ${isResizing ? 'bg-blue-500/50' : ''
      }`}
    onMouseDown={startResizing}
  >
    <div className="w-24 h-1 bg-slate-600 hover:bg-blue-400 rounded-full transition-colors"></div>
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70">
      <GripVertical className="w-4 h-4 text-slate-400" />
    </div>
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
      <span className="text-xs text-slate-400 font-mono">{Math.round(editorHeight)}%</span>
    </div>
  </div>
);

// Updated CodeEditor component - Simplified version
const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  fontSize,
  code,
  onLanguageChange,
  onCodeChange,
  onFontSizeChange,
  onCodeSubmit,
  submissionResult,
  isLoading,
  activeTab,
  onTabChange,
  isMarathon
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const user = useUserState((state) => state.user);
  const roomID = useMatchStore((state) => state.roomID);
  const router = useRouter();
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAbortMatch = async () => {
    // Add your abort match logic here
    console.log('Aborting match...');
    // Example: navigate to home page or show match ended screen
    // router.push('/');
    setShowAbortDialog(false);


    try {

      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/match-abort`, {
        roomID,
        userID: user?.id,
        rating: user?.rating
      })

      if (req.status === 200) {
        console.log('Match aborted successfully');
        router.back();
      }

    } catch (error) {
      console.error('Error aborting match:', error);
    }
  };

  const renderTabContent = useMemo(() => {
    if (!submissionResult) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
          <div className="text-3xl mb-4">👨‍💻</div>
          <p className="text-center mb-2">Run your code to see results</p>
          <p className="text-sm text-center text-gray-400">
            Write your solution and click Submit to test against test cases
          </p>
        </div>
      );
    }

    if (activeTab === 'test-cases') {
      if (!submissionResult.testCaseDetails) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
            <Play className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Run your code to see results</p>
          </div>
        );
      }
      return <TestCaseVisualizer testCaseDetails={submissionResult.testCaseDetails} />;
    }

    return <OutputDisplay submissionResult={submissionResult} />;
  }, [activeTab, submissionResult]);

  return (
    <>
      <div className={`h-full flex flex-col ${isFullscreen
        ? 'fixed inset-0 z-50 bg-slate-900'
        : 'bg-slate-900'
        }`}
      >
        {/* Simplified Editor Header */}
        <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key} className="bg-slate-800">
                    {config.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                >
                  A-
                </button>
                <span className="text-sm font-medium w-8 text-center">{fontSize}px</span>
                <button
                  onClick={() => onFontSizeChange(Math.min(18, fontSize + 1))}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                >
                  A+
                </button>
              </div>

              {/* Abort Match Button */}
              {!isMarathon && <Dialog open={showAbortDialog} onOpenChange={setShowAbortDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Abort Match
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      Abort Match?
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Are you sure you want to abort this match? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 my-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-red-300 mb-1">Warning:</p>
                        <ul className="space-y-1 text-red-200/80">
                          <li>• Your progress will be lost</li>
                          <li>• The match will end immediately</li>
                          <li>• This may affect your rating</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowAbortDialog(false)}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAbortMatch}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Yes, Abort Match
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button> */}

              <button
                onClick={onCodeSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 min-h-0">
          <div className="h-full flex">
            {/* Editor Section */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => onCodeChange(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: fontSize,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineHeight: 1.5,
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'all',
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                  },
                  cursorBlinking: 'smooth',
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Results Panel */}
            <div className="w-80 border-l border-slate-700 flex flex-col">
              <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
                <div className="flex">
                  <button
                    onClick={() => onTabChange('output')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'output'
                        ? 'text-blue-400 bg-slate-700'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    Output
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {renderTabContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeEditor;
