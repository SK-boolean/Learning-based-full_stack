import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { questionBankDb, DifficultyTier } from './src/services/questionBankDb';

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// 1. Rate Limiter Implementation (Sliding Window Algorithm)
// ----------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 30; // 30 requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds

function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use IP or client identifier
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let record = rateLimitStore.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(clientIp, record);
  }

  // Filter timestamps within sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  const remaining = Math.max(0, RATE_LIMIT_MAX - record.timestamps.length);
  const oldest = record.timestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetSeconds);

  // Allow health checks or internal assets to pass without blocking
  if (req.path.startsWith('/@') || req.path.startsWith('/src') || req.path.startsWith('/node_modules')) {
    return next();
  }

  if (record.timestamps.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait before attempting further requests.',
      retryAfterSeconds: resetSeconds,
      limit: RATE_LIMIT_MAX,
      remaining: 0,
    });
  }

  record.timestamps.push(now);
  next();
}

// Apply rate limiter to API routes
app.use('/api', rateLimiterMiddleware);

// ----------------------------------------------------
// 2. Load Balancer Implementation (Multi-Node Cluster)
// ----------------------------------------------------
export interface ClusterNode {
  id: string;
  name: string;
  region: string;
  endpoint: string;
  weight: number;
  activeConnections: number;
  latencyMs: number;
  status: 'healthy' | 'degraded' | 'offline';
  requestsHandled: number;
}

const clusterNodes: ClusterNode[] = [
  {
    id: 'node-alpha',
    name: 'Cluster-Alpha (Primary)',
    region: 'Asia-Southeast (Singapore)',
    endpoint: 'node-sg.berry.internal:3001',
    weight: 40,
    activeConnections: 8,
    latencyMs: 16,
    status: 'healthy',
    requestsHandled: 42,
  },
  {
    id: 'node-beta',
    name: 'Cluster-Beta (Secondary)',
    region: 'US-East (N. Virginia)',
    endpoint: 'node-us.berry.internal:3002',
    weight: 35,
    activeConnections: 5,
    latencyMs: 34,
    status: 'healthy',
    requestsHandled: 36,
  },
  {
    id: 'node-gamma',
    name: 'Cluster-Gamma (Backup)',
    region: 'Europe-West (Frankfurt)',
    endpoint: 'node-eu.berry.internal:3003',
    weight: 25,
    activeConnections: 3,
    latencyMs: 42,
    status: 'healthy',
    requestsHandled: 24,
  },
];

let roundRobinIndex = 0;
let activeAlgorithm: 'round-robin' | 'least-connections' | 'weighted' = 'round-robin';

function selectLoadBalancedNode(): ClusterNode {
  const healthyNodes = clusterNodes.filter((n) => n.status !== 'offline');
  if (healthyNodes.length === 0) {
    return clusterNodes[0];
  }

  if (activeAlgorithm === 'least-connections') {
    // Select node with minimum active connections
    return healthyNodes.reduce((prev, curr) => (curr.activeConnections < prev.activeConnections ? curr : prev));
  } else if (activeAlgorithm === 'weighted') {
    // Select based on weight probability
    const totalWeight = healthyNodes.reduce((sum, n) => sum + n.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const node of healthyNodes) {
      if (rand < node.weight) return node;
      rand -= node.weight;
    }
    return healthyNodes[0];
  } else {
    // Round-Robin
    const selected = healthyNodes[roundRobinIndex % healthyNodes.length];
    roundRobinIndex++;
    return selected;
  }
}

// ----------------------------------------------------
// 3. API Endpoints
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Berry Inclusive Education Platform Gateway',
  });
});

// Rate limiter status endpoint
app.get('/api/rate-limit/status', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const record = rateLimitStore.get(clientIp);
  const count = record ? record.timestamps.length : 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX - count);

  res.json({
    clientIp,
    limit: RATE_LIMIT_MAX,
    used: count,
    remaining,
    windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
    policy: 'Sliding Window Token Bucket',
  });
});

