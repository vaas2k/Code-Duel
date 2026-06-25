// app/admin/dashboard/components/modals/BulkUploadModal.tsx
import React, { useState, useRef } from 'react';
import { X, Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import { Problem } from './types';

interface BulkUploadModalProps {
  problem: Problem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (problemId: number, files: File[]) => Promise<void>;
}

interface UploadedFile {
  file: File;
  type: 'input' | 'output';
  pairId: number;
  status: 'pending' | 'paired' | 'error';
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ problem, isOpen, onClose, onSubmit }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      const match = file.name.match(/(\d+)\.(in|out)/);
      if (match) {
        const [, number, type] = match;
        newFiles.push({
          file,
          type: type as 'input' | 'output',
          pairId: parseInt(number),
          status: 'pending'
        });
      }
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Auto-pair files
    pairFiles([...uploadedFiles, ...newFiles]);
  };

  const pairFiles = (files: UploadedFile[]) => {
    const paired = new Set<number>();
    const updatedFiles = files.map(file => {
      const partner = files.find(f => 
        f.pairId === file.pairId && 
        f.type !== file.type && 
        f.file.name !== file.file.name
      );
      
      if (partner) {
        paired.add(file.pairId);
        return { ...file, status: 'paired' as const };
      }
      return file;
    });

    setUploadedFiles(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(problem.id, uploadedFiles.map(f => f.file));
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pairedTestCases = uploadedFiles.reduce((acc, file) => {
    if (file.status === 'paired') {
      acc.add(file.pairId);
    }
    return acc;
  }, new Set<number>());

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 w-full max-w-3xl">
        <div className="border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Bulk Upload Test Cases</h2>
            <p className="text-gray-400 mt-1">
              Upload multiple .in/.out files for problem: <span className="text-indigo-400">{problem.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-indigo-500/50 hover:bg-gray-800/30 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Drag & Drop Test Case Files</h3>
            <p className="text-gray-400 mb-4">
              Upload .in and .out files with matching numbers (1.in, 1.out, 2.in, 2.out, etc.)
            </p>
            <button className="px-6 py-2.5 bg-gray-700/50 text-white rounded-xl hover:bg-gray-700 transition-colors">
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".in,.out"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File Requirements */}
          <div className="bg-gray-800/30 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              File Naming Requirements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <code className="text-sm font-mono text-gray-300">1.in</code>
                  <span className="text-xs text-gray-400">Input for test case 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <code className="text-sm font-mono text-gray-300">1.out</code>
                  <span className="text-xs text-gray-400">Output for test case 1</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <code className="text-sm font-mono text-gray-300">2.in</code>
                  <span className="text-xs text-gray-400">Input for test case 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <code className="text-sm font-mono text-gray-300">2.out</code>
                  <span className="text-xs text-gray-400">Output for test case 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Selected Files ({uploadedFiles.length})</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-400">Paired: {pairedTestCases.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-xs text-gray-400">Unpaired: {uploadedFiles.length - (pairedTestCases.size * 2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      file.status === 'paired' ? 'bg-green-500/10' : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <File className={`w-5 h-5 ${
                        file.status === 'paired' ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{file.file.name}</div>
                        <div className="text-xs text-gray-400">
                          Test case {file.pairId} • {file.type === 'input' ? 'Input' : 'Output'} • 
                          {(file.file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {file.status === 'paired' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-700 pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {pairedTestCases.size} test cases ready to upload
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || pairedTestCases.size === 0}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {pairedTestCases.size} Test Cases
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;