import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertTriangle, MessageCircleQuestion, ShieldCheck, Search, Activity } from 'lucide-react';
import { cn } from '../ui/Button';
import { useAiInsight } from '../../lib/useAiInsight';
import { AiShell, AiSectionTitle, AiState, LevelPill, isAiUnavailable } from './AiKit';

const EXAMPLES = [
  'Frequent urination and thirst for the last two weeks',
  'Tightness in my chest when I climb stairs',
  'Persistent dry cough at night for a month',
  'Dizzy spells when I stand up quickly',
];

const URGENCY_BG: Record<string, string> = {
  EMERGENCY: 'bg-danger/5 border-danger/30',
  URGENT: 'bg-warning/5 border-warning/30',
  ROUTINE: 'bg-primary/5 border-primary/20',
  SELF_CARE: 'bg-primary/5 border-primary/20',
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const { data, loading, error, load } = useAiInsight<any>('/patient/triage', { method: 'post', autoLoad: false });
  const [submitted, setSubmitted] = useState(false);

  const run = async (text: string) => {
    const value = text.trim();
    if (value.length < 3) return;
    setSubmitted(true);
    await load({ symptoms: value });
  };

  const result = submitted ? data : null;
  const showEmpty = submitted && !loading && !error && isAiUnavailable(result);

  return (
    <div className="w-full">
      <div className="bg-white border border-border rounded-card p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-[20px] font-semibold text-text-black tracking-tight">Describe how you feel</h2>
        </div>
        <p className="text-[14px] text-text-mid mb-5">
          The AI reads your uploaded reports together with your description to estimate how urgent this is and what to do next.
        </p>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={4}
          placeholder="e.g. I've had a throbbing headache with blurred vision since yesterday evening…"
          className="w-full bg-background border border-border rounded-xl p-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setSymptoms(ex)}
              className="text-[12px] text-text-mid bg-background border border-border hover:border-primary hover:text-primary rounded-badge px-3 py-1.5 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={() => run(symptoms)}
          disabled={symptoms.trim().length < 3 || loading}
          className="mt-5 inline-flex items-center gap-2 bg-primary text-white font-medium text-[15px] rounded-btn px-6 h-11 hover:bg-primary-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Assessing…' : 'Check symptoms'}
        </button>
      </div>

      {!submitted && (
        <div className="bg-primary/5 border border-primary/20 rounded-card p-6 flex items-start gap-3 text-[13px] text-text-mid">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <p>
            This is an AI triage aid, not a diagnosis. For chest pain, difficulty breathing, fainting or severe
            bleeding, call emergency services immediately.
          </p>
        </div>
      )}

      {submitted && (
        <AiState loading={loading} error={error} onRetry={() => run(symptoms)} loadingLabel="Assessing your symptoms…">
          {showEmpty ? (
            <div className="bg-warning/5 border border-warning/20 rounded-card p-8 text-center text-[14px] text-text-mid">
              The AI could not assess these symptoms right now. Please try again in a moment.
            </div>
          ) : (
            result && (
              <AiShell title="Triage Assessment">
                {/* Urgency banner */}
                <div className={cn('rounded-xl border p-6 md:p-8 mb-8', URGENCY_BG[String(result.urgency).toUpperCase()] || URGENCY_BG.ROUTINE)}>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <LevelPill value={result.urgency} className="!text-[13px] !px-3 !py-1.5" />
                    <span className="text-[12px] font-mono uppercase tracking-wide text-text-muted">Urgency level</span>
                  </div>
                  <p className="text-[20px] md:text-[24px] font-semibold text-text-black leading-snug max-w-3xl">
                    {result.headline}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Possible conditions */}
                  {result.possibleConditions?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<Activity className="w-4 h-4" />}>Possible explanations</AiSectionTitle>
                      <div className="space-y-3">
                        {result.possibleConditions.map((c: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-background border border-border rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="font-semibold text-[15px] text-text-black">{c.name}</span>
                              <LevelPill value={c.likelihood} />
                            </div>
                            {c.reason && <p className="text-[13px] text-text-mid leading-relaxed">{c.reason}</p>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advice */}
                  {result.advice?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<ShieldCheck className="w-4 h-4" />}>What to do next</AiSectionTitle>
                      <ul className="space-y-3">
                        {result.advice.map((a: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-[14px] text-text-black">
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Red flags */}
                {result.redFlags?.length > 0 && (
                  <div className="mt-8 bg-danger/5 border border-danger/20 rounded-xl p-5">
                    <AiSectionTitle icon={<AlertTriangle className="w-4 h-4 text-danger" />} className="!text-danger !mb-3">
                      Emergency warning signs
                    </AiSectionTitle>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {result.redFlags.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-text-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-2" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {result.relatedFindings?.length > 0 && (
                    <div>
                      <AiSectionTitle>From your records</AiSectionTitle>
                      <ul className="space-y-2">
                        {result.relatedFindings.map((f: string, i: number) => (
                          <li key={i} className="text-[13px] text-text-mid bg-background border border-border rounded-lg px-3 py-2">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.questionsForDoctor?.length > 0 && (
                    <div>
                      <AiSectionTitle icon={<MessageCircleQuestion className="w-4 h-4" />}>Ask your doctor</AiSectionTitle>
                      <ul className="space-y-2">
                        {result.questionsForDoctor.map((q: string, i: number) => (
                          <li key={i} className="text-[13px] text-text-mid flex items-start gap-2">
                            <span className="text-primary font-bold">?</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {result.disclaimer && (
                  <p className="mt-8 text-[12px] text-text-muted border-t border-border pt-4">{result.disclaimer}</p>
                )}
              </AiShell>
            )
          )}
        </AiState>
      )}
    </div>
  );
}
