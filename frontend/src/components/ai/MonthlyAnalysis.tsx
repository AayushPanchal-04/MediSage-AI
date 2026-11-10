import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarRange, TrendingUp, TrendingDown, Minus, Eye, CheckCircle2, ListChecks } from 'lucide-react';
import { cn } from '../ui/Button';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiShell, AiSectionTitle, AiState, LevelPill, isAiUnavailable } from './AiKit';

const DirectionIcon = ({ direction }: { direction?: string }) => {
  switch (String(direction || '').toUpperCase()) {
    case 'IMPROVING':
      return <TrendingUp className="w-4 h-4 text-primary" />;
    case 'WORSENING':
      return <TrendingDown className="w-4 h-4 text-danger" />;
    case 'FLUCTUATING':
      return <Minus className="w-4 h-4 text-warning" />;
    default:
      return <Minus className="w-4 h-4 text-text-muted" />;
  }
};

const prettyMonth = (month: string) => {
  const [y, m] = String(month).split('-');
  if (!y || !m) return month;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

export default function MonthlyAnalysis() {
  const { data, loading, error, reload } = useAiInsight<any>('/patient/trends/monthly');

  const months: any[] = data?.months || [];
  const chartData = months.map((m) => ({ ...m, label: prettyMonth(m.month) }));
  const analysis: any = data?.analysis;

  return (
    <div className="w-full">
      <AiState loading={loading} error={error} onRetry={reload} loadingLabel="Analysing your month-by-month history…">
        {isAiUnavailable(data) ? (
          <div className="bg-warning/5 border border-warning/20 rounded-card p-8 text-center text-[14px] text-text-mid">
            The monthly analysis could not be generated right now. Please try again.
          </div>
        ) : (
          data && (
            <AiShell title="Month-by-Month AI Analysis" onRefresh={reload} refreshing={loading}>
              {/* Report / anomaly volume per month */}
              {chartData.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<CalendarRange className="w-4 h-4" />}>
                    Reports and anomalies by month
                  </AiSectionTitle>
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={8} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontFamily: '"JetBrains Mono"' }} />
                        <Tooltip
                          cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: 12 }}
                          formatter={(value: number, name: string) => [value, name === 'anomalyCount' ? 'Anomalies' : 'Reports']}
                        />
                        <Bar dataKey="reportCount" fill="#D1FAE5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="anomalyCount" radius={[4, 4, 0, 0]}>
                          {chartData.map((m, i) => (
                            <Cell key={i} fill={m.anomalyCount > 0 ? '#EF4444' : '#10B981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-2 text-[12px] text-text-muted font-mono">
                      <span className="w-3 h-3 bg-primary-light rounded-sm" /> Reports
                    </span>
                    <span className="flex items-center gap-2 text-[12px] text-text-muted font-mono">
                      <span className="w-3 h-3 bg-danger rounded-sm" /> Anomalies
                    </span>
                  </div>
                </div>
              )}

              {analysis?.narrative && (
                <p className="text-[15px] text-text-black leading-relaxed bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                  {analysis.narrative}
                </p>
              )}

              {/* Month timeline */}
              {analysis?.monthSummaries?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle>Month by month</AiSectionTitle>
                  <div className="space-y-4">
                    {analysis.monthSummaries.map((m: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center shrink-0 pt-1">
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary/20" />
                          <div className="w-px flex-1 bg-border mt-1" />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-[15px] text-text-black">{prettyMonth(m.month)}</span>
                            {typeof m.anomalyCount === 'number' && (
                              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-badge', m.anomalyCount > 0 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary')}>
                                {m.anomalyCount} anomal{m.anomalyCount === 1 ? 'y' : 'ies'}
                              </span>
                            )}
                          </div>
                          {m.headline && <p className="text-[13px] text-text-mid mb-2">{m.headline}</p>}
                          {m.highlights?.length > 0 && (
                            <ul className="space-y-1">
                              {m.highlights.map((h: string, j: number) => (
                                <li key={j} className="text-[12px] text-text-muted flex items-start gap-2">
                                  <span className="w-1 h-1 rounded-full bg-text-muted shrink-0 mt-2" />
                                  {h}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              {analysis?.trends?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle>Vital-level trends</AiSectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.trends.map((t: any, i: number) => (
                      <div key={i} className="bg-background border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="font-semibold text-[15px] text-text-black flex items-center gap-2">
                            <DirectionIcon direction={t.direction} /> {t.vital}
                          </span>
                          <LevelPill value={t.direction} />
                        </div>
                        {t.monthlyValues?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {t.monthlyValues.map((v: any, j: number) => (
                              <span key={j} className="text-[11px] font-mono bg-white border border-border rounded px-2 py-1 text-text-mid">
                                {prettyMonth(v.month)}: <span className="text-text-black font-bold">{v.value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {t.note && <p className="text-[12px] text-text-mid leading-relaxed">{t.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {analysis?.watchlist?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<Eye className="w-4 h-4 text-warning" />} className="!text-warning">
                      Watchlist
                    </AiSectionTitle>
                    <ul className="space-y-2">
                      {analysis.watchlist.map((w: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-black bg-warning/5 border border-warning/20 rounded-lg px-3 py-2">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis?.improvements?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<CheckCircle2 className="w-4 h-4 text-primary" />} className="!text-primary">
                      What improved
                    </AiSectionTitle>
                    <ul className="space-y-2">
                      {analysis.improvements.map((w: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-black bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis?.recommendedActions?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<ListChecks className="w-4 h-4" />}>Next steps</AiSectionTitle>
                    <ul className="space-y-2">
                      {analysis.recommendedActions.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-text-black">
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
