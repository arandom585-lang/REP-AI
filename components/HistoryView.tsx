'use client';

import React, { useState } from 'react';
import { WorkoutSession } from '@/lib/types';
import { Clock, ChevronDown, ChevronUp, Dumbbell, Play } from 'lucide-react';

interface HistoryViewProps {
  history: WorkoutSession[];
  onStartNewWorkout: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onStartNewWorkout,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    history[0]?.id || null
  );

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) {
      return `${mins} min`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* View Header */}
      <div className="space-y-1 pb-6 border-b border-[#E8E5DF]">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#282722]">
          Workout History
        </h1>
        <p className="text-xs sm:text-sm text-[#77756E]">
          Past recorded sessions, logged sets, weights, and durations.
        </p>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-xl border border-dashed border-[#E8E5DF] bg-[#FFFFFF] p-8">
          <div className="h-10 w-10 rounded-full bg-[#F8F7F4] border border-[#E8E5DF] text-[#77756E] mx-auto flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-[#282722]">No workouts logged yet</h3>
            <p className="text-xs text-[#77756E] max-w-sm mx-auto">
              Start your first session from your workout plan to record your weights, completed reps, and workout duration.
            </p>
          </div>
          <button
            onClick={onStartNewWorkout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium tracking-tight transition-all shadow-[0_1px_2px_rgba(199,101,66,0.15)]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Go to Workout Plan</span>
          </button>
        </div>
      ) : (
        /* History Sessions List */
        <div className="space-y-3">
          {history.map(session => {
            const isExpanded = expandedSessionId === session.id;
            const completedSets = session.exercises.reduce(
              (acc, curr) => acc + curr.sets.filter(s => s.completed).length,
              0
            );
            const totalSets = session.exercises.reduce(
              (acc, curr) => acc + curr.sets.length,
              0
            );

            return (
              <div
                key={session.id}
                className="rounded-xl border border-[#E8E5DF] bg-[#FFFFFF] transition-all overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                {/* Session Card Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(session.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-[#F8F7F4]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-medium text-[#282722]">
                        {session.dayTitle}
                      </h2>
                      <span className="text-[11px] text-[#77756E] font-mono">
                        {session.formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#77756E]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#C76542]" />
                        <span>{formatDuration(session.durationSeconds)}</span>
                      </div>
                      <span>·</span>
                      <span>
                        {completedSets} of {totalSets} sets logged ({session.exercises.length} exercises)
                      </span>
                    </div>
                  </div>

                  <div className="text-[#77756E]">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Session Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E8E5DF] space-y-4 animate-fadeIn">
                    {session.notes && (
                      <div className="p-2.5 rounded-lg bg-[#F8F7F4] text-xs text-[#282722]">
                        <span className="font-medium text-[#77756E] block mb-0.5">Notes:</span>
                        {session.notes}
                      </div>
                    )}

                    <div className="space-y-3">
                      {session.exercises.map((exercise, exIdx) => {
                        const loggedSets = exercise.sets.filter(s => s.completed || s.actualWeight);

                        return (
                          <div
                            key={exIdx}
                            className="p-3 rounded-lg border border-[#E8E5DF] bg-[#F8F7F4]/40 space-y-2"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-[#282722]">
                                {exercise.exerciseName}
                              </span>
                              <span className="text-[#77756E] text-[11px]">
                                {exercise.targetMuscle}
                              </span>
                            </div>

                            {/* Sets breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                              {loggedSets.map((set, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="px-2.5 py-1.5 rounded bg-[#FFFFFF] border border-[#E8E5DF] text-[11px]"
                                >
                                  <span className="text-[#77756E] block">Set {set.setNumber}</span>
                                  <span className="font-mono font-medium text-[#282722]">
                                    {set.actualWeight ? set.actualWeight : 'BW'} × {set.actualReps} reps
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

