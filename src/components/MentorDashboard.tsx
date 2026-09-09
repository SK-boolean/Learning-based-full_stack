import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  Search, 
  Plus, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  Clock, 
  Send,
  Eye,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { DisabilityMode } from '../types';

interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  mode: DisabilityMode;
  currentLevel: number;
  completedLevels: number[];
  gems: number;
  streakDays: number;
  lastActive: string;
  cognitiveScore: number;
  motorSteadiness: number;
  accommodations: string;
}

const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'std-1',
    name: 'Leo Parker',
    avatar: '🦁',
    email: 'leo.parker@school.edu',
    mode: 'autism',
    currentLevel: 3,
    completedLevels: [1, 2],
    gems: 160,
    streakDays: 5,
    lastActive: '12 mins ago',
    cognitiveScore: 92,
    motorSteadiness: 78,
    accommodations: 'Low sensory pastel palette, predictive micro-lesson pacing, 5s calm timeouts',
  },
  {
    id: 'std-2',
    name: 'Maya Chen',
    avatar: '🌸',
    email: 'maya.chen@school.edu',
    mode: 'cerebral-palsy',
    currentLevel: 2,
    completedLevels: [1],
    gems: 90,
    streakDays: 3,
    lastActive: '1 hour ago',
    cognitiveScore: 88,
    motorSteadiness: 55,
    accommodations: '200% oversized buttons, 1.2s Dwell-hover trigger enabled, Jitter filter active',
  },
  {
    id: 'std-3',
    name: 'Jordan Smith',
    avatar: '⚡',
    email: 'jordan.smith@school.edu',
    mode: 'dyslexia',
    currentLevel: 4,
    completedLevels: [1, 2, 3],
    gems: 240,
    streakDays: 8,
    lastActive: 'Yesterday',
    cognitiveScore: 95,
    motorSteadiness: 90,
    accommodations: 'Lexend weighted font, 1.8x line-height, text-to-speech auto readout',
  },
  {
    id: 'std-4',
    name: 'Aanya Patel',
    avatar: '🌟',
    email: 'aanya.patel@school.edu',
    mode: 'deaf-mute',
    currentLevel: 3,
    completedLevels: [1, 2],
    gems: 180,
    streakDays: 6,
    lastActive: '3 hours ago',
    cognitiveScore: 94,
    motorSteadiness: 85,
    accommodations: 'ISL (Indian Sign Language) visual cards & Berry AAC speech bridge synthesis',
  },
];

interface MentorDashboardProps {
  onSwitchToLearnerView?: () => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ onSwitchToLearnerView }) => {
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(INITIAL_STUDENTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLevelChange = (studentId: string, newLevel: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, currentLevel: newLevel } : s))
    );
    if (selectedStudent.id === studentId) {
      setSelectedStudent((prev) => ({ ...prev, currentLevel: newLevel }));
    }
    setNotification(`Updated ${selectedStudent.name}'s curriculum track to Level ${newLevel}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAwardGems = (studentId: string, amount: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, gems: s.gems + amount } : s))
    );
    if (selectedStudent.id === studentId) {
      setSelectedStudent((prev) => ({ ...prev, gems: prev.gems + amount }));
    }
    setNotification(`Sent +${amount} Berry Coins reward to ${selectedStudent.name}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-400/30">
              Mentor Portal • Special Educator Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Inclusive Learner Progress Dashboard
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-2xl">
            Track neurodiverse students, adjust individual learning accommodations, review diagnostic screening metrics, and assign levels.
          </p>
        </div>

        {onSwitchToLearnerView && (
          <button
            onClick={onSwitchToLearnerView}
            className="flex items-center gap-2 bg-white text-indigo-950 hover:bg-indigo-50 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Preview Learner Experience</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white font-bold text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Students</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</div>
          <div className="text-[11px] text-teal-600 font-bold mt-0.5">100% On-Track</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Streak</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">5.5 Days</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Consistent engagement</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Cognitive Index</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">92.2%</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-0.5">Diagnostic screening</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vocational Tasks</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">18 Cleared</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Money & social skills</div>
        </div>
      </div>

      {/* Two-Column Workspace: Student Directory & Student Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Student Directory */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Assigned Learners</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">{filteredStudents.length} learners</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learner name or mode..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl">
                      {student.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{student.mode.replace('-', ' ')} mode</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg">
                      Lvl {student.currentLevel}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-0.5">{student.lastActive}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Student Inspector & Action Center */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          
          {/* Student Profile Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-3xl shadow-inner">
                {selectedStudent.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedStudent.name}</h2>
                  <span className="text-[11px] font-bold capitalize bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                    {selectedStudent.mode.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedStudent.email} • Last active {selectedStudent.lastActive}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAwardGems(selectedStudent.id, 25)}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
                title="Reward student for perseverance"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>+25 Berry Coins</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Screening Metrics */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Diagnostic Screening & Motor steadiness</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Cognitive Comprehension</div>
                <div className="text-xl font-extrabold text-purple-700 mt-1">{selectedStudent.cognitiveScore}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${selectedStudent.cognitiveScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">Motor Steadiness (Jitter Test)</div>
                <div className="text-xl font-extrabold text-teal-700 mt-1">{selectedStudent.motorSteadiness}%</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${selectedStudent.motorSteadiness}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-bold text-slate-500">Consecutive Streak</div>
                <div className="text-xl font-extrabold text-amber-600 mt-1">{selectedStudent.streakDays} Days</div>
                <div className="text-[10px] text-slate-400 mt-1">Earned {selectedStudent.gems} Berry Coins</div>
              </div>
            </div>
          </div>

          {/* Accommodations & Adaptations Active */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sliders className="w-4 h-4 text-indigo-700" />
              <span className="font-extrabold text-xs text-indigo-900">Configured Accommodations</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              {selectedStudent.accommodations}
            </p>
          </div>

          {/* Curriculum Progression Controls */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Curriculum Level Allocation</span>
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isCurrent = selectedStudent.currentLevel === lvl;
                const isCleared = selectedStudent.completedLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    onClick={() => handleLevelChange(selectedStudent.id, lvl)}
                    className={`py-3 px-2 rounded-2xl border text-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105 ring-2 ring-indigo-300'
                        : isCleared
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>Level {lvl}</div>
                    <div className="text-[9px] mt-0.5 opacity-80">
                      {isCurrent ? 'Current' : isCleared ? 'Cleared' : 'Upcoming'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
