import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  HeartHandshake, 
  Award, 
  FileCheck, 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { speakText } from '../utils/audio';

interface Beneficiary {
  id: string;
  name: string;
  age: number;
  condition: string;
  level: number;
  progressPercent: number;
  mentorName: string;
  status: 'Active' | 'Under Review' | 'Completed Level';
}

interface PartnerMentor {
  id: string;
  name: string;
  agency: string;
  specialties: string[];
  activeLearnersCount: number;
  phone: string;
  rating: number;
}

interface CommunityProgram {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  type: 'Screening Camp' | 'Teacher Training' | 'Parent Support Group' | 'Vocational Workshop';
  status: 'Upcoming' | 'Completed';
}

export const NgoDashboard: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'beneficiaries' | 'mentors' | 'programs' | 'resources'>('overview');
  const [searchBeneficiary, setSearchBeneficiary] = useState('');
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBeneficiaryName, setNewBeneficiaryName] = useState('');
  const [newBeneficiaryAge, setNewBeneficiaryAge] = useState(10);
  const [newBeneficiaryCondition, setNewBeneficiaryCondition] = useState('Autism');

  // Sample beneficiaries under this NGO
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: 'ben-1', name: 'Aarav Kumar', age: 9, condition: 'Autism', level: 1, progressPercent: 75, mentorName: 'Dr. Sarah', status: 'Active' },
    { id: 'ben-2', name: 'Meera Sen', age: 11, condition: 'Dyslexia', level: 2, progressPercent: 40, mentorName: 'Vikram Joshi', status: 'Active' },
    { id: 'ben-3', name: 'Rohan Patel', age: 14, condition: 'Cerebral Palsy', level: 1, progressPercent: 90, mentorName: 'Dr. Priya Nair', status: 'Completed Level' },
    { id: 'ben-4', name: 'Ananya Roy', age: 8, condition: 'Low Sensory', level: 1, progressPercent: 30, mentorName: 'Dr. Sarah', status: 'Active' },
    { id: 'ben-5', name: 'Dev Sharma', age: 12, condition: 'Autism', level: 2, progressPercent: 60, mentorName: 'Kavita Menon', status: 'Active' },
  ]);

  // Partnered mentors
  const mentors: PartnerMentor[] = [
    { id: 'm-1', name: 'Dr. Sarah Jenkins', agency: 'Asha Child Development Center', specialties: ['Speech Therapy', 'Special Education'], activeLearnersCount: 4, phone: '+91 98110 44521', rating: 4.9 },
    { id: 'm-2', name: 'Vikram Joshi, OTR', agency: 'Vikas Sensory Hub', specialties: ['Occupational Therapy', 'Sensory Integration'], activeLearnersCount: 3, phone: '+91 98221 88310', rating: 4.8 },
    { id: 'm-3', name: 'Dr. Priya Nair', agency: 'National CP Rehabilitation Alliance', specialties: ['Behavioral Intervention', 'Motor Coordination'], activeLearnersCount: 2, phone: '+91 97110 33499', rating: 5.0 },
    { id: 'm-4', name: 'Kavita Menon, M.Ed', agency: 'Inclusive Learning Initiative', specialties: ['Special Education', 'Parent Support'], activeLearnersCount: 5, phone: '+91 99201 55678', rating: 4.9 },
  ];

  // Community programs
  const [programs, setPrograms] = useState<CommunityProgram[]>([
    { id: 'p-1', title: 'Community Autism Early Screening Camp', date: 'Oct 14, 2026', location: 'Community Health Hall, Sector 7', attendees: 45, type: 'Screening Camp', status: 'Upcoming' },
    { id: 'p-2', title: 'Inclusive Sensory Classroom Workshop for Educators', date: 'Oct 28, 2026', location: 'City Teacher Training Institute', attendees: 60, type: 'Teacher Training', status: 'Upcoming' },
    { id: 'p-3', title: 'Parent Peer Support & Caregiver Resilience Circle', date: 'Sept 20, 2026', location: 'Virtual via Berry Room', attendees: 32, type: 'Parent Support Group', status: 'Completed' },
  ]);

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeneficiaryName.trim()) return;
    const newBen: Beneficiary = {
      id: `ben-${Date.now()}`,
      name: newBeneficiaryName.trim(),
      age: newBeneficiaryAge,
      condition: newBeneficiaryCondition,
      level: 1,
      progressPercent: 0,
      mentorName: 'Dr. Sarah Jenkins',
      status: 'Active',
    };
    setBeneficiaries([newBen, ...beneficiaries]);
    setNewBeneficiaryName('');
    setShowAddBeneficiary(false);
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.name.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
    b.condition.toLowerCase().includes(searchBeneficiary.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top NGO Organization Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-800 flex items-center justify-center text-3xl shrink-0 shadow-xs">
              🏛️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {userProfile?.ngoName || userProfile?.displayName || 'Inclusive Minds Foundation'}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified NGO / Agency
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                  {userProfile?.orgType || 'NGO/Trust'}
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">
                Dedicated to inclusive education, early screening placement, and therapist-assisted support for neurodivergent children.
              </p>

              {/* Contact meta */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  Reg: <strong>{userProfile?.registrationNumber || 'NGO-DEL-2019-7712'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile?.officialEmail || userProfile?.email || 'contact@inclusiveminds.org'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile?.phoneNumber || '+91 98102 34567'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {userProfile?.registeredAddress || 'Vasant Kunj Institutional Area, New Delhi'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakText(`NGO Portal for ${userProfile?.ngoName || 'Inclusive Minds Foundation'}. Total active beneficiaries: ${beneficiaries.length}. Partnered therapists: ${mentors.length}.`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-medium hover:bg-teal-100 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Summary</span>
            </button>
            <button
              onClick={() => setShowAddBeneficiary(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Learner</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative backdrop */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'beneficiaries'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Beneficiaries ({beneficiaries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'mentors'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Partnered Therapists ({mentors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'programs'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Community Workshops ({programs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Enrolled Learners</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700 text-lg">🧒</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{beneficiaries.length}</div>
              <p className="text-xs text-slate-500 mt-1">Across Autism, CP & Dyslexia tracks</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Partnered Mentors</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-lg">🩺</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{mentors.length}</div>
              <p className="text-xs text-slate-500 mt-1">Speech, OT & Special Educators</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Community Outreach</span>
                <span className="p-2 rounded-xl bg-sky-50 text-sky-700 text-lg">📢</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">137</div>
              <p className="text-xs text-slate-500 mt-1">Families attended screening camps</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Assistive Resource Pool</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-lg">🎒</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800">28 Kits</div>
              <p className="text-xs text-slate-500 mt-1">AAC boards & sensory aids allocated</p>
            </div>
          </div>

          {/* Partner Impact Breakdown & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">Condition Distribution Among Beneficiaries</h3>
                <span className="text-xs text-slate-500 font-medium">Real-time enrolled data</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Autism Spectrum & Low Sensory</span>
                    <span>60% (3 Learners)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Dyslexia & Phonological Track</span>
                    <span>20% (1 Learner)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Cerebral Palsy (Motor & Dwell Access)</span>
                    <span>20% (1 Learner)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-100 text-xs text-teal-900 flex items-start gap-3 mt-4">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Automated Adaptive Track Compliance</p>
                  <p>
                    All learners enrolled through your organization are automatically shielded by strict access rules: they remain securely on their assigned condition track and progress step-by-step through Levels 1 and 2 with personalized therapist supervision.
                  </p>
                </div>
              </div>
            </div>

            {/* NGO Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-base mb-2">Organization Toolkit</h3>
              
              <button
                onClick={() => setShowAddBeneficiary(true)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900">Enroll New Beneficiary</div>
                  <div className="text-[11px] text-slate-500">Add student with diagnosed condition</div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </button>

              <button
                onClick={() => setActiveTab('programs')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900">Schedule Screening Camp</div>
                  <div className="text-[11px] text-slate-500">Plan neighborhood assessment drive</div>
                </div>
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </button>

              <button
                onClick={() => setActiveTab('mentors')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900">Therapist Directory</div>
                  <div className="text-[11px] text-slate-500">Connect with certified specialists</div>
                </div>
                <HeartHandshake className="w-4 h-4 text-slate-400 group-hover:text-teal-700" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BENEFICIARIES */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Enrolled Neurodivergent Learners</h3>
              <p className="text-xs text-slate-500">Assigned condition tracks, progression levels, and designated therapists</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name or condition..."
                  value={searchBeneficiary}
                  onChange={(e) => setSearchBeneficiary(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 w-52"
                />
              </div>
              <button
                onClick={() => setShowAddBeneficiary(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                  <th className="p-3">Learner</th>
                  <th className="p-3">Condition Track</th>
                  <th className="p-3">Current Level</th>
                  <th className="p-3">Level Progress</th>
                  <th className="p-3">Assigned Mentor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{b.name}</div>
                      <div className="text-[11px] text-slate-500">Age: {b.age} years</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {b.condition}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-extrabold text-slate-700">Level {b.level}</span>
                    </td>
                    <td className="p-3">
                      <div className="w-28">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>{b.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${b.progressPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {b.mentorName}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        b.status === 'Completed Level'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MENTORS */}
      {activeTab === 'mentors' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Partnered Therapists & Mentors</h3>
            <p className="text-xs text-slate-500">Certified clinical professionals providing specialized therapy and IEP guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl border border-slate-200 hover:border-teal-200 bg-slate-50/40 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{m.name}</h4>
                    <p className="text-xs text-slate-500">{m.agency}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ★ {m.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {m.specialties.map((s, idx) => (
                    <span key={idx} className="bg-white text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span>Active Beneficiaries: <strong>{m.activeLearnersCount}</strong></span>
                  <span className="text-teal-700 font-medium">{m.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Community Workshops & Outreach Camps</h3>
              <p className="text-xs text-slate-500">Grassroot screening drives, parent training, and inclusive educator circles</p>
            </div>
          </div>

          <div className="space-y-3">
            {programs.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'Upcoming' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {p.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.attendees} Registered</span>
                  </div>
                </div>

                <button
                  onClick={() => speakText(`Program: ${p.title} on ${p.date} at ${p.location}. Status is ${p.status}.`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-100 flex items-center gap-1 self-start sm:self-center"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio Info</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showAddBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Enroll New Beneficiary</h3>
              <button onClick={() => setShowAddBeneficiary(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleAddBeneficiary} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Learner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ishaan Verma"
                  value={newBeneficiaryName}
                  onChange={(e) => setNewBeneficiaryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="4"
                  max="25"
                  required
                  value={newBeneficiaryAge}
                  onChange={(e) => setNewBeneficiaryAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosed Condition Track</label>
                <select
                  value={newBeneficiaryCondition}
                  onChange={(e) => setNewBeneficiaryCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Autism">Autism Spectrum</option>
                  <option value="Dyslexia">Dyslexia & Phonological</option>
                  <option value="Cerebral Palsy">Cerebral Palsy (Motor Adaptation)</option>
                  <option value="Low Sensory">Low Sensory Sensitivity</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBeneficiary(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
