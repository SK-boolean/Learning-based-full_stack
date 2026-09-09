/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Neurodevelopmental Screening Question Bank Database Engine
 * Implements full relational schema, adaptive difficulty progression,
 * tier-weighted scoring, and rule-based level assignment.
 */

export type QuestionType = 'multiple-choice' | 'image-match' | 'drag-drop' | 'timed-response' | 'sequence-order';
export type QuestionCategory = 'attention' | 'logic' | 'math' | 'language' | 'motor' | 'sensory';
export type DifficultyTier = 1 | 2 | 3;
export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

export interface OptionItem {
  id: string;
  text: string;
  icon?: string;
  media_url?: string;
}

export interface ConditionRecord {
  condition_id: string;
  name: string;
  description: string;
  primary_focus: string;
  icon_name: string;
  created_at: string;
}

export interface QuestionRecord {
  question_id: string;
  condition_id: string;
  question_text: string;
  question_type: QuestionType;
  difficulty_tier: DifficultyTier;
  category: QuestionCategory;
  correct_answer: string;
  options: OptionItem[];
  media_url?: string;
  prompt_audio_text?: string;
  points_weight: number; // Tier 1: 2, Tier 2: 4, Tier 3: 6
  explanation?: string;
  created_at: string;
}

export interface TestSessionRecord {
  session_id: string;
  learner_id: string;
  condition_id: string;
  current_tier: DifficultyTier;
  score: number;
  max_score_possible: number;
  questions_answered: number;
  status: SessionStatus;
  assigned_level: 1 | 2 | null;
  started_at: string;
  completed_at?: string;
}

export interface SessionResponseRecord {
  response_id: string;
  session_id: string;
  question_id: string;
  learner_answer: string;
  is_correct: boolean;
  points_earned: number;
  tier_at_time: DifficultyTier;
  time_taken: number; // in milliseconds
  timestamp: string;
}

export interface LevelAssignmentRuleRecord {
  rule_id: string;
  condition_id: string;
  score_range_min: number;
  score_range_max: number;
  assigned_level: 1 | 2;
  curriculum_track_name: string;
  pedagogical_notes: string;
  created_at: string;
}

export interface DiagnosticSummary {
  session_id: string;
  learner_id: string;
  condition_id: string;
  condition_name: string;
  total_score: number;
  max_possible_score: number;
  score_percentage: number;
  highest_tier_reached: DifficultyTier;
  total_questions_answered: number;
  correct_count: number;
  accuracy_rate: number;
  assigned_level: 1 | 2;
  curriculum_track: string;
  pedagogical_notes: string;
  category_breakdown: Record<QuestionCategory, { total: number; correct: number }>;
  tier_breakdown: Record<DifficultyTier, { total: number; correct: number }>;
  completed_at: string;
}

// ============================================================================
// IN-MEMORY RELATIONAL DATABASE STORE (WITH PERSISTENCE CAPABILITY)
// ============================================================================
class ScreeningQuestionBankDatabase {
  private conditions = new Map<string, ConditionRecord>();
  private questions = new Map<string, QuestionRecord>();
  private testSessions = new Map<string, TestSessionRecord>();
  private sessionResponses = new Map<string, SessionResponseRecord>();
  private levelRules = new Map<string, LevelAssignmentRuleRecord>();

  constructor() {
    this.seedDatabase();
  }

