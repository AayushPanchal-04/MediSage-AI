import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Pill, CalendarHeart, Gauge } from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { PageHero } from '../../components/ui/PageHero';
import SymptomChecker from '../../components/ai/SymptomChecker';
import MedicationSafety from '../../components/ai/MedicationSafety';
import CarePlan from '../../components/ai/CarePlan';
import RiskScore from '../../components/ai/RiskScore';

const TABS = [
  { id: 'symptoms', name: 'Symptom Checker', icon: Stethoscope, blurb: 'Describe how you feel and get an urgency assessment.' },
  { id: 'medications', name: 'Medication Safety', icon: Pill, blurb: 'Check every medicine in your reports for conflicts.' },
  { id: 'care-plan', name: 'Care Plan', icon: CalendarHeart, blurb: 'A 7-day plan built from your own results.' },
  { id: 'risk', name: 'Risk Score', icon: Gauge, blurb: 'Where your numbers put you, explained simply.' },
];

export default function AiCare() {
  const [active, setActive] = useState('symptoms');
  const current = TABS.find((t) => t.id === active)!;

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      <PageHero
        title="AI Care Hub"
        subtitle="Four AI assistants that read your uploaded reports — symptom triage, medication safety, a personal care plan and your health risk score."
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8">
        {/* Tab strip */}
        <div className="flex gap-2 border-b border-border overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-4 text-[14px] font-medium whitespace-nowrap transition-colors',
                  isActive ? 'text-primary' : 'text-text-mid hover:text-text-black',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                {isActive && (
                  <motion.div layoutId="ai-care-tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <motion.p
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[14px] text-text-mid mt-5 mb-6"
        >
          {current.blurb}
        </motion.p>

        <motion.div key={`panel-${active}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {active === 'symptoms' && <SymptomChecker />}
          {active === 'medications' && <MedicationSafety />}
          {active === 'care-plan' && <CarePlan />}
          {active === 'risk' && <RiskScore />}
        </motion.div>
      </div>
    </div>
  );
}
