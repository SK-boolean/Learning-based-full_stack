/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Gamepad2, 
  Store, 
  Award, 
  Wind, 
  Sparkles,
  Layers,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { CURRICULUM_LEVELS } from './data/curriculum';
import { DisabilityMode, FontSizeOption, LevelData, DiagnosticReport } from './types';
import { LandingPage } from './components/LandingPage';
import { AdaptiveHeader } from './components/AdaptiveHeader';
import { LearningPath } from './components/LearningPath';
import { ScreeningTest } from './components/ScreeningTest';
import { LearnModal } from './components/LearnModal';
import { PracticeModal } from './components/PracticeModal';
import { VocationalStore } from './components/VocationalStore';
import { AacBoardModal } from './components/AacBoardModal';
import { CalmBreathingModal } from './components/CalmBreathingModal';
import { QuestionBankExplorer } from './components/QuestionBankExplorer';
import { SignUpPage } from './components/SignUpPage';
import { MentorDashboard } from './components/MentorDashboard';
import { NgoDashboard } from './components/NgoDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './services/firebase';
import { playSuccessChime } from './utils/audio';

function AppContent() {
  const { userProfile, demoLogin, updateCurrentUserProfile } = useAuth();

  // Accessibility & Sensory Settings
  const [activeMode, setActiveMode] = useState<DisabilityMode>('autism');
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Learner Progress & Gamification
  const [streakDays, setStreakDays] = useState<number>(5);
  const [gems, setGems] = useState<number>(140);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  // Modals & Navigation
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('learner');
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signup');
  const [isScreeningOpen, setIsScreeningOpen] = useState<boolean>(false);
  const [learnLevel, setLearnLevel] = useState<LevelData | null>(null);
  const [practiceLevel, setPracticeLevel] = useState<LevelData | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [isAacOpen, setIsAacOpen] = useState<boolean>(false);
  const [isVocationalOpen, setIsVocationalOpen] = useState<boolean>(false);
  const [isCalmOpen, setIsCalmOpen] = useState<boolean>(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState<boolean>(false);
  const [isLandingViewActive, setIsLandingViewActive] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'lessons' | 'practice' | 'store' | 'rewards'>('home');
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Synchronize user profile with state and enforce strict access rules
  useEffect(() => {
    if (!userProfile) {
      setIsLandingViewActive(false);
      return;
    }
    if (userProfile.role === 'learner') {
      // Enforce learner's assigned condition track
      if (userProfile.assignedCondition) {
        setActiveMode(userProfile.assignedCondition);
      }
      // Enforce starting and current level
      if (userProfile.currentLevel) {
        setCurrentLevelId(userProfile.currentLevel);
      } else if (userProfile.startingLevel) {
        setCurrentLevelId(userProfile.startingLevel);
      }
      if (userProfile.completedLevels) {
        setCompletedLevels(userProfile.completedLevels);
      }
    }
  }, [userProfile]);

  // Derived settings
  const isDwellActive = activeMode === 'cerebral-palsy';
  const isCpMode = activeMode === 'cerebral-palsy';

  // Level Selection Handler (with access rule enforcement)
  const handleSelectLevel = (level: LevelData) => {
    const isUnlocked = completedLevels.includes(level.id) || level.id <= currentLevelId;
    if (!isUnlocked) {
      setBannerAlert(`Level ${level.id} is locked. Complete Level ${currentLevelId} first to unlock!`);
      setTimeout(() => setBannerAlert(null), 3000);
      return;
    }
    setCurrentLevelId(level.id);
    setPracticeLevel(level);
    setIsTestMode(false);
  };

  // Screening completion (for learner diagnostic test)
  const handleScreeningComplete = async (report: DiagnosticReport) => {
    setActiveMode(report.recommendedMode);
    setCurrentLevelId(report.assignedLevel);
    setIsScreeningOpen(false);
    setGems((prev) => prev + 30);
    setBannerAlert(`Berry placed you on the ${report.recommendedMode.replace('-', ' ')} track at Level ${report.assignedLevel}!`);
    setTimeout(() => setBannerAlert(null), 4000);

    if (userProfile && userProfile.role === 'learner') {
      await updateCurrentUserProfile({
        assignedCondition: report.recommendedMode,
        startingLevel: report.assignedLevel,
        currentLevel: report.assignedLevel,
        screeningCompleted: true,
      });
    }
  };

  const handleLearnComplete = () => {
    if (learnLevel) {
      setGems((prev) => prev + 15);
      playSuccessChime();
      setBannerAlert(`Great job learning ${learnLevel.title}! +15 Berry Coins`);
      setTimeout(() => setBannerAlert(null), 3000);
      setLearnLevel(null);
    }
  };

  const handlePracticeComplete = async (stars: number) => {
    if (practiceLevel) {
      const earnedCoins = stars * 10;
      setGems((prev) => prev + earnedCoins);
      playSuccessChime();

      // Unlock next level if taking cert test or completing practice
      const nextLevel = practiceLevel.id + 1;
      const updatedCompleted = Array.from(new Set([...completedLevels, practiceLevel.id]));
      setCompletedLevels(updatedCompleted);

      if (nextLevel <= CURRICULUM_LEVELS.length && nextLevel > currentLevelId) {
        setCurrentLevelId(nextLevel);
        setBannerAlert(`Awesome! You completed Level ${practiceLevel.id} and unlocked Level ${nextLevel}! +${earnedCoins} Berry Coins`);
      } else {
        setBannerAlert(`Level ${practiceLevel.id} completed with ${stars} stars! +${earnedCoins} Berry Coins`);
      }
      setTimeout(() => setBannerAlert(null), 4000);

      // Persist to user profile
      if (userProfile && userProfile.role === 'learner') {
        await updateCurrentUserProfile({
          currentLevel: Math.max(userProfile.currentLevel || 1, nextLevel),
          completedLevels: updatedCompleted,
        });
      }

      setPracticeLevel(null);
    }
  };

  const handleEarnGems = (amount: number) => {
    setGems((prev) => prev + amount);
    playSuccessChime();
    setBannerAlert(`Earned +${amount} Berry Coins from cashier sales!`);
    setTimeout(() => setBannerAlert(null), 3000);
  };

  // Auth Open Handlers
  const handleOpenLearnerSignup = () => {
    setAuthInitialRole('learner');
    setAuthInitialMode('signup');
    setIsAuthOpen(true);
  };

  const handleOpenMentorSignup = () => {
    setAuthInitialRole('mentor');
    setAuthInitialMode('signup');
    setIsAuthOpen(true);
  };

  const handleOpenNgoSignup = () => {
    setAuthInitialRole('ngo');
    setAuthInitialMode('signup');
    setIsAuthOpen(true);
  };

  const handleOpenSignIn = () => {
    setAuthInitialMode('signin');
    setIsAuthOpen(true);
  };

  // Font size class mapping
  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl font-medium'
  }[fontSize];

  // =========================================================================
  // 1. UN趋AUTHENTICATED STATE: SHOW LANDING PAGE
  // =========================================================================
  if (!userProfile) {
    return (
      <div className={`min-h-screen bg-slate-50 ${fontSizeClass}`}>
        <LandingPage
          onOpenLearnerSignup={handleOpenLearnerSignup}
          onOpenMentorSignup={handleOpenMentorSignup}
          onOpenNgoSignup={handleOpenNgoSignup}
          onOpenSignIn={handleOpenSignIn}
          onQuickDemo={(role) => demoLogin(role)}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
        />

        {/* Signup / Sign In Modal */}
        {isAuthOpen && (
          <SignUpPage
            onClose={() => setIsAuthOpen(false)}
            initialRole={authInitialRole}
            initialMode={authInitialMode}
          />
        )}

        {/* Question Bank Explorer Modal */}
        {isQuestionBankOpen && (
          <QuestionBankExplorer
            onClose={() => setIsQuestionBankOpen(false)}
            onLaunchTestWithCondition={(conditionId) => {
              setIsQuestionBankOpen(false);
              setIsScreeningOpen(true);
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED STATE WITH STRICT ACCESS RULES
  // =========================================================================
  const userRole = userProfile.role;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 ${fontSizeClass} mode-${activeMode}`}>
      {/* Top Accessible Header */}
      <AdaptiveHeader
        activeMode={activeMode}
        onModeChange={(newMode) => {
          // Access rule: Learner cannot switch away from assigned condition
          if (userRole === 'learner') {
            setBannerAlert(`You are securely assigned to the ${activeMode.replace('-', ' ')} track.`);
            setTimeout(() => setBannerAlert(null), 3000);
            return;
          }
          setActiveMode(newMode);
        }}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => setTtsEnabled(!ttsEnabled)}
        streakDays={streakDays}
        gems={gems}
        currentLevel={currentLevelId}
        onOpenCalm={() => setIsCalmOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
        onRetakeScreening={() => setIsScreeningOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onBackToLanding={() => setIsLandingViewActive(true)}
      />

      {/* Global Accessibility Banner Alert */}
      {bannerAlert && (
        <div className="bg-teal-800 text-white px-4 py-2.5 text-center text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{bannerAlert}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* POST-LOGIN LANDING VIEW (WITH TOP-RIGHT SIGN OUT BUTTON)            */}
      {/* ==================================================================== */}
      {isLandingViewActive ? (
        <main className="pb-24 pt-3">
          <div className="max-w-6xl mx-auto px-4 mb-4">
            <div className="bg-teal-50/90 border border-teal-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                <span>🦆</span>
                <span>LearnBuddy Welcome Page • Signed in as {userProfile.displayName || userProfile.email}</span>
              </div>
              <button
                onClick={() => setIsLandingViewActive(false)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs flex items-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <LandingPage
            onOpenLearnerSignup={handleOpenLearnerSignup}
            onOpenMentorSignup={handleOpenMentorSignup}
            onOpenNgoSignup={handleOpenNgoSignup}
            onOpenSignIn={handleOpenSignIn}
            onQuickDemo={(role) => demoLogin(role)}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
            hideHeader={true}
            onReturnToDashboard={() => setIsLandingViewActive(false)}
          />
        </main>
      ) : (
        <>
          {/* ==================================================================== */}
          {/* ROLE 1: LEARNER - STRICT ACCESS TO LEARNER SECTION ONLY              */}
          {/* ==================================================================== */}
          {userRole === 'learner' && (
            <main className="pb-24 pt-4">
              <LearningPath
                levels={CURRICULUM_LEVELS}
                currentLevelId={currentLevelId}
                completedLevels={completedLevels}
                onSelectLevel={handleSelectLevel}
                onOpenLearn={(lvl) => setLearnLevel(lvl)}
                onOpenPractice={(lvl) => {
                  setIsTestMode(false);
                  setPracticeLevel(lvl);
                }}
                onOpenTalk={() => setIsAacOpen(true)}
                onOpenWork={() => setIsVocationalOpen(true)}
                onOpenTest={(lvl) => {
                  setIsTestMode(true);
                  setPracticeLevel(lvl);
                }}
                activeMode={activeMode}
                dwellEnabled={isDwellActive}
                soundEnabled={soundEnabled}
              />
            </main>
          )}

          {/* ==================================================================== */}
          {/* ROLE 2: MENTOR - STRICT ACCESS TO MENTOR SECTION ONLY                */}
          {/* ==================================================================== */}
          {userRole === 'mentor' && (
            <main className="pb-20 pt-2">
              <MentorDashboard />
            </main>
          )}

          {/* ==================================================================== */}
          {/* ROLE 3: NGO - STRICT ACCESS TO NGO SECTION ONLY                      */}
          {/* ==================================================================== */}
          {userRole === 'ngo' && (
            <main className="pb-20 pt-2">
              <NgoDashboard />
            </main>
          )}

          {/* ==================================================================== */}
          {/* ROLE 4: ADMIN - SYSTEM ARCHITECTURE & LOAD BALANCING METRICS         */}
          {/* ==================================================================== */}
          {userRole === 'admin' && (
            <main className="pb-20 pt-2">
              <AdminDashboard />
            </main>
          )}
        </>
      )}

      {/* Bottom Accessible Nav for Learners */}
      {userRole === 'learner' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2.5 px-6 shadow-md md:hidden">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={() => setActiveNavTab('home')}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeNavTab === 'home' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab('lessons');
                const lvl = CURRICULUM_LEVELS.find((l) => l.id === currentLevelId) || CURRICULUM_LEVELS[0];
                setLearnLevel(lvl);
              }}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeNavTab === 'lessons' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Story</span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab('practice');
                const lvl = CURRICULUM_LEVELS.find((l) => l.id === currentLevelId) || CURRICULUM_LEVELS[0];
                setIsTestMode(false);
                setPracticeLevel(lvl);
              }}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeNavTab === 'practice' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Practice</span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab('store');
                setIsVocationalOpen(true);
              }}
              className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
                activeNavTab === 'store' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Bakery</span>
            </button>
          </div>
        </nav>
      )}

      {/* Interactive Modals */}
      {isAuthOpen && (
        <SignUpPage
          onClose={() => setIsAuthOpen(false)}
          initialRole={authInitialRole}
          initialMode={authInitialMode}
        />
      )}

      {isScreeningOpen && (
        <ScreeningTest
          onComplete={handleScreeningComplete}
          onCancel={() => setIsScreeningOpen(false)}
          dwellEnabled={isDwellActive}
          soundEnabled={soundEnabled}
        />
      )}

      {learnLevel && (
        <LearnModal
          level={learnLevel}
          onClose={() => setLearnLevel(null)}
          onComplete={handleLearnComplete}
          dwellEnabled={isDwellActive}
          soundEnabled={soundEnabled}
          isCpMode={isCpMode}
        />
      )}

      {practiceLevel && (
        <PracticeModal
          level={practiceLevel}
          isTestMode={isTestMode}
          onClose={() => setPracticeLevel(null)}
          onComplete={handlePracticeComplete}
          dwellEnabled={isDwellActive}
          soundEnabled={soundEnabled}
          isCpMode={isCpMode}
        />
      )}

      {isAacOpen && (
        <AacBoardModal
          onClose={() => setIsAacOpen(false)}
          dwellEnabled={isDwellActive}
          soundEnabled={soundEnabled}
          isCpMode={isCpMode}
        />
      )}

      {isVocationalOpen && (
        <VocationalStore
          onClose={() => setIsVocationalOpen(false)}
          onEarnGems={handleEarnGems}
          dwellEnabled={isDwellActive}
          soundEnabled={soundEnabled}
          isCpMode={isCpMode}
        />
      )}

      {isCalmOpen && (
        <CalmBreathingModal
          onClose={() => setIsCalmOpen(false)}
          soundEnabled={soundEnabled}
        />
      )}

      {isQuestionBankOpen && (
        <QuestionBankExplorer
          onClose={() => setIsQuestionBankOpen(false)}
          onLaunchTestWithCondition={(conditionId) => {
            setIsQuestionBankOpen(false);
            setIsScreeningOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
