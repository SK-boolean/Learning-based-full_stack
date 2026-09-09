import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  GraduationCap, 
  HeartHandshake, 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Smile, 
  Info,
  ExternalLink,
  Layers,
  Heart,
  UserCheck,
  Database,
  LogOut
} from 'lucide-react';
import { BerryAvatar } from './BerryAvatar';
import { speakText, stopSpeaking } from '../utils/audio';
import { useAuth } from '../contexts/AuthContext';
import { SignOutConfirmModal } from './SignOutConfirmModal';

interface LandingPageProps {
  onOpenLearnerSignup: () => void;
  onOpenMentorSignup: () => void;
  onOpenNgoSignup: () => void;
  onOpenSignIn: () => void;
  onQuickDemo: (role: 'learner' | 'mentor' | 'ngo') => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenQuestionBank?: () => void;
  hideHeader?: boolean;
  onReturnToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLearnerSignup,
  onOpenMentorSignup,
  onOpenNgoSignup,
  onOpenSignIn,
  onQuickDemo,
  reducedMotion,
  onToggleReducedMotion,
  soundEnabled,
  onToggleSound,
  onOpenQuestionBank,
  hideHeader = false,
  onReturnToDashboard
}) => {
  const { userProfile, signOut } = useAuth();
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);
  const [isPlayingAbout, setIsPlayingAbout] = useState(false);
  const [activePartnerModal, setActivePartnerModal] = useState<string | null>(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const greetingText = "Hello Friend! Ready to help Berry count coins and practice real-world work skills today? We have a calm, friendly space made just for you.";
  const aboutText = "LearnBuddy is an inclusive neurodevelopmental learning platform. We offer calm, sensory-friendly education adapted for autism, dyslexia, cerebral palsy, and sensory sensitivities with real-world practice, therapist notes, and NGO community support.";

  const handlePlayGreeting = () => {
    if (isPlayingGreeting) {
      stopSpeaking();
      setIsPlayingGreeting(false);
    } else {
      setIsPlayingGreeting(true);
      speakText(greetingText, () => setIsPlayingGreeting(false));
    }
  };

  const handlePlayAbout = () => {
    if (isPlayingAbout) {
      stopSpeaking();
      setIsPlayingAbout(false);
    } else {
      setIsPlayingAbout(true);
      speakText(aboutText, () => setIsPlayingAbout(false));
    }
  };

  // Verified Partner Organizations (NGOs and Agencies Involved)
  const partnerOrganizations = [
    {
      id: 'afa',
      name: 'Action for Autism (AFA)',
      type: 'National Autism Center',
      tagline: 'Pioneering autism advocacy, early identification, and specialized education.',
      icon: '🧩',
      location: 'New Delhi, India',
      focus: 'Autism & Sensory Processing',
      verified: true
    },
    {
      id: 'dai',
      name: 'Dyslexia Association & Learning Clinic',
      type: 'Remedial Learning Society',
      tagline: 'Multi-sensory phonics, structured literacy, and cognitive remediation.',
      icon: '📖',
      location: 'Mumbai, Maharashtra',
      focus: 'Dyslexia & Phonics',
      verified: true
    },
    {
      id: 'cp-alliance',
      name: 'The Spastics Society & CP Alliance',
      type: 'Cerebral Palsy Trust',
      tagline: 'Motor coordination rehabilitation, assistive devices, and barrier-free access.',
      icon: '♿',
      location: 'Kolkata, West Bengal',
      focus: 'Cerebral Palsy & Motor Support',
      verified: true
    },
    {
      id: 'inclusive-minds',
      name: 'Inclusive Minds Foundation',
      type: 'Registered Section 8 NGO',
      tagline: 'Sensory-friendly classrooms, teacher training, and assistive grants.',
      icon: '🏛️',
      location: 'Bengaluru, Karnataka',
      focus: 'Inclusive Schools & Grants',
      verified: true
    },
    {
      id: 'samarthanam',
      name: 'Samarthanam Trust for the Disabled',
      type: 'National Rehabilitation NGO',
      tagline: 'Vocational training, livelihood transition, and assistive technology distribution.',
      icon: '🤝',
      location: 'Pan-India Reach',
      focus: 'Vocational & Livelihoods',
      verified: true
    },
    {
      id: 'sensory-hub',
      name: 'Pediatric Sensory & OT Care Hub',
      type: 'Clinical Therapy Agency',
      tagline: 'Pediatric occupational therapy, sensory diets, and motor regulation.',
      icon: '🍃',
      location: 'Hyderabad, Telangana',
      focus: 'Low Sensory Processing',
      verified: true
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Calm, Accessible Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center text-xl font-bold shadow-2xs">
                🦆
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                  LearnBuddy <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">Inclusive</span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Neurodevelopmental Adaptive Learning & Care Ecosystem
                </p>
              </div>
            </div>

            {/* Accessibility Controls & Auth Buttons */}
            <div className="flex items-center gap-2">
              {/* Reduced Motion Toggle */}
              <button
                onClick={onToggleReducedMotion}
                title={reducedMotion ? "Enable Soft Animations" : "Disable Animations (Reduced Motion)"}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  reducedMotion 
                    ? 'bg-amber-50 text-amber-900 border-amber-300' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">{reducedMotion ? 'Still Mode' : 'Motion Safe'}</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  soundEnabled 
                    ? 'bg-teal-50 text-teal-900 border-teal-300' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span className="hidden md:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
              </button>

              {/* Question Bank Explorer Modal Trigger */}
              {onOpenQuestionBank && (
                <button
                  onClick={onOpenQuestionBank}
                  title="Explore Screening Question Bank Schema & Engine"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Database className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Question Bank</span>
                </button>
              )}

              {/* AUTH ACTIONS: If logged in, show Dashboard return & top-right Sign Out; if not, show Sign In */}
              {userProfile ? (
                <div className="flex items-center gap-2">
                  {onReturnToDashboard && (
                    <button
                      onClick={onReturnToDashboard}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200 flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* TOP-RIGHT CORNER SIGN OUT BUTTON */}
                  <button
                    id="btn-landing-signout"
                    onClick={() => setIsSignOutModalOpen(true)}
                    title="Sign Out of LearnBuddy"
                    className="px-3 py-2 rounded-xl text-xs font-extrabold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 transition-all border border-rose-200/90 flex items-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-landing-signin"
                  onClick={onOpenSignIn}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 shadow-2xs"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 1. HERO GREETING SECTION */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-teal-100 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3.5 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Calm, Sensory-Friendly Learning Space</span>
            </div>

            {/* Prompt Mandated Greeting */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Hello Friend! <br className="hidden sm:inline" />
              <span className="text-teal-700">Ready to help...</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Berry is your friendly platypus guide. We help neurodivergent learners practice everyday skills, counting coins, and communication at a peaceful, reassuring pace.
            </p>

            {/* Prompt Mandated "Listen to greeting" Audio Button */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="btn-listen-greeting"
                onClick={handlePlayGreeting}
                className="inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-300 font-bold px-4 py-2.5 rounded-2xl text-sm transition-all shadow-2xs active:scale-95"
              >
                <Volume2 className={`w-5 h-5 text-teal-700 ${isPlayingGreeting ? 'animate-pulse' : ''}`} />
                <span>{isPlayingGreeting ? 'Pause Greeting' : 'Listen to greeting'}</span>
              </button>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Clear audio narration with no sudden loud sounds
              </span>
            </div>
          </div>

          {/* Friendly Platypus SVG Mascot */}
          <div className="shrink-0 z-10 flex flex-col items-center">
            <div className="relative p-2 bg-teal-50/50 rounded-full border border-teal-100">
              <BerryAvatar
                mood="happy"
                size="hero"
                showSpeechBubble={false}
                soundEnabled={soundEnabled}
              />
            </div>
            <p className="text-xs font-bold text-teal-800 mt-2">
              Berry the Platypus
            </p>
          </div>

          {/* Decorative soft pastel background circle */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-50 rounded-full opacity-60 pointer-events-none" />
        </div>
      </section>

      {/* 2. THREE USER ROLES ACTION CARDS */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            How would you like to get started?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Choose your role to enter your dedicated and secure portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Learner */}
          <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 hover:border-teal-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-3xl border border-teal-100">
                🧒
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">User Role 1</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Learner</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Personalized games, coin counting, and friendly practice adapted specifically for Autism, Dyslexia, Cerebral Palsy, or Low Sensory needs.
              </p>
              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-teal-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Fun screening & level assignment</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Condition-specific safe track</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenLearnerSignup}
                className="w-full py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Join as a Learner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuickDemo('learner')}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors text-center border border-slate-200"
              >
                Try Learner Demo (Leo, Autism Track)
              </button>
            </div>
          </div>

          {/* Card 2: Mentor / Therapist */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl border border-amber-100">
                🩺
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">User Role 2</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Mentor / Therapist</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For Speech Therapists, Occupational Therapists, and Special Educators. Review learner diagnostics, assign IEP milestones, and track behavioral progress.
              </p>
              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Individualized IEP notes & logging</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Clinical progress tracking</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenMentorSignup}
                className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Join as a Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuickDemo('mentor')}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors text-center border border-slate-200"
              >
                Try Mentor Demo (Dr. Sarah)
              </button>
            </div>
          </div>

          {/* Card 3: NGO / Agency */}
          <div className="bg-white rounded-3xl p-6 border-2 border-sky-200 hover:border-sky-400 shadow-xs transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-3xl border border-sky-100">
                🏛️
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">User Role 3</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">NGO / Agency</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For Trusts, Societies, Section 8 Companies, and specialized clinics. Monitor enrolled beneficiaries, coordinate with clinical mentors, and organize screening camps.
              </p>
              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-sky-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Beneficiary management & grants</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Community workshops & outreach</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenNgoSignup}
                className="w-full py-3 px-4 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Register NGO / Agency</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuickDemo('ngo')}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors text-center border border-slate-200"
              >
                Try NGO Demo (Inclusive Minds)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE WEBSITE SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl">
                ℹ️
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">About the Website</h2>
                <p className="text-xs text-slate-500">How our platform empowers neurodevelopmental learners</p>
              </div>
            </div>

            <button
              onClick={handlePlayAbout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors self-start sm:self-center"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAbout ? 'Stop Listening' : 'Listen to About Platform'}</span>
            </button>
          </div>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            LearnBuddy is an adaptive web application built specifically for learners with <strong>neurodevelopmental conditions</strong> — including Autism Spectrum Disorder, Dyslexia, Cerebral Palsy, and Low Sensory Processing. Traditional learning interfaces often overwhelm neurodivergent individuals with fast timers, bright strobe colors, and rigid text-only tests. LearnBuddy creates a safe, affirming harbor where every learner progresses at their own pace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Condition-Specific Tracks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dyslexia learners receive weighted OpenDyslexic typography. Cerebral Palsy learners receive 200% touch targets and dwell-click. Autism learners receive predictable routines and low-stimulus pastels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Practical Real-World Skills</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                From counting rupee coins in Berry’s Vocational Bakery to recognizing emotion cards and using an interactive AAC speech board, learners gain practical life confidence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Collaborative Ecosystem</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Therapists log session observations and customize IEP targets, while registered NGOs monitor community impact and distribute assistive devices to families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NGOS AND AGENCIES INVOLVED SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Ecosystem Partners</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              NGOs and Agencies Involved
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Our partner organizations provide clinical guidance, parent support circles, and ground-level screening camps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerOrganizations.map((org) => (
              <div 
                key={org.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-200 shadow-2xs space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    {org.icon}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Partner
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base">{org.name}</h3>
                  <p className="text-xs text-teal-700 font-semibold">{org.type}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {org.tagline}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>📍 {org.location}</span>
                  <span className="font-medium text-slate-700">{org.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEURODIVERGENT-FRIENDLY ACCESSIBILITY FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">🦆</span>
            <span><strong>LearnBuddy Platform</strong> • Designed for Neurodevelopmental Inclusion & Sensory Comfort</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Calm Palette (Low Contrast)</span>
            <span>•</span>
            <span>WCAG AA Accessible</span>
            <span>•</span>
            <button 
              onClick={onOpenSignIn}
              className="text-teal-700 font-bold hover:underline"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </footer>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={async () => {
          await signOut();
        }}
        userDisplayName={userProfile?.displayName}
        userEmail={userProfile?.email}
        userRole={userProfile?.role}
      />
    </div>
  );
};
