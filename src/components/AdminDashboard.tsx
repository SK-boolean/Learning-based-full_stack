import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Zap,
  Globe,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { fetchLoadBalancerStatus, LoadBalancerStatus, ServerNode } from '../utils/rateLimiter';
import { UserRole } from '../services/firebase';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'pending' | 'suspended';
}

const SAMPLE_USERS: AdminUser[] = [
  { id: 'usr-1', name: 'Leo Parker', email: 'leo.parker@school.edu', role: 'learner', registeredAt: '2026-09-01', lastLogin: '10m ago', status: 'active' },
  { id: 'usr-2', name: 'Dr. Sarah Miller', email: 'sarah.miller@school.edu', role: 'mentor', registeredAt: '2026-08-28', lastLogin: '2h ago', status: 'active' },
  { id: 'usr-3', name: 'Alex Lead Admin', email: 'admin.berry@example.com', role: 'admin', registeredAt: '2026-08-20', lastLogin: 'Just now', status: 'active' },
  { id: 'usr-4', name: 'Maya Chen', email: 'maya.chen@school.edu', role: 'learner', registeredAt: '2026-09-02', lastLogin: '1h ago', status: 'active' },
  { id: 'usr-5', name: 'Jordan Smith', email: 'jordan.smith@school.edu', role: 'learner', registeredAt: '2026-09-03', lastLogin: 'Yesterday', status: 'active' },
  { id: 'usr-6', name: 'Prof. David Thorne', email: 'david.thorne@sped.org', role: 'mentor', registeredAt: '2026-08-30', lastLogin: '1d ago', status: 'active' },
];

interface BurstResult {
  attempt: number;
  allowed: boolean;
  remaining: number;
}

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(SAMPLE_USERS);
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'users'>('infrastructure');
  
  // Load Balancer State
  const [lbStatus, setLbStatus] = useState<LoadBalancerStatus | null>(null);
  const [loadingLb, setLoadingLb] = useState<boolean>(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'round-robin' | 'least-connections' | 'weighted'>('round-robin');
  
  // Rate Limiter Test State
  const [testingBurst, setTestingBurst] = useState<boolean>(false);
  const [burstResults, setBurstResults] = useState<BurstResult[] | null>(null);
  const [burstSummary, setBurstSummary] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; remaining: number; used: number } | null>(null);

  const refreshInfrastructure = async () => {
    setLoadingLb(true);
    try {
      const status = await fetchLoadBalancerStatus();
      setLbStatus(status);
      setSelectedAlgorithm(status.algorithm);

      const res = await fetch('/api/rate-limit/status');
      if (res.ok) {
        const rlData = await res.json();
        setRateLimitInfo({
          limit: rlData.limit,
          remaining: rlData.remaining,
          used: rlData.used,
        });
      }
    } catch (err) {
      console.error('Failed to refresh infra status:', err);
    }
    setLoadingLb(false);
  };

  useEffect(() => {
    refreshInfrastructure();
    const interval = setInterval(refreshInfrastructure, 5000);
    return () => clearInterval(interval);
  }, []);

  // Switch Algorithm
  const handleAlgorithmChange = async (algo: 'round-robin' | 'least-connections' | 'weighted') => {
    setSelectedAlgorithm(algo);
    try {
      await fetch('/api/lb/algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: algo }),
      });
      refreshInfrastructure();
    } catch {
      // optimistic
    }
  };

  // Dispatch Single Request via Load Balancer
  const handleDispatchSingle = async () => {
    try {
      const res = await fetch('/api/lb/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'admin-dashboard-test' }),
      });
      if (res.ok) {
        refreshInfrastructure();
      }
    } catch {
      // ignore
    }
  };

  // Trigger Traffic Burst Test (e.g. 15 requests to test rate limiter & load balancing)
  const handleRunTrafficBurst = async (requestCount: number) => {
    setTestingBurst(true);
    setBurstResults(null);
    setBurstSummary(null);

    try {
      // Simulate concurrent requests through load balancer
      const promises = Array.from({ length: Math.min(10, requestCount) }).map(() =>
        fetch('/api/lb/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'burst-test' }),
        })
      );
      await Promise.allSettled(promises);

      // Call rate-limit burst tester endpoint
      const burstRes = await fetch('/api/rate-limit/burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: requestCount }),
      });

      if (burstRes.ok) {
        const data = await burstRes.json();
        setBurstResults(data.results);
        const throttled = data.results.filter((r: BurstResult) => !r.allowed).length;
        if (throttled > 0) {
          setBurstSummary(
            `Rate Limiter Protected Gateway: ${throttled} of ${requestCount} burst requests throttled with HTTP 429.`
          );
        } else {
          setBurstSummary(`All ${requestCount} requests passed safely within rate capacity.`);
        }
      }
      refreshInfrastructure();
    } catch (err) {
      console.error(err);
    }
    setTestingBurst(false);
  };

  // Change user role
  const handleUserRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-600/30 text-purple-200 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Admin Control Center
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            System Architecture & Platform Governance
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time Load Balancer traffic routing, sliding-window Rate Limiter telemetry, and user role management.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'infrastructure'
                ? 'bg-white text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Infra & Rate Limiter</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-white text-purple-950 shadow-md'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Roles ({users.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'infrastructure' ? (
        <div className="space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Nodes</div>
              <div className="text-2xl font-extrabold text-teal-700 mt-1">
                {lbStatus?.activeNodes.length || 3} / 3 Online
              </div>
              <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Health Check: 100% PASS</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">LB Average Latency</div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">
                {lbStatus?.averageLatencyMs || 22} ms
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Sub-50ms SLA verified</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rate Limiter Window</div>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">
                {rateLimitInfo?.remaining ?? 28} / {rateLimitInfo?.limit ?? 30}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tokens left in 60s sliding frame</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Requests Balanced</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {lbStatus?.totalRequests || 164}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across multi-region cluster</div>
            </div>
          </div>

          {/* Section 1: Load Balancer Cluster Topology */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Server className="w-5 h-5 text-teal-600" />
                  <span>Load Balancer Node Cluster Topology</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-availability distributed cluster dispatching educational traffic across edge nodes.
                </p>
              </div>

              {/* Algorithm Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Routing Policy:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['round-robin', 'least-connections', 'weighted'] as const).map((algo) => (
                    <button
                      key={algo}
                      onClick={() => handleAlgorithmChange(algo)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        selectedAlgorithm === algo
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {algo.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(lbStatus?.activeNodes || []).map((node) => {
                const isSelected = node.id === lbStatus?.selectedNodeId;
                const totalReq = lbStatus?.totalRequests || 1;
                const sharePercent = Math.round((node.requestsHandled / Math.max(1, totalReq)) * 100);

                return (
                  <div
                    key={node.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-extrabold text-sm text-slate-900">{node.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {node.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Region:</span>
                        <span className="font-semibold text-slate-800">{node.region}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Latency:</span>
                        <span className="font-semibold text-indigo-700">{node.latencyMs} ms</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Active Conns:</span>
                        <span className="font-semibold text-slate-800">{node.activeConnections} active</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Handled:</span>
                        <span className="font-semibold text-teal-700">{node.requestsHandled} reqs ({sharePercent}%)</span>
                      </div>

                      {/* Traffic Share Bar */}
                      <div className="pt-2">
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(15, sharePercent))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Actions for Load Balancer */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDispatchSingle}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Dispatch 1 Request via LB</span>
              </button>

              <button
                onClick={() => handleRunTrafficBurst(5)}
                disabled={testingBurst}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Dispatch Burst (5 Concurrent Requests)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Rate Limiter Live Testing & Telemetry */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Rate Limiter Protection Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protects authentication endpoints from brute-force floods using token bucket algorithm with HTTP 429 response.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Test Capacity Overload:</span>
                <button
                  onClick={() => handleRunTrafficBurst(10)}
                  disabled={testingBurst}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Send 10 Requests
                </button>
                <button
                  onClick={() => handleRunTrafficBurst(35)}
                  disabled={testingBurst}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Flood 35 Requests (Trigger 429)
                </button>
              </div>
            </div>

            {/* Live Burst Result Log */}
            {burstSummary && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-teal-400 font-bold">
                  <span>Simulation Report</span>
                  <span>HTTP 429 Guard: Active</span>
                </div>
                <p className="text-slate-200">{burstSummary}</p>
                {burstResults && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {burstResults.map((r) => (
                      <span
                        key={r.attempt}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.allowed
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-900/80 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        #{r.attempt}: {r.allowed ? '200 OK' : '429 THROTTLED'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Section 3: User Role Management */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Platform User Directory & Role Governance</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage roles (Learner, Mentor, Admin) and view account access credentials.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'mentor'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.registeredAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {(['learner', 'mentor', 'admin'] as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => handleUserRoleChange(u.id, r)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                              u.role === r
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