// Endpoint to simulate high traffic burst against the rate limiter
app.post('/api/rate-limit/burst', (req: Request, res: Response) => {
  const count = Number(req.body.count) || 5;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  let record = rateLimitStore.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(clientIp, record);
  }

  const results: { attempt: number; allowed: boolean; remaining: number }[] = [];
  for (let i = 1; i <= count; i++) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (record.timestamps.length < RATE_LIMIT_MAX) {
      record.timestamps.push(now);
      results.push({ attempt: i, allowed: true, remaining: RATE_LIMIT_MAX - record.timestamps.length });
    } else {
      results.push({ attempt: i, allowed: false, remaining: 0 });
    }
  }

  res.json({
    simulatedRequests: count,
    results,
    currentUsage: record.timestamps.length,
    rateLimitMax: RATE_LIMIT_MAX,
  });
});

// Load Balancer status endpoint
app.get('/api/lb/status', (req, res) => {
  const totalRequests = clusterNodes.reduce((acc, n) => acc + n.requestsHandled, 0);
  const avgLatency = Math.round(
    clusterNodes.reduce((acc, n) => acc + n.latencyMs, 0) / clusterNodes.length
  );

  res.json({
    algorithm: activeAlgorithm,
    totalRequests,
    averageLatencyMs: avgLatency,
    activeNodes: clusterNodes,
    selectedNodeId: clusterNodes[roundRobinIndex % clusterNodes.length].id,
  });
});

// Dispatch request through load balancer
app.post('/api/lb/dispatch', (req, res) => {
  const selectedNode = selectLoadBalancedNode();
  selectedNode.requestsHandled++;
  selectedNode.activeConnections++;

  // Add realistic latency variation
  const jitter = Math.floor(Math.random() * 8) - 4;
  const latencyMs = Math.max(8, selectedNode.latencyMs + jitter);

  setTimeout(() => {
    selectedNode.activeConnections = Math.max(0, selectedNode.activeConnections - 1);
  }, 300);

  res.json({
    success: true,
    node: selectedNode,
    algorithm: activeAlgorithm,
    latencyMs,
    timestamp: new Date().toISOString(),
  });
});

// Switch load balancing algorithm
app.post('/api/lb/algorithm', (req, res) => {
  const { algorithm } = req.body;
  if (['round-robin', 'least-connections', 'weighted'].includes(algorithm)) {
    activeAlgorithm = algorithm;
    return res.json({ success: true, algorithm: activeAlgorithm });
  }
  res.status(400).json({ error: 'Invalid algorithm specified' });
});

// ----------------------------------------------------
// 4. Screening Question Bank & Adaptive Testing API
// ----------------------------------------------------

// List all neurodevelopmental conditions
app.get('/api/screening/conditions', (req: Request, res: Response) => {
  const conditions = questionBankDb.getAllConditions();
  res.json({ success: true, conditions });
});

// Add a new condition (Extensible without schema changes)
app.post('/api/screening/conditions', (req: Request, res: Response) => {
  const { condition_id, name, description, primary_focus, icon_name } = req.body;
  if (!condition_id || !name || !description) {
    return res.status(400).json({ error: 'condition_id, name, and description are required' });
  }
  const cleanId = String(condition_id).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
  const record = questionBankDb.addCondition({
    condition_id: cleanId,
    name,
    description,
    primary_focus: primary_focus || 'Personalized Educational Focus',
    icon_name: icon_name || 'Brain',
  });
  res.json({ success: true, condition: record });
});

// Query questions (filtered by condition and optional tier)
app.get('/api/screening/questions', (req: Request, res: Response) => {
  const condition_id = req.query.condition_id as string;
  const tier = req.query.tier ? (Number(req.query.tier) as DifficultyTier) : undefined;
  
  if (condition_id) {
    const questions = questionBankDb.getQuestionsByCondition(condition_id, tier);
    return res.json({ success: true, questions, count: questions.length });
  }
  
  const questions = questionBankDb.getAllQuestions();
  res.json({ success: true, questions, count: questions.length });
});

// Add a new question to the bank (Extensible with zero code changes)
app.post('/api/screening/questions', (req: Request, res: Response) => {
  const {
    condition_id,
    question_text,
    question_type,
    difficulty_tier,
    category,
    correct_answer,
    options,
    media_url,
    prompt_audio_text,
    points_weight,
    explanation,
  } = req.body;

  if (!condition_id || !question_text || !correct_answer || !options) {
    return res.status(400).json({ error: 'condition_id, question_text, correct_answer, and options are required' });
  }

  const tier = Number(difficulty_tier) || 1;
  const newQuestion = questionBankDb.addQuestion({
    condition_id,
    question_text,
    question_type: question_type || 'multiple-choice',
    difficulty_tier: (tier === 2 ? 2 : tier === 3 ? 3 : 1) as DifficultyTier,
    category: category || 'attention',
    correct_answer,
    options: Array.isArray(options) ? options : [],
    media_url,
    prompt_audio_text,
    points_weight: Number(points_weight) || (tier === 3 ? 6 : tier === 2 ? 4 : 2),
    explanation,
  });

  res.json({ success: true, question: newQuestion });
});

// Get level assignment rules
app.get('/api/screening/rules', (req: Request, res: Response) => {
  const condition_id = req.query.condition_id as string;
  const rules = questionBankDb.getLevelRules(condition_id);
  res.json({ success: true, rules });
});

// Add or update level assignment rule
app.post('/api/screening/rules', (req: Request, res: Response) => {
  const { condition_id, score_range_min, score_range_max, assigned_level, curriculum_track_name, pedagogical_notes } = req.body;
  if (!condition_id || score_range_min === undefined || score_range_max === undefined || !assigned_level) {
    return res.status(400).json({ error: 'condition_id, score_range_min, score_range_max, and assigned_level are required' });
  }
  const rule = questionBankDb.addLevelRule({
    condition_id,
    score_range_min: Number(score_range_min),
    score_range_max: Number(score_range_max),
    assigned_level: (Number(assigned_level) === 2 ? 2 : 1) as 1 | 2,
    curriculum_track_name: curriculum_track_name || `Track Level ${assigned_level}`,
    pedagogical_notes: pedagogical_notes || 'Adaptive curriculum placement.',
  });
  res.json({ success: true, rule });
});

// Start an adaptive test session
app.post('/api/screening/sessions/start', (req: Request, res: Response) => {
  const { learner_id, condition_id } = req.body;
  if (!learner_id || !condition_id) {
    return res.status(400).json({ error: 'learner_id and condition_id are required' });
  }

  try {
    const session = questionBankDb.startSession(learner_id, condition_id);
    const nextQ = questionBankDb.getNextQuestion(session.session_id);
    res.json({
      success: true,
      session,
      firstQuestion: nextQ.question,
      adaptiveStatus: {
        currentTier: nextQ.currentTier,
        questionsAnswered: nextQ.questionsAnswered,
        targetCount: nextQ.targetCount,
        scoreSoFar: nextQ.scoreSoFar,
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get next adaptive question
app.get('/api/screening/sessions/:sessionId/next', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const nextData = questionBankDb.getNextQuestion(sessionId);
    res.json({ success: true, ...nextData });
  } catch (err: unknown) {
    res.status(404).json({ error: (err as Error).message });
  }
});

// Submit answer for an adaptive question
app.post('/api/screening/sessions/:sessionId/respond', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { question_id, learner_answer, time_taken_ms } = req.body;

  if (!question_id || learner_answer === undefined) {
    return res.status(400).json({ error: 'question_id and learner_answer are required' });
  }

  try {
    const result = questionBankDb.submitResponse(
      sessionId,
      question_id,
      String(learner_answer),
      Number(time_taken_ms) || 1500
    );
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Complete session & determine assigned level via rules
app.post('/api/screening/sessions/:sessionId/complete', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const summary = questionBankDb.completeSession(sessionId);
    res.json({ success: true, summary });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get session details and response history
app.get('/api/screening/sessions/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = questionBankDb.getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const responses = questionBankDb.getSessionResponses(sessionId);
  res.json({ success: true, session, responses });
});

// ----------------------------------------------------
// 5. Start Server with Vite Middleware
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Berry Full-Stack Server with Rate Limiter & Load Balancer running on port ${PORT}`);
  });
}

startServer();
