import { UserProfile, WorkoutPlan, DayWorkout, Exercise, WorkoutSession } from './types';

/**
 * Exercise database with equipment, muscle group, and limitation considerations.
 */
interface RawExercise {
  name: string;
  muscle: string;
  category: 'compound' | 'isolation';
  equipmentReq: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  instructions: string;
  substitutions: string[];
  avoids: string[]; // e.g. 'lower_back', 'shoulder', 'knee'
}

const EXERCISE_POOL: RawExercise[] = [
  // CHEST
  {
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    category: 'compound',
    equipmentReq: 'barbell',
    instructions: 'Retract scapulae, maintain a stable arch, lower bar with control to mid-chest, and press smoothly without flaring elbows.',
    substitutions: ['Dumbbell Bench Press', 'Push-ups', 'Machine Chest Press'],
    avoids: ['shoulder']
  },
  {
    name: 'Dumbbell Flat Bench Press',
    muscle: 'Chest',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Keep neutral to semi-pronated wrists. Lower dumbells under control to chest level and press upwards in an arc.',
    substitutions: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Push-ups'],
    avoids: []
  },
  {
    name: 'Incline Dumbbell Press',
    muscle: 'Upper Chest',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Set bench to 30 degrees. Press upward concentrating on upper pectoral contraction. Do not bounce at the bottom.',
    substitutions: ['Incline Barbell Press', 'Low-to-High Cable Flyes', 'Pike Push-ups'],
    avoids: []
  },
  {
    name: 'Standard Push-up',
    muscle: 'Chest & Core',
    category: 'compound',
    equipmentReq: 'bodyweight',
    instructions: 'Maintain a rigid straight plank line from heels to head. Lower until chest is an inch off the floor, then press through palms.',
    substitutions: ['Incline Push-ups', 'Floor Dumbbell Press', 'Dips'],
    avoids: []
  },
  {
    name: 'Cable Chest Flye',
    muscle: 'Chest',
    category: 'isolation',
    equipmentReq: 'cable',
    instructions: 'Slight elbow bend, bring handles together in front of sternum, squeeze chest at peak contraction, controlled eccentric.',
    substitutions: ['Dumbbell Flyes', 'Resistance Band Flyes', 'Machine Pec Deck'],
    avoids: []
  },

  // BACK
  {
    name: 'Chest-Supported Row',
    muscle: 'Upper Back & Lats',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Lie prone on an incline bench. Drive elbows back towards hips to minimize spinal load while fully contracting upper lats.',
    substitutions: ['Inverted Bodyweight Row', 'Single-Arm Dumbbell Row', 'Cable Seated Row'],
    avoids: [] // Very friendly for lower back!
  },
  {
    name: 'Barbell Bent-Over Row',
    muscle: 'Upper Back & Lats',
    category: 'compound',
    equipmentReq: 'barbell',
    instructions: 'Hinge hips back with neutral spine, grip bar slightly wider than shoulder-width, row into lower ribcage.',
    substitutions: ['Chest-Supported Row', 'Single-Arm Dumbbell Row', 'Seated Cable Row'],
    avoids: ['lower_back']
  },
  {
    name: 'Lat Pulldown',
    muscle: 'Lats',
    category: 'compound',
    equipmentReq: 'cable',
    instructions: 'Grip bar slightly outside shoulder width. Pull toward upper sternum while keeping torso upright, squeezing shoulder blades together.',
    substitutions: ['Pull-ups / Chin-ups', 'Resistance Band Lat Pulldown', 'Dumbbell Pullover'],
    avoids: []
  },
  {
    name: 'Pull-up / Assisted Pull-up',
    muscle: 'Lats & Upper Back',
    category: 'compound',
    equipmentReq: 'bodyweight',
    instructions: 'Hang with full scapular stretch, depress shoulder blades and pull chin over bar. Lower with control.',
    substitutions: ['Lat Pulldown', 'Inverted Row', 'Band-Assisted Pull-up'],
    avoids: []
  },
  {
    name: 'Single-Arm Dumbbell Row',
    muscle: 'Lats & Mid-Back',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Place non-working knee and hand on flat bench. Pull dumbbell back toward hip crease, keeping torso still and spine neutral.',
    substitutions: ['Chest-Supported Row', 'Cable Row', 'Meadows Row'],
    avoids: []
  },

  // SHOULDERS
  {
    name: 'Overhead Barbell Press',
    muscle: 'Shoulders & Triceps',
    category: 'compound',
    equipmentReq: 'barbell',
    instructions: 'Stand tall with core braced and glutes squeezed. Press bar vertically overhead, clearing chin and locking out over midfoot.',
    substitutions: ['Seated Dumbbell Shoulder Press', 'Neutral Grip DB Press', 'Pike Push-ups'],
    avoids: ['shoulder', 'lower_back']
  },
  {
    name: 'Seated Neutral-Grip Dumbbell Press',
    muscle: 'Shoulders',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Palms facing each other reduces subacromial impingement. Press dumbbells smoothly overhead with upright posture.',
    substitutions: ['Arnold Press', 'Landmine Press', 'High Incline DB Press'],
    avoids: []
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscle: 'Lateral Deltoids',
    category: 'isolation',
    equipmentReq: 'dumbbell',
    instructions: 'Lead with elbows in the scapular plane (30 degrees forward of midline), raising to shoulder height. Pause for 0.5s.',
    substitutions: ['Cable Lateral Raise', 'Band Lateral Raise', 'Machine Lateral Raise'],
    avoids: []
  },
  {
    name: 'Face Pull',
    muscle: 'Rear Delts & Rotator Cuff',
    category: 'isolation',
    equipmentReq: 'cable',
    instructions: 'Attach rope at eye level. Pull rope towards bridge of nose, externally rotating hands so thumbs point backward.',
    substitutions: ['Band Face Pull', 'Reverse Dumbbell Flye', 'Prone Y-Raises'],
    avoids: []
  },

  // LEGS - QUADS & GLUTES
  {
    name: 'Barbell Back Squat',
    muscle: 'Quads & Glutes',
    category: 'compound',
    equipmentReq: 'barbell',
    instructions: 'Set bar securely across traps, hinge hips back and bend knees tracking over toes to parallel depth. Drive through midfoot.',
    substitutions: ['Goblet Squat', 'Leg Press', 'Bulgarian Split Squat'],
    avoids: ['knee', 'lower_back']
  },
  {
    name: 'Goblet Squat',
    muscle: 'Quads & Core',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Hold dumbbell vertically against chest. Squat between hips with proud chest, keeping elbows inside knees.',
    substitutions: ['Bodyweight Squat', 'Leg Press', 'Front Squat'],
    avoids: ['lower_back']
  },
  {
    name: 'Bulgarian Split Squat',
    muscle: 'Quads & Glutes',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Rear foot elevated on bench. Lower hips vertically until front thigh is parallel to ground. Excellent for unilateral stability.',
    substitutions: ['Walking Lunges', 'Reverse Lunges', 'Step-ups'],
    avoids: ['lower_back']
  },
  {
    name: 'Bodyweight Air Squat',
    muscle: 'Quads & Glutes',
    category: 'compound',
    equipmentReq: 'bodyweight',
    instructions: 'Feet shoulder-width apart. Squat down under full control, arms forward for counterbalance. Return to full extension.',
    substitutions: ['Tempo Air Squat', 'Chair Squat', 'Walking Lunges'],
    avoids: []
  },

  // LEGS - POSTERIOR CHAIN (HAMSTRINGS / GLUTES)
  {
    name: 'Romanian Deadlift (RDL)',
    muscle: 'Hamstrings & Glutes',
    category: 'compound',
    equipmentReq: 'barbell',
    instructions: 'Hold bar with overhand grip, slight knee bend, push hips backward until deep hamstring stretch is felt. Squeeze glutes to return.',
    substitutions: ['Dumbbell Romanian Deadlift', 'Single-Leg DB RDL', 'Cable Pull-Through'],
    avoids: ['lower_back']
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    muscle: 'Hamstrings & Glutes',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Keep weights close to shins, hinge hips back while maintaining a flat spine. Reverse motion by squeezing glutes forward.',
    substitutions: ['Single-Leg DB RDL', 'Glute Bridge', 'Swiss Ball Leg Curl'],
    avoids: []
  },
  {
    name: 'Lying or Seated Leg Curl',
    muscle: 'Hamstrings',
    category: 'isolation',
    equipmentReq: 'machine',
    instructions: 'Keep hips pinned down against pad. Curl roller pad towards glutes, hold contraction, lower over 3 seconds.',
    substitutions: ['Stability Ball Leg Curl', 'Nordic Hamstring Curl', 'Resistance Band Hamstring Curl'],
    avoids: ['lower_back']
  },
  {
    name: 'Glute Bridge / Hip Thrust',
    muscle: 'Glutes',
    category: 'compound',
    equipmentReq: 'dumbbell',
    instructions: 'Shoulders against bench or back on floor. Drive through heels to full hip extension, squeezing glutes hard at the top without hyper-extending back.',
    substitutions: ['Barbell Hip Thrust', 'Single-Leg Glute Bridge', 'Cable Pull-Through'],
    avoids: ['knee', 'lower_back']
  },

  // ARMS & CORE
  {
    name: 'Incline Dumbbell Bicep Curl',
    muscle: 'Biceps',
    category: 'isolation',
    equipmentReq: 'dumbbell',
    instructions: 'Set bench to 45 degrees. Let arms hang back for full long-head stretch. Curl weights up without swinging elbows.',
    substitutions: ['Standing Dumbbell Curl', 'Cable Bicep Curl', 'Hammer Curl'],
    avoids: []
  },
  {
    name: 'Hammer Curl',
    muscle: 'Brachialis & Forearms',
    category: 'isolation',
    equipmentReq: 'dumbbell',
    instructions: 'Neutral grip (palms facing each other). Curl dumbbells upward under strict control. Ideal for elbow comfort.',
    substitutions: ['Rope Cable Hammer Curl', 'Reverse Barbell Curl', 'Cross-Body DB Curl'],
    avoids: ['wrist']
  },
  {
    name: 'Triceps Rope Pushdown',
    muscle: 'Triceps',
    category: 'isolation',
    equipmentReq: 'cable',
    instructions: 'Elbows pinned to sides. Push rope down and spread handles at full extension, locking out triceps with control.',
    substitutions: ['Overhead Dumbbell Triceps Extension', 'Bench Dips', 'Diamond Push-ups'],
    avoids: []
  },
  {
    name: 'Overhead Dumbbell Triceps Extension',
    muscle: 'Triceps (Long Head)',
    category: 'isolation',
    equipmentReq: 'dumbbell',
    instructions: 'Hold single dumbbell overhead with both hands forming a cup under plates. Lower behind head until elbows bend 90 degrees.',
    substitutions: ['Triceps Pushdown', 'Skull Crushers', 'Close-Grip Push-up'],
    avoids: ['shoulder']
  },
  {
    name: 'Plank with Shoulder Taps',
    muscle: 'Core & Abdominals',
    category: 'isolation',
    equipmentReq: 'bodyweight',
    instructions: 'In a tall push-up position, tap opposite shoulder without rotating hips. Maintain anti-rotational stability.',
    substitutions: ['Standard Forearm Plank', 'Deadbug', 'Pallof Press'],
    avoids: ['lower_back']
  },
  {
    name: 'Hanging Leg Raise / Knee Raise',
    muscle: 'Abs & Hip Flexors',
    category: 'isolation',
    equipmentReq: 'bodyweight',
    instructions: 'Hang from pull-up bar, posteriorly tilt pelvis and curl knees or legs towards chest without swinging.',
    substitutions: ['Captain’s Chair Knee Raise', 'Reverse Crunch', 'Ab Wheel Rollout'],
    avoids: []
  }
];

