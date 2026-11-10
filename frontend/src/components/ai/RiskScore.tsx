import { motion } from 'framer-motion';
import { Gauge, ShieldCheck, ListChecks, Activity } from 'lucide-react';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiShell, AiSectionTitle, AiState, LevelPill, isAiUnavailable } from './AiKit';

const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

const ringColor = (level?: string) => {
  switch (String(level || '').toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return '#EF4444';
    case 'MODERATE':
      return '#F59E0B';
    default:
      return '#10B981';
  }
};

export default function RiskScore({
  endpoint = '/patient/risk',
  title = 'AI Health Risk Score',
}: {
  endpoint?: string;
  title?: string;
}) {
  const { data, loading, error, reload } = useAiInsight<any>(endpoint);

  const score = typeof data?.overallScore === 'number' ? Math.max(0, Math.min(100, data.overallScore)) : 0;

  return (
    <div className="w-full">
      <AiState loading={loading} error={error} onRetry={reload} loadingLabel="Scoring your health risks…">
        {isAiUnavailable(data) ? (
          <div className="bg-warning/5 border border-warning/20 rounded-card p-8 text-center text-[14px] text-text-mid">
            The risk score could not be generated right now. Please try again.
          </div>
        ) : (
          data && (
            <AiShell title={title} onRefresh={reload} refreshing={loading}>
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
                {/* Score ring */}
                <div className="relative w-[140px] h-[140px] shrink-0 mx-auto md:mx-0">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#E5E7EB" strokeWidth="12" />
                    <motion.circle
                      cx="70"
                      cy="70"
                      r={RING_R}
                      fill="none"
                      stroke={ringColor(data.overallLevel)}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      initial={{ strokeDashoffset: RING_C }}
                      animate={{ strokeDashoffset: RING_C - (score / 100) * RING_C }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-[34px] font-bold text-text-black leading-none">{score}</span>
                    <span className="text-[11px] text-text-muted uppercase tracking-wide">/ 100</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Gauge className="w-5 h-5 text-text-mid" />
                    <LevelPill value={data.overallLevel} className="!text-[13px] !px-3 !py-1.5" />
                  </div>
                  {data.explanation && (
                    <p className="text-[15px] text-text-black leading-relaxed">{data.explanation}</p>
                  )}
                </div>
              </div>

              {/* Per-condition risks */}
              {data.risks?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<Activity className="w-4 h-4" />}>Condition breakdown</AiSectionTitle>
                  <div className="space-y-4">
                    {data.risks.map((r: any, i: number) => {
                      const val = Math.max(0, Math.min(100, Number(r.score) || 0));
                      return (
                        <div key={i} className="bg-background border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="font-semibold text-[15px] text-text-black">{r.condition}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[14px] font-bold text-text-black">{val}</span>
                              <LevelPill value={r.level} />
                            </div>
                          </div>
                          <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mb-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.8, delay: i * 0.08 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: ringColor(r.level) }}
                            />
                          </div>
                          {(r.factors?.length > 0 || r.evidence?.length > 0) && (
                            <ul className="space-y-1">
                              {(r.factors || r.evidence).map((f: string, j: number) => (
                                <li key={j} className="text-[12px] text-text-mid flex items-start gap-2">
                                  <span className="w-1 h-1 rounded-full bg-text-muted shrink-0 mt-2" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {data.protectiveFactors?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<ShieldCheck className="w-4 h-4 text-primary" />} className="!text-primary">
                      In your favour
                    </AiSectionTitle>
                    <ul className="space-y-2">
                      {data.protectiveFactors.map((f: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-black bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.recommendedActions?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<ListChecks className="w-4 h-4" />}>Recommended actions</AiSectionTitle>
                    <ul className="space-y-3">
                      {data.recommendedActions.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-text-black">
                          <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AiShell>
          )
        )}
      </AiState>
    </div>
  );
}
