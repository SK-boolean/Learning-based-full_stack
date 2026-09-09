import React, { useState } from 'react';
import { 
  Flame, 
  Gem, 
  Volume2, 
  VolumeX, 
  Wind, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  GraduationCap, 
  HeartHandshake,
  Building2,
  Lock,
  Sparkles,
  Database
} from 'lucide-react';
import { DisabilityMode, FontSizeOption } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../services/firebase';
import { SignOutConfirmModal } from './SignOutConfirmModal';

interface AdaptiveHeaderProps {
  activeMode: DisabilityMode;
  onModeChange: (mode: DisabilityMode) => void;
  fontSize: FontSizeOption;
  onFontSizeChange: (size: FontSizeOption) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  streakDays: number;
  gems: number;
  currentLevel: number;
  onOpenCalm: () => void;
  onRetakeScreening: () => void;
  onOpenAuth: () => void;
  onBackToLanding?: () => void;
  onOpenQuestionBank?: () => void;
}

export const AdaptiveHeader: React.FC<AdaptiveHeaderProps> = ({
  activeMode,
  onModeChange,
  fontSize,
  onFontSizeChange,
  soundEnabled,
  onToggleSound,
  streakDays,
  gems,
  currentLevel,
  onOpenCalm,
  onRetakeScreening,
  onOpenAuth,
  onBackToLanding,
  onOpenQuestionBank,
}) => {
  const { userProfile, signOut } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);

  const roleMeta: Record<UserRole, { label: string; bg: string; icon: string; desc: string }> = {
    learner: { 
      label: 'Learner (Protected Track)', 
      bg: 'bg-teal-100 text-teal-900 border-teal-300', 
      icon: '🎓', 
      desc: 'Assigned condition track only' 
    },
    mentor: { 
      label: 'Mentor / Therapist', 
      bg: 'bg-amber-100 text-amber-900 border-amber-300', 
      icon: '🩺', 
      desc: 'Mentor clinical section' 
    },
    ngo: { 
      label: 'NGO / Agency', 
      bg: 'bg-sky-100 text-sky-900 border-sky-300', 
      icon: '🏛️', 
      desc: 'NGO beneficiary section' 
    },
    admin: { 
      label: 'Admin', 
      bg: 'bg-purple-100 text-purple-900 border-purple-300', 
      icon: '🛡️', 
      desc: 'Full administrator access' 
    },
  };

  const currentRole: UserRole = userProfile?.role || 'learner';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Platypus identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onBackToLanding || onRetakeScreening}
            title="Berry - Click to return to Welcome Page"
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-teal-100 border-2 border-teal-300 flex items-center justify-center text-2xl shadow-inner cursor-pointer hover:scale-105 transition-transform"
          >
            🦆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 tracking-tight text-lg md:text-xl">
                LearnBuddy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-700 text-white px-2 py-0.5 rounded-full">
                {currentRole === 'learner' ? 'Learner Portal' : currentRole === 'mentor' ? 'Therapist Portal' : 'NGO Portal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Neurodevelopmental Adaptive Learning Platform
            </p>
          </div>
        </div>

        {/* Center: Strict Role Indicator & Access Enforcement Notice */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>{roleMeta[currentRole].icon}</span>
            <span>{roleMeta[currentRole].label}</span>
          </div>

          <div className="w-px h-3.5 bg-slate-200" />

          {currentRole === 'learner' ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
              <Lock className="w-3 h-3 text-teal-600" />
              <span>Track: {activeMode.replace('-', ' ').toUpperCase()}</span>
            </div>
          ) : currentRole === 'mentor' ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Clinical Mentor Section Only</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
              <Lock className="w-3 h-3 text-sky-600" />
              <span>NGO / Agency Section Only</span>
            </div>
          )}
        </div>

        {/* Gamification Stats: Streak, Gems (Only for Learner) */}
        {currentRole === 'learner' && (
          <div className="hidden lg:flex items-center gap-2 md:gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
            {/* Streak */}
            <div className="flex items-center gap-1 text-amber-600 font-bold text-xs" title="Consecutive learning streak">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streakDays}d</span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Berry Coins / Gems */}
            <div className="flex items-center gap-1 text-teal-700 font-bold text-xs" title="Coins earned through micro-tasks">
              <Gem className="w-3.5 h-3.5 fill-teal-400 text-teal-600" />
              <span>{gems}</span>
            </div>

            <div className="w-px h-3.5 bg-slate-200" />

            {/* Current Level */}
            <div className="flex items-center gap-1 text-teal-800 font-bold text-xs">
              <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded-md text-[10px]">
                Level {currentLevel}
              </span>
            </div>
          </div>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Calm Breathing */}
          <button
            id="btn-calm-breathing"
            onClick={onOpenCalm}
            title="Calm & Relax Sensory Breathing"
            className="hidden md:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span>Calm</span>
          </button>

          {/* Question Bank Explorer Trigger */}
          {onOpenQuestionBank && (
            <button
              id="btn-question-bank"
              onClick={onOpenQuestionBank}
              title="Explore Screening Question Bank Schema, Adaptive Tiers & Rules"
              className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Question Bank</span>
            </button>
          )}

          {/* Sound Mute/Unmute */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute audio chimes" : "Enable sound FX"}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* User Account / Profile Details */}
          {userProfile ? (
            <div className="relative">
              <button
                id="btn-user-profile"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  roleMeta[currentRole].bg
                }`}
              >
                <span>{roleMeta[currentRole].icon}</span>
                <span className="hidden sm:inline font-extrabold max-w-[120px] truncate">
                  {userProfile.displayName || userProfile.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {/* Account Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-extrabold text-xs text-slate-900 truncate">
                      {userProfile.displayName || userProfile.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{userProfile.email}</div>
                    <div className="text-[10px] font-bold text-teal-700 uppercase mt-1">
                      Role: {currentRole}
                    </div>
                    {userProfile.agencyName && (
                      <div className="text-[10px] text-slate-500 mt-0.5">Agency: {userProfile.agencyName}</div>
                    )}
                    {userProfile.ngoName && (
                      <div className="text-[10px] text-slate-500 mt-0.5">Org: {userProfile.ngoName}</div>
                    )}
                  </div>

                  {/* Strict Access Notice */}
                  <div className="p-2.5 bg-slate-50 rounded-xl my-2 text-[11px] text-slate-600 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-teal-600" />
                      <span>Role Enforcement Active</span>
                    </div>
                    <p className="text-[10px] leading-tight">
                      {currentRole === 'learner' 
                        ? 'You are assigned strictly to your learner track and levels. Cross-role navigation is disabled.' 
                        : currentRole === 'mentor' 
                        ? 'You are in the clinical Mentor section. Learner and NGO sections are restricted.' 
                        : 'You are in the NGO/Agency section. Learner and Mentor sections are restricted.'}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-slate-100 flex flex-col gap-1">
                    {onBackToLanding && (
                      <button
                        onClick={() => {
                          onBackToLanding();
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <span>🏠</span>
                        <span>Welcome Landing Page</span>
                      </button>
                    )}

                    <button
                      id="btn-dropdown-signout"
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setIsSignOutModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-open-sign-up"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Join</span>
            </button>
          )}

          {/* TOP-RIGHT CORNER SIGN OUT BUTTON (VISIBLE ON EVERY AUTHENTICATED PAGE) */}
          {userProfile && (
            <button
              id="btn-header-signout"
              onClick={() => setIsSignOutModalOpen(true)}
              title="Sign Out of LearnBuddy"
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/90 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-95 shrink-0 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-extrabold">Sign Out</span>
            </button>
          )}

        </div>
      </div>

      {/* Secondary Bar: Typography and Sensory Tone (for Learner) */}
      {currentRole === 'learner' && (
        <div className="bg-slate-800 text-slate-200 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-400" />
                Assigned Track:
              </span>
              <span className="bg-teal-900 text-teal-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-teal-700">
                {activeMode === 'dyslexia' ? '📖 Dyslexia Phonics Track' : activeMode === 'cerebral-palsy' ? '🖐️ CP Motor & Dwell Track' : '🌸 Autism & Low Sensory Track'}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                (Strictly locked to your doctor assessment & fun test)
              </span>
            </div>

            {/* Text Size Scale */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Font Size:</span>
              {(['normal', 'large', 'extra-large'] as FontSizeOption[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onFontSizeChange(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    fontSize === sz ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {sz === 'normal' ? 'A' : sz === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reusable Sign Out Confirmation Prompt (Accessible & Sensory-Friendly) */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={async () => {
          await signOut();
          if (onBackToLanding) {
            onBackToLanding();
          }
        }}
        userDisplayName={userProfile?.displayName}
        userEmail={userProfile?.email}
        userRole={currentRole}
      />
    </header>
  );
};
