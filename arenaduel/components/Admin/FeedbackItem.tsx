// app/admin/dashboard/components/cards/FeedbackItem.tsx
import React from 'react';
import { CheckCircle, MoreVertical, Eye, Mail } from 'lucide-react';

interface FeedbackItemProps {
  feedback: any;
  onResolve: (feedbackId: number) => void;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback, onResolve }) => {
  
  console.log(feedback);
  return (
    <div key={feedback.id} className="p-6 hover:bg-gray-800/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              feedback.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              feedback.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              feedback.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {feedback.severity.toUpperCase()}
            </div>
            <div className="px-3 py-1 rounded-full text-sm bg-gray-700/50 text-gray-400">
              {feedback.issueType}
            </div>
            {feedback.anonymous && (
              <div className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
                Anonymous
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{feedback.title}</h3>
          <p className="text-gray-300 mb-4">{feedback.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-2">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-blue-400">{feedback.email}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {feedback.includeScreenshot && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Screenshot attached
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={feedback.resolved}
            onClick={() => onResolve(feedback.id)}
            className={feedback.resolved ? 
              "px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
            :
            "px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-500 transition-all flex items-center gap-2"
          }
          >
            {feedback.resolved && <CheckCircle className="w-4 h-4" />}
            {feedback.resolved ? 'Resolved' : 'Mark Resolved'}
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-500 transition-all">
            Reply
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItem;