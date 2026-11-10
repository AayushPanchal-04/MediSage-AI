import { motion } from 'framer-motion';
import { Target, Salad, Dumbbell, CalendarDays, Activity, CalendarCheck, Info } from 'lucide-react';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiShell, AiSectionTitle, AiState, isAiUnavailable } from './AiKit';

const CheckList = ({ items, tone = 'primary' }: { items?: string[]; tone?: 'primary' | 'danger' }) =>
  items?.length ? (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px] text-text-black leading-relaxed">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${tone === 'danger' ? 'bg-danger' : 'bg-primary'}`} />
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-[13px] text-text-muted">Nothing to add.</p>
  );

export default function CarePlan() {
  const { data, loading, error, reload } = useAiInsight<any>('/patient/care-plan');

  return (
    <div className="w-full">
      <AiState loading={loading} error={error} onRetry={reload} loadingLabel="Building your care plan…">
        {isAiUnavailable(data) ? (
          <div className="bg-warning/5 border border-warning/20 rounded-card p-8 text-center text-[14px] text-text-mid">
            The care plan could not be generated right now. Please try again.
          </div>
        ) : (
          data && (
            <AiShell title="Personalised 7-Day Care Plan" onRefresh={reload} refreshing={loading}>
              {data.overview && (
                <p className="text-[15px] text-text-black leading-relaxed bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                  {data.overview}
                </p>
              )}

              {/* Goals */}
              {data.goals?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<Target className="w-4 h-4" />}>Your goals</AiSectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.goals.map((g: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-background border border-border rounded-xl p-4"
                      >
                        <span className="font-semibold text-[14px] text-text-black block">{g.goal}</span>
                        {g.target && <span className="font-mono text-[12px] text-primary block mt-1">{g.target}</span>}
                        {g.timeframe && <span className="text-[12px] text-text-muted block mt-1">{g.timeframe}</span>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet */}
              {data.diet && (
                <div className="mb-8">
                  <AiSectionTitle icon={<Salad className="w-4 h-4" />}>Nutrition</AiSectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background border border-border rounded-xl p-4">
                      <span className="text-[12px] font-bold uppercase tracking-wide text-text-muted block mb-3">Focus</span>
                      <CheckList items={data.diet.focus} />
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <span className="text-[12px] font-bold uppercase tracking-wide text-primary block mb-3">Eat more of</span>
                      <CheckList items={data.diet.include} />
                    </div>
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                      <span className="text-[12px] font-bold uppercase tracking-wide text-danger block mb-3">Cut down</span>
                      <CheckList items={data.diet.avoid} tone="danger" />
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly plan */}
              {data.weeklyPlan?.length > 0 && (
                <div className="mb-8">
                  <AiSectionTitle icon={<CalendarDays className="w-4 h-4" />}>Your week</AiSectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.weeklyPlan.map((d: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white border border-border rounded-xl p-4 shadow-sm"
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wide text-primary block">{d.day}</span>
                        <span className="font-semibold text-[14px] text-text-black block mt-1 mb-3">{d.focus}</span>
                        <ul className="space-y-1.5">
                          {(d.actions || []).map((a: string, j: number) => (
                            <li key={j} className="text-[12px] text-text-mid flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-text-muted shrink-0 mt-2" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle / monitoring / follow-up */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {data.lifestyle?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<Dumbbell className="w-4 h-4" />}>Lifestyle</AiSectionTitle>
                    <CheckList items={data.lifestyle} />
                  </div>
                )}
                {data.monitoring?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<Activity className="w-4 h-4" />}>Monitor</AiSectionTitle>
                    <CheckList items={data.monitoring} />
                  </div>
                )}
                {data.followUp?.length > 0 && (
                  <div>
                    <AiSectionTitle icon={<CalendarCheck className="w-4 h-4" />}>Follow-up</AiSectionTitle>
                    <CheckList items={data.followUp} />
                  </div>
                )}
              </div>

              {data.disclaimer && (
                <p className="mt-8 text-[12px] text-text-muted border-t border-border pt-4 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {data.disclaimer}
                </p>
              )}
            </AiShell>
          )
        )}
      </AiState>
    </div>
  );
}
