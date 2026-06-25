// app/admin/dashboard/components/cards/FeedbackCard.tsx
import React from 'react';
import { Mail } from 'lucide-react';

interface FeedbackCardProps {
  feedback: any;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  return (
    <div className="p-3 bg-gray-800/50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-white">{feedback.title}</div>
        <span className={`px-2 py-1 text-xs rounded ${
          feedback.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
          feedback.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
          feedback.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {feedback.severity}
        </span>
      </div>
      <div className="text-sm text-gray-400 mb-2">{feedback.description.slice(0, 100)}...</div>
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Mail className="w-3 h-3" />
        {feedback.email}
      </div>
    </div>
  );
};

export default FeedbackCard;