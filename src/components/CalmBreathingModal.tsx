import React, { useState, useEffect } from 'react';
import { X, Wind, Heart, Sparkles, Volume2 } from 'lucide-react';
import { BerryAvatar } from './BerryAvatar';
import { playCalmBreathingTone } from '../utils/audio';

interface CalmBreathingModalProps {
  onClose: () => void;
  soundEnabled?: boolean;
}

export const CalmBreathingModal: React.FC<CalmBreathingModalProps> = ({
  onClose,
  soundEnabled = true
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(1);

  useEffect(() => {
    if (soundEnabled) {
      playCalmBreathingTone(phase);
    }
  }, [phase, soundEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setPhase('inhale');
            setCycleCount((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const phaseConfig = {
    inhale: {
      label: 'Breathe In Gently...',
      color: 'from-teal-400 to-emerald-400',
      scale: 'scale-125',
      instruction: 'Fill your chest with calm, fresh air.'
    },
    hold: {
      label: 'Hold Softly...',
      color: 'from-amber-300 to-teal-300',
      scale: 'scale-110',
      instruction: 'Feel the peace resting inside you.'
    },
    exhale: {
      label: 'Breathe Out Slowly...',
      color: 'from-sky-300 to-indigo-300',
      scale: 'scale-90',
      instruction: 'Let any tension or worry melt away.'
    }
  };

  const current = phaseConfig[phase];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-2 border-emerald-200 rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
          <Wind className="w-3.5 h-3.5" />
          <span>Berry Sensory Calm Zone • Cycle {cycleCount}</span>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-1">
          {current.label}
        </h3>
        <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
          {current.instruction}
        </p>

        {/* Breathing Orb with Berry */}
        <div className="relative w-52 h-52 mx-auto flex items-center justify-center my-4">
          {/* Animated pulsing outer halo */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${current.color} opacity-40 blur-xl transition-transform duration-1000 ease-in-out ${current.scale}`}
          />
          {/* Outer circle ring */}
          <div
            className={`absolute inset-4 rounded-full border-4 border-dashed border-emerald-300 transition-transform duration-1000 ease-in-out ${current.scale}`}
          />
          {/* Berry Avatar in center */}
          <div className="relative z-10">
            <BerryAvatar
              mood="calm"
              size="md"
              showSpeechBubble={false}
              soundEnabled={false}
            />
          </div>
          {/* Floating timer number */}
          <div className="absolute -bottom-2 bg-white/90 border border-emerald-200 text-emerald-800 font-extrabold text-sm px-3 py-0.5 rounded-full shadow-xs">
            {timer}s
          </div>
        </div>

        {/* Calming reassurance */}
        <div className="mt-6 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
          <p className="font-medium">
            "You are safe, capable, and doing great. Take as much time as you need." — Berry
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-colors text-sm"
        >
          I Feel Calmer, Return to Lessons
        </button>
      </div>
    </div>
  );
};