/**
 * Filter pool according to user equipment and limitations
 */
function getEligibleExercises(profile: UserProfile): RawExercise[] {
  const limitations = (profile.limitations || '').toLowerCase();
  const hasLowerBackIssue = limitations.includes('back') || limitations.includes('spine') || limitations.includes('disc');
  const hasShoulderIssue = limitations.includes('shoulder') || limitations.includes('rotator');
  const hasKneeIssue = limitations.includes('knee') || limitations.includes('patella');
  const hasWristIssue = limitations.includes('wrist');

  const userEquip = (profile.equipment || []).map(e => e.toLowerCase());
  const isGym = profile.location === 'gym' || profile.location === 'both';
  const hasBarbell = isGym || userEquip.some(e => e.includes('barbell'));
  const hasDumbbells = isGym || userEquip.some(e => e.includes('dumbbell'));
  const hasCables = isGym || userEquip.some(e => e.includes('cable'));
  const hasPullup = isGym || userEquip.some(e => e.includes('pull-up') || e.includes('bar'));

  return EXERCISE_POOL.filter(ex => {
    // Check limitations
    if (hasLowerBackIssue && ex.avoids.includes('lower_back')) return false;
    if (hasShoulderIssue && ex.avoids.includes('shoulder')) return false;
    if (hasKneeIssue && ex.avoids.includes('knee')) return false;
    if (hasWristIssue && ex.avoids.includes('wrist')) return false;

    // Check equipment requirements
    if (ex.equipmentReq === 'barbell' && !hasBarbell) return false;
    if (ex.equipmentReq === 'cable' && !hasCables) return false;
    if (ex.equipmentReq === 'dumbbell' && !hasDumbbells) return false;
    if (ex.equipmentReq === 'machine' && !isGym) return false;
    if (ex.name.includes('Pull-up') && !hasPullup && !isGym) return false;

    return true;
  });
}

