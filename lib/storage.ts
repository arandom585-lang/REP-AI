'use client';

import { UserProfile, WorkoutPlan, WorkoutSession, ActiveWorkoutState, ChatMessage } from './types';

const STORAGE_KEYS = {
  PROFILE: 'rep_ai_user_profile',
  PLAN: 'rep_ai_current_plan',
  HISTORY: 'rep_ai_workout_history',
  ACTIVE_WORKOUT: 'rep_ai_active_workout',
  CHAT: 'rep_ai_chat_messages',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getStoredProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.goal) {
      return parsed as UserProfile;
    }
  } catch (err) {
    console.error('Failed to read profile from storage:', err);
  }
  return null;
}

export function saveStoredProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to storage:', err);
  }
}

export function getStoredPlan(): WorkoutPlan | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.days)) {
      return parsed as WorkoutPlan;
    }
  } catch (err) {
    console.error('Failed to read plan from storage:', err);
  }
  return null;
}

export function saveStoredPlan(plan: WorkoutPlan): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save plan to storage:', err);
  }
}

export function getStoredHistory(): WorkoutSession[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as WorkoutSession[];
    }
  } catch (err) {
    console.error('Failed to read workout history:', err);
  }
  return [];
}

export function saveStoredHistory(history: WorkoutSession[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save workout history:', err);
  }
}

export function addWorkoutToHistory(session: WorkoutSession): WorkoutSession[] {
  const current = getStoredHistory();
  const updated = [session, ...current];
  saveStoredHistory(updated);
  return updated;
}

export function getStoredActiveWorkout(): ActiveWorkoutState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.exercises)) {
      return parsed as ActiveWorkoutState;
    }
  } catch (err) {
    console.error('Failed to read active workout from storage:', err);
  }
  return null;
}

export function saveStoredActiveWorkout(active: ActiveWorkoutState | null): void {
  if (!isBrowser()) return;
  try {
    if (active === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(active));
    }
  } catch (err) {
    console.error('Failed to save active workout:', err);
  }
}

export function getStoredChat(): ChatMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ChatMessage[];
    }
  } catch (err) {
    console.error('Failed to read chat history:', err);
  }
  return [];
}

export function saveStoredChat(messages: ChatMessage[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save chat messages:', err);
  }
}

export function clearAllLocalData(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}
