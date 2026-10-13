'use client';

import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  ActiveWorkoutState,
  ChatMessage,
  DayWorkout,
} from '@/lib/types';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredPlan,
  saveStoredPlan,
  getStoredHistory,
  addWorkoutToHistory,
  getStoredActiveWorkout,
  saveStoredActiveWorkout,
  getStoredChat,
  saveStoredChat,
  clearAllLocalData,
} from '@/lib/storage';
import { generateWorkoutPlan } from '@/lib/aiService';
import { generateUniqueId, getCurrentTimestamp } from '@/lib/idHelper';
import { Navigation } from '@/components/Navigation';
import { WelcomeView } from '@/components/WelcomeView';
import { OnboardingView } from '@/components/OnboardingView';
import { PlanView } from '@/components/PlanView';
import { TrackerView } from '@/components/TrackerView';
import { HistoryView } from '@/components/HistoryView';
import { ChatView } from '@/components/ChatView';
import { ResetModal } from '@/components/ResetModal';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ActiveView>('welcome');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Modal & Transition States
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [selectedDayForTracker, setSelectedDayForTracker] = useState<DayWorkout | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const loadedProfile = getStoredProfile();
      const loadedPlan = getStoredPlan();
      const loadedHistory = getStoredHistory();
      const loadedActiveWorkout = getStoredActiveWorkout();
      const loadedChat = getStoredChat();

      setProfile(loadedProfile);
      setPlan(loadedPlan);
      setHistory(loadedHistory);
      setActiveWorkout(loadedActiveWorkout);
      setChatMessages(loadedChat);

      // Initial view heuristic
      if (loadedActiveWorkout) {
        setCurrentView('tracker');
      } else if (loadedPlan) {
        setCurrentView('plan');
      } else {
        setCurrentView('welcome');
      }

      setIsHydrated(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  // Handlers
  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setIsGeneratingPlan(true);
    try {
      setProfile(newProfile);
      saveStoredProfile(newProfile);

      const newPlan = await generateWorkoutPlan(newProfile);
      setPlan(newPlan);
      saveStoredPlan(newPlan);

      setCurrentView('plan');
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleStartWorkout = (day: DayWorkout) => {
    setSelectedDayForTracker(day);
    setCurrentView('tracker');
  };

  const handleSaveWorkoutSession = (session: WorkoutSession) => {
    const updatedHistory = addWorkoutToHistory(session);
    setHistory(updatedHistory);
    setActiveWorkout(null);
    saveStoredActiveWorkout(null);
    setSelectedDayForTracker(null);
    setCurrentView('history');
  };

  const handleCancelWorkout = () => {
    setCurrentView('plan');
  };

  const handleAskAI = (initialQuestion?: string) => {
    if (initialQuestion) {
      const userMsg: ChatMessage = {
        id: generateUniqueId('msg_user'),
        sender: 'user',
        text: initialQuestion,
        timestamp: getCurrentTimestamp(),
      };
      const updatedMessages = [...chatMessages, userMsg];
      setChatMessages(updatedMessages);
      saveStoredChat(updatedMessages);
    }
    setCurrentView('chat');
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setPlan(updatedPlan);
    saveStoredPlan(updatedPlan);
  };

  const handleUpdateChat = (messages: ChatMessage[]) => {
    setChatMessages(messages);
    saveStoredChat(messages);
  };

  const handleResetData = () => {
    clearAllLocalData();
    setProfile(null);
    setPlan(null);
    setHistory([]);
    setActiveWorkout(null);
    setChatMessages([]);
    setSelectedDayForTracker(null);
    setCurrentView('welcome');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] text-[#77756E]">
        <div className="flex items-center gap-2 text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-[#C76542]" />
          <span>Loading REP AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#282722]">
      {/* Top Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        hasPlan={!!plan}
        hasActiveWorkout={!!activeWorkout}
        onOpenReset={() => setIsResetOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Loading Overlay during Plan Generation */}
        {isGeneratingPlan ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-10 w-10 rounded-full bg-[#C76542]/10 flex items-center justify-center text-[#C76542]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-medium text-[#282722]">
                Synthesizing your workout plan
              </h2>
              <p className="text-xs text-[#77756E] max-w-sm">
                Balancing progressive overload, movement selection, and joint mechanics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'welcome' && (
              <WelcomeView
                onStartOnboarding={() => setCurrentView('onboarding')}
                onOpenChat={() => setCurrentView('chat')}
                hasExistingPlan={!!plan}
                onViewPlan={() => setCurrentView('plan')}
              />
            )}

            {currentView === 'onboarding' && (
              <OnboardingView
                initialProfile={profile}
                onComplete={handleOnboardingComplete}
                onCancel={() => setCurrentView(plan ? 'plan' : 'welcome')}
              />
            )}

            {currentView === 'plan' && plan && (
              <PlanView
                plan={plan}
                onStartWorkout={handleStartWorkout}
                onAskAI={handleAskAI}
                onEditPlan={() => setCurrentView('onboarding')}
                onUpdatePlan={handleUpdatePlan}
              />
            )}

            {currentView === 'plan' && !plan && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <p className="text-sm text-[#77756E]">
                  You have not created a workout plan yet.
                </p>
                <button
                  onClick={() => setCurrentView('onboarding')}
                  className="px-4 py-2 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium"
                >
                  Create workout plan
                </button>
              </div>
            )}

            {currentView === 'tracker' && (
              <TrackerView
                initialDay={selectedDayForTracker || plan?.days[0]}
                activeState={activeWorkout}
                onSaveSession={handleSaveWorkoutSession}
                onCancelWorkout={handleCancelWorkout}
              />
            )}

            {currentView === 'history' && (
              <HistoryView
                history={history}
                onStartNewWorkout={() => setCurrentView('plan')}
              />
            )}

            {currentView === 'chat' && (
              <ChatView
                messages={chatMessages}
                onUpdateMessages={handleUpdateChat}
                profile={profile}
                plan={plan}
                history={history}
                onApplyPlanUpdate={handleUpdatePlan}
                onNavigateToPlan={() => setCurrentView('plan')}
                onStartOnboarding={() => setCurrentView('onboarding')}
              />
            )}
          </>
        )}
      </main>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirmReset={handleResetData}
      />
    </div>
  );
}
