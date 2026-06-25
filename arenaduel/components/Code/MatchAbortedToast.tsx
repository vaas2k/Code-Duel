// components/MatchAbortedToast.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Trophy, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchAbortedToastProps {
  isOpen: boolean;
  opponentName?: string;
  onClose: () => void;
  onAction?: () => void;
}

const MatchAbortedToast: React.FC<MatchAbortedToastProps> = ({
  isOpen,
  opponentName = 'Opponent',
  onClose,
  onAction,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl shadow-2xl backdrop-blur-sm transform transition-all duration-300 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    Victory!
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                      +25 RP
                    </span>
                  </h4>
                  <p className="text-sm text-slate-300 mt-1">
                    <span className="text-red-400 font-medium">{opponentName}</span> abandoned the match
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-300">
                  Match aborted. You have been awarded the win.
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="text-xs border-slate-600 hover:bg-slate-700"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={onAction}
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  Find New Match
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAbortedToast;