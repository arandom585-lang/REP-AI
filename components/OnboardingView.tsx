'use client';

import React, { useState } from 'react';
import { UserProfile, FitnessGoal, ExperienceLevel, TrainingLocation } from '@/lib/types';
import {
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_LOCATIONS,
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  EQUIPMENT_OPTIONS,
  COMMON_LIMITATIONS
} from '@/lib/constants';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react';
import { generateUniqueId, getCurrentTimestamp } from '@/lib/idHelper';

interface OnboardingViewProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile?.goal || 'muscle');
  const [age, setAge] = useState<string>(initialProfile?.age ? String(initialProfile.age) : '28');
  const [height, setHeight] = useState<string>(initialProfile?.height || "5'10\" (178 cm)");
  const [weight, setWeight] = useState<string>(initialProfile?.weight || '165 lbs (75 kg)');
  const [gender, setGender] = useState<string>(initialProfile?.gender || '');
  const [experience, setExperience] = useState<ExperienceLevel>(initialProfile?.experience || 'intermediate');
  const [location, setLocation] = useState<TrainingLocation>(initialProfile?.location || 'gym');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialProfile?.daysPerWeek || 4);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialProfile?.durationMinutes || 60);
  const [limitations, setLimitations] = useState<string>(initialProfile?.limitations || '');
  const [equipment, setEquipment] = useState<string[]>(
    initialProfile?.equipment || ['Dumbbells', 'Adjustable Bench', 'Pull-up Bar']
  );

  const totalSteps = 9;

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(e => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const parsedAge = parseInt(age, 10);
    const profile: UserProfile = {
      id: initialProfile?.id || generateUniqueId('user'),
      goal,
      age: isNaN(parsedAge) ? null : parsedAge,
      height: height.trim() || "5'10\"",
      weight: weight.trim() || '165 lbs',
      gender: gender.trim(),
      experience,
      location,
      daysPerWeek,
      durationMinutes,
      limitations: limitations.trim(),
      equipment: location === 'gym' ? ['Full Commercial Gym Equipment'] : equipment,
      completedOnboarding: true,
      createdAt: initialProfile?.createdAt || getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    onComplete(profile);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 md:py-16">
      <div className="w-full max-w-xl">
        {/* Subtle Progress Bar & Back Control */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E8E5DF] mb-8">
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 text-xs text-[#77756E] hover:text-[#282722] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#77756E] font-mono">
              Step {step} of {totalSteps}
            </span>
            <div className="w-20 h-1 bg-[#E8E5DF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C76542] transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Containers */}
        <div className="min-h-[380px] flex flex-col justify-between">
          {/* STEP 1: GOAL */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  What is your primary fitness goal?
                </h2>
                <p className="text-xs text-[#77756E]">
                  This establishes the volume, rep ranges, and energy system demands for your routine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FITNESS_GOALS.map(item => {
                  const isSelected = goal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#C76542] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(199,101,66,0.1)]'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#D5D1C8] hover:bg-[#F0EEE9]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#282722]">{item.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#C76542]" />}
                      </div>
                      <p className="text-xs text-[#77756E] leading-relaxed">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: AGE */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  How old are you?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Used to calibrate recovery capacity and warm-up requirements.
                </p>
              </div>

              <div className="max-w-xs space-y-3">
                <div>
                  <label htmlFor="age-input" className="block text-xs font-medium text-[#282722] mb-1">
                    Age (years)
                  </label>
                  <input
                    id="age-input"
                    type="number"
                    min="14"
                    max="99"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. 28"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-sm text-[#282722] focus:outline-none focus:border-[#C76542] transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  {[22, 28, 35, 45, 55].map(sampleAge => (
                    <button
                      key={sampleAge}
                      type="button"
                      onClick={() => setAge(String(sampleAge))}
                      className="px-2.5 py-1 text-xs rounded border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-[#77756E]"
                    >
                      {sampleAge}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HEIGHT & WEIGHT */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  What are your height and current weight?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Provides baseline anthropometrics for loading recommendations. Gender is entirely optional.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="height-input" className="block text-xs font-medium text-[#282722] mb-1">
                      Height
                    </label>
                    <input
                      id="height-input"
                      type="text"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder="e.g. 5 ft 10 in or 178 cm"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-sm text-[#282722] focus:outline-none focus:border-[#C76542] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="weight-input" className="block text-xs font-medium text-[#282722] mb-1">
                      Current Weight
                    </label>
                    <input
                      id="weight-input"
                      type="text"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="e.g. 165 lbs or 75 kg"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-sm text-[#282722] focus:outline-none focus:border-[#C76542] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label htmlFor="gender-input" className="block text-xs font-medium text-[#77756E] mb-1">
                    Gender <span className="text-[11px] text-[#77756E]/80">(optional)</span>
                  </label>
                  <input
                    id="gender-input"
                    type="text"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    placeholder="Optional (e.g. Male, Female, Non-binary, or leave blank)"
                    className="w-full max-w-sm px-3.5 py-2 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-xs text-[#282722] focus:outline-none focus:border-[#C76542] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TRAINING EXPERIENCE */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  What is your training experience?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Dictates appropriate exercise complexity and volume thresholds.
                </p>
              </div>

              <div className="space-y-2.5">
                {EXPERIENCE_LEVELS.map(item => {
                  const isSelected = experience === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExperience(item.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#C76542] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(199,101,66,0.1)]'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#D5D1C8] hover:bg-[#F0EEE9]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#282722]">{item.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#C76542]" />}
                      </div>
                      <p className="text-xs text-[#77756E]">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: WHERE DO YOU TRAIN */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  Where do you train?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Filters exercises to only movements you have the gear to execute.
                </p>
              </div>

              <div className="space-y-2.5">
                {TRAINING_LOCATIONS.map(item => {
                  const isSelected = location === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLocation(item.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#C76542] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(199,101,66,0.1)]'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#D5D1C8] hover:bg-[#F0EEE9]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#282722]">{item.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#C76542]" />}
                      </div>
                      <p className="text-xs text-[#77756E]">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: DAYS PER WEEK */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  How many days per week can you train?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Pick a realistic frequency you can sustain week after week without burnout.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {DAYS_OPTIONS.map(days => {
                  const isSelected = daysPerWeek === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDaysPerWeek(days)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-[#C76542] bg-[#FFFFFF] text-[#282722] shadow-[0_1px_3px_rgba(199,101,66,0.1)]'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#77756E] hover:border-[#D5D1C8]'
                      }`}
                    >
                      <span className="block text-2xl font-semibold mb-1">{days}</span>
                      <span className="text-[11px]">days</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[#77756E] bg-[#FFFFFF] p-3 rounded-lg border border-[#E8E5DF]">
                {daysPerWeek === 2 && 'Split strategy: Full Body A & B. High efficiency for busy schedules.'}
                {daysPerWeek === 3 && 'Split strategy: Push / Pull / Legs or 3 Full Body rotations.'}
                {daysPerWeek === 4 && 'Split strategy: Upper / Lower / Upper / Lower. Gold standard for recovery & hypertrophy.'}
                {daysPerWeek === 5 && 'Split strategy: Push / Pull / Legs / Upper / Lower.'}
                {daysPerWeek === 6 && 'Split strategy: Push / Pull / Legs (2× cycle) for high dedication athletes.'}
              </p>
            </div>
          )}

          {/* STEP 7: SESSION DURATION */}
          {step === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  How long can each workout last?
                </h2>
                <p className="text-xs text-[#77756E]">
                  Including rest intervals and proper warmup sets.
                </p>
              </div>

              <div className="space-y-2.5">
                {DURATION_OPTIONS.map(opt => {
                  const isSelected = durationMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => setDurationMinutes(opt.minutes)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C76542] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(199,101,66,0.1)]'
                          : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#D5D1C8] hover:bg-[#F0EEE9]/50'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium text-[#282722] block">{opt.label}</span>
                        <span className="text-xs text-[#77756E]">{opt.description}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-[#C76542]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: INJURIES & LIMITATIONS */}
          {step === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  Do you have any injuries, limitations, or exercises to avoid?
                </h2>
                <p className="text-xs text-[#77756E]">
                  We will automatically exclude compromising movement patterns and prescribe joint-friendly alternatives.
                </p>
              </div>

              <div className="space-y-3">
                <textarea
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  rows={3}
                  placeholder="e.g. Mild lower back sensitivity, avoid barbell deadlifts; right shoulder impingement with overhead pressing."
                  className="w-full p-3 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] text-sm text-[#282722] focus:outline-none focus:border-[#C76542] transition-colors"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#77756E] block font-medium">Quick suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_LIMITATIONS.map(lim => (
                      <button
                        key={lim}
                        type="button"
                        onClick={() => {
                          if (lim.startsWith('None')) {
                            setLimitations('None');
                          } else {
                            setLimitations(prev => (prev && prev !== 'None' ? `${prev}; ${lim}` : lim));
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-full border border-[#E8E5DF] bg-[#FFFFFF] text-[#77756E] hover:text-[#282722] hover:bg-[#F0EEE9] transition-colors"
                      >
                        {lim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: HOME EQUIPMENT (IF HOME OR BOTH) */}
          {step === 9 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium tracking-tight text-[#282722]">
                  {location === 'gym' ? 'Confirming equipment profile' : 'What equipment do you have access to?'}
                </h2>
                <p className="text-xs text-[#77756E]">
                  {location === 'gym'
                    ? 'Commercial gym profile is selected with full access to racks, dumbbells, cables, and machines.'
                    : 'Select everything available in your training space.'}
                </p>
              </div>

              {location === 'gym' ? (
                <div className="p-4 rounded-lg border border-[#E8E5DF] bg-[#FFFFFF] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#282722]">
                    <Check className="h-4 w-4 text-[#C76542]" />
                    <span>Commercial Gym Equipment</span>
                  </div>
                  <p className="text-xs text-[#77756E] leading-relaxed">
                    Includes barbells, power racks, adjustable benches, full dumbbell sets, cable stations, and standard compound machines.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EQUIPMENT_OPTIONS.map(item => {
                    const isChecked = equipment.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEquipment(item)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                          isChecked
                            ? 'border-[#C76542] bg-[#FFFFFF] text-[#282722] font-medium'
                            : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#77756E] hover:border-[#D5D1C8]'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-[#C76542]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="pt-8 border-t border-[#E8E5DF] flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-[#77756E] hover:text-[#282722] transition-colors"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C76542] hover:bg-[#B55938] text-white text-xs font-medium tracking-tight transition-all disabled:opacity-50 shadow-[0_1px_2px_rgba(199,101,66,0.15)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing plan...</span>
                </>
              ) : step === totalSteps ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate my plan</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

