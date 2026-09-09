import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Layers, 
  Activity, 
  HelpCircle,
  Award,
  Zap,
  BookOpen,
  HeartHandshake,
  Eye,
  Brain,
  ShieldCheck,
  Flame,
  Scale
} from 'lucide-react';
import { DiagnosticReport, DisabilityMode } from '../types';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { playSuccessChime, playSoftClick, speakText } from '../utils/audio';
import { 
  screeningApi, 
  StartSessionResponse, 
  NextQuestionResponse,
  SubmitResponseResult 
} from '../services/screeningApi';
import { 
  ConditionRecord, 
  QuestionRecord, 
  DifficultyTier, 
  DiagnosticSummary 
} from '../services/questionBankDb';
import { useAuth } from '../contexts/AuthContext';

interface ScreeningTestProps {
  onComplete: (report: DiagnosticReport) => void;
  onCancel?: () => void;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
  initialConditionId?: string;
}

export const ScreeningTest: React.FC<ScreeningTestProps> = ({
  onComplete,
  onCancel,
  dwellEnabled = false,
  soundEnabled = true,
  initialConditionId = 'autism'
}) => {
  const { userProfile, updateCurrentUserProfile } = useAuth();

  // State
  const [conditions, setConditions] = useState<ConditionRecord[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>(
    userProfile?.assignedCondition || initialConditionId || 'autism'
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionRecord | null>(null);
  const [currentTier, setCurrentTier] = useState<DifficultyTier>(1);
  const [targetCount, setTargetCount] = useState<number>(6);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [runningScore, setRunningScore] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [tierTransitionMsg, setTierTransitionMsg] = useState<string | null>(null);
  const [diagnosticSummary, setDiagnosticSummary] = useState<DiagnosticSummary | null>(null);
  const [jitterCount, setJitterCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; points: number; explanation?: string } | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());

  // Load conditions on mount
  useEffect(() => {
    const loadConditions = async () => {
      const conds = await screeningApi.getConditions();
      setConditions(conds);
    };
    loadConditions();
  }, []);

  // Start test session when condition changes
  const startAdaptiveTest = async (conditionId: string) => {
    setLoading(true);
    setFeedback(null);
    setDiagnosticSummary(null);
    setSelectedOptionId(null);
    setTierTransitionMsg(null);
    setQuestionsAnswered(0);
    setRunningScore(0);

    const learnerId = userProfile?.uid || 'learner_eval';
    const initData: StartSessionResponse = await screeningApi.startSession(learnerId, conditionId);

    setSessionId(initData.session.session_id);
    setCurrentQuestion(initData.firstQuestion);
    setCurrentTier(initData.adaptiveStatus.currentTier);
    setTargetCount(initData.adaptiveStatus.targetCount);
    questionStartTimeRef.current = Date.now();
    setLoading(false);

    if (initData.firstQuestion?.prompt_audio_text && soundEnabled) {
      speakText(initData.firstQuestion.prompt_audio_text);
    }
  };

  useEffect(() => {
    startAdaptiveTest(selectedConditionId);
  }, [selectedConditionId]);

  const handlePointerMove = () => {
    setJitterCount((prev) => prev + 1);
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    if (soundEnabled) playSoftClick();
  };

  // Submit current answer to adaptive engine
  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion || !selectedOptionId || submitting) return;

    setSubmitting(true);
    const timeTaken = Date.now() - questionStartTimeRef.current;

    // Submit answer to backend
    const result: SubmitResponseResult = await screeningApi.submitAnswer(
      sessionId,
      currentQuestion.question_id,
      selectedOptionId,
      timeTaken
    );

    setRunningScore(result.totalScore);
    setQuestionsAnswered(result.questionsAnswered);
    setFeedback({
      isCorrect: result.isCorrect,
      points: result.pointsEarned,
      explanation: result.explanation,
    });

    if (result.isCorrect) {
      if (soundEnabled) playSuccessChime();
    } else {
      if (soundEnabled) playSoftClick();
    }

    // Check if adaptive tier shifted
    if (result.newTier > currentTier) {
      setTierTransitionMsg(
        `Great performance! Adaptive engine advanced you to Tier ${result.newTier} (${
          result.newTier === 2 ? 'Logic & Mathematics' : 'Advanced Problem Solving'
        })!`
      );
    } else if (result.newTier < currentTier) {
      setTierTransitionMsg(`Pacing adapted: providing supportive reinforcement questions.`);
    }
    setCurrentTier(result.newTier);

    // Brief delay to show feedback, then fetch next question or complete
    setTimeout(async () => {
      setFeedback(null);
      setTierTransitionMsg(null);
      setSelectedOptionId(null);

      // Fetch next adaptive question
      const nextData: NextQuestionResponse = await screeningApi.getNextQuestion(sessionId);

      if (nextData.isComplete || !nextData.question) {
        // Complete the session
        const summary = await screeningApi.completeSession(sessionId);
        setDiagnosticSummary(summary);
        if (soundEnabled) playSuccessChime();

        // Also update the learner's profile with the rule-assigned level & condition
        if (updateCurrentUserProfile) {
          updateCurrentUserProfile({
            assignedCondition: summary.condition_id as any,
            currentLevel: summary.assigned_level,
            startingLevel: summary.assigned_level,
            screeningCompleted: true,
          });
        }
      } else {
        setCurrentQuestion(nextData.question);
        setCurrentTier(nextData.currentTier);
        questionStartTimeRef.current = Date.now();
        if (nextData.question.prompt_audio_text && soundEnabled) {
          speakText(nextData.question.prompt_audio_text);
        }
      }
      setSubmitting(false);
    }, 1200);
  };

  const handleConfirmDiagnosticReport = () => {
    if (!diagnosticSummary) return;

    // Map condition to disability mode
    let mode: DisabilityMode = 'standard';
    if (diagnosticSummary.condition_id === 'autism') mode = 'autism';
    else if (diagnosticSummary.condition_id === 'adhd') mode = 'standard';
    else if (diagnosticSummary.condition_id === 'dyslexia') mode = 'dyslexia';
    else if (diagnosticSummary.condition_id === 'cerebral-palsy') mode = 'cerebral-palsy';
    else if (diagnosticSummary.condition_id === 'low-sensory') mode = 'standard';

    const steadiness = Math.max(35, Math.min(98, 100 - Math.round(jitterCount / 12)));

    const report: DiagnosticReport = {
      recommendedMode: mode,
      assignedLevel: diagnosticSummary.assigned_level,
      motorSteadinessScore: steadiness,
      cognitiveScore: diagnosticSummary.score_percentage,
      sensoryPreference: diagnosticSummary.condition_id === 'low-sensory' ? 'Tactile/Low-Sensory' : 'Visual',
      analysisSummary: `Completed ${diagnosticSummary.total_questions_answered} adaptive questions across difficulty tiers up to Tier ${diagnosticSummary.highest_tier_reached}. Score: ${diagnosticSummary.total_score} pts (${diagnosticSummary.score_percentage}%). Level assignment rule mapped learner to ${diagnosticSummary.curriculum_track}.`,
    };

    onComplete(report);
  };

  const currentConditionRecord = conditions.find((c) => c.condition_id === selectedConditionId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-purple-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Adaptive Diagnostic Screening
                </h2>
                <p className="text-xs text-purple-100 font-medium">
                  Dynamic Difficulty Progression & Rule-Based Level Assignment
                </p>
              </div>
            </div>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full font-bold transition-colors"
              >
                Skip / Cancel
              </button>
            )}
          </div>

          {/* Condition Selector Tabs */}
          {!diagnosticSummary && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wide shrink-0">
                Condition Track:
              </span>
              {conditions.map((cond) => (
                <button
                  key={cond.condition_id}
                  onClick={() => setSelectedConditionId(cond.condition_id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedConditionId === cond.condition_id
                      ? 'bg-white text-purple-900 shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cond.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Progress & Adaptive Status */}
          {!diagnosticSummary && (
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-100">
                  Question {questionsAnswered + 1} of {targetCount}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  currentTier === 1
                    ? 'bg-emerald-400 text-emerald-950'
                    : currentTier === 2
                    ? 'bg-amber-300 text-amber-950'
                    : 'bg-rose-300 text-rose-950'
                }`}>
                  Tier {currentTier}: {currentTier === 1 ? 'Foundational' : currentTier === 2 ? 'Logic & Math' : 'Advanced'}
                </span>
              </div>
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Score: {runningScore} pts
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8" onPointerMove={handlePointerMove}>
          {!diagnosticSummary ? (
            loading || !currentQuestion ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Loading condition question pool...</p>
              </div>
            ) : (
              <div>
                {/* Berry Avatar */}
                <BerryAvatar
                  mood={currentTier === 1 ? 'talking' : 'thinking'}
                  message={
                    currentTier === 1
                      ? `Welcome! Let's start with foundational questions for ${currentConditionRecord?.name || 'you'}. Take your time!`
                      : currentTier === 2
                      ? `You did awesome on the basics! Now let's try some logical reasoning & math questions!`
                      : `Super high score! Let's explore advanced problem-solving challenges together!`
                  }
                  size="md"
                  soundEnabled={soundEnabled}
                  className="mb-5"
                />

                {/* Adaptive Tier Transition Banner */}
                {tierTransitionMsg && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-purple-50 border border-amber-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center gap-2 animate-in fade-in">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{tierTransitionMsg}</span>
                  </div>
                )}

                {/* Question Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full capitalize">
                        {currentQuestion.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentQuestion.points_weight} Points
                      </span>
                    </div>
                    {currentQuestion.prompt_audio_text && (
                      <button
                        onClick={() => speakText(currentQuestion.prompt_audio_text!)}
                        className="text-purple-600 hover:text-purple-800 p-1.5 rounded-lg bg-white border border-purple-100"
                        title="Read aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1 mb-4 leading-relaxed">
                    {currentQuestion.question_text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.id)}
                          disabled={submitting}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-md ring-2 ring-purple-200'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50/80 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {opt.icon && <span className="text-2xl">{opt.icon}</span>}
                            <span className="text-sm md:text-base font-semibold">{opt.text}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Feedback Notice */}
                {feedback && (
                  <div className={`p-3.5 mb-5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {feedback.isCorrect 
                        ? `Correct! +${feedback.points} points awarded.` 
                        : `Good try! Every question helps customize your learning path.`}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <DwellButton
                  id="btn-submit-adaptive-answer"
                  dwellEnabled={dwellEnabled}
                  soundEnabled={soundEnabled}
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId || submitting}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
                    selectedOptionId && !submitting
                      ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </DwellButton>
              </div>
            )
          ) : (
            /* DIAGNOSTIC SUMMARY REPORT (RULE-BASED LEVEL ASSIGNMENT) */
            <div className="animate-in fade-in">
              <BerryAvatar
                mood="celebrate"
                message={`Fantastic work! Your adaptive screening is complete. I've placed you into ${diagnosticSummary.curriculum_track}!`}
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-4">
                {/* Level Assignment */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                      Rule-Assigned Level
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {diagnosticSummary.curriculum_track}
                    </span>
                  </div>
                  <span className="font-black text-purple-700 text-lg bg-purple-100 px-4 py-1.5 rounded-2xl border border-purple-200">
                    Level {diagnosticSummary.assigned_level}
                  </span>
                </div>

                {/* Score & Tier Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-400">Weighted Score</div>
                    <div className="text-base font-bold text-slate-900">
                      {diagnosticSummary.total_score} pts
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-400">Accuracy Rate</div>
                    <div className="text-base font-bold text-emerald-700">
                      {diagnosticSummary.accuracy_rate}%
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="text-xs text-slate-400">Highest Tier Reached</div>
                    <div className="text-base font-bold text-indigo-700">
                      Tier {diagnosticSummary.highest_tier_reached}
                    </div>
                  </div>
                </div>

                {/* Pedagogical Notes from Rules Table */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    `level_assignment_rules` Pedagogical Mapping:
                  </strong>
                  {diagnosticSummary.pedagogical_notes}
                </div>
              </div>

              {/* Confirm CTA */}
              <DwellButton
                id="btn-confirm-adaptive-diagnostic"
                dwellEnabled={dwellEnabled}
                soundEnabled={soundEnabled}
                onClick={handleConfirmDiagnosticReport}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Enter Personalized Level {diagnosticSummary.assigned_level} Path</span>
              </DwellButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