  // --------------------------------------------------------------------------
  // Seed initial conditions, question bank, and level assignment rules
  // --------------------------------------------------------------------------
  private seedDatabase() {
    // 1. Conditions
    const initialConditions: ConditionRecord[] = [
      {
        condition_id: 'autism',
        name: 'Autism Spectrum',
        description: 'Visual routine clarity, predictable cues, and structured sensory pacing.',
        primary_focus: 'Social Cues, Visual Routines & Logical Sequences',
        icon_name: 'Sparkles',
        created_at: new Date().toISOString(),
      },
      {
        condition_id: 'adhd',
        name: 'Attention Deficit (ADHD)',
        description: 'Fast-paced micro tasks, working memory challenges, and executive focus.',
        primary_focus: 'Sustained Attention, Working Memory & Impulse Scaffolding',
        icon_name: 'Zap',
        created_at: new Date().toISOString(),
      },
      {
        condition_id: 'dyslexia',
        name: 'Dyslexia Track',
        description: 'Phonological decoding, weighted baseline typography, and auditory rhyme.',
        primary_focus: 'Phonemic Awareness, Letter Orientation & Story Logic',
        icon_name: 'BookOpen',
        created_at: new Date().toISOString(),
      },
      {
        condition_id: 'cerebral-palsy',
        name: 'Cerebral Palsy (Motor)',
        description: 'Enlarged targets, dwell timer tolerance, and simplified spatial inputs.',
        primary_focus: 'Target Acquisition, Spatial Logic & Quantitative Choice',
        icon_name: 'HeartHandshake',
        created_at: new Date().toISOString(),
      },
      {
        condition_id: 'low-sensory',
        name: 'Low Sensory (SPD)',
        description: 'Subdued tones, gentle breathing pauses, and low-contrast visual logic.',
        primary_focus: 'Sensory Regulation, Quiet Arithmetic & Spatial Calm',
        icon_name: 'Eye',
        created_at: new Date().toISOString(),
      },
    ];

    initialConditions.forEach((c) => this.conditions.set(c.condition_id, c));

    // 2. Questions across Conditions & Tiers
    // Tier 1: Foundational (Attention, basic recognition, following directions)
    // Tier 2: Intermediate (Logic, sequencing, early mathematical relationships)
    // Tier 3: Advanced (Multi-step reasoning, quantitative arithmetic, deduction)
    const initialQuestions: QuestionRecord[] = [
      // ----------------- AUTISM QUESTION POOL -----------------
      {
        question_id: 'aut_q1',
        condition_id: 'autism',
        question_text: 'Help Berry find the happy smile! Which face looks friendly and calm?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_happy',
        options: [
          { id: 'opt_happy', text: 'Gentle Smiling Face', icon: '😊' },
          { id: 'opt_angry', text: 'Frowning Face', icon: '😠' },
          { id: 'opt_sleepy', text: 'Yawning Face', icon: '🥱' },
        ],
        prompt_audio_text: 'Look at the three faces. Tap the gentle smiling face.',
        points_weight: 2,
        explanation: 'Tests basic facial emotion recognition in a calm, non-threatening presentation.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'aut_q2',
        condition_id: 'autism',
        question_text: 'Following Directions: Berry wants to make tea. Tap the Blue Teacup.',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_blue_cup',
        options: [
          { id: 'opt_red_cup', text: 'Red Cup', icon: '🔴' },
          { id: 'opt_blue_cup', text: 'Blue Teacup', icon: '🔵' },
          { id: 'opt_green_cup', text: 'Green Cup', icon: '🟢' },
        ],
        prompt_audio_text: 'Tap on the blue teacup to help Berry.',
        points_weight: 2,
        explanation: 'Tests auditory and visual selective attention to color instructions.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'aut_q3',
        condition_id: 'autism',
        question_text: 'Sequence Logic: First we wash our hands 🧼, next we sit down 🪑. What comes next?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'logic',
        correct_answer: 'opt_eat',
        options: [
          { id: 'opt_sleep', text: 'Go to sleep with shoes', icon: '👟' },
          { id: 'opt_eat', text: 'Eat our delicious lunch', icon: '🥪' },
          { id: 'opt_mud', text: 'Play in wet mud', icon: '🪣' },
        ],
        prompt_audio_text: 'First hands washed, then sitting down. What comes next in the routine?',
        points_weight: 4,
        explanation: 'Assesses 3-step daily routine sequence and context logic.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'aut_q4',
        condition_id: 'autism',
        question_text: 'Pattern Logic: Apple 🍎, Bread 🍞, Apple 🍎, Bread 🍞. What comes next?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'logic',
        correct_answer: 'opt_apple',
        options: [
          { id: 'opt_apple', text: 'Apple 🍎', icon: '🍎' },
          { id: 'opt_chair', text: 'Chair 🪑', icon: '🪑' },
          { id: 'opt_shoe', text: 'Shoe 👟', icon: '👟' },
        ],
        prompt_audio_text: 'Apple, bread, apple, bread. What should be next?',
        points_weight: 4,
        explanation: 'Evaluates ABAB visual pattern extrapolation.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'aut_q5',
        condition_id: 'autism',
        question_text: 'Bakery Math: Berry baked 4 strawberry muffins 🧁. A customer bought 1. How many muffins are left?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'math',
        correct_answer: 'opt_3',
        options: [
          { id: 'opt_2', text: '2 muffins left', icon: '🧁' },
          { id: 'opt_3', text: '3 muffins left', icon: '🧁' },
          { id: 'opt_5', text: '5 muffins left', icon: '🧁' },
        ],
        prompt_audio_text: 'Berry has four muffins. One is sold. Count how many are left on the tray.',
        points_weight: 6,
        explanation: 'Tests concrete subtraction in a real-world vocational bakery scenario.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'aut_q6',
        condition_id: 'autism',
        question_text: 'Logical Classification: Berry is organizing items for the school backpack. Which item DOES NOT belong in a backpack?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'logic',
        correct_answer: 'opt_frying_pan',
        options: [
          { id: 'opt_notebook', text: 'Notebook 📒', icon: '📒' },
          { id: 'opt_pencil', text: 'Pencil ✏️', icon: '✏️' },
          { id: 'opt_frying_pan', text: 'Heavy Frying Pan 🍳', icon: '🍳' },
        ],
        prompt_audio_text: 'Which of these three items does not belong inside a school backpack?',
        points_weight: 6,
        explanation: 'Tests categorical exclusion and executive deduction.',
        created_at: new Date().toISOString(),
      },

      // ----------------- ADHD QUESTION POOL -----------------
      {
        question_id: 'adhd_q1',
        condition_id: 'adhd',
        question_text: 'Visual Search: Find the golden star ⭐ among the circles!',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_star',
        options: [
          { id: 'opt_circle_1', text: 'Grey Circle', icon: '⚪' },
          { id: 'opt_star', text: 'Golden Star', icon: '⭐' },
          { id: 'opt_circle_2', text: 'Dark Circle', icon: '⚫' },
        ],
        prompt_audio_text: 'Quickly tap on the shining golden star.',
        points_weight: 2,
        explanation: 'Tests immediate selective visual focus amid distractor items.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'adhd_q2',
        condition_id: 'adhd',
        question_text: 'Impulse Control: Berry says "Wait for the Green Light 🟢". Which one means GO?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_green',
        options: [
          { id: 'opt_red', text: 'Red Light (Stop)', icon: '🔴' },
          { id: 'opt_green', text: 'Green Light (Go!)', icon: '🟢' },
          { id: 'opt_yellow', text: 'Yellow Light (Wait)', icon: '🟡' },
        ],
        prompt_audio_text: 'Tap only the green light that allows Berry to go.',
        points_weight: 2,
        explanation: 'Assesses response inhibition and rule adherence.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'adhd_q3',
        condition_id: 'adhd',
        question_text: 'Working Memory: Berry showed you a 🎒 Backpack, then a 🍎 Apple. Which item was FIRST?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'logic',
        correct_answer: 'opt_backpack',
        options: [
          { id: 'opt_backpack', text: 'Backpack 🎒 was first', icon: '🎒' },
          { id: 'opt_apple', text: 'Apple 🍎 was first', icon: '🍎' },
          { id: 'opt_book', text: 'Book 📖 was first', icon: '📖' },
        ],
        prompt_audio_text: 'Think back to what Berry showed you. Which object was shown first?',
        points_weight: 4,
        explanation: 'Tests short-term sequential working memory recall.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'adhd_q4',
        condition_id: 'adhd',
        question_text: 'Number Comparison: Which group has MORE coins to buy a treat?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'math',
        correct_answer: 'opt_7',
        options: [
          { id: 'opt_3', text: '3 Berry Coins 🪙', icon: '3️⃣' },
          { id: 'opt_7', text: '7 Berry Coins 🪙', icon: '7️⃣' },
          { id: 'opt_4', text: '4 Berry Coins 🪙', icon: '4️⃣' },
        ],
        prompt_audio_text: 'Compare the three numbers. Which group has the greatest number of coins?',
        points_weight: 4,
        explanation: 'Evaluates numerical magnitude perception under working memory load.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'adhd_q5',
        condition_id: 'adhd',
        question_text: 'Time Estimation: Berry has 10 minutes before the bell rings. Can he finish a 4-minute puzzle and a 3-minute drawing?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'math',
        correct_answer: 'opt_yes',
        options: [
          { id: 'opt_yes', text: 'Yes! 4 + 3 = 7 mins (Plenty of time)', icon: '⏱️' },
          { id: 'opt_no', text: 'No, it takes 20 minutes', icon: '❌' },
          { id: 'opt_not_enough', text: 'No, 7 is bigger than 10', icon: '⏳' },
        ],
        prompt_audio_text: 'Four minutes plus three minutes equals seven minutes. Is that less than ten minutes?',
        points_weight: 6,
        explanation: 'Assesses executive time budgeting and additive mental math.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'adhd_q6',
        condition_id: 'adhd',
        question_text: 'Prioritization Problem: Berry needs to complete 3 tasks. Which task should be done FIRST?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'logic',
        correct_answer: 'opt_homework',
        options: [
          { id: 'opt_play', text: 'Play video games for 3 hours', icon: '🎮' },
          { id: 'opt_homework', text: 'Pack homework notebook due in 10 mins', icon: '📝' },
          { id: 'opt_cloud', text: 'Look out the window at birds', icon: '🪟' },
        ],
        prompt_audio_text: 'Help Berry prioritize what needs attention first before school starts.',
        points_weight: 6,
        explanation: 'Measures executive prioritization and consequence foresight.',
        created_at: new Date().toISOString(),
      },

      // ----------------- DYSLEXIA QUESTION POOL -----------------
      {
        question_id: 'dys_q1',
        condition_id: 'dyslexia',
        question_text: 'Letter Orientation: Look closely at the letter. Which one is the letter "B" (not "D" or "P")?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'language',
        correct_answer: 'opt_b',
        options: [
          { id: 'opt_d', text: 'd (Facing Left)', icon: '🔡' },
          { id: 'opt_b', text: 'b (Facing Right)', icon: '🔤' },
          { id: 'opt_p', text: 'p (Facing Down)', icon: '🔠' },
        ],
        prompt_audio_text: 'Look at the stick and circle. Tap the lowercase b that faces right.',
        points_weight: 2,
        explanation: 'Assesses spatial letter orientation and b/d discrimination.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'dys_q2',
        condition_id: 'dyslexia',
        question_text: 'Sound Matching: Which picture starts with the /b/ sound like "Berry"?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'language',
        correct_answer: 'opt_ball',
        options: [
          { id: 'opt_ball', text: 'Ball ⚽ (/b/ sound)', icon: '⚽' },
          { id: 'opt_sun', text: 'Sun ☀️ (/s/ sound)', icon: '☀️' },
          { id: 'opt_cat', text: 'Cat 🐱 (/k/ sound)', icon: '🐱' },
        ],
        prompt_audio_text: 'Listen carefully: /b/, /b/. Ball, Sun, Cat. Which begins with /b/?',
        points_weight: 2,
        explanation: 'Evaluates initial phoneme isolation with auditory support.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'dys_q3',
        condition_id: 'dyslexia',
        question_text: 'Rhyme Recognition: Which word rhymes with "CAT" 🐱?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'language',
        correct_answer: 'opt_hat',
        options: [
          { id: 'opt_dog', text: 'DOG 🐕', icon: '🐕' },
          { id: 'opt_hat', text: 'HAT 🎩', icon: '🎩' },
          { id: 'opt_fish', text: 'FISH 🐟', icon: '🐟' },
        ],
        prompt_audio_text: 'Which word sounds the same at the end: Cat and Hat, or Cat and Dog?',
        points_weight: 4,
        explanation: 'Tests phonological rime awareness and sound mapping.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'dys_q4',
        condition_id: 'dyslexia',
        question_text: 'Syllable Counting: Clap the word: "BUT-TER-FLY" 🦋. How many beats/syllables?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'language',
        correct_answer: 'opt_3',
        options: [
          { id: 'opt_1', text: '1 Beat', icon: '1️⃣' },
          { id: 'opt_2', text: '2 Beats', icon: '2️⃣' },
          { id: 'opt_3', text: '3 Beats (But-ter-fly)', icon: '3️⃣' },
        ],
        prompt_audio_text: 'Clap with Berry: But... ter... fly! How many claps did you make?',
        points_weight: 4,
        explanation: 'Tests phonological segmentation and rhythmic syllable counting.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'dys_q5',
        condition_id: 'dyslexia',
        question_text: 'Sentence Context Math: "A book shelf has 5 green books 📗 and 4 red books 📕." How many books are on the shelf?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'math',
        correct_answer: 'opt_9',
        options: [
          { id: 'opt_7', text: '7 Books', icon: '7️⃣' },
          { id: 'opt_9', text: '9 Books (5 + 4 = 9)', icon: '9️⃣' },
          { id: 'opt_12', text: '12 Books', icon: '🔟' },
        ],
        prompt_audio_text: 'Five green books plus four red books. Read or listen, then add them together.',
        points_weight: 6,
        explanation: 'Evaluates word-problem reading comprehension combined with addition.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'dys_q6',
        condition_id: 'dyslexia',
        question_text: 'Reading Deduction: "The sun came out and the puddles began to ___." Which word completes the story logically?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'logic',
        correct_answer: 'opt_dry',
        options: [
          { id: 'opt_dry', text: 'DRY up ☀️', icon: '☀️' },
          { id: 'opt_freeze', text: 'FREEZE into ice ❄️', icon: '❄️' },
          { id: 'opt_jump', text: 'JUMP away 🐸', icon: '🐸' },
        ],
        prompt_audio_text: 'When the warm sun shines down, what naturally happens to water puddles?',
        points_weight: 6,
        explanation: 'Measures narrative cloze reasoning and context inference.',
        created_at: new Date().toISOString(),
      },

      // ----------------- CEREBRAL PALSY (MOTOR & DWELL) POOL -----------------
      {
        question_id: 'cp_q1',
        condition_id: 'cerebral-palsy',
        question_text: 'Motor Target: Hold your pointer or gaze on the Large Golden Button 🌟 for 1 second.',
        question_type: 'timed-response',
        difficulty_tier: 1,
        category: 'motor',
        correct_answer: 'opt_target_large',
        options: [
          { id: 'opt_target_large', text: 'Large Golden Target 🌟', icon: '🌟' },
          { id: 'opt_target_small', text: 'Small Star ⭐', icon: '⭐' },
        ],
        prompt_audio_text: 'Rest your mouse or finger on the big star button.',
        points_weight: 2,
        explanation: 'Tests gross motor cursor stability and dwell-click capability.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'cp_q2',
        condition_id: 'cerebral-palsy',
        question_text: 'High-Contrast Choice: Which arrow points towards the RIGHT? ➡️',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_right',
        options: [
          { id: 'opt_left', text: 'Left Arrow ⬅️', icon: '⬅️' },
          { id: 'opt_right', text: 'Right Arrow ➡️', icon: '➡️' },
        ],
        prompt_audio_text: 'Select the arrow that points forward to the right.',
        points_weight: 2,
        explanation: 'Assesses directional discrimination with enlarged 80px target pads.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'cp_q3',
        condition_id: 'cerebral-palsy',
        question_text: 'Size Comparison: Which cake is BIGGER for sharing with friends?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'logic',
        correct_answer: 'opt_big_cake',
        options: [
          { id: 'opt_big_cake', text: 'Big Party Cake 🎂', icon: '🎂' },
          { id: 'opt_cupcake', text: 'Tiny Cupcake 🧁', icon: '🧁' },
        ],
        prompt_audio_text: 'Look at the two treats. Tap the bigger cake.',
        points_weight: 4,
        explanation: 'Evaluates relative magnitude and visual comparison.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'cp_q4',
        condition_id: 'cerebral-palsy',
        question_text: 'Quantity Match: Which tray has EXACTLY 3 cookies? 🍪',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'math',
        correct_answer: 'opt_3_cookies',
        options: [
          { id: 'opt_1_cookie', text: '1 Cookie 🍪', icon: '1️⃣' },
          { id: 'opt_3_cookies', text: '3 Cookies 🍪🍪🍪', icon: '3️⃣' },
          { id: 'opt_6_cookies', text: '6 Cookies', icon: '6️⃣' },
        ],
        prompt_audio_text: 'Count carefully: one, two, three. Tap the tray with three cookies.',
        points_weight: 4,
        explanation: 'Measures subitizing and small-set counting with accessible controls.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'cp_q5',
        condition_id: 'cerebral-palsy',
        question_text: 'Cashier Arithmetic: 2 coins + 2 coins = How many coins in total? 🪙',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'math',
        correct_answer: 'opt_4',
        options: [
          { id: 'opt_3', text: '3 Coins', icon: '3️⃣' },
          { id: 'opt_4', text: '4 Coins (2 + 2 = 4)', icon: '4️⃣' },
          { id: 'opt_5', text: '5 Coins', icon: '5️⃣' },
        ],
        prompt_audio_text: 'Add two coins plus two coins. What is the total sum?',
        points_weight: 6,
        explanation: 'Tests basic arithmetic operations with high dwell assistance.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'cp_q6',
        condition_id: 'cerebral-palsy',
        question_text: 'Multi-Step AAC Choice: Berry is thirsty 🥛 and hot ☀️. Which icon helps Berry communicate this best?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'logic',
        correct_answer: 'opt_water',
        options: [
          { id: 'opt_water', text: '"I want Cold Water" 🧊🥛', icon: '🥛' },
          { id: 'opt_jacket', text: '"Put on heavy winter coat" 🧥', icon: '🧥' },
          { id: 'opt_umbrella', text: '"Open rain umbrella" ☂️', icon: '☂️' },
        ],
        prompt_audio_text: 'Berry feels hot and thirsty. Which button should Berry press on the board?',
        points_weight: 6,
        explanation: 'Evaluates functional communication logic and cause-effect deduction.',
        created_at: new Date().toISOString(),
      },

      // ----------------- LOW SENSORY (SPD) QUESTION POOL -----------------
      {
        question_id: 'ls_q1',
        condition_id: 'low-sensory',
        question_text: 'Calm Observation: Which color feels gentle and peaceful on the eyes?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'sensory',
        correct_answer: 'opt_soft_blue',
        options: [
          { id: 'opt_soft_blue', text: 'Soft Slate Blue (Gentle)', icon: '🌊' },
          { id: 'opt_neon_pink', text: 'Flashing Neon Pink (High glare)', icon: '⚡' },
          { id: 'opt_neon_yellow', text: 'Bright Strobe Yellow', icon: '💥' },
        ],
        prompt_audio_text: 'Select the color tone that feels soft, cool, and comfortable.',
        points_weight: 2,
        explanation: 'Assesses sensory comfort preference and self-regulation awareness.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'ls_q2',
        condition_id: 'low-sensory',
        question_text: 'Quiet Breathing: Berry is inhaling slowly... 🌬️ What comes after breathing in?',
        question_type: 'multiple-choice',
        difficulty_tier: 1,
        category: 'attention',
        correct_answer: 'opt_exhale',
        options: [
          { id: 'opt_exhale', text: 'Exhale slowly (Breathe out) 🍃', icon: '🍃' },
          { id: 'opt_shout', text: 'Shout loudly into microphone 📢', icon: '📢' },
        ],
        prompt_audio_text: 'Take a gentle breath in. Then breathe slowly out.',
        points_weight: 2,
        explanation: 'Reinforces grounding pacing and attention stabilization.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'ls_q3',
        condition_id: 'low-sensory',
        question_text: 'Daylight Sequence: Morning Sunrise 🌅 ➔ Bright Afternoon ☀️ ➔ What comes next?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'logic',
        correct_answer: 'opt_evening',
        options: [
          { id: 'opt_evening', text: 'Quiet Evening & Stars 🌙', icon: '🌙' },
          { id: 'opt_noon', text: 'Noon again immediately', icon: '☀️' },
        ],
        prompt_audio_text: 'Morning, then afternoon. What follows next in the day?',
        points_weight: 4,
        explanation: 'Tests cyclical chronological logic in a serene context.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'ls_q4',
        condition_id: 'low-sensory',
        question_text: 'Quiet Count: 3 soft clouds ☁️ plus 2 soft clouds ☁️ = How many clouds in the sky?',
        question_type: 'multiple-choice',
        difficulty_tier: 2,
        category: 'math',
        correct_answer: 'opt_5',
        options: [
          { id: 'opt_4', text: '4 Clouds', icon: '4️⃣' },
          { id: 'opt_5', text: '5 Clouds (3 + 2 = 5)', icon: '5️⃣' },
          { id: 'opt_6', text: '6 Clouds', icon: '6️⃣' },
        ],
        prompt_audio_text: 'Three clouds and two more clouds. Count all the clouds in the calm sky.',
        points_weight: 4,
        explanation: 'Evaluates basic addition without overwhelming audiovisual stimuli.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'ls_q5',
        condition_id: 'low-sensory',
        question_text: 'Library Math: The quiet study room had 8 books 📚. 3 books were placed on the cart. How many books remain on the table?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'math',
        correct_answer: 'opt_5_books',
        options: [
          { id: 'opt_4_books', text: '4 Books', icon: '4️⃣' },
          { id: 'opt_5_books', text: '5 Books (8 - 3 = 5)', icon: '5️⃣' },
          { id: 'opt_6_books', text: '6 Books', icon: '6️⃣' },
        ],
        prompt_audio_text: 'Eight books on the table. Three are put away. How many stay on the table?',
        points_weight: 6,
        explanation: 'Assesses word problem arithmetic in a quiet library vignette.',
        created_at: new Date().toISOString(),
      },
      {
        question_id: 'ls_q6',
        condition_id: 'low-sensory',
        question_text: 'Sensory Regulation Deduction: When the classroom gets too noisy, what is the best helper for Berry?',
        question_type: 'multiple-choice',
        difficulty_tier: 3,
        category: 'logic',
        correct_answer: 'opt_headphones',
        options: [
          { id: 'opt_headphones', text: 'Put on soft noise-canceling headphones 🎧', icon: '🎧' },
          { id: 'opt_drums', text: 'Bang on loud metal drums 🥁', icon: '🥁' },
          { id: 'opt_alarm', text: 'Ring a loud fire bell 🔔', icon: '🔔' },
        ],
        prompt_audio_text: 'If a room gets too noisy, which tool helps keep Berry calm and focused?',
        points_weight: 6,
        explanation: 'Tests practical self-advocacy and sensory accommodation problem-solving.',
        created_at: new Date().toISOString(),
      },
    ];

    initialQuestions.forEach((q) => this.questions.set(q.question_id, q));

    // 3. Level Assignment Rules
    const initialRules: LevelAssignmentRuleRecord[] = [
      {
        rule_id: 'rule_aut_l1',
        condition_id: 'autism',
        score_range_min: 0,
        score_range_max: 9,
        assigned_level: 1,
        curriculum_track_name: 'Autism Spectrum: Foundational Level 1',
        pedagogical_notes: 'Visual routines, 1-step directions, low stimulus scaffolding.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_aut_l2',
        condition_id: 'autism',
        score_range_min: 10,
        score_range_max: 30,
        assigned_level: 2,
        curriculum_track_name: 'Autism Spectrum: Intermediate Vocational Level 2',
        pedagogical_notes: 'Multi-step sequences, vocational bakery cashier, and collaborative AAC.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_adhd_l1',
        condition_id: 'adhd',
        score_range_min: 0,
        score_range_max: 9,
        assigned_level: 1,
        curriculum_track_name: 'ADHD: Foundational Sprint Level 1',
        pedagogical_notes: 'Micro-rewards, visual timers, and 30-second sustained attention blocks.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_adhd_l2',
        condition_id: 'adhd',
        score_range_min: 10,
        score_range_max: 30,
        assigned_level: 2,
        curriculum_track_name: 'ADHD: Executive Function Level 2',
        pedagogical_notes: 'Working memory exercises, task prioritization, and delayed gratification loops.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_dys_l1',
        condition_id: 'dyslexia',
        score_range_min: 0,
        score_range_max: 9,
        assigned_level: 1,
        curriculum_track_name: 'Dyslexia: Phonemic Decoding Level 1',
        pedagogical_notes: 'High-contrast weighted baseline fonts, b/d guidance, and continuous TTS.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_dys_l2',
        condition_id: 'dyslexia',
        score_range_min: 10,
        score_range_max: 30,
        assigned_level: 2,
        curriculum_track_name: 'Dyslexia: Reading & Story Comprehension Level 2',
        pedagogical_notes: 'Multi-syllable chunking, vocational customer orders, and narrative cloze.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_cp_l1',
        condition_id: 'cerebral-palsy',
        score_range_min: 0,
        score_range_max: 9,
        assigned_level: 1,
        curriculum_track_name: 'Cerebral Palsy: High-Assist Dwell Level 1',
        pedagogical_notes: '1200ms dwell timers, 80px+ click boxes, and involuntary tremor filtering.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_cp_l2',
        condition_id: 'cerebral-palsy',
        score_range_min: 10,
        score_range_max: 30,
        assigned_level: 2,
        curriculum_track_name: 'Cerebral Palsy: Fluent AAC & Work Level 2',
        pedagogical_notes: 'Dynamic 800ms dwell timers, 12-key communicative boards, and cashier register.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_ls_l1',
        condition_id: 'low-sensory',
        score_range_min: 0,
        score_range_max: 9,
        assigned_level: 1,
        curriculum_track_name: 'Low Sensory: Gentle Calm Level 1',
        pedagogical_notes: 'Warm neutral palettes, zero motion flicker, and built-in breathing pauses.',
        created_at: new Date().toISOString(),
      },
      {
        rule_id: 'rule_ls_l2',
        condition_id: 'low-sensory',
        score_range_min: 10,
        score_range_max: 30,
        assigned_level: 2,
        curriculum_track_name: 'Low Sensory: Self-Regulated Logic Level 2',
        pedagogical_notes: 'Self-paced arithmetic puzzles, sensory toolkit monitoring, and independent goals.',
        created_at: new Date().toISOString(),
      },
    ];

    initialRules.forEach((r) => this.levelRules.set(r.rule_id, r));
  }

