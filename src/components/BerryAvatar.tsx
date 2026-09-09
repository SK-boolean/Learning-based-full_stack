import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/audio';

export type BerryMood = 'idle' | 'happy' | 'celebrate' | 'thinking' | 'calm' | 'talking' | 'sign';

interface BerryAvatarProps {
  mood?: BerryMood;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSpeechBubble?: boolean;
  soundEnabled?: boolean;
  onBerryClick?: () => void;
  className?: string;
}

export const BerryAvatar: React.FC<BerryAvatarProps> = ({
  mood = 'idle',
  message,
  size = 'md',
  showSpeechBubble = true,
  soundEnabled = true,
  onBerryClick,
  className = ''
}) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message, () => setIsSpeaking(false));
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
    hero: 'w-52 h-52'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Berry Mascot */}
      <div 
        onClick={onBerryClick}
        title="Berry the Platypus (Your Inclusive AI Mentor)"
        className={`relative flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 select-none ${sizeClasses[size]}`}
      >
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Body Gradient */}
            <linearGradient id="berryBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="60%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>

            {/* Beak Gradient */}
            <linearGradient id="berryBillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Tail Gradient */}
            <linearGradient id="berryTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#042F2E" />
            </linearGradient>

            {/* Hat Gradient */}
            <linearGradient id="berryHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>

          {/* Beaver Tail */}
          <path 
            d="M 40,135 C 10,130 5,165 30,175 C 60,185 85,160 80,140 Z" 
            fill="url(#berryTailGrad)" 
            opacity="0.95"
            className={mood === 'celebrate' || mood === 'happy' ? 'animate-bounce' : ''}
          />
          {/* Tail Texture Hatching */}
          <path d="M 25,145 L 45,160 M 35,140 L 60,165 M 50,140 L 70,160" stroke="#042F2E" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

          {/* Back Left Foot */}
          <ellipse cx="65" cy="168" rx="16" ry="8" fill="#F59E0B" />

          {/* Main Body */}
          <path 
            d="M 70,75 C 70,35 140,35 140,75 C 145,115 155,160 115,168 C 75,172 65,135 70,75 Z" 
            fill="url(#berryBodyGrad)" 
          />

          {/* Tummy highlight */}
          <ellipse cx="108" cy="118" rx="26" ry="34" fill="#5EEAD4" opacity="0.25" />

          {/* Front Right Foot */}
          <ellipse cx="130" cy="168" rx="16" ry="8" fill="#F59E0B" />

          {/* Cute Detective / Mentor Fedora Hat */}
          <g transform="translate(0, -6)">
            <ellipse cx="105" cy="50" rx="42" ry="7" fill="#6D28D9" />
            <path d="M 80,50 C 80,24 130,24 130,50 Z" fill="url(#berryHatGrad)" />
            <rect x="80" y="44" width="50" height="6" rx="2" fill="#FBBF24" />
          </g>

          {/* Eyes */}
          {mood === 'calm' ? (
            // Peaceful sleeping/smiling curved eyes
            <g stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 86,72 Q 95,78 104,72" />
              <path d="M 116,72 Q 125,78 134,72" />
            </g>
          ) : (
            // Big friendly open eyes
            <g>
              {/* Left Eye */}
              <circle cx="95" cy="70" r="10" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.5" />
              <circle cx={mood === 'thinking' ? 98 : 96} cy={mood === 'thinking' ? 67 : 70} r="6" fill="#0F172A" />
              <circle cx="98" cy="68" r="2.5" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="125" cy="70" r="10" fill="#FFFFFF" stroke="#0F766E" strokeWidth="1.5" />
              <circle cx={mood === 'thinking' ? 128 : 126} cy={mood === 'thinking' ? 67 : 70} r="6" fill="#0F172A" />
              <circle cx="128" cy="68" r="2.5" fill="#FFFFFF" />

              {/* Cheerful rosy cheeks */}
              <ellipse cx="80" cy="85" rx="6" ry="4" fill="#FDA4AF" opacity="0.7" />
              <ellipse cx="140" cy="85" rx="6" ry="4" fill="#FDA4AF" opacity="0.7" />
            </g>
          )}

          {/* Platypus Bill / Beak */}
          <g transform={mood === 'talking' ? 'translate(0, 2)' : ''}>
            {/* Upper bill */}
            <path 
              d="M 82,85 C 80,78 140,78 138,85 C 146,98 142,106 110,107 C 78,106 74,98 82,85 Z" 
              fill="url(#berryBillGrad)" 
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Nostrils */}
            <ellipse cx="102" cy="88" rx="2" ry="1.5" fill="#78350F" />
            <ellipse cx="118" cy="88" rx="2" ry="1.5" fill="#78350F" />
            {/* Smile crease */}
            <path d="M 98,96 Q 110,102 122,96" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>

          {/* Paws */}
          {mood === 'celebrate' ? (
            // Hands raised up high in celebration
            <g fill="#F59E0B">
              <path d="M 65,85 C 50,60 45,70 60,95 Z" />
              <path d="M 145,85 C 160,60 165,70 150,95 Z" />
            </g>
          ) : mood === 'thinking' ? (
            // Paw touching beak
            <g fill="#F59E0B">
              <ellipse cx="134" cy="98" rx="10" ry="7" />
              <ellipse cx="76" cy="115" rx="9" ry="6" />
            </g>
          ) : (
            // Friendly resting paws
            <g fill="#F59E0B">
              <ellipse cx="76" cy="112" rx="9" ry="6" />
              <ellipse cx="142" cy="112" rx="9" ry="6" />
            </g>
          )}

          {/* Sparkles if celebrating */}
          {(mood === 'celebrate' || mood === 'happy') && (
            <g fill="#FBBF24" className="animate-pulse">
              <polygon points="50,45 54,35 64,39 56,47 60,57 50,51 40,57 44,47 36,39 46,35" transform="scale(0.5) translate(40, 20)" />
              <polygon points="50,45 54,35 64,39 56,47 60,57 50,51 40,57 44,47 36,39 46,35" transform="scale(0.4) translate(310, 40)" />
            </g>
          )}
        </svg>

        {/* Small floating badge */}
        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 border border-amber-200">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Berry</span>
        </div>
      </div>

      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div className="relative flex-1 bg-white border-2 border-teal-200 rounded-2xl p-3.5 shadow-sm min-w-[200px] max-w-xl transition-all">
          {/* Arrow */}
          <div className="absolute left-0 top-6 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent z-10" />
          <div className="absolute left-0 top-6 -translate-x-2.5 w-0 h-0 border-t-[9px] border-t-transparent border-r-[9px] border-r-teal-200 border-b-[9px] border-b-transparent z-0" />

          <div className="flex items-start justify-between gap-2">
            <p className="text-gray-800 text-sm md:text-base font-medium leading-relaxed">
              {message}
            </p>
            {soundEnabled && (
              <button
                id="btn-berry-speak"
                onClick={handleSpeak}
                title={isSpeaking ? "Stop reading" : "Listen to Berry's voice"}
                className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                  isSpeaking ? 'bg-teal-500 text-white animate-pulse' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
