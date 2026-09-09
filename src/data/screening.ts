import { DisabilityMode, DiagnosticReport } from '../types';

export interface ScreeningStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  category: 'visual-pattern' | 'motor-steadiness' | 'literacy-phonetic' | 'sensory-social';
  title: string;
  instruction: string;
  berryMessage: string;
  testType: 'select-shape' | 'tap-target-motor' | 'word-dyslexia' | 'communication-preference';
  options?: {
    id: string;
    label: string;
    sublabel?: string;
    icon?: string;
    isCorrect?: boolean;
    suggestsMode?: DisabilityMode;
    weightLevel?: number;
  }[];
}

export const SCREENING_STEPS: ScreeningStep[] = [
  {
    id: 'screen-1',
    stepNumber: 1,
    totalSteps: 4,
    category: 'visual-pattern',
    title: 'Pattern & Shape Matching',
    instruction: 'Help Berry match the shape that completes the pattern!',
    berryMessage: "Hi there! I'm Berry. Let's play a quick game so I can prepare the most fun lessons for you!",
    testType: 'select-shape',
    options: [
      { id: 'opt-circle', label: 'Circle 🟡', icon: '🟡', isCorrect: false, weightLevel: 1 },
      { id: 'opt-star', label: 'Star ⭐', icon: '⭐', isCorrect: true, weightLevel: 2 },
      { id: 'opt-square', label: 'Square 🟦', icon: '🟦', isCorrect: false, weightLevel: 1 }
    ]
  },
  {
    id: 'screen-2',
    stepNumber: 2,
    totalSteps: 4,
    category: 'motor-steadiness',
    title: 'Touch & Motor Calibration',
    instruction: 'Tap the glowing target when you feel ready. (We measure touch steadiness to adapt button sizes)',
    berryMessage: 'Take your time! No rush at all. Tap the gentle glowing button when you are ready.',
    testType: 'tap-target-motor',
    options: [
      { id: 'motor-standard', label: 'I can tap easily', icon: '👆', suggestsMode: 'standard', weightLevel: 3 },
      { id: 'motor-cp', label: 'My hands shake or stiffen (Make buttons BIG & easy to tap)', icon: '🖐️', suggestsMode: 'cerebral-palsy', weightLevel: 2 }
    ]
  },
  {
    id: 'screen-3',
    stepNumber: 3,
    totalSteps: 4,
    category: 'literacy-phonetic',
    title: 'Reading & Letter Ease',
    instruction: 'Which letter starts the word "Berry"? 🦆',
    berryMessage: 'Listen to the sound: "B-B-Berry!" If letters ever seem to spin or dance, I have a special reading font for you!',
    testType: 'word-dyslexia',
    options: [
      { id: 'letter-b', label: 'B (Berry)', icon: '🅱️', isCorrect: true, suggestsMode: 'standard', weightLevel: 3 },
      { id: 'letter-d', label: 'd (flipped)', icon: '🔡', isCorrect: false, suggestsMode: 'dyslexia', weightLevel: 2 },
      { id: 'audio-mode', label: 'Read aloud for me 🔊', icon: '🔊', suggestsMode: 'dyslexia', weightLevel: 2 }
    ]
  },
  {
    id: 'screen-4',
    stepNumber: 4,
    totalSteps: 4,
    category: 'sensory-social',
    title: 'Sensory & Communication Style',
    instruction: 'How do you learn best and feel most comfortable?',
    berryMessage: 'Your comfort is my top priority. Pick how you like the app to feel!',
    testType: 'communication-preference',
    options: [
      { id: 'pref-calm', label: 'Calm pastels & quiet sounds (Low Sensory)', icon: '🌸', suggestsMode: 'autism', weightLevel: 3 },
      { id: 'pref-sign', label: 'Sign Language & Visual Picture Cards (AAC)', icon: '🤟', suggestsMode: 'deaf-mute', weightLevel: 3 },
      { id: 'pref-standard', label: 'Standard interactive games & cheerful sounds', icon: '🎮', suggestsMode: 'standard', weightLevel: 3 }
    ]
  }
];

export function computeScreeningDiagnosis(
  answers: Record<string, { optionId: string; reactionTimeMs: number; jitterCount: number }>
): DiagnosticReport {
  let recommendedMode: DisabilityMode = 'standard';
  let assignedLevel = 2; // default
  let motorSteadiness = 88;
  let cognitiveScore = 80;
  let sensoryPreference: 'Visual' | 'Auditory' | 'Tactile/Low-Sensory' = 'Visual';
  let summary = 'Standard personalized path initialized with Berry.';

  const s2 = answers['screen-2'];
  const s3 = answers['screen-3'];
  const s4 = answers['screen-4'];

  // Check motor
  if (s2?.optionId === 'motor-cp' || (s2 && s2.jitterCount > 2)) {
    recommendedMode = 'cerebral-palsy';
    motorSteadiness = 48;
    summary = 'Cerebral Palsy / Motor Ease detected. Auto-enabled: 200% Touch Targets, Dwell-selection (hover to click), and tremor jitter-filter.';
    assignedLevel = 2;
  } else if (s3?.optionId === 'letter-d' || s3?.optionId === 'audio-mode') {
    recommendedMode = 'dyslexia';
    sensoryPreference = 'Auditory';
    summary = 'Dyslexia Friendly detected. Auto-enabled: High-legibility baseline weighted fonts, color overlays, and automatic audio speech read-aloud.';
    assignedLevel = 2;
  } else if (s4?.optionId === 'pref-calm') {
    recommendedMode = 'autism';
    sensoryPreference = 'Tactile/Low-Sensory';
    summary = 'Autism & Low-Sensory Profile detected. Auto-enabled: Calming muted pastels, persistent breathing guide, and predictable visual routines.';
    assignedLevel = 3;
  } else if (s4?.optionId === 'pref-sign') {
    recommendedMode = 'deaf-mute';
    sensoryPreference = 'Visual';
    summary = 'Deaf & Non-Verbal Communication Profile detected. Auto-enabled: ISL Sign Language cards, Berry digital voice-to-customer bridge, and visual AAC board.';
    assignedLevel = 3;
  } else {
    recommendedMode = 'standard';
    assignedLevel = 3;
    summary = 'Universal Balanced Profile. Auto-enabled: Interactive lessons with money skills, vocational practice, and Berry voice coach.';
  }

  return {
    recommendedMode,
    assignedLevel,
    motorSteadinessScore: motorSteadiness,
    cognitiveScore,
    sensoryPreference,
    analysisSummary: summary
  };
}
