-- ============================================================================
-- Berry Inclusive Learning Platform
-- Neurodevelopmental Screening Question Bank & Adaptive Assessment Schema
-- Supported Dialects: PostgreSQL 12+, SQLite 3.35+, Cloud SQL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CONDITIONS TABLE
-- Stores supported neurodevelopmental conditions. Easily extensible with new rows.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conditions (
    condition_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    primary_focus VARCHAR(100),
    icon_name VARCHAR(50) DEFAULT 'Brain',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. QUESTIONS TABLE
-- Pool of screening questions partitioned by condition_id, tagged with difficulty tier.
-- Tier 1 = Foundational (attention, basic recognition, following instructions)
-- Tier 2 = Intermediate (logical reasoning, sequential patterns, math concepts)
-- Tier 3 = Advanced (problem-solving, multi-step deduction, quantitative analysis)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    question_id VARCHAR(50) PRIMARY KEY,
    condition_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple-choice', 'image-match', 'drag-drop', 'timed-response', 'sequence-order')),
    difficulty_tier INT NOT NULL CHECK (difficulty_tier BETWEEN 1 AND 3),
    category VARCHAR(50) NOT NULL CHECK (category IN ('attention', 'logic', 'math', 'language', 'motor', 'sensory')),
    correct_answer TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of { id: string, text: string, icon?: string, media_url?: string }
    media_url VARCHAR(255),
    prompt_audio_text TEXT,
    points_weight INT NOT NULL DEFAULT 2, -- Default: Tier 1 = 2, Tier 2 = 4, Tier 3 = 6
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condition_id) REFERENCES conditions(condition_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_condition_tier ON questions(condition_id, difficulty_tier);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- ----------------------------------------------------------------------------
-- 3. TEST_SESSIONS TABLE
-- Tracks a learner's active or historical adaptive screening attempt.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    learner_id VARCHAR(100) NOT NULL,
    condition_id VARCHAR(50) NOT NULL,
    current_tier INT NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 3),
    score INT NOT NULL DEFAULT 0,
    max_score_possible INT NOT NULL DEFAULT 0,
    questions_answered INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
    assigned_level INT CHECK (assigned_level IN (1, 2)),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (condition_id) REFERENCES conditions(condition_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_sessions_learner ON test_sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_condition ON test_sessions(condition_id);

-- ----------------------------------------------------------------------------
-- 4. SESSION_RESPONSES TABLE
-- Granular log of every answer provided during an adaptive screening session.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_responses (
    response_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    learner_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    tier_at_time INT NOT NULL DEFAULT 1,
    time_taken INT NOT NULL, -- in milliseconds
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON session_responses(question_id);

-- ----------------------------------------------------------------------------
-- 5. LEVEL_ASSIGNMENT_RULES TABLE
-- Maps weighted test session scores to curriculum levels (Level 1 vs Level 2).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS level_assignment_rules (
    rule_id VARCHAR(50) PRIMARY KEY,
    condition_id VARCHAR(50) NOT NULL,
    score_range_min INT NOT NULL,
    score_range_max INT NOT NULL,
    assigned_level INT NOT NULL CHECK (assigned_level IN (1, 2)),
    curriculum_track_name VARCHAR(100) NOT NULL,
    pedagogical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condition_id) REFERENCES conditions(condition_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rules_condition_range ON level_assignment_rules(condition_id, score_range_min, score_range_max);

-- ----------------------------------------------------------------------------
-- 6. SEED DATA: CONDITIONS
-- ----------------------------------------------------------------------------
INSERT INTO conditions (condition_id, name, description, primary_focus, icon_name) VALUES
('autism', 'Autism Spectrum', 'Sensory-calm visual routines, structured sequencing, and direct clear communications.', 'Social Communication & Visual Structure', 'Sparkles')
ON CONFLICT (condition_id) DO NOTHING;

INSERT INTO conditions (condition_id, name, description, primary_focus, icon_name) VALUES
('adhd', 'Attention Deficit & Hyperactivity (ADHD)', 'High-engagement micro-tasks, immediate feedback, and executive function scaffolding.', 'Sustained Attention & Impulse Control', 'Zap')
ON CONFLICT (condition_id) DO NOTHING;

INSERT INTO conditions (condition_id, name, description, primary_focus, icon_name) VALUES
('dyslexia', 'Dyslexia & Phonological Processing', 'Phonemic awareness, weighted baseline typography, and auditory multimodal reinforcement.', 'Phonological Decoding & Rapid Naming', 'BookOpen')
ON CONFLICT (condition_id) DO NOTHING;

INSERT INTO conditions (condition_id, name, description, primary_focus, icon_name) VALUES
('cerebral-palsy', 'Cerebral Palsy (Motor & Dwell)', 'Expanded clickable targets, dwell-click timer selection, and tremor-tolerant inputs.', 'Motor Control & Ergonomic Access', 'HeartHandshake')
ON CONFLICT (condition_id) DO NOTHING;

INSERT INTO conditions (condition_id, name, description, primary_focus, icon_name) VALUES
('low-sensory', 'Sensory Sensitivity (SPD)', 'Low-contrast neutral palettes, subdued tones, zero flicker, and gentle ambient audio.', 'Sensory Regulation & Cognitive Comfort', 'Eye')
ON CONFLICT (condition_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. SEED DATA: LEVEL ASSIGNMENT RULES
-- Maps score 0-9 -> Level 1 (Foundational), 10-30 -> Level 2 (Intermediate/Advanced)
-- ----------------------------------------------------------------------------
INSERT INTO level_assignment_rules (rule_id, condition_id, score_range_min, score_range_max, assigned_level, curriculum_track_name, pedagogical_notes) VALUES
('rule_autism_l1', 'autism', 0, 9, 1, 'Autism Foundational Track', 'Focus on visual routine icons, 1-step directions, and calm sensory pacing.'),
('rule_autism_l2', 'autism', 10, 30, 2, 'Autism Vocational & Social Track', 'Focus on 2-step sequencing, cashier vocational bakery practice, and peer collaboration.'),

('rule_adhd_l1', 'adhd', 0, 9, 1, 'ADHD Focus Scaffolding Track', 'High-frequency micro-rewards, 30-second focus sprints, and visual countdown cues.'),
('rule_adhd_l2', 'adhd', 10, 30, 2, 'ADHD Executive Function Track', 'Multi-task prioritization, working memory puzzles, and goal-directed persistence.'),

('rule_dyslexia_l1', 'dyslexia', 0, 9, 1, 'Dyslexia Phonemic Track', 'OpenDyslexic weighted font, audio-read aloud on all items, and phoneme pairing.'),
('rule_dyslexia_l2', 'dyslexia', 10, 30, 2, 'Dyslexia Reading & Comprehension Track', 'Contextual sentence construction, vocabulary morphology, and story navigation.'),

('rule_cp_l1', 'cp', 0, 9, 1, 'Cerebral Palsy High-Assist Track', 'Extended 1200ms dwell timers, extra-large touch targets (80px+), and high audio feedback.'),
('rule_cp_l2', 'cp', 10, 30, 2, 'Cerebral Palsy Fluent Access Track', 'Configurable 800ms dwell timers, AAC 12-key switchboard, and vocational cashier controls.'),

('rule_lowsens_l1', 'low-sensory', 0, 9, 1, 'Low Sensory Gentle Calm Track', 'Reduced visual animations, warm slate tones, and gentle breathing breaks.'),
('rule_lowsens_l2', 'low-sensory', 10, 30, 2, 'Low Sensory Autonomous Track', 'Customizable background tints, self-paced logic puzzles, and sensory self-monitoring.')
ON CONFLICT (rule_id) DO NOTHING;
