export type FitnessGoal = 'muscle' | 'fat_loss' | 'strength' | 'general_fitness';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingLocation = 'gym' | 'home' | 'both';

export interface UserProfile {
  id: string;
  goal: FitnessGoal;
  age: number | null;
  height: string;
  weight: string;
  experience: ExperienceLevel;
  location: TrainingLocation;
  daysPerWeek: number;
  durationMinutes: number;
  limitations: string;
  equipment: string[];
  gender?: string;
  completedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  substitutions: string[];
  completed?: boolean;
}

export interface DayWorkout {
  id: string;
  dayNumber: number;
  dayName: string;
  focus: string;
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  summary: string;
  daysPerWeek: number;
  sessionDuration: string;
  targetGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  days: DayWorkout[];
  principles: string[];
  createdAt: string;
}

export interface LoggedSet {
  setNumber: number;
  prescribedReps: string;
  actualWeight: string;
  actualReps: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  planId?: string;
  dayId: string;
  dayTitle: string;
  date: string;
  formattedDate: string;
  durationSeconds: number;
  exercises: LoggedExercise[];
  notes?: string;
  completed: boolean;
}

export interface ActiveWorkoutState {
  dayId: string;
  dayTitle: string;
  planId?: string;
  startTime: number;
  elapsedSeconds: number;
  isPaused: boolean;
  currentExerciseIndex: number;
  exercises: LoggedExercise[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  errorCode?: string;
  action?: {
    type: 'generate_plan' | 'view_plan' | 'start_workout' | 'replace_exercise';
    label: string;
    payload?: WorkoutPlan | unknown;
  };
}

export type ActiveView = 'welcome' | 'onboarding' | 'plan' | 'tracker' | 'history' | 'chat';
