import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Award,
  HelpCircle,
  Gem
} from 'lucide-react';
import { LevelData, PracticeQuestion } from '../types';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { playSuccessChime, playGentleRetry, playSoftClick, speakText } from '../utils/audio';

interface PracticeModalProps {
  level: LevelData;
  isTestMode?: boolean; // If true, this is the Level-Up Certification Test
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
  isCpMode?: boolean;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  level,
  isTestMode = false,
  onClose,
  onComplete,
  dwellEnabled = false,
  soundEnabled = true,
  isCpMode = false
}) => {
  const questions: PracticeQuestion[] = isTestMode ? level.testQuestions : level.practiceQuestions;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  const handleSelectOption = (optId: string) => {
    if (feedbackState !== 'idle') return;
    setSelectedOptionId(optId);
    if (soundEnabled) playSoftClick();
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || feedbackState !== 'idle') return;

    const opt = currentQ.options.find((o) => o.id === selectedOptionId);
    const isCorrect = opt?.isCorrect ?? false;

    if (isCorrect) {
      setFeedbackState('correct');
      setCorrectCount((prev) => prev + 1);
      if (soundEnabled) playSuccessChime();
    } else {
      setFeedbackState('incorrect');
      if (soundEnabled) playGentleRetry();
    }
  };

  const handleNext = () => {
    setFeedbackState('idle');
    setSelectedOptionId(null);

    if (isLast) {
      setFinished(true);
      if (soundEnabled) playSuccessChime();
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const passed = isTestMode ? finalScore >= 50 : true;
    onComplete(finalScore, passed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-teal-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isTestMode 
            ? 'bg-gradient-to-r from-purple-700 to-indigo-700' 
            : 'bg-gradient-to-r from-teal-600 to-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              {isTestMode ? '🏆' : '🎮'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  {isTestMode ? 'Level-Up Certification Exam' : 'Practice Challenge'}
                </span>
                <span className="text-xs opacity-90">
                  Question {questionIndex + 1} of {questions.length}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold mt-0.5">
                {level.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {!finished ? (
            <div>
              {/* Berry's guidance */}
              <BerryAvatar
                mood={
                  feedbackState === 'correct' 
                    ? 'celebrate' 
                    : feedbackState === 'incorrect' 
                    ? 'thinking' 
                    : 'idle'
                }
                message={
                  feedbackState === 'correct'
                    ? "Fantastic! You nailed it! Look at that bright thinking!"
                    : feedbackState === 'incorrect'
                    ? `Close one! Here's a tip: ${currentQ.berryHint}`
                    : `Ready? Take your time and pick the best answer below.`
                }
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              {/* Question Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug">
                      {currentQ.prompt}
                    </h3>
                    {currentQ.subtext && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {currentQ.subtext}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(currentQ.prompt)}
                    className="p-2 rounded-xl bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors flex-shrink-0"
                    title="Read aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className={`grid gap-3 mb-6 ${
                isCpMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optStyle = 'border-slate-200 bg-white hover:bg-slate-50';

                  if (feedbackState === 'idle') {
                    if (isSelected) {
                      optStyle = 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/30';
                    }
                  } else if (feedbackState === 'correct') {
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/40';
                    } else if (isSelected) {
                      optStyle = 'border-slate-200 bg-slate-100 opacity-50';
                    }
                  } else if (feedbackState === 'incorrect') {
                    if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/40';
                    }
                  }

                  return (
                    <DwellButton
                      key={opt.id}
                      dwellEnabled={dwellEnabled}
                      soundEnabled={soundEnabled}
                      disabled={feedbackState !== 'idle'}
                      onClick={() => handleSelectOption(opt.id)}
                      isLargeCpTarget={isCpMode}
                      className={`p-4 border-2 text-left flex items-center gap-3 transition-all ${optStyle}`}
                    >
                      {opt.icon && (
                        <span className="text-2xl md:text-3xl flex-shrink-0">
                          {opt.icon}
                        </span>
                      )}
                      <div className="flex-1">
                        <span className="font-bold text-gray-800 text-sm md:text-base block">
                          {opt.text}
                        </span>
                        {feedbackState === 'correct' && opt.isCorrect && opt.helperTip && (
                          <span className="text-xs text-emerald-700 block mt-1 font-medium">
                            {opt.helperTip}
                          </span>
                        )}
                      </div>
                      {feedbackState === 'correct' && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      )}
                    </DwellButton>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-500">
                  Score: {correctCount} / {questions.length}
                </div>

                {feedbackState === 'idle' ? (
                  <DwellButton
                    dwellEnabled={dwellEnabled}
                    soundEnabled={soundEnabled}
                    disabled={!selectedOptionId}
                    onClick={handleCheckAnswer}
                    isLargeCpTarget={isCpMode}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md disabled:opacity-40"
                  >
                    <span>Check Answer</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </DwellButton>
                ) : (
                  <DwellButton
                    dwellEnabled={dwellEnabled}
                    soundEnabled={soundEnabled}
                    onClick={handleNext}
                    isLargeCpTarget={isCpMode}
                    className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md"
                  >
                    <span>{isLast ? 'View Results' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </DwellButton>
                )}
              </div>
            </div>
          ) : (
            /* Results Finish Card */
            <div className="text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-4xl mb-4 shadow-sm">
                {isTestMode ? '🎖️' : '🌟'}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {isTestMode ? 'Level Certification Complete!' : 'Practice Session Finished!'}
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto mt-1 mb-6">
                You solved {correctCount} out of {questions.length} questions correctly!
              </p>

              {/* Berry celebrate avatar */}
              <BerryAvatar
                mood="celebrate"
                message={
                  isTestMode
                    ? `Congratulations! You mastered ${level.title} and earned your verified ${level.badgeName} badge!`
                    : `You are making wonderful progress every single day. I'm so proud of your dedication!`
                }
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              {/* Reward Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase">Accuracy</div>
                  <div className="text-2xl font-extrabold text-teal-700">
                    {Math.round((correctCount / questions.length) * 100)}%
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase">Reward</div>
                  <div className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                    <Gem className="w-5 h-5 fill-amber-400" />
                    <span>+{isTestMode ? 50 : 20}</span>
                  </div>
                </div>
                {isTestMode && (
                  <>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-500 uppercase">Skill Badge</div>
                      <div className="text-base font-extrabold text-purple-700">
                        {level.badgeIcon} {level.badgeName}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DwellButton
                dwellEnabled={dwellEnabled}
                soundEnabled={soundEnabled}
                onClick={handleFinish}
                isLargeCpTarget={isCpMode}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <span>{isTestMode ? 'Claim Badge & Level Up!' : 'Continue My Journey'}</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </DwellButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
