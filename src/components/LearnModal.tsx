import React, { useState } from 'react';
import { X, Volume2, ArrowRight, ArrowLeft, Check, Sparkles, BookOpen } from 'lucide-react';
import { LevelData } from '../types';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { playSuccessChime, playSoftClick, speakText } from '../utils/audio';

interface LearnModalProps {
  level: LevelData;
  onClose: () => void;
  onComplete: () => void;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
  isCpMode?: boolean;
}

export const LearnModal: React.FC<LearnModalProps> = ({
  level,
  onClose,
  onComplete,
  dwellEnabled = false,
  soundEnabled = true,
  isCpMode = false
}) => {
  const [conceptIndex, setConceptIndex] = useState(0);
  const concepts = level.learnConcepts;
  const currentConcept = concepts[conceptIndex];
  const isLast = conceptIndex === concepts.length - 1;

  const handleNext = () => {
    if (soundEnabled) playSoftClick();
    if (isLast) {
      if (soundEnabled) playSuccessChime();
      onComplete();
    } else {
      setConceptIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (soundEnabled) playSoftClick();
    if (conceptIndex > 0) {
      setConceptIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-teal-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-teal-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-teal-800/80 px-2 py-0.5 rounded-md text-teal-100">
                  Concept {conceptIndex + 1} of {concepts.length}
                </span>
                <span className="text-xs text-teal-200 font-bold">{level.title}</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold mt-0.5">
                {currentConcept.title}
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
          {/* Berry Avatar Guidance */}
          <BerryAvatar
            mood="thinking"
            message={`Let's discover ${currentConcept.title} together! I'll break it down into easy, friendly steps.`}
            size="md"
            soundEnabled={soundEnabled}
            className="mb-6"
          />

          {/* Main Visual Card */}
          <div className="bg-slate-50 border-2 border-teal-100 rounded-2xl p-6 mb-6 text-center">
            <div className="text-6xl mb-4 select-none drop-shadow-sm">
              {currentConcept.icon}
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <h3 className="text-xl font-bold text-gray-900">
                {currentConcept.title}
              </h3>
              <button
                onClick={() => speakText(`${currentConcept.title}. ${currentConcept.description}`)}
                className="p-1.5 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
                title="Read lesson aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-4">
              {currentConcept.description}
            </p>

            <div className="bg-white border border-teal-200 rounded-xl p-3.5 text-left text-sm text-teal-900 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-950 font-bold block mb-0.5">Everyday Life Example:</strong>
                <span>{currentConcept.example}</span>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between gap-3">
            <DwellButton
              dwellEnabled={dwellEnabled}
              soundEnabled={soundEnabled}
              onClick={handlePrev}
              disabled={conceptIndex === 0}
              isLargeCpTarget={isCpMode}
              className="px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-sm flex items-center gap-2 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </DwellButton>

            <div className="flex gap-1.5">
              {concepts.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === conceptIndex ? 'w-6 bg-teal-600' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <DwellButton
              dwellEnabled={dwellEnabled}
              soundEnabled={soundEnabled}
              onClick={handleNext}
              isLargeCpTarget={isCpMode}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md"
            >
              <span>{isLast ? 'Complete & Earn 10 💎' : 'Next Concept'}</span>
              {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </DwellButton>
          </div>
        </div>
      </div>
    </div>
  );
};
