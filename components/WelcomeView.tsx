'use client';

import React from 'react';
import { ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';

interface WelcomeViewProps {
  onStartOnboarding: () => void;
  onOpenChat: () => void;
  hasExistingPlan: boolean;
  onViewPlan: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onStartOnboarding,
  onOpenChat,
  hasExistingPlan,
  onViewPlan,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 md:py-24">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#77756E] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C76542]" />
          <span>Calm, personalized training intelligence</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#282722] leading-[1.15]">
            A workout plan that fits you.
          </h1>
          <p className="text-base sm:text-lg text-[#77756E] max-w-xl mx-auto font-normal leading-relaxed">
            Tell us about your goals, your routine, and your experience. We&apos;ll help you build a workout plan that works for you.
          </p>
        </div>

        {/* Primary CTA Block */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartOnboarding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-sm font-medium tracking-tight transition-all shadow-[0_1px_2px_rgba(199,101,66,0.15)] hover:shadow-[0_2px_4px_rgba(199,101,66,0.25)]"
          >
            <span>Create my plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {hasExistingPlan ? (
            <button
              onClick={onViewPlan}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EEE9] text-[#282722] border border-[#E8E5DF] text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-[#C76542]" />
              <span>View current plan</span>
            </button>
          ) : (
            <button
              onClick={onOpenChat}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F0EEE9] text-[#77756E] hover:text-[#282722] border border-[#E8E5DF] text-sm font-medium transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Talk with AI</span>
            </button>
          )}
        </div>

        {/* Small Note */}
        <p className="text-xs text-[#77756E] tracking-tight">
          Personalized training. One step at a time.
        </p>

        {/* Feature Highlights - Restrained, clean text list */}
        <div className="pt-12 sm:pt-16 border-t border-[#E8E5DF] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#282722]">
              Adaptive Volume
            </h3>
            <p className="text-xs text-[#77756E] leading-relaxed">
              Programmed to match your schedule, whether you have 2 days or 6 days a week.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#282722]">
              Injury Conscious
            </h3>
            <p className="text-xs text-[#77756E] leading-relaxed">
              Automatic substitutions for lower back, shoulder, or knee sensitivities.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#282722]">
              Focused Tracking
            </h3>
            <p className="text-xs text-[#77756E] leading-relaxed">
              Distraction-free execution mode to record reps, weights, and rest periods cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