  // ==========================================================================
  // QUERY & CRUD API (EXTENSIBLE WITH ZERO CODE CHANGES)
  // ==========================================================================
  public getAllConditions(): ConditionRecord[] {
    return Array.from(this.conditions.values());
  }

  public getCondition(conditionId: string): ConditionRecord | undefined {
    return this.conditions.get(conditionId);
  }

  public addCondition(condition: Omit<ConditionRecord, 'created_at'>): ConditionRecord {
    const record: ConditionRecord = {
      ...condition,
      created_at: new Date().toISOString(),
    };
    this.conditions.set(record.condition_id, record);
    return record;
  }

  public getQuestionsByCondition(conditionId: string, tier?: DifficultyTier): QuestionRecord[] {
    return Array.from(this.questions.values()).filter(
      (q) => q.condition_id === conditionId && (tier === undefined || q.difficulty_tier === tier)
    );
  }

  public getAllQuestions(): QuestionRecord[] {
    return Array.from(this.questions.values());
  }

  public getQuestion(questionId: string): QuestionRecord | undefined {
    return this.questions.get(questionId);
  }

  public addQuestion(question: Omit<QuestionRecord, 'question_id' | 'created_at'> & { question_id?: string }): QuestionRecord {
    const qid = question.question_id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: QuestionRecord = {
      ...question,
      question_id: qid,
      points_weight: question.points_weight || (question.difficulty_tier === 1 ? 2 : question.difficulty_tier === 2 ? 4 : 6),
      created_at: new Date().toISOString(),
    };
    this.questions.set(record.question_id, record);
    return record;
  }

