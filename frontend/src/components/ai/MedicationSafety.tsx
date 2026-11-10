import { motion } from 'framer-motion';
import { Pill, Copy, GitCompareArrows, ShieldAlert, AlertOctagon, Info } from 'lucide-react';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiShell, AiSectionTitle, AiState, LevelPill, isAiUnavailable } from './AiKit';

export default function MedicationSafety() {
  const { data, loading, error, reload } = useAiInsight<any>('/patient/medications');

  return (
    <div className="w-full">
      <AiState loading={loading} error={error} onRetry={reload} loadingLabel="Reviewing your medications…">
        {isAiUnavailable(data) ? (
          <div className="bg-warning/5 border border-warning/20 rounded-card p-8 text-center text-[14px] text-text-mid">
            The medication review could not be generated right now. Please try again.
          </div>
        ) : (
          data && (
            <AiShell title="Medication Safety Review" onRefresh={reload} refreshing={loading}>
              {data.summary && (
                <p className="text-[15px] text-text-black leading-relaxed bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                  {data.summary}
                </p>
              )}

              {/* Active medications */}
              {data.medications?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<Pill className="w-4 h-4" />}>Medications found in your reports</AiSectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.medications.map((m: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-background border border-border rounded-xl p-4"
                      >
                        <span className="font-semibold text-[15px] text-text-black block">{m.name}</span>
                        <span className="font-mono text-[12px] text-text-mid block mt-1">
                          {[m.dosage, m.frequency].filter(Boolean).join(' · ') || 'Dosage not stated'}
                        </span>
                        {m.purpose && <p className="text-[12px] text-text-muted mt-2 leading-relaxed">{m.purpose}</p>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions */}
              {data.interactions?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<GitCompareArrows className="w-4 h-4 text-danger" />} className="!text-danger">
                    Potential interactions
                  </AiSectionTitle>
                  <div className="space-y-3">
                    {data.interactions.map((it: any, i: number) => (
                      <div key={i} className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-semibold text-[14px] text-text-black">
                            {(it.between || []).join('  +  ')}
                          </span>
                          <LevelPill value={it.severity} />
                        </div>
                        <p className="text-[13px] text-text-mid leading-relaxed">{it.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Duplicates */}
                {data.duplicates?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<Copy className="w-4 h-4 text-warning" />} className="!text-warning">
                      Possible duplicates
                    </AiSectionTitle>
                    <div className="space-y-2">
                      {data.duplicates.map((d: any, i: number) => (
                        <div key={i} className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                          <span className="font-semibold text-[13px] text-text-black block">{d.name}</span>
                          <span className="text-[12px] text-text-mid">{d.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergy conflicts */}
                {data.allergyConflicts?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<ShieldAlert className="w-4 h-4 text-danger" />} className="!text-danger">
                      Allergy conflicts
                    </AiSectionTitle>
                    <ul className="space-y-2">
                      {data.allergyConflicts.map((c: string, i: number) => (
                        <li key={i} className="text-[13px] text-text-black bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {data.warnings?.length > 0 && (
                <div className="mt-8">
                  <AiSectionTitle icon={<AlertOctagon className="w-4 h-4" />}>Other things to raise</AiSectionTitle>
                  <ul className="space-y-2">
                    {data.warnings.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-text-mid">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-2" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-8 text-[12px] text-text-muted border-t border-border pt-4 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                This is an automated review of the text found in your reports. Always confirm medication changes with your
                doctor or pharmacist before acting on them.
              </p>
            </AiShell>
          )
        )}
      </AiState>
    </div>
  );
}
