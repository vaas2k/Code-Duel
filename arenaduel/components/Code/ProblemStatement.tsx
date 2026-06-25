'use client';
import React, { useState, useEffect } from 'react';
// import statements from '@/lib/statments';
import { ChevronLeft, ChevronRight, BookOpen, Target, Clock, Zap } from 'lucide-react';
import axios from 'axios';

interface ProblemStatementProps {
  problemID: string;
}

// Simplified ProblemStatement component
const ProblemStatement: React.FC<ProblemStatementProps> = ({ problemID }) => {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblemStatement(id: string) {
      try {
        
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/problem`,{
          problemID :id
        });
        if (res.status === 200) {
          console.log(res.data.problem);
          setProblem(res.data.problem);
        }
        
      } catch (error) {
        console.error('Error fetching problem statement:', error);
        setProblem(null);
      } finally {
        setLoading(false);
      }
    }

    if (problemID) {
      fetchProblemStatement(problemID);
    }
  }, [problemID]);

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded-lg w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Problem not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Problem Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {problem.difficulty || 'Medium'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-blue-400">{problem.timeLimit || '1s'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-purple-400">{problem.memoryLimit || '256MB'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Content */}
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Description</h2>
          <div className="text-gray-300 leading-relaxed">
            <p className="whitespace-pre-line">{problem.statement || 'No description available.'}</p>
          </div>
        </section>

        {/* Input/Output */}
        <div className="grid grid-cols-2 gap-6">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Input</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {problem.input || 'No input format specified.'}
              </pre>
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Output</h2>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <pre className="text-rose-300 font-mono text-sm whitespace-pre-wrap">
                {problem.output || 'No output format specified.'}
              </pre>
            </div>
          </section>
        </div>

        {/* Sample Test Cases */}
        {Array.isArray(problem.testCases) && problem.testCases.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Examples</h2>
            <div className="space-y-4">
              {problem.testCases.slice(0, 1).map((testCase: any, index: number) => (
                <div key={index} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Input</h3>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600">
                      <pre className="text-green-400 font-mono text-sm">
                        {typeof testCase === 'string' ? testCase : testCase?.input || testCase}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Output</h3>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600">
                      <pre className="text-blue-400 font-mono text-sm">
                        {Array.isArray(problem.testCases) && problem.testCases[index + 1]
                          ? (typeof problem.testCases[index + 1] === 'string'
                            ? problem.testCases[index + 1]
                            : problem.testCases[index + 1]?.output || problem.testCases[index + 1])
                          : 'Expected output'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Constraints</h2>
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <ul className="space-y-2 text-gray-300">
                {problem.constraints.split('\n').map((constraint: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>{constraint.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProblemStatement;