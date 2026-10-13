import { FitnessGoal, ExperienceLevel, TrainingLocation, UserProfile } from './types';

export const FITNESS_GOALS: { id: FitnessGoal; label: string; description: string }[] = [
  {
    id: 'muscle',
    label: 'Build muscle',
    description: 'Optimize hypertrophy with balanced volume and progressive overload.'
  },
  {
    id: 'fat_loss',
    label: 'Lose fat',
    description: 'Maintain lean mass while boosting caloric expenditure and conditioning.'
  },
  {
    id: 'strength',
    label: 'Gain strength',
    description: 'Focus on compound strength progression and central nervous system adaptation.'
  },
  {
    id: 'general_fitness',
    label: 'Improve general fitness',
    description: 'Well-rounded functional movement, mobility, and cardiovascular health.'
  }
];

export const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; description: string }[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Less than 1 year of consistent structured training. Learning form and basic movement patterns.'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: '1 to 3 years of regular lifting. Familiar with main compound lifts and training splits.'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: '3+ years of progressive training. Requires specific periodization and volume management.'
  }
];

export const TRAINING_LOCATIONS: { id: TrainingLocation; label: string; description: string }[] = [
  {
    id: 'gym',
    label: 'Commercial Gym',
    description: 'Full access to barbells, racks, cables, and machines.'
  },
  {
    id: 'home',
    label: 'Home Gym',
    description: 'Training with available personal equipment or bodyweight.'
  },
  {
    id: 'both',
    label: 'Both / Hybrid',
    description: 'Mix of gym visits and quick home training days.'
  }
];

export const DAYS_OPTIONS = [2, 3, 4, 5, 6];

export const DURATION_OPTIONS = [
  { minutes: 30, label: '30 minutes', description: 'Brief & high density' },
  { minutes: 45, label: '45 minutes', description: 'Balanced and focused' },
  { minutes: 60, label: '60 minutes', description: 'Standard comprehensive session' },
  { minutes: 75, label: '75 minutes', description: 'Extended volume' },
  { minutes: 90, label: '90 minutes', description: 'Heavy strength or full work' }
];

export const EQUIPMENT_OPTIONS = [
  'Dumbbells',
  'Barbell & Plates',
  'Pull-up Bar',
  'Resistance Bands',
  'Adjustable Bench',
  'Kettlebell',
  'Squat Rack',
  'Cable Machine',
  'Bodyweight Only'
];

export const COMMON_LIMITATIONS = [
  'None / Healthy',
  'Lower back pain / avoid heavy spinal loading',
  'Shoulder impingement / avoid overhead pressing',
  'Knee pain / avoid deep loaded squats',
  'Wrist strain / prefer neutral grip',
  'Recent injury rehabilitation'
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_default',
  goal: 'muscle',
  age: 28,
  height: '5 ft 10 in (178 cm)',
  weight: '165 lbs (75 kg)',
  experience: 'intermediate',
  location: 'gym',
  daysPerWeek: 4,
  durationMinutes: 60,
  limitations: '',
  equipment: ['Dumbbells', 'Barbell & Plates', 'Adjustable Bench', 'Pull-up Bar'],
  gender: '',
  completedOnboarding: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

