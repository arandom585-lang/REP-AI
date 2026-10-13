'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DayWorkout, WorkoutSession, LoggedExercise, ActiveWorkoutState } from '@/lib/types';
import { saveStoredActiveWorkout } from '@/lib/storage';
import {
  Play,
  Pause,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Timer
} from 'lucide-react';
import { generateUniqueId, getCurrentTimestamp } from '@/lib/idHelper';

interface TrackerViewProps {
  initialDay?: DayWorkout | null;
  activeState?: ActiveWorkoutState | null;
  onSaveSession: (session: WorkoutSession) => void;
  onCancelWorkout: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  initialDay,
  activeState,
  onSaveSession,
  onCancelWorkout,
}) => {
  // If active state exists in storage, resume from it. Otherwise initialize from initialDay.
  const [exercises, setExercises] = useState<LoggedExercise[]>(() => {
    if (activeState?.exercises && activeState.exercises.length > 0) {
      return activeState.exercises;
    }
    if (initialDay) {
      return initialDay.exercises.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: Array.from({ length: ex.sets }).map((_, idx) => ({
          setNumber: idx + 1,
          prescribedReps: ex.reps,
          actualWeight: '',
          actualReps: parseInt(ex.reps.split('–')[0] || ex.reps.split('-')[0] || '10', 10) || 10,
          completed: false,
        })),
      }));
    }
    return [];
  });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(
    activeState?.currentExerciseIndex || 0
  );
  const [isPaused, setIsPaused] = useState<boolean>(activeState?.isPaused || false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    activeState?.elapsedSeconds || 0
  );

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const restDuration = 90;

  // Completion Screen State
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const dayTitle = activeState?.dayTitle || initialDay?.dayName || 'Custom Workout';
  const dayId = activeState?.dayId || initialDay?.id || 'day_active';

  // Stopwatch interval
  useEffect(() => {
    if (isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isCompleted]);

  // Rest countdown timer
  useEffect(() => {
    if (restSecondsRemaining === null || restSecondsRemaining <= 0) return;

    const restTimer = setInterval(() => {
      setRestSecondsRemaining(prev => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(restTimer);
  }, [restSecondsRemaining]);

  const startTimeRef = useRef<number>(activeState?.startTime || 0);

  // Sync state to LocalStorage
  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    if (isCompleted) {
      saveStoredActiveWorkout(null);
      return;
    }

    if (exercises.length > 0) {
      saveStoredActiveWorkout({
        dayId,
        dayTitle,
        planId: initialDay?.id,
        startTime: startTimeRef.current,
        elapsedSeconds,
        isPaused,
        currentExerciseIndex: activeExerciseIndex,
        exercises,
      });
    }
  }, [exercises, isPaused, activeExerciseIndex, isCompleted, dayId, dayTitle, initialDay, elapsedSeconds]);

  // Format MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress calculations
  const totalSets = exercises.reduce((acc, curr) => acc + curr.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, curr) => acc + curr.sets.filter(s => s.completed).length,
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const currentExercise = exercises[activeExerciseIndex];

  // Set field update handlers
  const updateSetWeight = (exerciseIndex: number, setIndex: number, weight: string) => {
    setExercises(prev =>
      prev.map((ex, exIdx) => {
        if (exIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            return { ...set, actualWeight: weight };
          }),
        };
      })
    );
  };

  const updateSetReps = (exerciseIndex: number, setIndex: number, reps: number) => {
    setExercises(prev =>
      prev.map((ex, exIdx) => {
        if (exIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            return { ...set, actualReps: Math.max(0, reps) };
          }),
        };
      })
    );
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const currentSet = exercises[exerciseIndex]?.sets[setIndex];
    const willBeComplete = !currentSet?.completed;

    setExercises(prev =>
      prev.map((ex, exIdx) => {
        if (exIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            return { ...set, completed: willBeComplete };
          }),
        };
      })
    );

    // If set is marked complete, trigger rest timer
    if (willBeComplete) {
      setRestSecondsRemaining(restDuration);
    }
  };

  const handleFinishWorkout = () => {
    setIsCompleted(true);
  };

  const handleConfirmSaveSession = () => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const session: WorkoutSession = {
      id: generateUniqueId('session'),
      dayId,
      dayTitle,
      date: getCurrentTimestamp(),
      formattedDate,
      durationSeconds: elapsedSeconds,
      exercises,
      notes: sessionNotes.trim(),
      completed: true,
    };

    onSaveSession(session);
  };

  if (!currentExercise && !isCompleted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-sm text-[#77756E]">No workout selected.</p>
        <button
          onClick={onCancelWorkout}
          className="px-4 py-2 rounded-lg bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-medium text-[#282722]"
        >
          Return to Workout Plan
        </button>
      </div>
    );
  }

  // Completion View
  if (isCompleted) {
    return (
      <div className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-[#C76542]/10 text-[#C76542] mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#282722]">
            Workout completed
          </h1>
          <p className="text-xs text-[#77756E]">
            Great effort. Your performance and volume metrics have been compiled.
          </p>
        </div>

        {/* Workout Summary Card */}
        <div className="p-5 rounded-xl border border-[#E8E5DF] bg-[#FFFFFF] space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center border-b border-[#E8E5DF] pb-4">
            <div>
              <span className="block text-[11px] text-[#77756E]">Duration</span>
              <span className="text-lg font-semibold text-[#282722] font-mono">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#77756E]">Sets Logged</span>
              <span className="text-lg font-semibold text-[#282722] font-mono">
                {completedSets} / {totalSets}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-[#77756E]">Exercises</span>
              <span className="text-lg font-semibold text-[#282722] font-mono">
                {exercises.length}
              </span>
            </div>
          </div>

          {/* Exercise breakdown preview */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-medium text-[#282722] block">Summary of Exercises:</span>
            <ul className="space-y-1 text-xs text-[#77756E]">
              {exercises.map((ex, i) => {
                const finishedSets = ex.sets.filter(s => s.completed).length;
                return (
                  <li key={i} className="flex justify-between items-center py-0.5">
                    <span className="text-[#282722]">{ex.exerciseName}</span>
                    <span className="font-mono text-[11px] text-[#77756E]">
                      {finishedSets} of {ex.sets.length} sets completed
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Session Notes */}
          <div className="pt-2">
            <label htmlFor="notes-input" className="block text-xs font-medium text-[#282722] mb-1">
              Session reflections / notes (optional)
            </label>
            <textarea
              id="notes-input"
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              placeholder="e.g. Felt strong on chest press, increase dumbbell load next time."
              rows={2}
              className="w-full p-2.5 rounded-lg border border-[#E8E5DF] bg-[#F8F7F4] text-xs text-[#282722] focus:outline-none focus:border-[#C76542]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCompleted(false)}
            className="flex-1 py-2.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-xs font-medium text-[#77756E] transition-colors"
          >
            Review workout
          </button>
          <button
            onClick={handleConfirmSaveSession}
            className="flex-1 py-2.5 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium tracking-tight transition-all shadow-[0_1px_2px_rgba(199,101,66,0.15)]"
          >
            Save to history
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Tracker Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DF]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancelWorkout}
            className="p-1.5 rounded-md hover:bg-[#F0EEE9] text-[#77756E] hover:text-[#282722] transition-colors"
            title="Leave workout"
          >
            <X className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C76542] block">
              Active Session
            </span>
            <h1 className="text-base font-medium text-[#282722] leading-tight">
              {dayTitle}
            </h1>
          </div>
        </div>

        {/* Duration Timer & Pause/Resume */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-mono font-medium text-[#282722]">
            <Clock className="h-3.5 w-3.5 text-[#C76542]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-md border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-[#77756E] hover:text-[#282722] transition-colors"
            title={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#77756E]">
          <span>
            Progress: {completedSets} of {totalSets} sets ({progressPercent}%)
          </span>
          <span>
            Exercise {activeExerciseIndex + 1} of {exercises.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#E8E5DF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C76542] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Rest Countdown Timer Pill (if active) */}
      {restSecondsRemaining !== null && restSecondsRemaining > 0 && (
        <div className="p-3 rounded-lg border border-[#C76542]/30 bg-[#FFFFFF] shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[#C76542] animate-spin" />
            <span className="text-xs text-[#282722] font-medium">Rest interval:</span>
            <span className="text-sm font-semibold font-mono text-[#C76542]">
              {formatTime(restSecondsRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSecondsRemaining(prev => (prev ? prev + 30 : 30))}
              className="text-[11px] px-2 py-0.5 rounded border border-[#E8E5DF] hover:bg-[#F0EEE9] text-[#77756E]"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSecondsRemaining(null)}
              className="text-[11px] px-2 py-0.5 rounded border border-[#E8E5DF] hover:bg-[#F0EEE9] text-[#77756E]"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Exercise Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {exercises.map((ex, idx) => {
          const isSelected = idx === activeExerciseIndex;
          const allSetsDone = ex.sets.every(s => s.completed);

          return (
            <button
              key={idx}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'border-[#C76542] bg-[#FFFFFF] text-[#282722]'
                  : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#77756E] hover:text-[#282722]'
              }`}
            >
              <span>{idx + 1}. {ex.exerciseName.split(' ')[0]}</span>
              {allSetsDone && <Check className="h-3 w-3 text-[#C76542]" />}
            </button>
          );
        })}
      </div>

      {/* Active Exercise Detail Card */}
      <div className="p-5 rounded-xl border border-[#E8E5DF] bg-[#FFFFFF] space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#77756E]">
              Exercise {activeExerciseIndex + 1} of {exercises.length}
            </span>
            <h2 className="text-xl font-medium text-[#282722]">
              {currentExercise.exerciseName}
            </h2>
            <span className="text-xs text-[#77756E]">
              Target: {currentExercise.targetMuscle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={activeExerciseIndex === 0}
              onClick={() => setActiveExerciseIndex(prev => prev - 1)}
              className="p-1.5 rounded border border-[#E8E5DF] hover:bg-[#F0EEE9] disabled:opacity-40 text-[#77756E]"
              title="Previous exercise"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={activeExerciseIndex === exercises.length - 1}
              onClick={() => setActiveExerciseIndex(prev => prev + 1)}
              className="p-1.5 rounded border border-[#E8E5DF] hover:bg-[#F0EEE9] disabled:opacity-40 text-[#77756E]"
              title="Next exercise"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Set Table */}
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-[11px] font-medium text-[#77756E] px-2">
            <span className="col-span-2">SET</span>
            <span className="col-span-3">TARGET</span>
            <span className="col-span-3">WEIGHT</span>
            <span className="col-span-2">REPS</span>
            <span className="col-span-2 text-right">DONE</span>
          </div>

          {/* Set Rows */}
          <div className="space-y-1.5">
            {currentExercise.sets.map((set, setIdx) => {
              const isSetDone = set.completed;

              return (
                <div
                  key={set.setNumber}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-colors ${
                    isSetDone
                      ? 'border-[#E8E5DF] bg-[#F8F7F4]/70 opacity-80'
                      : 'border-[#E8E5DF] bg-[#FFFFFF]'
                  }`}
                >
                  <span className="col-span-2 text-xs font-mono font-medium text-[#282722]">
                    #{set.setNumber}
                  </span>

                  <span className="col-span-3 text-xs text-[#77756E]">
                    {set.prescribedReps}
                  </span>

                  {/* Weight input */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={set.actualWeight}
                      onChange={e => updateSetWeight(activeExerciseIndex, setIdx, e.target.value)}
                      placeholder="e.g. 50 lbs"
                      className="w-full px-2 py-1 text-xs rounded border border-[#E8E5DF] bg-[#FFFFFF] text-[#282722] focus:outline-none focus:border-[#C76542]"
                    />
                  </div>

                  {/* Reps input */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={set.actualReps}
                      onChange={e => updateSetReps(activeExerciseIndex, setIdx, parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2 py-1 text-xs rounded border border-[#E8E5DF] bg-[#FFFFFF] text-[#282722] focus:outline-none focus:border-[#C76542]"
                    />
                  </div>

                  {/* Complete checkbox */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleSetComplete(activeExerciseIndex, setIdx)}
                      className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors ${
                        isSetDone
                          ? 'bg-[#C76542] border-[#C76542] text-white'
                          : 'border-[#E8E5DF] hover:border-[#C76542] bg-[#FFFFFF] text-transparent hover:text-[#C76542]/50'
                      }`}
                      aria-label={`Mark set ${set.setNumber} complete`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Move to next exercise / Complete workout actions */}
        <div className="pt-2 border-t border-[#E8E5DF] flex items-center justify-between">
          {activeExerciseIndex < exercises.length - 1 ? (
            <button
              onClick={() => setActiveExerciseIndex(prev => prev + 1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#282722] hover:text-[#C76542] transition-colors"
            >
              <span>Next exercise: {exercises[activeExerciseIndex + 1].exerciseName}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="text-xs text-[#77756E]">Final exercise in session</span>
          )}

          <button
            onClick={handleFinishWorkout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#282722] hover:bg-[#1a1916] text-white text-xs font-medium tracking-tight transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Finish workout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

