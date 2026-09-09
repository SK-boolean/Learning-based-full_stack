export type DisabilityMode = 
  | 'standard' 
  | 'cerebral-palsy' 
  | 'dyslexia' 
  | 'autism' 
  | 'deaf-mute';

export type FontSizeOption = 'normal' | 'large' | 'extra-large';

export interface ScreeningAnswer {
  questionId: string;
  reactionTimeMs: number;
  jitterCount: number;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface DiagnosticReport {
  recommendedMode: DisabilityMode;
  assignedLevel: number;
  motorSteadinessScore: number; // 0-100
  cognitiveScore: number; // 0-100
  sensoryPreference: 'Visual' | 'Auditory' | 'Tactile/Low-Sensory';
  analysisSummary: string;
}

export interface PracticeQuestion {
  id: string;
  prompt: string;
  subtext?: string;
  type: 'multiple-choice' | 'coin-count' | 'emotion-match' | 'sign-match' | 'item-sort';
  options: {
    id: string;
    text: string;
    icon?: string;
    isCorrect: boolean;
    helperTip?: string;
    value?: number;
  }[];
  targetValue?: number;
  currencyTarget?: number;
  berryHint: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  focusArea: string;
  badgeName: string;
  badgeIcon: string;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  learnConcepts: {
    title: string;
    description: string;
    icon: string;
    example: string;
  }[];
  practiceQuestions: PracticeQuestion[];
  testQuestions: PracticeQuestion[];
  vocationalSimulation?: {
    storeName: string;
    customerPersona: string;
    orderItems: { name: string; icon: string; price: number; quantity: number }[];
    totalCost: number;
    customerSpeech: string;
    expectedResponsePhrase: string;
  };
}

export interface UserState {
  currentLevel: number;
  completedLevels: number[];
  gems: number;
  streakDays: number;
  activeMode: DisabilityMode;
  fontSize: FontSizeOption;
  soundEnabled: boolean;
  ttsEnabled: boolean;
  dwellClickEnabled: boolean;
  dwellDurationMs: number;
  calmOverlayActive: boolean;
  screeningCompleted: boolean;
  diagnosticReport: DiagnosticReport | null;
}
