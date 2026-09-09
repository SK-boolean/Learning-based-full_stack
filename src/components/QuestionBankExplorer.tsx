import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Layers, 
  Brain, 
  Sparkles, 
  Zap, 
  BookOpen, 
  HeartHandshake, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Filter,
  BarChart3,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { 
  ConditionRecord, 
  QuestionRecord, 
  LevelAssignmentRuleRecord, 
  DifficultyTier, 
  QuestionCategory 
} from '../services/questionBankDb';
import { screeningApi } from '../services/screeningApi';

interface QuestionBankExplorerProps {
  onClose?: () => void;
  onLaunchTestWithCondition?: (conditionId: string) => void;
}

export const QuestionBankExplorer: React.FC<QuestionBankExplorerProps> = ({ 
  onClose,
  onLaunchTestWithCondition
}) => {
  const [conditions, setConditions] = useState<ConditionRecord[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>('autism');
  const [selectedTier, setSelectedTier] = useState<DifficultyTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [rules, setRules] = useState<LevelAssignmentRuleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'bank' | 'add_question' | 'add_condition' | 'rules' | 'adaptive_flow'>('bank');

  // Form states for adding new condition dynamically (Extensibility showcase)
  const [newCondId, setNewCondId] = useState('');
  const [newCondName, setNewCondName] = useState('');
  const [newCondDesc, setNewCondDesc] = useState('');
  const [newCondFocus, setNewCondFocus] = useState('');
  const [conditionSuccessMsg, setConditionSuccessMsg] = useState<string | null>(null);

  // Form states for adding new question dynamically
  const [newQText, setNewQText] = useState('');
  const [newQTier, setNewQTier] = useState<DifficultyTier>(1);
  const [newQCategory, setNewQCategory] = useState<QuestionCategory>('attention');
  const [newQCorrect, setNewQCorrect] = useState('opt_1');
  const [newQOpt1, setNewQOpt1] = useState('');
  const [newQOpt2, setNewQOpt2] = useState('');
  const [newQOpt3, setNewQOpt3] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [questionSuccessMsg, setQuestionSuccessMsg] = useState<string | null>(null);

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    const conds = await screeningApi.getConditions();
    setConditions(conds);
    if (conds.length > 0 && !conds.find(c => c.condition_id === selectedConditionId)) {
      setSelectedConditionId(conds[0].condition_id);
    }
    const qList = await screeningApi.getQuestions();
    setQuestions(qList);
    const rList = await screeningApi.getRules();
    setRules(rList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentCondition = conditions.find((c) => c.condition_id === selectedConditionId);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (q.condition_id !== selectedConditionId) return false;
    if (selectedTier !== 'all' && q.difficulty_tier !== selectedTier) return false;
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    return true;
  });

  const conditionRules = rules.filter((r) => r.condition_id === selectedConditionId);

  // Handle Add Condition
  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondId.trim() || !newCondName.trim() || !newCondDesc.trim()) return;

    const created = await screeningApi.addCondition({
      condition_id: newCondId.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newCondName.trim(),
      description: newCondDesc.trim(),
      primary_focus: newCondFocus.trim() || 'Adaptive Skill Acquisition',
      icon_name: 'Brain',
    });

    setConditions((prev) => [...prev, created]);
    setSelectedConditionId(created.condition_id);
    setConditionSuccessMsg(`Condition "${created.name}" created in database with 0 code changes!`);
    setNewCondId('');
    setNewCondName('');
    setNewCondDesc('');
    setNewCondFocus('');
    setTimeout(() => setConditionSuccessMsg(null), 4000);
  };

  // Handle Add Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQOpt1.trim() || !newQOpt2.trim()) return;

    const options = [
      { id: 'opt_1', text: newQOpt1 },
      { id: 'opt_2', text: newQOpt2 },
      ...(newQOpt3.trim() ? [{ id: 'opt_3', text: newQOpt3 }] : []),
    ];

    const created = await screeningApi.addQuestion({
      condition_id: selectedConditionId,
      question_text: newQText.trim(),
      question_type: 'multiple-choice',
      difficulty_tier: newQTier,
      category: newQCategory,
      correct_answer: newQCorrect,
      options,
      prompt_audio_text: newQText.trim(),
      points_weight: newQTier === 3 ? 6 : newQTier === 2 ? 4 : 2,
      explanation: newQExplanation.trim(),
    });

    setQuestions((prev) => [...prev, created]);
    setQuestionSuccessMsg(`Question added to Tier ${newQTier} pool for ${currentCondition?.name || selectedConditionId}!`);
    setNewQText('');
    setNewQOpt1('');
    setNewQOpt2('');
    setNewQOpt3('');
    setNewQExplanation('');
    setTimeout(() => setQuestionSuccessMsg(null), 4000);
  };

  const getConditionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-indigo-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      case 'Eye': return <Eye className="w-5 h-5 text-sky-500" />;
      default: return <Brain className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Screening Question Bank & Adaptive Engine</h2>
              <p className="text-xs text-purple-100 mt-0.5">
                Relational schema with condition-specific pools, 3-tier difficulty progression & rule-based level assignment
              </p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl text-sm transition-all"
            >
              Close
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto gap-2 py-2.5">
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'bank'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Question Bank Pool ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('adaptive_flow')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'adaptive_flow'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Adaptive Algorithm & Tier Rules
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Level Assignment Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('add_question')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'add_question'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Question (No Code Change)
          </button>
          <button
            onClick={() => setActiveTab('add_condition')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'add_condition'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Add New Condition
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: QUESTION BANK EXPLORER */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              {/* Condition Selectors */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Condition Pool (Independent Question Bank)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {conditions.map((cond) => {
                    const isSelected = cond.condition_id === selectedConditionId;
                    const qCount = questions.filter((q) => q.condition_id === cond.condition_id).length;
                    return (
                      <button
                        key={cond.condition_id}
                        onClick={() => setSelectedConditionId(cond.condition_id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100'
                            : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 rounded-xl bg-slate-100">
                            {getConditionIcon(cond.icon_name)}
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                            {qCount} Qs
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-sm leading-tight">{cond.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{cond.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition Overview & Actions */}
              {currentCondition && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                        Condition Schema Row
                      </span>
                      <span className="text-xs text-slate-400 font-mono">condition_id: "{currentCondition.condition_id}"</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{currentCondition.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{currentCondition.primary_focus}</p>
                  </div>
                  {onLaunchTestWithCondition && (
                    <button
                      onClick={() => onLaunchTestWithCondition(currentCondition.condition_id)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start md:self-auto transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Take Adaptive Test for {currentCondition.name}
                    </button>
                  )}
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Tier Filter:
                  </span>
                  {(['all', 1, 2, 3] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedTier === tier
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tier === 'all' ? 'All Tiers' : tier === 1 ? 'Tier 1 (Foundational)' : tier === 2 ? 'Tier 2 (Logic / Math)' : 'Tier 3 (Advanced)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <option value="all">All Categories</option>
                    <option value="attention">Attention</option>
                    <option value="logic">Logic</option>
                    <option value="math">Math</option>
                    <option value="language">Language</option>
                    <option value="motor">Motor</option>
                    <option value="sensory">Sensory</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No questions found matching criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Use the "Add Question" tab above to add questions dynamically.</p>
                  </div>
                ) : (
                  filteredQuestions.map((q) => (
                    <div 
                      key={q.question_id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            q.difficulty_tier === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty_tier === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            Tier {q.difficulty_tier} {q.difficulty_tier === 1 ? '• Foundational' : q.difficulty_tier === 2 ? '• Logic & Math' : '• Advanced'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                            {q.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">ID: {q.question_id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Weight: {q.points_weight} pts
                          </span>
                          <span className="text-xs font-mono text-slate-400 capitalize">{q.question_type}</span>
                        </div>
                      </div>

                      <div className="font-semibold text-slate-900 text-sm">
                        {q.question_text}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correct_answer;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {opt.icon && <span>{opt.icon}</span>}
                                <span>{opt.text}</span>
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span><strong>Pedagogical Metric:</strong> {q.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADAPTIVE PROGRESSION ENGINE */}
          {activeTab === 'adaptive_flow' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Adaptive Testing Logic & Difficulty Progression
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  The screening test is not a static quiz. It dynamically adapts question difficulty in real time based on the learner's ongoing accuracy, preventing frustration while discovering their upper capability threshold.
                </p>
              </div>

              {/* Visual Workflow Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm relative">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Tier 1: Foundational Launch</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Every learner starts with 2 foundational questions (attention, basic recognition, motor tracking, and direct instructions).
                  </p>
                  <div className="mt-3 p-2 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 font-medium">
                    Points Weight: 2 pts per question
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm relative">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Tier 2: Logic & Math Progression</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    If learner achieves ≥ 50–70% accuracy on foundational items, the engine promotes to Tier 2 (sequential patterns, early arithmetic, and working memory).
                  </p>
                  <div className="mt-3 p-2 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-medium">
                    Points Weight: 4 pts per question
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-white rounded-2xl border border-purple-200 shadow-sm relative">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Tier 3: Advanced Deduction</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    If learner excels on Tier 2 items, the engine introduces Tier 3 quantitative deduction, word problem arithmetic, and multi-step reasoning.
                  </p>
                  <div className="mt-3 p-2 bg-purple-50 rounded-xl text-[11px] text-purple-800 font-medium">
                    Points Weight: 6 pts per question
                  </div>
                </div>
              </div>

              {/* Supportive Scaffolding Guarantee */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Supportive Frustration-Free Fallback
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  If a learner struggles with higher tiers (accuracy &lt; 50%), the adaptive engine automatically keeps them in Tier 1 or serves comforting foundational items. This ensures neurodivergent learners never face repeated failure or sensory distress.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: LEVEL ASSIGNMENT RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  `level_assignment_rules` Table
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Maps the learner's final weighted screening score (reflecting both correct answers and difficulty tier weights) to a curriculum Level (Level 1 vs Level 2).
                </p>
              </div>

              <div className="space-y-3">
                {rules.map((rule) => {
                  const cond = conditions.find((c) => c.condition_id === rule.condition_id);
                  return (
                    <div 
                      key={rule.rule_id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cond?.name || rule.condition_id}</span>
                          <span className="text-[11px] font-mono text-slate-400">{rule.rule_id}</span>
                        </div>
                        <div className="text-xs font-semibold text-purple-700">
                          {rule.curriculum_track_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {rule.pedagogical_notes}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Score Range</div>
                          <div className="font-bold text-slate-800 text-sm">
                            {rule.score_range_min} – {rule.score_range_max} pts
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          rule.assigned_level === 1 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Assigned: Level {rule.assigned_level}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ADD QUESTION DYNAMICALLY */}
          {activeTab === 'add_question' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Plus className="w-5 h-5 text-purple-600" />
                Add Screening Question (Extensible with Zero Code Changes)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Directly inserts a new record into the `questions` table. It will immediately appear in the condition's adaptive test pool.
              </p>

              {questionSuccessMsg && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {questionSuccessMsg}
                </div>
              )}

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Condition</label>
                  <select
                    value={selectedConditionId}
                    onChange={(e) => setSelectedConditionId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                  >
                    {conditions.map((c) => (
                      <option key={c.condition_id} value={c.condition_id}>
                        {c.name} ({c.condition_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Difficulty Tier</label>
                    <select
                      value={newQTier}
                      onChange={(e) => setNewQTier(Number(e.target.value) as DifficultyTier)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                    >
                      <option value={1}>Tier 1: Foundational (2 pts)</option>
                      <option value={2}>Tier 2: Logic & Math (4 pts)</option>
                      <option value={3}>Tier 3: Advanced Problem-Solving (6 pts)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Cognitive Category</label>
                    <select
                      value={newQCategory}
                      onChange={(e) => setNewQCategory(e.target.value as QuestionCategory)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                    >
                      <option value="attention">Attention</option>
                      <option value="logic">Logic & Sequence</option>
                      <option value="math">Mathematics</option>
                      <option value="language">Language & Rhyme</option>
                      <option value="motor">Motor & Dwell</option>
                      <option value="sensory">Sensory Regulation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Question Prompt</label>
                  <input
                    type="text"
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="e.g. Pattern: Star, Star, Moon, Star, Star, ___"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Options & Correct Answer</label>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={newQCorrect === 'opt_1'}
                        onChange={() => setNewQCorrect('opt_1')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={newQOpt1}
                        onChange={(e) => setNewQOpt1(e.target.value)}
                        placeholder="Option 1"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                        required
                      />
                      <span className="text-[11px] text-slate-400 font-mono">opt_1</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={newQCorrect === 'opt_2'}
                        onChange={() => setNewQCorrect('opt_2')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={newQOpt2}
                        onChange={(e) => setNewQOpt2(e.target.value)}
                        placeholder="Option 2"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                        required
                      />
                      <span className="text-[11px] text-slate-400 font-mono">opt_2</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={newQCorrect === 'opt_3'}
                        onChange={() => setNewQCorrect('opt_3')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={newQOpt3}
                        onChange={(e) => setNewQOpt3(e.target.value)}
                        placeholder="Option 3 (Optional)"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                      />
                      <span className="text-[11px] text-slate-400 font-mono">opt_3</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">Select the radio button next to the correct answer.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pedagogical Explanation</label>
                  <input
                    type="text"
                    value={newQExplanation}
                    onChange={(e) => setNewQExplanation(e.target.value)}
                    placeholder="e.g. Evaluates sequential pattern completion and cognitive flexibility."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Save Question to Database
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ADD NEW CONDITION DYNAMICALLY */}
          {activeTab === 'add_condition' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Layers className="w-5 h-5 text-purple-600" />
                Add New Condition (Zero Code Changes Required)
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Demonstrates schema extensibility: insert a brand-new neurodevelopmental condition row (e.g. "Down Syndrome", "Auditory Processing Disorder"). The app immediately provisions an independent question pool for it!
              </p>

              {conditionSuccessMsg && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {conditionSuccessMsg}
                </div>
              )}

              <form onSubmit={handleAddCondition} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Condition ID (Slug)</label>
                  <input
                    type="text"
                    value={newCondId}
                    onChange={(e) => setNewCondId(e.target.value)}
                    placeholder="e.g. down-syndrome, apd, dyscalculia"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Condition Display Name</label>
                  <input
                    type="text"
                    value={newCondName}
                    onChange={(e) => setNewCondName(e.target.value)}
                    placeholder="e.g. Down Syndrome Cognitive & Motor Track"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    value={newCondDesc}
                    onChange={(e) => setNewCondDesc(e.target.value)}
                    placeholder="Describe the primary neurodevelopmental characteristics and supportive design guidelines..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs h-20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Primary Pedagogical Focus</label>
                  <input
                    type="text"
                    value={newCondFocus}
                    onChange={(e) => setNewCondFocus(e.target.value)}
                    placeholder="e.g. Visual Memory, Articulation Scaffolding & Fine Motor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Insert Condition into Database
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
