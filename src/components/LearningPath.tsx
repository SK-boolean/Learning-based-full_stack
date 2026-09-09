import React from 'react';
import { 
  Lock, 
  CheckCircle, 
  Sparkles, 
  Award, 
  BookOpen, 
  Gamepad2, 
  MessageSquare, 
  Store, 
  ArrowRight,
  Flame,
  Gem,
  Volume2,
  Trophy
} from 'lucide-react';
import { LevelData, DisabilityMode } from '../types';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { speakText } from '../utils/audio';

interface LearningPathProps {
  levels: LevelData[];
  currentLevelId: number;
  completedLevels: number[];
  onSelectLevel: (level: LevelData) => void;
  onOpenLearn: (level: LevelData) => void;
  onOpenPractice: (level: LevelData) => void;
  onOpenTalk: () => void;
  onOpenWork: () => void;
  onOpenTest: (level: LevelData) => void;
  activeMode: DisabilityMode;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  levels,
  currentLevelId,
  completedLevels,
  onSelectLevel,
  onOpenLearn,
  onOpenPractice,
  onOpenTalk,
  onOpenWork,
  onOpenTest,
  activeMode,
  dwellEnabled = false,
  soundEnabled = true
}) => {
  const currentLevel = levels.find((l) => l.id === currentLevelId) || levels[0];
  const isCpMode = activeMode === 'cerebral-palsy';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Berry Welcome Banner (Like the reference design) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border-2 border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Inclusive Path • Powered by Berry AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Hello, Friend!
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-md">
            Ready to help Berry count coins and practice real-world work skills today?
          </p>

          {/* Berry voice greeting trigger */}
          <button
            onClick={() => speakText("Hello, Friend! Ready to help Berry count coins and practice real-world work skills today?")}
            className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-bold mt-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen to greeting</span>
          </button>
        </div>

        {/* Berry Animated Character */}
        <div className="flex-shrink-0 z-10">
          <BerryAvatar
            mood="happy"
            size="hero"
            showSpeechBubble={false}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Decorative background blob */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-50 rounded-full opacity-60 pointer-events-none" />
      </div>

      {/* Current Level Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center">
              {currentLevel.id}
            </span>
            <span className="font-extrabold text-gray-800 text-sm md:text-base">
              {currentLevel.title}
            </span>
          </div>
          <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            75% Complete
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
          <div 
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: '75%' }}
          />
        </div>
      </div>

      {/* Quick Action Station Hub (Learn, Practice, Talk, Work Sandbox) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Current Level Activities
          </h2>
          <span className="text-xs text-teal-700 font-bold">
            {currentLevel.focusArea}
          </span>
        </div>

        <div className={`grid gap-4 ${
          isCpMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          {/* Learn Button */}
          <DwellButton
            id="action-learn"
            dwellEnabled={dwellEnabled}
            soundEnabled={soundEnabled}
            onClick={() => onOpenLearn(currentLevel)}
            isLargeCpTarget={isCpMode}
            className="bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 hover:border-sky-400 p-5 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">📚</div>
            <div className="font-extrabold text-sky-900 text-sm uppercase tracking-wide">
              Learn
            </div>
            <span className="text-[11px] text-sky-700 font-medium">
              Guided Visual Story
            </span>
          </DwellButton>

          {/* Practice Button */}
          <DwellButton
            id="action-practice"
            dwellEnabled={dwellEnabled}
            soundEnabled={soundEnabled}
            onClick={() => onOpenPractice(currentLevel)}
            isLargeCpTarget={isCpMode}
            className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 p-5 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">🎮</div>
            <div className="font-extrabold text-amber-900 text-sm uppercase tracking-wide">
              Practice
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Earn Berry Coins
            </span>
          </DwellButton>

          {/* Talk / AAC Button */}
          <DwellButton
            id="action-talk"
            dwellEnabled={dwellEnabled}
            soundEnabled={soundEnabled}
            onClick={onOpenTalk}
            isLargeCpTarget={isCpMode}
            className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 p-5 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">💬</div>
            <div className="font-extrabold text-purple-900 text-sm uppercase tracking-wide">
              Talk
            </div>
            <span className="text-[11px] text-purple-700 font-medium">
              Berry Voice Bridge
            </span>
          </DwellButton>

          {/* Vocational Work Sandbox */}
          <DwellButton
            id="action-work"
            dwellEnabled={dwellEnabled}
            soundEnabled={soundEnabled}
            onClick={onOpenWork}
            isLargeCpTarget={isCpMode}
            className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 hover:border-emerald-500 p-5 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">💼</div>
            <div className="font-extrabold text-emerald-900 text-sm uppercase tracking-wide">
              Work Test
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Cashier Sandbox
            </span>
          </DwellButton>
        </div>
      </div>

      {/* Level-Up Certification Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            🏆
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-200">
              Ready to Upgrade?
            </span>
            <h3 className="text-lg md:text-xl font-black">
              Take the {currentLevel.title} Certification Test
            </h3>
            <p className="text-xs text-purple-100 mt-0.5">
              Pass to unlock Level {currentLevel.id + 1} and claim your verified {currentLevel.badgeName} badge!
            </p>
          </div>
        </div>

        <DwellButton
          id="btn-take-cert-test"
          dwellEnabled={dwellEnabled}
          soundEnabled={soundEnabled}
          onClick={() => onOpenTest(currentLevel)}
          isLargeCpTarget={isCpMode}
          className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-6 py-3 rounded-2xl shadow-md text-sm flex items-center gap-2 whitespace-nowrap transition-transform active:scale-95 flex-shrink-0"
        >
          <span>Take Test</span>
          <Trophy className="w-4 h-4" />
        </DwellButton>
      </div>

      {/* The 5-Level Milestone Roadmap (Duolingo-style Path) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
            The 5-Level Competency Roadmap
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Foundation to Financial Independence
          </span>
        </div>

        <div className="space-y-4">
          {levels.map((lvl) => {
            const isCompleted = completedLevels.includes(lvl.id);
            const isCurrent = lvl.id === currentLevelId;
            const isUnlocked = isCompleted || isCurrent || lvl.id <= currentLevelId;

            return (
              <div
                key={lvl.id}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  isCurrent
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                    : isCompleted
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : lvl.badgeIcon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-gray-900">
                          {lvl.title}
                        </h3>
                        {isCurrent && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {lvl.subtitle} • {lvl.focusArea}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isUnlocked ? (
                      <DwellButton
                        dwellEnabled={dwellEnabled}
                        soundEnabled={soundEnabled}
                        onClick={() => onSelectLevel(lvl)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isCurrent ? 'Continue' : 'Review'}
                      </DwellButton>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold px-3 py-1.5 bg-slate-100 rounded-xl">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
