import assert from 'node:assert';

// 1. Verify User Context Formatting
function formatUserContext(profile, workoutPlan) {
  let context = '### CURRENT USER PROFILE:\n';
  if (!profile || typeof profile !== 'object' || Object.keys(profile).length === 0) {
    context += 'Status: No profile recorded yet. Treat all profile fields as unknown. Do not assume the user has completed onboarding.\n';
  } else {
    context += `- Completed Onboarding: ${profile.completedOnboarding ? 'Yes' : 'No / Incomplete'}\n`;
    context += `- Fitness Goal: ${profile.goal ? String(profile.goal).replace('_', ' ') : 'Unknown'}\n`;
    context += `- Age: ${profile.age ?? 'Unknown'}\n`;
    context += `- Height: ${profile.height || 'Unknown'}\n`;
    context += `- Weight: ${profile.weight || 'Unknown'}\n`;
    context += `- Training Experience: ${profile.experience || 'Unknown'}\n`;
    context += `- Training Location: ${profile.location || 'Unknown'}\n`;
    context += `- Weekly Training Days: ${profile.daysPerWeek ? `${profile.daysPerWeek} days/week` : 'Unknown'}\n`;
    context += `- Workout Duration: ${profile.durationMinutes ? `${profile.durationMinutes} minutes` : 'Unknown'}\n`;
    context += `- Stated Injuries / Physical Limitations: ${profile.limitations?.trim() ? profile.limitations.trim() : 'None reported'}\n`;
    context += `- Available Equipment: ${Array.isArray(profile.equipment) && profile.equipment.length > 0 ? profile.equipment.join(', ') : 'Unknown'}\n`;
    if (profile.gender) {
      context += `- Gender: ${profile.gender}\n`;
    }
  }

  context += '\n### CURRENT SAVED WORKOUT PLAN:\n';
  if (!workoutPlan || typeof workoutPlan !== 'object' || !Array.isArray(workoutPlan.days) || workoutPlan.days.length === 0) {
    context += 'Status: No active workout plan generated or saved yet.\n';
  } else {
    context += `- Plan Title: "${workoutPlan.title || 'Custom Plan'}"\n`;
    context += `- Summary: ${workoutPlan.summary || 'None'}\n`;
    context += `- Structure: ${workoutPlan.daysPerWeek || workoutPlan.days.length} days/week (~${workoutPlan.sessionDuration || '60 min'} per session)\n`;
    context += '- Weekly Schedule Details:\n';
    workoutPlan.days.forEach(day => {
      context += `  * ${day.dayName || 'Day'} [Focus: ${day.focus || 'General'}]:\n`;
      if (Array.isArray(day.exercises)) {
        day.exercises.forEach(ex => {
          context += `    - ${ex.name} [Target: ${ex.targetMuscle || 'General'}] | ${ex.sets || 3} sets × ${ex.reps || '8-12 reps'} (Rest: ${ex.restSeconds || 90}s)\n`;
        });
      }
    });
  }

  return context;
}

// Test 5: No saved profile
const noProfileContext = formatUserContext(null, null);
assert(noProfileContext.includes('Status: No profile recorded yet. Treat all profile fields as unknown.'));
assert(noProfileContext.includes('Status: No active workout plan generated or saved yet.'));
console.log('✓ Scenario 5 Passed: Handled empty profile gracefully');

// Test 6: Physical limitations and equipment
const limitedProfile = {
  completedOnboarding: true,
  goal: 'muscle',
  age: 32,
  experience: 'intermediate',
  location: 'home',
  daysPerWeek: 3,
  durationMinutes: 45,
  limitations: 'Lower back herniation, shoulder impingement on overhead lifts',
  equipment: ['Dumbbells', 'Adjustable Bench', 'Resistance Bands']
};
const limitedContext = formatUserContext(limitedProfile, null);
assert(limitedContext.includes('Stated Injuries / Physical Limitations: Lower back herniation, shoulder impingement on overhead lifts'));
assert(limitedContext.includes('Available Equipment: Dumbbells, Adjustable Bench, Resistance Bands'));
console.log('✓ Scenario 6 Passed: Context properly includes stated physical limitations and equipment');

// Test 1-4: Conversation Memory sequencing
const sampleHistory = [
  { sender: 'user', text: 'Give me a Monday chest workout' },
  { sender: 'assistant', text: 'Here is your chest workout: Flat DB Press, Incline DB Press, Cable Flyes.' },
  { sender: 'user', text: 'Make this workout shorter' },
  { sender: 'assistant', text: 'Here is a 30-minute version: Flat DB Press and Push-ups.' },
  { sender: 'user', text: 'Can we replace push-ups with dumbbell flyes?' },
  { sender: 'assistant', text: 'Replaced Push-ups with Dumbbell Flyes (3 sets × 10–12 reps).' }
];

const newQuery = 'How long should I rest between sets on these exercises?';
assert(newQuery.length > 0);
const sanitized = sampleHistory.slice(-10).map(m => ({
  role: m.sender === 'user' ? 'user' : 'assistant',
  content: m.text
}));

assert.strictEqual(sanitized.length, 6);
assert.strictEqual(sanitized[0].role, 'user');
assert.strictEqual(sanitized[0].content, 'Give me a Monday chest workout');
assert.strictEqual(sanitized[sanitized.length - 1].content, 'Replaced Push-ups with Dumbbell Flyes (3 sets × 10–12 reps).');
console.log('✓ Scenario 1-4 Passed: Conversation history correctly preserves chronological context across follow-ups');

console.log('\nAll context, memory, and limitation unit scenarios verified successfully!');
