'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E5DF] bg-[#FFFFFF] p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#C76542]/10 text-[#C76542] flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#282722]">
                Reset Local Data
              </h2>
              <span className="text-xs text-[#77756E]">
                Clear all stored plans and logs
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#77756E] hover:text-[#282722]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#77756E] leading-relaxed">
          This will delete your personalized profile, generated workout plan, in-progress sessions, workout history logs, and chat messages saved in your browser&apos;s LocalStorage. This action cannot be undone.
        </p>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-xs font-medium text-[#77756E] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium tracking-tight transition-colors shadow-sm"
          >
            Reset everything
          </button>
        </div>
      </div>
    </div>
  );
};