  public getLevelRules(conditionId?: string): LevelAssignmentRuleRecord[] {
    const rules = Array.from(this.levelRules.values());
    if (conditionId) {
      return rules.filter((r) => r.condition_id === conditionId);
    }
    return rules;
  }

  public addLevelRule(rule: Omit<LevelAssignmentRuleRecord, 'rule_id' | 'created_at'> & { rule_id?: string }): LevelAssignmentRuleRecord {
    const rid = rule.rule_id || `rule_${Date.now()}`;
    const record: LevelAssignmentRuleRecord = {
      ...rule,
      rule_id: rid,
      created_at: new Date().toISOString(),
    };
    this.levelRules.set(record.rule_id, record);
    return record;
  }

  // ==========================================================================
  // ADAPTIVE TESTING ENGINE
  // ==========================================================================

  /**
   * Starts a new screening session for a learner and target condition.
   */
  public startSession(learnerId: string, conditionId: string): TestSessionRecord {
    const cond = this.conditions.get(conditionId);
    if (!cond) {
      throw new Error(`Condition "${conditionId}" does not exist in the question bank database.`);
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session: TestSessionRecord = {
      session_id: sessionId,
      learner_id: learnerId,
      condition_id: conditionId,
      current_tier: 1, // All screening starts at foundational tier 1
      score: 0,
      max_score_possible: 0,
      questions_answered: 0,
      status: 'in-progress',
      assigned_level: null,
      started_at: new Date().toISOString(),
    };

    this.testSessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): TestSessionRecord | undefined {
    return this.testSessions.get(sessionId);
  }

  public getSessionResponses(sessionId: string): SessionResponseRecord[] {
    return Array.from(this.sessionResponses.values()).filter((r) => r.session_id === sessionId);
  }

  /**
   * Adaptive Question Selection Logic:
   * 1. Looks up existing responses for this session.
   * 2. Evaluates performance so far:
   *    - Questions 1-2: Always Tier 1 (attention, basic recognition, following directions).
   *    - If learner scores >= 65% in Tier 1: System promotes to Tier 2 (introducing logic, sequential reasoning, and math).
   *    - If learner struggles in Tier 1 (< 50%): System continues with foundational Tier 1 questions.
   *    - If learner scores >= 70% in Tier 2: System advances to Tier 3 (advanced problem-solving & math deduction).
   * 3. Finds an unanswered question matching the adapted tier for this condition.
   * 4. If no questions remaining in that tier, falls back gracefully or signals completion.
   */
  public getNextQuestion(sessionId: string): {
    question: QuestionRecord | null;
    isComplete: boolean;
    currentTier: DifficultyTier;
    questionsAnswered: number;
    targetCount: number;
    scoreSoFar: number;
  } {
    const session = this.testSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status === 'completed') {
      return {
        question: null,
        isComplete: true,
        currentTier: session.current_tier,
        questionsAnswered: session.questions_answered,
        targetCount: 6,
        scoreSoFar: session.score,
      };
    }

    const responses = this.getSessionResponses(sessionId);
    const answeredQuestionIds = new Set(responses.map((r) => r.question_id));
    const allConditionQuestions = this.getQuestionsByCondition(session.condition_id);

    // Target total questions per screening test session (e.g. 5 to 6 questions)
    const TARGET_QUESTION_COUNT = Math.min(6, allConditionQuestions.length);

    if (responses.length >= TARGET_QUESTION_COUNT) {
      return {
        question: null,
        isComplete: true,
        currentTier: session.current_tier,
        questionsAnswered: responses.length,
        targetCount: TARGET_QUESTION_COUNT,
        scoreSoFar: session.score,
      };
    }

    // Evaluate Adaptive Progression
    let targetTier: DifficultyTier = 1;
    const tier1Responses = responses.filter((r) => r.tier_at_time === 1);
    const tier2Responses = responses.filter((r) => r.tier_at_time === 2);

    if (tier1Responses.length >= 2) {
      const tier1Correct = tier1Responses.filter((r) => r.is_correct).length;
      const tier1Accuracy = tier1Correct / tier1Responses.length;

      if (tier1Accuracy >= 0.5) {
        // Learner handled foundational tier well -> advance to Tier 2 (logic / math)
        targetTier = 2;

        if (tier2Responses.length >= 2) {
          const tier2Correct = tier2Responses.filter((r) => r.is_correct).length;
          const tier2Accuracy = tier2Correct / tier2Responses.length;

          if (tier2Accuracy >= 0.5) {
            // Learner excelling at logic & math -> advance to Tier 3 (advanced problem-solving)
            targetTier = 3;
          }
        }
      } else {
        // Reinforce with Tier 1
        targetTier = 1;
      }
    }

    // Update session's current tier
    session.current_tier = targetTier;

    // Find next unanswered question matching targetTier
    let candidateQuestions = allConditionQuestions.filter(
      (q) => q.difficulty_tier === targetTier && !answeredQuestionIds.has(q.question_id)
    );

    // If no remaining questions in targetTier, pick from adjacent tier
    if (candidateQuestions.length === 0) {
      candidateQuestions = allConditionQuestions.filter((q) => !answeredQuestionIds.has(q.question_id));
    }

    if (candidateQuestions.length === 0) {
      // All questions exhausted
      return {
        question: null,
        isComplete: true,
        currentTier: session.current_tier,
        questionsAnswered: responses.length,
        targetCount: TARGET_QUESTION_COUNT,
        scoreSoFar: session.score,
      };
    }

    const nextQ = candidateQuestions[0];

    return {
      question: nextQ,
      isComplete: false,
      currentTier: targetTier,
      questionsAnswered: responses.length,
      targetCount: TARGET_QUESTION_COUNT,
      scoreSoFar: session.score,
    };
  }

