// app/admin/dashboard/components/modals/ProblemModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Problem, ProblemFormData } from './types';

interface ProblemModalProps {
  problem: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: any;
}

const ProblemModal: React.FC<ProblemModalProps> = ({ problem, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    url: '',
    statement: '',
    inputDescription: '',
    outputDescription: '',
    constraints: '',
    sampleTestCases: [{ input: '', output: '' }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title,
        url: problem.url || '',
        statement: problem.statement,
        inputDescription: problem.input,
        outputDescription: problem.output,
        constraints: problem.constraints,
        sampleTestCases: problem.sampleTestCases || [{ input: '', output: '' }],
      });
    } else {
      setFormData({
        title: '',
        url: '',
        statement: '',
        inputDescription: '',
        outputDescription: '',
        constraints: '',
        sampleTestCases: [{ input: '', output: '' }],
      });
    }
  }, [problem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {

      

      await onSubmit(problem ? { id: problem.id, ...formData } : formData);
      onClose();
    } catch (error) {
      console.error('Error saving problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleTestCase = () => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: [...prev.sampleTestCases, { input: '', output: '' }]
    }));
  };

  const handleRemoveSampleTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sampleTestCases: prev.sampleTestCases.filter((_, i) => i !== index)
    }));
  };

  const handleSampleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const newTestCases = [...formData.sampleTestCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData(prev => ({ ...prev, sampleTestCases: newTestCases }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900/95 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {problem ? 'Edit Problem' : 'Create New Problem'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Two Sum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Problem URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., https://leetcode.com/problems/two-sum/"
                />
              </div>
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Problem Statement *
            </label>
            <textarea
              required
              rows={6}
              value={formData.statement}
              onChange={(e) => setFormData(prev => ({ ...prev, statement: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the problem in detail..."
            />
          </div>

          {/* Input/Output Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Input Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.inputDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, inputDescription: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe the input format..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Output Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.outputDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, outputDescription: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe the expected output..."
              />
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Constraints *
            </label>
            <textarea
              required
              rows={3}
              value={formData.constraints}
              onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
            />
          </div>

          {/* Sample Test Cases */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sample Test Cases</h3>
              <button
                type="button"
                onClick={handleAddSampleTestCase}
                className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.sampleTestCases.map((testCase, index) => (
                <div key={index} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      Sample Test Case {index + 1}
                    </span>
                    {formData.sampleTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSampleTestCase(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleSampleTestCaseChange(index, 'input', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Input data..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => handleSampleTestCaseChange(index, 'output', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-gray-900/95 border-t border-gray-700 -mx-6 -mb-6 p-6">
            <div className="flex items-center justify-end gap-3">
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
                    Saving...
                  </>
                ) : (
                  <>
                    {problem ? 'Update Problem' : 'Create Problem'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;