'use client';

import React from 'react';
import { ActiveView } from '@/lib/types';
import { Calendar, Dumbbell, History, MessageSquare, RotateCcw, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  hasPlan: boolean;
  hasActiveWorkout: boolean;
  onOpenReset: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  hasPlan,
  hasActiveWorkout,
  onOpenReset,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E8E5DF] bg-[#F8F7F4]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(hasPlan ? 'plan' : 'welcome')}
            className="flex items-center gap-2 text-left group transition-opacity hover:opacity-80"
          >
            <span className="h-5 w-5 rounded bg-[#C76542] flex items-center justify-center text-white text-[10px] font-semibold tracking-tighter">
              R
            </span>
            <span className="font-semibold tracking-tight text-[#282722] text-sm">
              REP AI
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'plan'
                  ? 'bg-[#FFFFFF] text-[#282722] border border-[#E8E5DF] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  : 'text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => onNavigate('tracker')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'tracker'
                  ? 'bg-[#FFFFFF] text-[#282722] border border-[#E8E5DF] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  : 'text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9]'
              }`}
            >
              <Dumbbell className="h-3.5 w-3.5" />
              <span>Workout</span>
              {hasActiveWorkout && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#C76542] absolute top-1.5 right-1.5 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'history'
                  ? 'bg-[#FFFFFF] text-[#282722] border border-[#E8E5DF] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  : 'text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9]'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentView === 'chat'
                  ? 'bg-[#FFFFFF] text-[#282722] border border-[#E8E5DF] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  : 'text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9]'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>AI Chat</span>
            </button>
          </nav>
        </div>

        {/* Right side understated actions */}
        <div className="flex items-center gap-2">
          {hasPlan && currentView !== 'onboarding' && (
            <button
              onClick={() => onNavigate('onboarding')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9] rounded-md transition-colors"
              title="Edit Profile & Routine"
            >
              <Sparkles className="h-3 w-3 text-[#C76542]" />
              <span>New Plan</span>
            </button>
          )}

          <button
            onClick={onOpenReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9] rounded-md transition-colors"
            title="Reset Stored Data"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-[#E8E5DF] bg-[#FFFFFF] px-2 py-1.5 flex justify-around">
        <button
          onClick={() => onNavigate('plan')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            currentView === 'plan' ? 'text-[#C76542]' : 'text-[#77756E]'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Plan</span>
        </button>

        <button
          onClick={() => onNavigate('tracker')}
          className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            currentView === 'tracker' ? 'text-[#C76542]' : 'text-[#77756E]'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Workout</span>
          {hasActiveWorkout && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#C76542] absolute top-1 right-3" />
          )}
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            currentView === 'history' ? 'text-[#C76542]' : 'text-[#77756E]'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            currentView === 'chat' ? 'text-[#C76542]' : 'text-[#77756E]'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>AI Chat</span>
        </button>
      </div>
    </header>
  );
};