  /**
   * Records a response, tallies weighted score, and dynamically assesses adaptive tier.
   */
  public submitResponse(
    sessionId: string,
    questionId: string,
    learnerAnswer: string,
    timeTakenMs: number
  ): {
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    newTier: DifficultyTier;
    questionsAnswered: number;
    explanation?: string;
  } {
    const session = this.testSessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const question = this.questions.get(questionId);
    if (!question) throw new Error(`Question ${questionId} not found`);

    const isCorrect = learnerAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
    const pointsEarned = isCorrect ? question.points_weight : 0;

    const responseRecord: SessionResponseRecord = {
      response_id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      session_id: sessionId,
      question_id: questionId,
      learner_answer: learnerAnswer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      tier_at_time: question.difficulty_tier,
      time_taken: timeTakenMs,
      timestamp: new Date().toISOString(),
    };

    this.sessionResponses.set(responseRecord.response_id, responseRecord);

    // Update Session aggregates
    session.score += pointsEarned;
    session.max_score_possible += question.points_weight;
    session.questions_answered += 1;

    // Check next adaptive tier
    const nextCheck = this.getNextQuestion(sessionId);

    return {
      isCorrect,
      pointsEarned,
      totalScore: session.score,
      newTier: nextCheck.currentTier,
      questionsAnswered: session.questions_answered,
      explanation: question.explanation,
    };
  }

