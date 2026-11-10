import { motion } from 'framer-motion';
import { Users, Activity, UserRoundSearch, ClipboardX, ListChecks, Sparkles } from 'lucide-react';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiSectionTitle, AiState, LevelPill, isAiUnavailable, RefreshButton } from './AiKit';

export default function PopulationInsights() {
  const { data, loading, error, reload } = useAiInsight<any>('/admin/insights');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-border rounded-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-[16px] text-text-black tracking-tight">AI Population Insights</span>
        </div>
        <RefreshButton onClick={reload} loading={loading} />
      </div>

      <div className="p-6 md:p-8">
        <AiState loading={loading} error={error} onRetry={reload} loadingLabel="Analysing the patient population…">
          {isAiUnavailable(data) ? (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 text-center text-[14px] text-text-mid">
              Population insights could not be generated right now. Please try again.
            </div>
          ) : (
            data && (
              <>
                {data.overview && (
                  <p className="text-[15px] text-text-black leading-relaxed bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                    {data.overview}
                  </p>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top anomalies */}
                  {data.topAnomalies?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<Activity className="w-4 h-4" />}>Most common anomalies</AiSectionTitle>
                      <div className="space-y-3">
                        {data.topAnomalies.map((a: any, i: number) => (
                          <div key={i} className="bg-background border border-border rounded-xl p-4">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="font-semibold text-[14px] text-text-black">{a.label}</span>
                              <span className="font-mono text-[13px] text-text-mid">
                                {a.count} case{a.count === 1 ? '' : 's'} · {a.patients} patient{a.patients === 1 ? '' : 's'}
                              </span>
                            </div>
                            {a.insight && <p className="text-[12px] text-text-mid leading-relaxed">{a.insight}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cohorts */}
                  {data.cohorts?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<Users className="w-4 h-4" />}>Patient cohorts</AiSectionTitle>
                      <div className="space-y-3">
                        {data.cohorts.map((c: any, i: number) => (
                          <div key={i} className="bg-background border border-border rounded-xl p-4">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="font-semibold text-[14px] text-text-black">{c.segment}</span>
                              <span className="text-[12px] font-mono text-text-mid">{c.size} patient{c.size === 1 ? '' : 's'}</span>
                            </div>
                            {c.observation && <p className="text-[12px] text-text-mid leading-relaxed">{c.observation}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Patients needing attention */}
                {data.patientsNeedingAttention?.length > 0 && (
                  <div className="mt-8">
                    <AiSectionTitle icon={<UserRoundSearch className="w-4 h-4 text-danger" />} className="!text-danger">
                      Patients needing attention
                    </AiSectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.patientsNeedingAttention.map((p: any, i: number) => (
                        <div key={i} className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold text-[14px] text-text-black block">{p.name}</span>
                            <p className="text-[12px] text-text-mid leading-relaxed mt-1">{p.reason}</p>
                          </div>
                          <LevelPill value={p.risk} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {data.dataQuality?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<ClipboardX className="w-4 h-4 text-warning" />} className="!text-warning">
                        Data quality gaps
                      </AiSectionTitle>
                      <ul className="space-y-2">
                        {data.dataQuality.map((d: string, i: number) => (
                          <li key={i} className="text-[13px] text-text-black bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.recommendedActions?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<ListChecks className="w-4 h-4" />}>Operational next steps</AiSectionTitle>
                      <ul className="space-y-2">
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
              </>
            )
          )}
        </AiState>
      </div>
    </motion.div>
  );
}
