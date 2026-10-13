import { NextResponse } from 'next/server';
import { UserProfile, WorkoutPlan } from '@/lib/types';
import { generateWorkoutPlan } from '@/lib/aiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile = body as UserProfile;

    if (!profile || !profile.goal) {
      return NextResponse.json(
        { error: 'Invalid profile payload. Missing fitness goal.' },
        { status: 400 }
      );
    }

    // In production with an LLM provider, this is where server-side API keys
    // (e.g. process.env.ANTHROPIC_API_KEY) are utilized to invoke the model with structured output.
    const plan: WorkoutPlan = await generateWorkoutPlan(profile);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan.' },
      { status: 500 }
    );
  }
}

