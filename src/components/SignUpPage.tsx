import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  HeartHandshake, 
  Building2, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Volume2,
  Phone,
  MapPin,
  FileCheck,
  Brain,
  HelpCircle,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, UserProfile } from '../services/firebase';
import { DisabilityMode } from '../types';
import { authRateLimiter, RateLimiterState } from '../utils/rateLimiter';
import { speakText, playSuccessChime } from '../utils/audio';

interface SignUpPageProps {
  onClose?: () => void;
  initialRole?: UserRole;
  initialMode?: 'signup' | 'signin';
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onClose, 
  initialRole = 'learner',
  initialMode = 'signup' 
}) => {
  const { signUp, signIn, demoLogin, authError, clearError } = useAuth();
  
  // Navigation & Role Tabs
  const [activeTab, setActiveTab] = useState<UserRole | 'signin'>(initialMode === 'signin' ? 'signin' : initialRole);
  
  // Common Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  // 1. LEARNER FORM STATE
  const [learnerStep, setLearnerStep] = useState<'info' | 'doctor' | 'fun-test-prompt' | 'screening' | 'confirmed'>('info');
  const [learnerName, setLearnerName] = useState('');
  const [learnerAge, setLearnerAge] = useState<number>(10);
  const [learnerInterest, setLearnerInterest] = useState('Art & Colors');
  const [doctorDiagnosis, setDoctorDiagnosis] = useState<string>('Autism');
  
  // Screening Test in Signup
  const [screeningQuestionIdx, setScreeningQuestionIdx] = useState(0);
  const [screeningAnswers, setScreeningAnswers] = useState<string[]>([]);
  const [assignedTrack, setAssignedTrack] = useState<DisabilityMode>('autism');
  const [assignedLevel, setAssignedLevel] = useState<number>(1);

  // 2. MENTOR FORM STATE
  const [mentorName, setMentorName] = useState('');
  const [mentorAgency, setMentorAgency] = useState('');
  const [mentorFieldOfStudy, setMentorFieldOfStudy] = useState('Special Education & Child Development');
  const [mentorServices, setMentorServices] = useState<string[]>(['Speech Therapy', 'Special Education']);

  // 3. NGO FORM STATE
  const [ngoName, setNgoName] = useState('');
  const [ngoAddress, setNgoAddress] = useState('');
  const [ngoOfficialEmail, setNgoOfficialEmail] = useState('');
  const [ngoPhone, setNgoPhone] = useState('');
  const [ngoRegNumber, setNgoRegNumber] = useState('');
  const [ngoOrgType, setNgoOrgType] = useState('NGO/Trust');
  const [ngoOrgTypeOther, setNgoOrgTypeOther] = useState('');

  // Rate Limiter
  const [rateLimitState, setRateLimitState] = useState<RateLimiterState>(() => authRateLimiter.checkLimit());

  useEffect(() => {
    const unsub = authRateLimiter.subscribe((state) => {
      setRateLimitState(state);
    });
    return () => unsub();
  }, []);

  // Handle Mentor Service Checkbox
  const toggleMentorService = (service: string) => {
    if (mentorServices.includes(service)) {
      setMentorServices(mentorServices.filter(s => s !== service));
    } else {
      setMentorServices([...mentorServices, service]);
    }
  };

  // Fun Screening Questions
  const funQuestions = [
    {
      title: "Tap the coin to help Berry!",
      prompt: "Can you click or tap on the golden coin smoothly?",
      options: [
        { text: "Easy tap! (Steady motor hand)", track: 'standard', levelBoost: 1 },
        { text: "A bit shaky or needs large buttons", track: 'cerebral-palsy', levelBoost: 0 },
      ]
    },
    {
      title: "How do letters & words feel to you?",
      prompt: "When you read words on a screen:",
      options: [
        { text: "Words dance or flip around (Need weighted fonts)", track: 'dyslexia', levelBoost: 0 },
        { text: "Words are clear with audio read-aloud", track: 'autism', levelBoost: 1 }
      ]
    },
    {
      title: "What is your sensory comfort?",
      prompt: "When sounds or colors happen around you:",
      options: [
        { text: "I love calm, quiet pastels & steady routines", track: 'autism', levelBoost: 1 },
        { text: "I like gentle music & predictable steps", track: 'autism', levelBoost: 0 }
      ]
    }
  ];

  // Learner Fun Test Next Step
  const handleFunTestAnswer = (chosenTrack: string, levelBoost: number) => {
    const updatedAnswers = [...screeningAnswers, chosenTrack];
    setScreeningAnswers(updatedAnswers);

    if (screeningQuestionIdx < funQuestions.length - 1) {
      setScreeningQuestionIdx(prev => prev + 1);
    } else {
      // Complete test & assign track & starting level
      let trackResult: DisabilityMode = 'autism';
      if (doctorDiagnosis === 'Dyslexia' || chosenTrack === 'dyslexia') {
        trackResult = 'dyslexia';
      } else if (doctorDiagnosis === 'Cerebral Palsy' || chosenTrack === 'cerebral-palsy') {
        trackResult = 'cerebral-palsy';
      } else {
        trackResult = 'autism';
      }

      const calculatedLevel = (levelBoost > 0 && learnerAge >= 10) ? 2 : 1;
      setAssignedTrack(trackResult);
      setAssignedLevel(calculatedLevel);
      setLearnerStep('confirmed');
      playSuccessChime();
    }
  };

  // Submit Learner Signup
  const handleLearnerSubmit = async () => {
    setLocalValidation(null);
    clearError();

    if (!email || !password) {
      setLocalValidation('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const extraProfile: Partial<UserProfile> = {
      age: learnerAge,
      fieldOfInterest: learnerInterest,
      doctorDiagnosed: doctorDiagnosis,
      assignedCondition: assignedTrack,
      startingLevel: assignedLevel,
      currentLevel: assignedLevel,
      completedLevels: [],
      screeningCompleted: learnerStep === 'confirmed',
    };

    const success = await signUp(
      email,
      password,
      'learner',
      learnerName || 'Learner Friend',
      extraProfile
    );
    setSubmitting(false);

    if (success && onClose) {
      onClose();
    }
  };

  // Submit Mentor Signup
  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!mentorName.trim()) {
      setLocalValidation('Please enter your name.');
      return;
    }
    if (!mentorAgency.trim()) {
      setLocalValidation('Please enter your agency or clinic name.');
      return;
    }
    if (mentorServices.length === 0) {
      setLocalValidation('Please select at least one service you provide.');
      return;
    }
    if (!email || !password) {
      setLocalValidation('Please provide an email and password.');
      return;
    }

    setSubmitting(true);
    const extraProfile: Partial<UserProfile> = {
      agencyName: mentorAgency,
      fieldOfStudy: mentorFieldOfStudy,
      servicesProvided: mentorServices,
    };

    const success = await signUp(
      email,
      password,
      'mentor',
      mentorName,
      extraProfile
    );
    setSubmitting(false);

    if (success && onClose) {
      onClose();
    }
  };

  // Submit NGO Signup
  const handleNgoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!ngoName.trim()) {
      setLocalValidation('Please enter your organization name.');
      return;
    }
    if (!ngoRegNumber.trim()) {
      setLocalValidation('Please enter your NGO registration number.');
      return;
    }
    if (!ngoOfficialEmail.trim() || !password) {
      setLocalValidation('Please enter the official email and password.');
      return;
    }

    setSubmitting(true);
    const extraProfile: Partial<UserProfile> = {
      ngoName: ngoName,
      registeredAddress: ngoAddress,
      officialEmail: ngoOfficialEmail,
      phoneNumber: ngoPhone,
      registrationNumber: ngoRegNumber,
      orgType: ngoOrgType === 'Other' ? (ngoOrgTypeOther || 'Other') : ngoOrgType,
    };

    const success = await signUp(
      ngoOfficialEmail,
      password,
      'ngo',
      ngoName,
      extraProfile
    );
    setSubmitting(false);

    if (success && onClose) {
      onClose();
    }
  };

  // Existing User Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);
    clearError();

    if (!email || !password) {
      setLocalValidation('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const success = await signIn(email, password);
    setSubmitting(false);

    if (success && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 text-white p-6 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold shadow-xs">
              🦆
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Berry Inclusive Learning</h2>
              <p className="text-xs text-teal-100">Personalized Role-Based Access for Neurodevelopmental Care</p>
            </div>
          </div>
        </div>

        {/* Tab Selector: Learner | Mentor | NGO | Sign In */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => { setActiveTab('learner'); clearError(); setLocalValidation(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'learner'
                ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-teal-700" />
            <span>Learner</span>
          </button>

          <button
            onClick={() => { setActiveTab('mentor'); clearError(); setLocalValidation(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'mentor'
                ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-700" />
            <span>Mentor</span>
          </button>

          <button
            onClick={() => { setActiveTab('ngo'); clearError(); setLocalValidation(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'ngo'
                ? 'bg-white text-sky-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-sky-700" />
            <span>NGO / Agency</span>
          </button>

          <button
            onClick={() => { setActiveTab('signin'); clearError(); setLocalValidation(null); }}
            className={`py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'signin'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {(localValidation || authError) && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{localValidation || authError}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 1. LEARNER SIGNUP FLOW */}
        {/* ==================================================================== */}
        {activeTab === 'learner' && (
          <div className="p-6 space-y-5">
            {/* Step 1: Info & Interest */}
            {learnerStep === 'info' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Step 1 of 3: Learner Profile</span>
                  <button
                    onClick={() => speakText("Please enter your name, age, and choose what you like to learn most!")}
                    className="flex items-center gap-1 text-xs text-teal-700 font-bold hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Leo or Aarav"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="4"
                      max="30"
                      value={learnerAge}
                      onChange={(e) => setLearnerAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Field of Interest</label>
                    <select
                      value={learnerInterest}
                      onChange={(e) => setLearnerInterest(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="Art & Colors">🎨 Art & Colors</option>
                      <option value="Numbers & Counting">🪙 Numbers & Counting</option>
                      <option value="Nature & Animals">🐾 Nature & Animals</option>
                      <option value="Music & Rhythm">🎵 Music & Rhythm</option>
                      <option value="Practical Life & Work Skills">💼 Practical Work Skills</option>
                      <option value="Stories & Words">📖 Stories & Reading</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="learner@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!learnerName.trim()) {
                      setLocalValidation('Please enter your name.');
                      return;
                    }
                    if (!email || !password) {
                      setLocalValidation('Please enter your email and password.');
                      return;
                    }
                    setLocalValidation(null);
                    setLearnerStep('doctor');
                  }}
                  className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Doctor diagnosis question */}
            {learnerStep === 'doctor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Step 2 of 3: Doctor / Professional Guidance</span>
                  <button
                    onClick={() => speakText("Has a doctor or professional ever told you that you have Autism, Dyslexia, Cerebral Palsy, or Low Sensory?")}
                    className="flex items-center gap-1 text-xs text-teal-700 font-bold hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>

                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    Has a doctor or professional ever told you that you have:
                  </h3>
                  <p className="text-xs text-slate-600">
                    This helps Berry prepare the right sensory tools and typography for your comfort.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'Autism', label: 'Autism Spectrum', icon: '🧩', sub: 'Calm routines, emotion cues' },
                    { id: 'Dyslexia', label: 'Dyslexia', icon: '📖', sub: 'Weighted letters, phonics support' },
                    { id: 'Cerebral Palsy', label: 'Cerebral Palsy', icon: '♿', sub: 'Large touch buttons, dwell-click' },
                    { id: 'Low Sensory', label: 'Low Sensory', icon: '🍃', sub: 'Gentle colors, no loud sounds' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDoctorDiagnosis(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        doctorDiagnosis === item.id
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setLearnerStep('info')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLearnerStep('fun-test-prompt')}
                    className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Fun Test Prompt */}
            {learnerStep === 'fun-test-prompt' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center text-3xl mx-auto">
                  ⭐
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Small Fun Test for You — Are you interested?
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                    Play a 1-minute friendly mini game so Berry can set your starting level and perfect sensory track!
                  </p>
                </div>

                <button
                  onClick={() => speakText("Small Fun Test for You — Are you interested? You can play a 1-minute mini game to set your starting level, or skip directly to your track.")}
                  className="inline-flex items-center gap-1 text-xs text-teal-700 font-bold hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Question</span>
                </button>

                <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setScreeningQuestionIdx(0);
                      setScreeningAnswers([]);
                      setLearnerStep('screening');
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Yes! Let's Play the Fun Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Map directly to track based on diagnosis
                      let track: DisabilityMode = 'autism';
                      if (doctorDiagnosis === 'Dyslexia') track = 'dyslexia';
                      else if (doctorDiagnosis === 'Cerebral Palsy') track = 'cerebral-palsy';
                      else track = 'autism';
                      setAssignedTrack(track);
                      setAssignedLevel(1);
                      setLearnerStep('confirmed');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    Skip Test (Use My Selected Condition Track)
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Mini Fun Test Questions */}
            {learnerStep === 'screening' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-800">
                    Mini Game Question {screeningQuestionIdx + 1} of {funQuestions.length}
                  </span>
                  <button
                    onClick={() => speakText(`${funQuestions[screeningQuestionIdx].title}. ${funQuestions[screeningQuestionIdx].prompt}`)}
                    className="flex items-center gap-1 text-teal-700 font-bold hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                </div>

                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {funQuestions[screeningQuestionIdx].title}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {funQuestions[screeningQuestionIdx].prompt}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {funQuestions[screeningQuestionIdx].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFunTestAnswer(opt.track, opt.levelBoost)}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-left transition-all text-xs font-bold text-slate-800 flex items-center justify-between"
                    >
                      <span>{opt.text}</span>
                      <ArrowRight className="w-4 h-4 text-teal-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Confirmed Assignment & Access Rules Summary */}
            {learnerStep === 'confirmed' && (
              <div className="space-y-4">
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mx-auto">
                    🎉
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Placement Confirmed for {learnerName}!
                  </h3>
                  <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-900">
                    <span>Track: {assignedTrack.replace('-', ' ').toUpperCase()}</span>
                    <span>•</span>
                    <span>Starting Level {assignedLevel}</span>
                  </div>
                </div>

                {/* Prompt Mandated Access Rules Notice */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>Your Learning Safety Rules:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                    <li>You are placed securely on your assigned <strong>{assignedTrack.replace('-', ' ')}</strong> track.</li>
                    <li>You start at <strong>Level {assignedLevel}</strong>. Higher levels unlock as you complete each level.</li>
                    <li>Learner access is protected: you stay focused on your learning without access to mentor or NGO management sections.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleLearnerSubmit}
                  className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>{submitting ? 'Creating Safe Profile...' : 'Enter My Learning Space'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. MENTOR SIGNUP FLOW */}
        {/* ==================================================================== */}
        {activeTab === 'mentor' && (
          <form onSubmit={handleMentorSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Mentor / Therapist Registration
              </span>
              <span className="text-[11px] text-slate-500">Access strictly to Mentor Section</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Dr. Sarah Jenkins, OTR"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency / Clinic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Asha Child Center"
                  value={mentorAgency}
                  onChange={(e) => setMentorAgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Special Education"
                  value={mentorFieldOfStudy}
                  onChange={(e) => setMentorFieldOfStudy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Prompt Mandated Services Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                What services do you provide? (Multi-select)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Speech Therapy',
                  'Occupational Therapy',
                  'Behavioral Intervention',
                  'Special Education',
                  'Parent Support',
                  'Vocational Training'
                ].map((srv) => (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleMentorService(srv)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      mentorServices.includes(srv)
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      mentorServices.includes(srv) ? 'bg-amber-600 text-white' : 'border border-slate-300'
                    }`}>
                      {mentorServices.includes(srv) && '✓'}
                    </span>
                    <span className="truncate">{srv}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="mentor@clinic.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Access Rule Notice */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <strong>Access Rule:</strong> Mentors have dedicated access to the Mentor Section (IEP notes, telemetry, and learner milestones).
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Registering Mentor...' : 'Complete Mentor Signup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ==================================================================== */}
        {/* 3. NGO SIGNUP FLOW */}
        {/* ==================================================================== */}
        {activeTab === 'ngo' && (
          <form onSubmit={handleNgoSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                NGO / Agency Registration
              </span>
              <span className="text-[11px] text-slate-500">Access strictly to NGO Section</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NGO / Organization Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Inclusive Minds Foundation"
                value={ngoName}
                onChange={(e) => setNgoName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., NGO-DEL-2019-7712"
                  value={ngoRegNumber}
                  onChange={(e) => setNgoRegNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +91 98102 34567"
                  value={ngoPhone}
                  onChange={(e) => setNgoPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                required
                placeholder="e.g., Institutional Area, Vasant Kunj, New Delhi"
                value={ngoAddress}
                onChange={(e) => setNgoAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Prompt Mandated Org Type Question */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">What type of organization are you?</label>
              <select
                value={ngoOrgType}
                onChange={(e) => setNgoOrgType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="NGO/Trust">NGO / Trust</option>
                <option value="Society">Society</option>
                <option value="Section 8 Company">Section 8 Company</option>
                <option value="Private Agency/Clinic">Private Agency / Clinic</option>
                <option value="Other">Other (specify below)</option>
              </select>
            </div>

            {ngoOrgType === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specify Organization Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., International Inclusive Consortium"
                  value={ngoOrgTypeOther}
                  onChange={(e) => setNgoOrgTypeOther(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@ngo.org"
                  value={ngoOfficialEmail}
                  onChange={(e) => setNgoOfficialEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Access Rule Notice */}
            <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 text-[11px] text-sky-900">
              <strong>Access Rule:</strong> NGOs/Agencies can only access the NGO section after signup.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Registering NGO...' : 'Complete NGO Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ==================================================================== */}
        {/* 4. SIGN IN TAB */}
        {/* ==================================================================== */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sign In to Your Account
              </span>
              <span className="text-[11px] text-slate-500">Learners, Mentors & NGOs</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Sign In */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
                Quick Demo Accounts (Evaluation)
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { demoLogin('learner'); onClose?.(); }}
                  className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 text-center"
                >
                  🧒 Learner
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('mentor'); onClose?.(); }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 text-center"
                >
                  🩺 Mentor
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('ngo'); onClose?.(); }}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold border border-sky-200 text-center"
                >
                  🏛️ NGO
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
