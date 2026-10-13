import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { UserProfile, WorkoutPlan } from '@/lib/types';

interface ChatRequestBody {
  message?: string;
  profile?: Partial<UserProfile> | null;
  workoutPlan?: Partial<WorkoutPlan> | null;
  conversationHistory?: Array<{
    role?: 'user' | 'assistant' | 'system';
    sender?: 'user' | 'assistant';
    content?: string;
    text?: string;
  }>;
}

const SYSTEM_INSTRUCTION = `You are REP AI, a workout planning assistant.

Your purpose is to help users create, understand, and adjust exercise routines.

Use the supplied user profile and workout plan as context.

Answer the user's actual question directly.

When asked for a workout, provide a specific structured routine instead of generic motivational advice.

For each exercise, include:
- Exercise name
- Sets
- Rep range
- Rest period
- Brief instructions

Respect available equipment, training experience, time constraints, and stated physical limitations.

Never fabricate profile information.

Do not claim to have modified or saved a workout plan unless the modification was successfully performed.

Ask clarifying questions when essential information is missing.

Do not diagnose injuries or recommend training through pain.

Distinguish general fitness guidance from medical advice.`;

function formatUserContext(
  profile: Partial<UserProfile> | null | undefined,
  workoutPlan: Partial<WorkoutPlan> | null | undefined
): string {
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
          if (ex.instructions) {
            context += `      Instructions: ${ex.instructions}\n`;
          }
          if (Array.isArray(ex.substitutions) && ex.substitutions.length > 0) {
            context += `      Substitutions: ${ex.substitutions.join(', ')}\n`;
          }
        });
      }
    });
  }

  return context;
}

const PLAN_REVISION_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'propose_plan_revision',
    description:
      'Propose an updated or revised version of the user workout plan ONLY when the user explicitly requests to modify, adjust, swap exercises in, shorten, or update their saved weekly plan. Do NOT invoke this for general fitness questions or one-off workout requests.',
    parameters: {
      type: 'object',
      properties: {
        explanation: {
          type: 'string',
          description: 'A concise summary of what was revised in the plan and the biomechanical rationale.',
        },
        revisedPlan: {
          type: 'object',
          description: 'The complete updated WorkoutPlan object containing the modified days and exercises.',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            summary: { type: 'string' },
            daysPerWeek: { type: 'number' },
            sessionDuration: { type: 'string' },
            targetGoal: { type: 'string' },
            experienceLevel: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  dayNumber: { type: 'number' },
                  dayName: { type: 'string' },
                  focus: { type: 'string' },
                  estimatedMinutes: { type: 'number' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        targetMuscle: { type: 'string' },
                        sets: { type: 'number' },
                        reps: { type: 'string' },
                        restSeconds: { type: 'number' },
                        instructions: { type: 'string' },
                        substitutions: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                      required: ['id', 'name', 'targetMuscle', 'sets', 'reps', 'restSeconds', 'instructions'],
                    },
                  },
                },
                required: ['id', 'dayNumber', 'dayName', 'focus', 'estimatedMinutes', 'exercises'],
              },
            },
            principles: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['title', 'summary', 'daysPerWeek', 'sessionDuration', 'days'],
        },
      },
      required: ['explanation', 'revisedPlan'],
    },
  },
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON payload received in request.', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const { message, profile, workoutPlan, conversationHistory }: ChatRequestBody = rawBody;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'The "message" field is required and cannot be empty.', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    // Verify OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable in your .env.local file.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

    const openai = new OpenAI({ apiKey });

    // Format user context
    const userContextText = formatUserContext(profile, workoutPlan);
    const fullSystemMessage = `${SYSTEM_INSTRUCTION}\n\n${userContextText}`;

    // Format sanitized conversation history (limit to last 10 messages)
    const messagesForOpenAI: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: fullSystemMessage },
    ];

    if (Array.isArray(conversationHistory)) {
      const sanitizedHistory = conversationHistory
        .slice(-10)
        .map(item => {
          const role = item.role || (item.sender === 'assistant' ? 'assistant' : 'user');
          const content = (item.content || item.text || '').trim();
          return { role, content };
        })
        .filter(item => item.content.length > 0 && item.role !== 'system');

      // Avoid duplicating the user's latest message if already at the end of history
      const lastHistoryItem = sanitizedHistory[sanitizedHistory.length - 1];
      if (lastHistoryItem && lastHistoryItem.role === 'user' && lastHistoryItem.content === trimmedMessage) {
        sanitizedHistory.pop();
      }

      sanitizedHistory.forEach(item => {
        messagesForOpenAI.push({
          role: item.role as 'user' | 'assistant',
          content: item.content,
        });
      });
    }

    // Add current user message
    messagesForOpenAI.push({
      role: 'user',
      content: trimmedMessage,
    });

    // Provide plan revision tool only if an existing plan is available
    const tools = workoutPlan && Array.isArray(workoutPlan.days) && workoutPlan.days.length > 0
      ? [PLAN_REVISION_TOOL]
      : undefined;

    const completion = await openai.chat.completions.create({
      model,
      messages: messagesForOpenAI,
      temperature: 0.7,
      max_tokens: 1500,
      tools,
      tool_choice: tools ? 'auto' : undefined,
    });

    const choice = completion.choices[0];
    if (!choice || !choice.message) {
      return NextResponse.json(
        { error: 'No response generated from the AI provider.', code: 'API_ERROR' },
        { status: 502 }
      );
    }

    // Check if the model called propose_plan_revision
    const toolCalls = choice.message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const planRevisionCall = toolCalls.find(
        tc => tc.type === 'function' && tc.function.name === 'propose_plan_revision'
      );
      if (planRevisionCall && planRevisionCall.type === 'function') {
        try {
          const parsedArgs = JSON.parse(planRevisionCall.function.arguments);
          const explanation = parsedArgs.explanation || 'Proposed plan adjustment based on your request.';
          const revisedPlan = parsedArgs.revisedPlan as WorkoutPlan;

          if (revisedPlan && Array.isArray(revisedPlan.days)) {
            // Ensure ID and principles exist
            if (!revisedPlan.id) revisedPlan.id = `plan_${Date.now()}`;
            if (!revisedPlan.principles) revisedPlan.principles = workoutPlan?.principles || [];

            const assistantText = choice.message.content
              ? choice.message.content.trim()
              : `${explanation}\n\nReview the suggested modification below. Click "Apply Revised Plan" to persist these changes to your active workout schedule.`;

            return NextResponse.json({
              success: true,
              message: assistantText,
              action: {
                type: 'replace_exercise',
                label: 'Apply Revised Plan',
                payload: revisedPlan,
              },
            });
          }
        } catch (parseError) {
          console.error('Error parsing plan revision tool call arguments:', parseError);
        }
      }
    }

    const contentText = choice.message.content?.trim() || 'No response content.';

    return NextResponse.json({
      success: true,
      message: contentText,
    });
  } catch (error: unknown) {
    console.error('REP AI /api/chat error:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          {
            error:
              'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable in .env.local.',
            code: 'AUTH_ERROR',
          },
          { status: 401 }
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            error:
              'OpenAI rate limit or usage quota exceeded. Please check your OpenAI account billing or try again in a few moments.',
            code: 'RATE_LIMIT',
          },
          { status: 429 }
        );
      }

      if (error.status === 400) {
        return NextResponse.json(
          {
            error: `OpenAI request was invalid: ${error.message}`,
            code: 'INVALID_REQUEST',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `OpenAI service error (${error.status}): ${error.message}`,
          code: 'API_ERROR',
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      {
        error: 'Unable to communicate with the AI service. Please verify your connection and server configuration.',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