  /**
   * Finalizes the screening session:
   * - Sets completed_at and marks completed
   * - Maps score to Level 1 or 2 using the level_assignment_rules table
   * - Synthesizes comprehensive category and tier diagnostic breakdown
   */
  public completeSession(sessionId: string): DiagnosticSummary {
    const session = this.testSessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const responses = this.getSessionResponses(sessionId);
    session.status = 'completed';
    session.completed_at = new Date().toISOString();

    // Look up rule in level_assignment_rules table for condition and score range
    const rules = this.getLevelRules(session.condition_id);
    let matchedRule = rules.find(
      (r) => session.score >= r.score_range_min && session.score <= r.score_range_max
    );

    // Fallback if score exceeds maximum registered rule
    if (!matchedRule && rules.length > 0) {
      // Sort by score_range_max desc
      const sorted = [...rules].sort((a, b) => b.score_range_max - a.score_range_max);
      matchedRule = sorted[0];
    }

    const assignedLevel: 1 | 2 = matchedRule ? matchedRule.assigned_level : (session.score >= 10 ? 2 : 1);
    session.assigned_level = assignedLevel;

    // Category breakdown
    const categoryBreakdown: Record<QuestionCategory, { total: number; correct: number }> = {
      attention: { total: 0, correct: 0 },
      logic: { total: 0, correct: 0 },
      math: { total: 0, correct: 0 },
      language: { total: 0, correct: 0 },
      motor: { total: 0, correct: 0 },
      sensory: { total: 0, correct: 0 },
    };

    const tierBreakdown: Record<DifficultyTier, { total: number; correct: number }> = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
    };