function selectExercisesForFocus(
  eligible: RawExercise[],
  focus: string,
  targetCount: number,
  experience: string
): Exercise[] {
  const chosen: RawExercise[] = [];
  const focusLower = focus.toLowerCase();

  const matchesFocus = (ex: RawExercise): boolean => {
    const m = ex.muscle.toLowerCase();
    if (focusLower.includes('upper') || focusLower.includes('push') || focusLower.includes('pull')) {
      if (focusLower.includes('push') && (m.includes('chest') || m.includes('shoulder') || m.includes('tricep'))) return true;
      if (focusLower.includes('pull') && (m.includes('back') || m.includes('lat') || m.includes('bicep') || m.includes('rear delt'))) return true;
      if (focusLower.includes('upper') && (m.includes('chest') || m.includes('back') || m.includes('shoulder') || m.includes('lat') || m.includes('bicep') || m.includes('tricep'))) return true;
    }
    if (focusLower.includes('lower') || focusLower.includes('leg')) {
      if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('leg') || m.includes('core')) return true;
    }
    if (focusLower.includes('full')) {
      return true;
    }
    return false;
  };

  const pool = eligible.filter(matchesFocus);
  const fallback = eligible.length > 0 ? eligible : EXERCISE_POOL;

  // Pick unique muscle representations
  const addedMuscles = new Set<string>();

  // Prioritize compound first
  for (const ex of pool.filter(e => e.category === 'compound')) {
    if (chosen.length >= targetCount) break;
    if (!addedMuscles.has(ex.muscle)) {
      chosen.push(ex);
      addedMuscles.add(ex.muscle);
    }
  }

  // Then add isolations / supplemental
  for (const ex of pool) {
    if (chosen.length >= targetCount) break;
    if (!chosen.some(c => c.name === ex.name)) {
      chosen.push(ex);
    }
  }

  // Fill up if needed
  let i = 0;
  while (chosen.length < targetCount && i < fallback.length) {
    const candidate = fallback[i % fallback.length];
    if (!chosen.some(c => c.name === candidate.name)) {
      chosen.push(candidate);
    }
    i++;
  }

  // Format reps & sets based on experience & goal
  return chosen.map((item, idx) => {
    let sets = 3;
    let reps = '8–12 reps';
    let rest = 90;

    if (item.category === 'compound') {
      sets = experience === 'beginner' ? 3 : 4;
      reps = experience === 'beginner' ? '8–10 reps' : '6–8 reps';
      rest = 120;
    } else {
      sets = experience === 'advanced' ? 4 : 3;
      reps = '10–15 reps';
      rest = 60;
    }

    return {
      id: `ex_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      targetMuscle: item.muscle,
      sets,
      reps,
      restSeconds: rest,
      instructions: item.instructions,
      substitutions: item.substitutions,
      completed: false
    };
  });
}

/**
 * Generates an individualized WorkoutPlan based on the user's profile.
 */
export async function generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
  // Realistic simulated generation delay to give a calm, deliberate AI computation feel
  await new Promise(resolve => setTimeout(resolve, 800));

  const eligible = getEligibleExercises(profile);
  const daysPerWeek = profile.daysPerWeek || 3;
  const days: DayWorkout[] = [];

  // Determine exercises per workout based on duration
  const targetExercisesPerDay = profile.durationMinutes <= 45 ? 4 : profile.durationMinutes >= 75 ? 6 : 5;

  if (daysPerWeek === 2) {
    days.push({
      id: 'day_1',
      dayNumber: 1,
      dayName: 'Day 1 · Full Body A',
      focus: 'Full Body Compound Foundations',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Full Body Quad Chest Back', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      dayName: 'Day 2 · Full Body B',
      focus: 'Full Body Hinge Shoulders Core',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Full Body Hamstring Shoulder Back', targetExercisesPerDay, profile.experience)
    });
  } else if (daysPerWeek === 3) {
    days.push({
      id: 'day_1',
      dayNumber: 1,
      dayName: 'Day 1 · Push Focus',
      focus: 'Chest, Shoulders & Triceps',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Push Chest Shoulder Triceps', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      dayName: 'Day 2 · Pull Focus',
      focus: 'Back, Lats & Biceps',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Pull Back Lats Biceps', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      dayName: 'Day 3 · Legs & Core',
      focus: 'Quads, Hamstrings & Stability',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Lower Legs Quads Hamstrings', targetExercisesPerDay, profile.experience)
    });
  } else if (daysPerWeek === 4) {
    days.push({
      id: 'day_1',
      dayNumber: 1,
      dayName: 'Day 1 · Upper Body Strength',
      focus: 'Horizontal Press & Row Progression',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Upper Chest Back Shoulders', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      dayName: 'Day 2 · Lower Body Power',
      focus: 'Quad Dominance & Core Bracing',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Lower Quads Core Glutes', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      dayName: 'Day 3 · Upper Body Hypertrophy',
      focus: 'Vertical Pull, Shoulders & Arms',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Upper Lats Shoulders Biceps Triceps', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_4',
      dayNumber: 4,
      dayName: 'Day 4 · Lower Body Posterior',
      focus: 'Hamstrings, Hip Extension & Unilateral Stability',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Lower Hamstrings Glutes Core', targetExercisesPerDay, profile.experience)
    });
  } else if (daysPerWeek === 5) {
    days.push({
      id: 'day_1',
      dayNumber: 1,
      dayName: 'Day 1 · Push',
      focus: 'Chest & Shoulders',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Push Chest Shoulders', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_2',
      dayNumber: 2,
      dayName: 'Day 2 · Pull',
      focus: 'Back & Rear Delts',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Pull Back Lats', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_3',
      dayNumber: 3,
      dayName: 'Day 3 · Legs',
      focus: 'Quad & Glute Power',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Lower Quads Glutes', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_4',
      dayNumber: 4,
      dayName: 'Day 4 · Upper Body',
      focus: 'Upper Body Pump & Density',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Upper Chest Back Arms', targetExercisesPerDay, profile.experience)
    });
    days.push({
      id: 'day_5',
      dayNumber: 5,
      dayName: 'Day 5 · Lower & Core',
      focus: 'Hamstrings, Calves & Trunk Control',
      estimatedMinutes: profile.durationMinutes,
      exercises: selectExercisesForFocus(eligible, 'Lower Hamstrings Core', targetExercisesPerDay, profile.experience)
    });
  } else {
    // 6 days - Push / Pull / Legs x 2
    const templates = [
      { name: 'Day 1 · Push A', focus: 'Chest & Triceps Heavy', tag: 'Push Chest Triceps' },
      { name: 'Day 2 · Pull A', focus: 'Lats & Biceps Heavy', tag: 'Pull Lats Biceps' },
      { name: 'Day 3 · Legs A', focus: 'Quad Dominant & Calves', tag: 'Lower Quads Core' },
      { name: 'Day 4 · Push B', focus: 'Shoulders & Incline Chest', tag: 'Push Shoulders Chest' },
      { name: 'Day 5 · Pull B', focus: 'Upper Back & Rear Delts', tag: 'Pull Back Lats' },
      { name: 'Day 6 · Legs B', focus: 'Hamstrings & Unilateral', tag: 'Lower Hamstrings Glutes' }
    ];
    templates.forEach((t, idx) => {
      days.push({
        id: `day_${idx + 1}`,
        dayNumber: idx + 1,
        dayName: t.name,
        focus: t.focus,
        estimatedMinutes: profile.durationMinutes,
        exercises: selectExercisesForFocus(eligible, t.tag, targetExercisesPerDay, profile.experience)
      });
    });
  }

  const goalSummaryMap: Record<string, string> = {
    muscle: 'Optimized for progressive hypertrophy with moderate volume and controlled tempos.',
    strength: 'Structured around compound foundation lifts, emphasizing neurological efficiency and strength adaptation.',
    fat_loss: 'Designed with continuous movement density and compound energy expenditure to preserve lean mass.',
    general_fitness: 'Balanced split prioritizing joint longevity, functional athleticism, and conditioning.'
  };

  const planTitle = `${profile.daysPerWeek}-Day ${profile.goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Plan`;
  const summary = `${goalSummaryMap[profile.goal] || 'Structured training program.'} Tailored for ${profile.experience} level at ${profile.location === 'gym' ? 'a fully equipped gym' : profile.location === 'home' ? 'your home gym setup' : 'a hybrid gym/home setup'}${profile.limitations ? ` with adjustments for: "${profile.limitations}"` : ''}.`;

  return {
    id: `plan_${Date.now()}`,
    title: planTitle,
    summary,
    daysPerWeek: profile.daysPerWeek,
    sessionDuration: `${profile.durationMinutes} minutes`,
    targetGoal: profile.goal,
    experienceLevel: profile.experience,
    days,
    principles: [
      'Warm up with 5 minutes of dynamic mobility before working sets.',
      'Record your working weights each session to gauge progressive overload.',
      'Leave 1 to 2 reps in reserve (RIR) on compound movements to avoid technical breakdown.',
      'If you encounter joint pinching or acute pain, stop immediately and use the suggested exercise substitution.'
    ],
    createdAt: new Date().toISOString()
  };
}

/**
 * Answers questions about the workout plan or training concepts in Claude AI's calm, informative tone.
 */
export async function askWorkoutQuestion(
  question: string,
  context: { profile?: UserProfile; plan?: WorkoutPlan; history?: WorkoutSession[] }
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const q = question.toLowerCase();

  // Safety & injury guardrail
  if (q.includes('pain') || q.includes('hurt') || q.includes('injury') || q.includes('sprain') || q.includes('tear')) {
    return `Training through acute or sharp pain is never recommended. When a movement causes discomfort rather than normal muscular fatigue, prioritize your joint health:

1. **Stop the aggravating movement**: Immediately substitute it with a pain-free alternative or rest the area.
2. **Examine grip and range**: Subtle adjustments, such as switching to a neutral grip or limiting depth, often eliminate impingement.
3. **Medical consultation**: If pain persists outside of training, consult a licensed physical therapist or sports medicine specialist. We cannot provide clinical medical diagnoses.`;
  }

  if (q.includes('progressive overload') || q.includes('progress') || q.includes('plateau') || q.includes('weight')) {
    return `Progressive overload is the fundamental driver of adaptation. Here is how to apply it systematically:

* **Repetition Progression (Double Progression)**: If your prescription is 3 sets of 8–12 reps, start with a weight you can cleanly perform for 8 reps across all sets. Keep that exact weight until you reach 12 clean reps on all 3 sets. Only then increase the load by 2.5–5 lbs.
* **Form Consistency**: An extra rep only counts if executed with the same tempo and range of motion as previous weeks.
* **Recovery Check**: If your numbers stall for 2+ consecutive weeks, verify you are getting adequate sleep (7–9 hours) and adequate protein intake.`;
  }

  if (q.includes('rest') || q.includes('recovery') || q.includes('sore') || q.includes('doms')) {
    return `Rest periods and recovery dictate the quality of your stimulus:

* **Compound lifts** (squats, presses, rows): Take 2 to 3 minutes between heavy working sets. This allows ATP replenishment so high force output can be maintained.
* **Isolation lifts** (curls, lateral raises, pushdowns): 60 to 90 seconds is typically sufficient.
* **Delayed Onset Muscle Soreness (DOMS)**: Mild soreness is natural when introducing new movement patterns, but severe soreness indicates excessive volume. Light walking, hydration, and mobility promote blood flow to speed recovery.`;
  }

  if (q.includes('warm') || q.includes('warmup') || q.includes('prep')) {
    return `An effective warm-up prepares the nervous system and lubricates joints without fatiguing your muscles:

1. **General Movement (3–5 min)**: Light cycling, brisk incline walking, or rowing to elevate core temperature.
2. **Targeted Mobility (2–3 min)**: Band pull-aparts, hip openers (90/90s), or cat-cow stretches depending on whether it is an upper or lower body day.
3. **Ramping Warm-up Sets**: For your first major lift, perform 2–3 lighter ramp sets (e.g., empty bar × 10, 50% working weight × 5, 75% × 3) before beginning your first tracked working set.`;
  }

  if (q.includes('substitute') || q.includes('swap') || q.includes('replace') || q.includes('alternative')) {
    return `Every exercise in your plan includes pre-vetted substitutions directly under its details card on the Plan view.

When substituting:
* Match the movement pattern (e.g. replace a horizontal push with another horizontal push).
* Match the primary stimulus (compound for compound, isolation for isolation).
* Choose variations that accommodate your equipment availability and joint comfort. You can also ask me directly to revise the plan for you!`;
  }

  // Contextual fallback response
  const currentSplit = context.plan ? `Your current plan is a **${context.plan.title}** (${context.plan.daysPerWeek} days/week).` : 'You currently have a customized training profile.';
  return `${currentSplit}

Regarding your inquiry: "${question}"

Consistency and adherence to clean mechanics are what produce long-term results. Focus on maintaining steady tempo (2 seconds down, slight pause, forceful contraction), tracking your loads in the Active Workout tracker, and respecting the prescribed rest intervals.

Is there a specific exercise, split structure, or timing schedule you would like me to adjust in your plan?`;
}

/**
 * Revises the current workout plan based on user prompt instructions.
 */
export async function reviseWorkoutPlan(
  currentPlan: WorkoutPlan,
  instruction: string,
  _profile?: UserProfile
): Promise<{ updatedPlan: WorkoutPlan; explanation: string }> {
  void _profile;
  await new Promise(resolve => setTimeout(resolve, 800));

  const lower = instruction.toLowerCase();
  const updatedPlan: WorkoutPlan = JSON.parse(JSON.stringify(currentPlan));
  let explanation = '';

  if (lower.includes('short') || lower.includes('30 min') || lower.includes('45 min') || lower.includes('time')) {
    // Reduce sets or exercises
    updatedPlan.sessionDuration = '45 minutes';
    updatedPlan.days.forEach(day => {
      day.estimatedMinutes = 45;
      if (day.exercises.length > 4) {
        day.exercises = day.exercises.slice(0, 4);
      }
      day.exercises.forEach(ex => {
        ex.sets = Math.max(2, ex.sets - 1);
      });
    });
    explanation = 'Reduced session duration to 45 minutes by trimming accessory volume and focusing on high-impact core compound movements.';
  } else if (lower.includes('shoulder') && (lower.includes('avoid') || lower.includes('hurt') || lower.includes('pain') || lower.includes('replace'))) {
    // Replace overhead presses
    updatedPlan.days.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.name.toLowerCase().includes('overhead') || ex.name.toLowerCase().includes('barbell bench')) {
          ex.name = 'Neutral-Grip Dumbbell Floor Press';
          ex.instructions = 'Keep elbows tucked at 45 degrees. Neutral grip minimizes shoulder subacromial stress.';
          ex.substitutions = ['Push-ups', 'Incline Dumbbell Press', 'Cable Press'];
        }
      });
    });
    explanation = 'Replaced barbell overhead and wide-grip presses with neutral-grip dumbbell movements to protect the shoulder joint.';
  } else if (lower.includes('back') && (lower.includes('lower') || lower.includes('pain') || lower.includes('deadlift') || lower.includes('squat'))) {
    // Replace heavy spinal loading
    updatedPlan.days.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.name.toLowerCase().includes('deadlift') || ex.name.toLowerCase().includes('back squat')) {
          ex.name = 'Chest-Supported Row & Goblet Box Squat';
          ex.instructions = 'Eliminates shear stress on lumbar spine while retaining stimulus on legs and upper back.';
          ex.substitutions = ['Leg Press', 'Bulgarian Split Squat', 'Single-Leg Glute Bridge'];
        }
      });
    });
    explanation = 'Removed axial spinal loading (heavy deadlifts/back squats) and substituted chest-supported and box-supported variations to spare your lower back.';
  } else if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) {
    // Add arm volume
    updatedPlan.days.forEach(day => {
      const hasArms = day.exercises.some(e => e.targetMuscle.includes('Biceps') || e.targetMuscle.includes('Triceps'));
      if (!hasArms) {
        day.exercises.push({
          id: `ex_arm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: 'Incline Dumbbell Curl / Triceps Extension Superset',
          targetMuscle: 'Arms',
          sets: 3,
          reps: '10–12 reps',
          restSeconds: 60,
          instructions: 'Perform controlled reps focusing on full peak contraction and 2-second eccentric phase.',
          substitutions: ['Hammer Curls', 'Cable Pushdowns'],
          completed: false
        });
      }
    });
    explanation = 'Added targeted arm hypertrophy sets into your routine with specific bicep and tricep stimulus.';
  } else {
    // General refinement
    explanation = `Adjusted your plan according to your request: "${instruction}". Updated exercise tempos, rest intervals, and volume distribution across your ${updatedPlan.daysPerWeek}-day split.`;
  }

  return { updatedPlan, explanation };
}

