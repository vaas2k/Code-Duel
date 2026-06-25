// components/MatchAbortedModal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { X, Trophy, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface MatchAbortedModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponentName?: string;
  onReturnHome?: () => void;
  onFindNewMatch?: () => void;
}

const MatchAbortedModal: React.FC<MatchAbortedModalProps> = ({
  isOpen,
  onClose,
  opponentName = 'Opponent',
  onReturnHome,
  onFindNewMatch,
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
    //   const timer = setTimeout(() => setIsVisible(false), 300);
    //   return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleReturnHome = () => {
    onClose();
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push('/');
    }
  };

  const handleFindNewMatch = () => {
    onClose();
    if (onFindNewMatch) {
      onFindNewMatch();
    } else {
      router.push('/duel');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Victory by Forfeit!</h2>
                <p className="text-sm text-slate-400 mt-1">Match has ended</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">
              You Win!
            </h3>
            <p className="text-slate-400 mb-4">
              <span className="font-medium text-red-400">{opponentName}</span> has abandoned the match
            </p>

            {/* Warning Box */}
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-red-300 mb-1">Match Aborted</p>
                  <p className="text-sm text-red-200/80">
                    Your opponent left the match. You have been awarded the victory.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="text-2xl font-bold text-green-400">+25</div>
                <div className="text-xs text-slate-400 mt-1">Rating Points</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="text-2xl font-bold text-blue-400">1</div>
                <div className="text-xs text-slate-400 mt-1">Win Streak</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* <Button
              onClick={handleFindNewMatch}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Find New Match
            </Button> */}
            
            <Button
              onClick={handleReturnHome}
              variant="outline"
              className="w-full border-slate-600 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAbortedModal;