// app/admin/dashboard/components/modals/TestCaseModal.tsx
import React, { useState } from 'react';
import { X, FileInput, FileOutput } from 'lucide-react';
import { Problem, TestCase } from './types';

interface TestCaseModalProps {
  problem: Problem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problemId: number, testCase: TestCase) => Promise<void>;
}

const TestCaseModal: React.FC<TestCaseModalProps> = ({ problem, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    input: '',
    output: '',
    isSample: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.input.trim() || !formData.output.trim()) {
      alert('Both input and output are required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(problem.problemID, {
        problemId: problem.problemID,
        ...formData,
      });
      setFormData({ input: '', output: '', isSample: false });
      onClose();
    } catch (error) {
      console.error('Error adding test case:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl">
        <div className="border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Test Case</h2>
            <p className="text-gray-400 mt-1">
              For problem: <span className="text-indigo-400 font-medium">{problem.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                <FileInput className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Input Data</h3>
                <p className="text-sm text-gray-400">Test input for the problem</p>
              </div>
            </div>
            <textarea
              value={formData.input}
              onChange={(e) => setFormData(prev => ({ ...prev, input: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter test input..."
              required
            />
          </div>

          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                <FileOutput className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Expected Output</h3>
                <p className="text-sm text-gray-400">Expected output for the given input</p>
              </div>
            </div>
            <textarea
              value={formData.output}
              onChange={(e) => setFormData(prev => ({ ...prev, output: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter expected output..."
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl">
            <input
              type="checkbox"
              id="isSample"
              checked={formData.isSample}
              onChange={(e) => setFormData(prev => ({ ...prev, isSample: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isSample" className="text-gray-300">
              This is a sample test case (visible to users)
            </label>
          </div>

          <div className="border-t border-gray-700 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Test Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseModal;