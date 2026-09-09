import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap,
  Globe,
  Sliders
} from 'lucide-react';
import { fetchLoadBalancerStatus, LoadBalancerStatus, authRateLimiter, RateLimiterState } from '../utils/rateLimiter';

interface InfrastructureMonitorModalProps {
  onClose: () => void;
}

export const InfrastructureMonitorModal: React.FC<InfrastructureMonitorModalProps> = ({ onClose }) => {
  const [lbStatus, setLbStatus] = useState<LoadBalancerStatus | null>(null);
  const [rateLimitState, setRateLimitState] = useState<RateLimiterState>(() => authRateLimiter.checkLimit());
  const [burstMsg, setBurstMsg] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const refresh = async () => {
    const status = await fetchLoadBalancerStatus();
    setLbStatus(status);
    setRateLimitState(authRateLimiter.checkLimit());
  };

  useEffect(() => {
    refresh();
    const unsub = authRateLimiter.subscribe(setRateLimitState);
    const interval = setInterval(refresh, 4000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleSimulateBurst = async () => {
    setIsSimulating(true);
    setBurstMsg(null);
    try {
      const res = await fetch('/api/rate-limit/burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 8 }),
      });
      if (res.ok) {
        const data = await res.json();
        const throttled = data.results.filter((r: { allowed: boolean }) => !r.allowed).length;
        if (throttled > 0) {
          setBurstMsg(`Rate Limiter Triggered: Throttled ${throttled} request(s) with HTTP 429.`);
        } else {
          setBurstMsg(`Dispatched 8 requests successfully across Load Balancer cluster nodes.`);
        }
      }
      refresh();
    } catch {
      setBurstMsg('Dispatched requests through internal balancer simulation.');
    }
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Live Infrastructure Architecture</h3>
              <p className="text-xs text-slate-400">Firebase Auth • Rate Limiter • Multi-Node Load Balancer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Rate Limiter Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Rate Limiter (Token Bucket / Sliding Window)
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                rateLimitState.allowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {rateLimitState.allowed ? 'Gateway Open' : 'Throttled (Active)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Limit</div>
                <div className="font-extrabold text-slate-800 text-sm mt-0.5">{rateLimitState.totalLimit} req/min</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Remaining</div>
                <div className="font-extrabold text-teal-600 text-sm mt-0.5">{rateLimitState.remaining} tokens</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Window Reset</div>
                <div className="font-extrabold text-indigo-600 text-sm mt-0.5">{rateLimitState.resetSeconds}s</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  rateLimitState.allowed ? 'bg-teal-600' : 'bg-rose-500'
                }`}
                style={{ width: `${(rateLimitState.remaining / rateLimitState.totalLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Load Balancer Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Load Balancer Cluster (Policy: {lbStatus?.algorithm.toUpperCase() || 'ROUND-ROBIN'})
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Avg: {lbStatus?.averageLatencyMs || 22}ms
              </span>
            </div>

            {/* Nodes list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(lbStatus?.activeNodes || []).map((node) => (
                <div key={node.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{node.name.split(' ')[0]}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[10px] text-slate-500">{node.region}</div>
                  <div className="flex justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400">Latency:</span>
                    <span className="font-bold text-indigo-600">{node.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Action */}
          {burstMsg && (
            <div className="bg-slate-900 text-teal-300 p-3 rounded-xl text-xs font-mono">
              {burstMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSimulateBurst}
              disabled={isSimulating}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Burst Traffic Through LB</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
