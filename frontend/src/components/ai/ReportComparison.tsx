import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, Sparkles, ArrowRight, Plus, Minus, Repeat } from 'lucide-react';
import { cn } from '../ui/Button';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiSectionTitle, AiState, LevelPill, isAiUnavailable } from './AiKit';

const directionTone = (dir?: string) => {
  switch (String(dir || '').toUpperCase()) {
    case 'BETTER':
      return 'text-primary';
    case 'WORSE':
      return 'text-danger';
    case 'NEW':
      return 'text-warning';
    default:
      return 'text-text-mid';
  }
};

export default function ReportComparison({ recordId }: { recordId: string }) {
  const { data, loading, error, load } = useAiInsight<any>(`/patient/records/${recordId}/compare`, {
    autoLoad: false,
  });
  const [started, setStarted] = useState(false);

  const analysis: any = started ? (data as any)?.analysis : null;
  const hasPrevious = started ? (data as any)?.hasPrevious : undefined;

  return (
    <div className="w-full bg-white rounded-card border border-border shadow-sm overflow-hidden mb-4">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="w-5 h-5 text-primary" />
          <span className="font-semibold text-[16px] text-text-black">Compare with previous reports</span>
        </div>
        {!started && (
          <button
            onClick={() => {
              setStarted(true);
              load();
            }}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline"
          >
            Run comparison <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {!started ? (
          <p className="text-[13px] text-text-mid">
            See exactly what changed since your last report — which values improved, which got worse, and what to do next.
          </p>
        ) : (
          <AiState loading={loading} error={error} onRetry={() => load()} loadingLabel="Comparing your reports…">
            {hasPrevious === false ? (
              <div className="bg-background border border-border rounded-xl p-6 text-center text-[14px] text-text-mid">
                {(data as any)?.message || 'This is your earliest report — upload another to unlock comparisons.'}
              </div>
            ) : isAiUnavailable(analysis) ? (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 text-center text-[14px] text-text-mid">
                The comparison could not be generated right now. Please try again.
              </div>
            ) : (
              analysis && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {analysis.headline && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wide text-[12px] mb-2">
                        <Sparkles className="w-4 h-4" /> Biggest change
                      </div>
                      <p className="text-[16px] font-semibold text-text-black leading-snug">{analysis.headline}</p>
                    </div>
                  )}

                  {analysis.narrative && (
                    <p className="text-[14px] text-text-mid leading-relaxed mb-6">{analysis.narrative}</p>
                  )}

                  {/* Changed values */}
                  {analysis.changes?.length > 0 && (
                    <div className="mb-6">
                      <AiSectionTitle icon={<Repeat className="w-4 h-4" />}>What changed</AiSectionTitle>
                      <div className="border border-border rounded-xl overflow-hidden">
                        {analysis.changes.map((c: any, i: number) => (
                          <div
                            key={i}
                            className={cn(
                              'grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.6fr] gap-2 md:gap-4 items-center px-4 py-3',
                              i % 2 === 0 ? 'bg-white' : 'bg-background',
                            )}
                          >
                            <span className="font-medium text-[14px] text-text-black">{c.vital}</span>
                            <div className="flex items-center gap-2 font-mono text-[13px]">
                              <span className="text-text-muted">{c.previous}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                              <span className={cn('font-bold', directionTone(c.direction))}>{c.current}</span>
                              <LevelPill value={c.direction} className="ml-1" />
                            </div>
                            <span className="text-[12px] text-text-mid">{c.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anomaly buckets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {analysis.newAnomalies?.length > 0 && (
                      <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-danger mb-3">
                          <Plus className="w-3.5 h-3.5" /> New anomalies
                        </span>
                        <ul className="space-y-1.5">
                          {analysis.newAnomalies.map((a: string, i: number) => (
                            <li key={i} className="text-[12px] text-text-black">{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.persistingAnomalies?.length > 0 && (
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-warning mb-3">
                          <Repeat className="w-3.5 h-3.5" /> Still present
                        </span>
                        <ul className="space-y-1.5">
                          {analysis.persistingAnomalies.map((a: string, i: number) => (
                            <li key={i} className="text-[12px] text-text-black">{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.resolvedAnomalies?.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-primary mb-3">
                          <Minus className="w-3.5 h-3.5" /> Resolved
                        </span>
                        <ul className="space-y-1.5">
                          {analysis.resolvedAnomalies.map((a: string, i: number) => (
                            <li key={i} className="text-[12px] text-text-black">{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {analysis.medicationChanges?.length > 0 && (
                    <div className="mb-6">
                      <AiSectionTitle>Medication changes</AiSectionTitle>
                      <ul className="space-y-2">
                        {analysis.medicationChanges.map((m: string, i: number) => (
                          <li key={i} className="text-[13px] text-text-black bg-background border border-border rounded-lg px-3 py-2">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendedActions?.length > 0 && (
                    <div>
                      <AiSectionTitle>Recommended actions</AiSectionTitle>
                      <ul className="space-y-2">
                        {analysis.recommendedActions.map((a: string, i: number) => (
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
                </motion.div>
              )
            )}
          </AiState>
        )}
      </div>
    </div>
  );
}
