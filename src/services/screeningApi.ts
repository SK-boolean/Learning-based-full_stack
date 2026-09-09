/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client SDK for Adaptive Screening Question Bank & Progression Engine
 */

import { 
  ConditionRecord, 
  QuestionRecord, 
  TestSessionRecord, 
  LevelAssignmentRuleRecord, 
  DiagnosticSummary,
  questionBankDb,
  DifficultyTier
} from './questionBankDb';

export interface StartSessionResponse {
  session: TestSessionRecord;
  firstQuestion: QuestionRecord | null;
  adaptiveStatus: {
    currentTier: DifficultyTier;
    questionsAnswered: number;
    targetCount: number;
    scoreSoFar: number;
  };
}

export interface NextQuestionResponse {
  question: QuestionRecord | null;
  isComplete: boolean;
  currentTier: DifficultyTier;
  questionsAnswered: number;
  targetCount: number;
  scoreSoFar: number;
}

export interface SubmitResponseResult {
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  newTier: DifficultyTier;
  questionsAnswered: number;
  explanation?: string;
}

export const screeningApi = {
  // 1. Conditions
  async getConditions(): Promise<ConditionRecord[]> {
    try {
      const res = await fetch('/api/screening/conditions');
      if (res.ok) {
        const data = await res.json();
        return data.conditions;
      }
    } catch {
      // Fallback
    }
    return questionBankDb.getAllConditions();
  },

  async addCondition(payload: {
    condition_id: string;
    name: string;
    description: string;
    primary_focus?: string;
    icon_name?: string;
  }): Promise<ConditionRecord> {
    try {
      const res = await fetch('/api/screening/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.condition;
      }
    } catch {
      // Fallback
    }
    return questionBankDb.addCondition({
      condition_id: payload.condition_id,
      name: payload.name,
      description: payload.description,
      primary_focus: payload.primary_focus || 'Personalized Focus',
      icon_name: payload.icon_name || 'Brain',
    });
  },

  // 2. Questions
  async getQuestions(conditionId?: string, tier?: DifficultyTier): Promise<QuestionRecord[]> {
    try {
      const url = new URL('/api/screening/questions', window.location.origin);
      if (conditionId) url.searchParams.set('condition_id', conditionId);
      if (tier) url.searchParams.set('tier', String(tier));
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        return data.questions;
      }
    } catch {
      // Fallback
    }
    return conditionId 
      ? questionBankDb.getQuestionsByCondition(conditionId, tier) 
      : questionBankDb.getAllQuestions();
  },

  async addQuestion(question: Omit<QuestionRecord, 'question_id' | 'created_at'> & { question_id?: string }): Promise<QuestionRecord> {
    try {
      const res = await fetch('/api/screening/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question),
      });
      if (res.ok) {
        const data = await res.json();
        return data.question;
      }
    } catch {
      // Fallback
    }
    return questionBankDb.addQuestion(question);
  },

  // 3. Level Rules
  async getRules(conditionId?: string): Promise<LevelAssignmentRuleRecord[]> {
    try {
      const url = new URL('/api/screening/rules', window.location.origin);
      if (conditionId) url.searchParams.set('condition_id', conditionId);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        return data.rules;
      }
    } catch {
      // Fallback
    }
    return questionBankDb.getLevelRules(conditionId);
  },

  // 4. Adaptive Test Flow
  async startSession(learnerId: string, conditionId: string): Promise<StartSessionResponse> {
    try {
      const res = await fetch('/api/screening/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learner_id: learnerId, condition_id: conditionId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const session = questionBankDb.startSession(learnerId, conditionId);
    const nextQ = questionBankDb.getNextQuestion(session.session_id);
    return {
      session,
      firstQuestion: nextQ.question,
      adaptiveStatus: {
        currentTier: nextQ.currentTier,
        questionsAnswered: nextQ.questionsAnswered,
        targetCount: nextQ.targetCount,
        scoreSoFar: nextQ.scoreSoFar,
      },
    };
  },

  async getNextQuestion(sessionId: string): Promise<NextQuestionResponse> {
    try {
      const res = await fetch(`/api/screening/sessions/${sessionId}/next`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return questionBankDb.getNextQuestion(sessionId);
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    learnerAnswer: string,
    timeTakenMs: number
  ): Promise<SubmitResponseResult> {
    try {
      const res = await fetch(`/api/screening/sessions/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          learner_answer: learnerAnswer,
          time_taken_ms: timeTakenMs,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return questionBankDb.submitResponse(sessionId, questionId, learnerAnswer, timeTakenMs);
  },

  async completeSession(sessionId: string): Promise<DiagnosticSummary> {
    try {
      const res = await fetch(`/api/screening/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary;
      }
    } catch {
      // Fallback
    }
    return questionBankDb.completeSession(sessionId);
  },
};
