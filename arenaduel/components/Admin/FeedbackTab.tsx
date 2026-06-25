// app/admin/dashboard/components/tabs/FeedbackTab.tsx
import React from 'react';
import { AlertTriangle, DownloadCloud, CheckCircle, MoreVertical, Eye, Mail } from 'lucide-react';
import FeedbackItem from './FeedbackItem';

interface FeedbackTabProps {
  feedback: any[];
  onResolveFeedback: (feedbackId: number) => void;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ feedback, onResolveFeedback }) => {
  const handleExportData = () => {
    console.log('Exporting feedback data');
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Feedback Reports
        </h2>
        <div className="flex items-center gap-3">
          <select className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-gray-600 hover:to-gray-500 transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-700">
        {feedback.map((item) => (
          <FeedbackItem 
            key={item.id} 
            feedback={item} 
            onResolve={onResolveFeedback}
          />
        ))}
      </div>
    </div>
  );
};

export default FeedbackTab;