    let highestTier: DifficultyTier = 1;
    let totalCorrect = 0;

    responses.forEach((r) => {
      const q = this.questions.get(r.question_id);
      if (q) {
        if (categoryBreakdown[q.category]) {
          categoryBreakdown[q.category].total += 1;
          if (r.is_correct) categoryBreakdown[q.category].correct += 1;
        }
      }

      tierBreakdown[r.tier_at_time].total += 1;
      if (r.is_correct) {
        tierBreakdown[r.tier_at_time].correct += 1;
        totalCorrect += 1;
      }

      if (r.tier_at_time > highestTier) {
        highestTier = r.tier_at_time;
      }
    });

    const cond = this.conditions.get(session.condition_id);
    const scorePct = session.max_score_possible > 0 
      ? Math.round((session.score / session.max_score_possible) * 100)
      : 0;
    const accuracyRate = responses.length > 0
      ? Math.round((totalCorrect / responses.length) * 100)
      : 0;

    return {
      session_id: sessionId,
      learner_id: session.learner_id,
      condition_id: session.condition_id,
      condition_name: cond ? cond.name : session.condition_id,
      total_score: session.score,
      max_possible_score: session.max_score_possible,
      score_percentage: scorePct,
      highest_tier_reached: highestTier,
      total_questions_answered: responses.length,
      correct_count: totalCorrect,
      accuracy_rate: accuracyRate,
      assigned_level: assignedLevel,
      curriculum_track: matchedRule ? matchedRule.curriculum_track_name : `Track Level ${assignedLevel}`,
      pedagogical_notes: matchedRule ? matchedRule.pedagogical_notes : 'Standard personalized learning track.',
      category_breakdown: categoryBreakdown,
      tier_breakdown: tierBreakdown,
      completed_at: session.completed_at,
    };
  }
}

// Export singleton database instance
export const questionBankDb = new ScreeningQuestionBankDatabase();
