// app/admin/dashboard/components/tabs/ProblemsTab.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload, 
  Download,
  Eye,
  FolderOpen,
  FileInput,
  FileOutput
} from 'lucide-react';

import { Problem, TestCase } from './types';
import ProblemModal from './ProblemModal';
import TestCaseModal from './TestCaseModal';
import BulkUploadModal from './BulkUploadModal';


interface ProblemsTabProps {
  problems: Problem[];
  onProblemCreate: (problem: any) => Promise<void>;
  onProblemUpdate: (id: number, problem: any) => Promise<void>;
  onProblemDelete: (id: number) => Promise<void>;
  onTestCaseAdd: (problemId: number, testCase: TestCase) => Promise<void>;
  onTestCaseDelete: (problemId: number, testCaseId: number) => Promise<void>;
  onTestCasesBulkUpload: (problemId: number, files: File[]) => Promise<void>;
}

const ProblemsTab: React.FC<ProblemsTabProps> = ({ 
  problems, 
  onProblemCreate, 
  onProblemUpdate, 
  onProblemDelete,
  onTestCaseAdd,
  onTestCaseDelete,
  onTestCasesBulkUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.statement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProblem = () => {
    setEditingProblem(null);
    setIsProblemModalOpen(true);
  };

  const handleEditProblem = (problem: any) => {

    console.log(problem);
    setEditingProblem(problem);
    setIsProblemModalOpen(true);
  };

  const handleAddTestCase = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsTestCaseModalOpen(true);
  };

  const handleBulkUpload = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsBulkUploadOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-400" />
                Problem Management
              </h2>
              <p className="text-gray-400 mt-1">
                Create, edit, and manage coding problems and test cases
              </p>
            </div>
            <button
              onClick={handleCreateProblem}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Problem
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select className="bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Problems</option>
              <option value="recent">Recently Added</option>
              <option value="popular">Most Used</option>
            </select>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <div 
              key={problem.problemID} 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{problem.title}</h3>
                      <div className="text-sm text-gray-400">ID: {problem.problemID}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {problem.statement.substring(0, 150)}...
                  </p>
                </div>
              </div>

              {/* Problem Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Test Cases</div>
                  <div className="text-lg font-bold text-white">
                    {problem.hiddenTestCasesCount || 0}
                  </div>
                </div>
                {/* <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Samples</div>
                  <div className="text-lg font-bold text-white">
                    {problem.sampleTestCases?.length || 0}
                  </div>
                </div> */}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditProblem(problem)}
                  className="flex-1 px-3 py-2 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleAddTestCase(problem)}
                  className="flex-1 px-3 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Test
                </button>
                {/* <button
                  onClick={() => handleBulkUpload(problem)}
                  className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Bulk Upload Test Cases"
                >
                  <Upload className="w-4 h-4" />
                </button> */}
                <button
                  onClick={() => onProblemDelete(problem.id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  title="Delete Problem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-700/50 flex items-center justify-center">
              <FileText className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Problems Found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'Create your first coding problem to get started'}
            </p>
            <button
              onClick={handleCreateProblem}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create First Problem
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isProblemModalOpen && (
        <ProblemModal
          problem={editingProblem}
          isOpen={isProblemModalOpen}
          onClose={() => setIsProblemModalOpen(false)}
          onSubmit={editingProblem ? onProblemUpdate : onProblemCreate}
        />
      )}

      {isTestCaseModalOpen && selectedProblem && (
        <TestCaseModal
          problem={selectedProblem}
          isOpen={isTestCaseModalOpen}
          onClose={() => setIsTestCaseModalOpen(false)}
          onSubmit={onTestCaseAdd}
        />
      )}

      {isBulkUploadOpen && selectedProblem && (
        <BulkUploadModal
          problem={selectedProblem}
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          onSubmit={onTestCasesBulkUpload}
        />
      )}
    </>
  );
};

export default ProblemsTab;