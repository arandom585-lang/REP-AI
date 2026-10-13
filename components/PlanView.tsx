'use client';

import React, { useState } from 'react';
import { WorkoutPlan, DayWorkout } from '@/lib/types';
import {
  Calendar,
  Clock,
  Play,
  MessageSquare,
  ArrowRightLeft,
  Check,
  Info,
  SlidersHorizontal,
  Printer
} from 'lucide-react';

interface PlanViewProps {
  plan: WorkoutPlan;
  onStartWorkout: (day: DayWorkout) => void;
  onAskAI: (initialQuestion?: string) => void;
  onEditPlan: () => void;
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  onStartWorkout,
  onAskAI,
  onEditPlan,
  onUpdatePlan,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(
    plan.days[0]?.id || ''
  );
  const [swappingExerciseId, setSwappingExerciseId] = useState<string | null>(null);

  const activeDay = plan.days.find(d => d.id === selectedDayId) || plan.days[0];

  const handleToggleExerciseCheck = (exerciseId: string) => {
    const updatedPlan: WorkoutPlan = {
      ...plan,
      days: plan.days.map(day => {
        if (day.id !== activeDay?.id) return day;
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, completed: !ex.completed };
          }),
        };
      }),
    };
    onUpdatePlan(updatedPlan);
  };

  const handleSwapExercise = (exerciseId: string, substitutionName: string) => {
    const currentExercise = activeDay?.exercises.find(e => e.id === exerciseId);
    if (!currentExercise) return;

    const oldName = currentExercise.name;
    const updatedPlan: WorkoutPlan = {
      ...plan,
      days: plan.days.map(day => {
        if (day.id !== activeDay?.id) return day;
        return {
          ...day,
          exercises: day.exercises.map(ex => {
            if (ex.id !== exerciseId) return ex;
            return {
              ...ex,
              name: substitutionName,
              substitutions: [oldName, ...ex.substitutions.filter(s => s !== substitutionName)],
            };
          }),
        };
      }),
    };

    onUpdatePlan(updatedPlan);
    setSwappingExerciseId(null);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Plan Header */}
      <div className="space-y-4 pb-6 border-b border-[#E8E5DF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#77756E] font-medium">
              <span>REP AI Personalized Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#282722]">
              {plan.title}
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onAskAI(`Can you give me an overview and tips for my ${activeDay?.dayName}?`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-xs font-medium text-[#282722] transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#77756E]" />
              <span>Ask AI</span>
            </button>

            <button
              onClick={onEditPlan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-xs font-medium text-[#77756E] hover:text-[#282722] transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Edit routine</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-xs font-medium text-[#77756E] hover:text-[#282722] transition-colors"
              title="Print Plan"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-[#77756E] leading-relaxed max-w-2xl font-normal">
          {plan.summary}
        </p>

        {/* Plan Metadata Tags */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#77756E] pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#C76542]" />
            <span>{plan.daysPerWeek} training days per week</span>
          </div>

          <span className="text-[#E8E5DF]">·</span>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#C76542]" />
            <span>~{plan.sessionDuration} per session</span>
          </div>

          <span className="text-[#E8E5DF]">·</span>

          <span className="capitalize">{plan.experienceLevel} level</span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8E5DF]">
          {plan.days.map(day => {
            const isSelected = day.id === activeDay?.id;
            const completedCount = day.exercises.filter(e => e.completed).length;
            const totalCount = day.exercises.length;

            return (
              <button
                key={day.id}
                onClick={() => {
                  setSelectedDayId(day.id);
                  setSwappingExerciseId(null);
                }}
                className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium rounded-lg transition-all text-left border ${
                  isSelected
                    ? 'border-[#C76542] bg-[#FFFFFF] text-[#282722] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'border-transparent text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9]'
                }`}
              >
                <div className="font-semibold">{day.dayName}</div>
                <div className="text-[11px] text-[#77756E] font-normal truncate max-w-[130px]">
                  {day.focus}
                </div>
                {completedCount > 0 && (
                  <div className="text-[10px] text-[#C76542] pt-0.5">
                    {completedCount}/{totalCount} done
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day View */}
        {activeDay && (
          <div className="space-y-6">
            {/* Day Title & Start Workout CTA */}
            <div className="p-4 rounded-xl border border-[#E8E5DF] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#C76542]">
                  {activeDay.dayName}
                </div>
                <h2 className="text-lg font-medium text-[#282722]">
                  {activeDay.focus}
                </h2>
                <p className="text-xs text-[#77756E]">
                  {activeDay.exercises.length} prescribed movements · Estimated time: {activeDay.estimatedMinutes} minutes
                </p>
              </div>

              <button
                onClick={() => onStartWorkout(activeDay)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium tracking-tight transition-all shadow-[0_1px_2px_rgba(199,101,66,0.15)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start workout</span>
              </button>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#77756E] px-1">
                <span>Exercises & Prescribed Sets</span>
                <span>Click checkmark when finished</span>
              </div>

              <div className="space-y-3">
                {activeDay.exercises.map((exercise, index) => {
                  const isChecked = !!exercise.completed;
                  const isSwapping = swappingExerciseId === exercise.id;

                  return (
                    <div
                      key={exercise.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[#E8E5DF] bg-[#F8F7F4]/80 opacity-75'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Completion Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleExerciseCheck(exercise.id)}
                            className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#C76542] border-[#C76542] text-white'
                                : 'border-[#E8E5DF] hover:border-[#C76542] bg-[#FFFFFF]'
                            }`}
                            aria-label={`Mark ${exercise.name} complete`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5" />}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-[#77756E]">#{index + 1}</span>
                              <h3 className={`text-sm font-medium text-[#282722] ${isChecked ? 'line-through text-[#77756E]' : ''}`}>
                                {exercise.name}
                              </h3>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-[#F8F7F4] border border-[#E8E5DF] text-[#77756E]">
                                {exercise.targetMuscle}
                              </span>
                            </div>

                            {/* Sets · Reps · Rest */}
                            <div className="flex items-center gap-3 text-xs text-[#282722] font-normal pt-0.5">
                              <span className="font-medium text-[#C76542]">{exercise.sets} sets</span>
                              <span className="text-[#E8E5DF]">·</span>
                              <span>{exercise.reps}</span>
                              <span className="text-[#E8E5DF]">·</span>
                              <span className="text-[#77756E]">Rest: {exercise.restSeconds}s</span>
                            </div>

                            {/* Brief Instructions */}
                            <p className="text-xs text-[#77756E] leading-relaxed pt-1 max-w-2xl font-normal">
                              {exercise.instructions}
                            </p>
                          </div>
                        </div>

                        {/* Substitution Toggle */}
                        {exercise.substitutions && exercise.substitutions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSwappingExerciseId(isSwapping ? null : exercise.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#77756E] hover:text-[#282722] p-1.5 rounded hover:bg-[#F0EEE9] transition-colors"
                            title="Substitute this exercise"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            <span className="hidden sm:inline">Swap</span>
                          </button>
                        )}
                      </div>

                      {/* Substitution Drawer */}
                      {isSwapping && exercise.substitutions && (
                        <div className="mt-3 pt-3 border-t border-[#E8E5DF] space-y-2 animate-fadeIn">
                          <span className="text-[11px] font-medium text-[#282722] block">
                            Substitute with an alternative:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {exercise.substitutions.map(sub => (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => handleSwapExercise(exercise.id, sub)}
                                className="px-2.5 py-1 text-xs rounded border border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#C76542] hover:text-[#C76542] text-[#282722] transition-colors"
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Training Principles / Tips */}
            {plan.principles && plan.principles.length > 0 && (
              <div className="p-4 rounded-xl border border-[#E8E5DF] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#282722]">
                  <Info className="h-3.5 w-3.5 text-[#C76542]" />
                  <span>Program Guidance</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#77756E] list-disc list-inside">
                  {plan.principles.map((principle, i) => (
                    <li key={i} className="leading-relaxed">
                      {principle}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

