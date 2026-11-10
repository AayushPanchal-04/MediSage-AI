import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../components/ui/Button';
import { TypingEffect } from '../../components/ui/TypingEffect';
import api from '../../lib/api';

const activityData = [
  { day: 'Mon', records: 4 }, { day: 'Tue', records: 7 }, { day: 'Wed', records: 2 },
  { day: 'Thu', records: 9 }, { day: 'Fri', records: 5 }, { day: 'Sat', records: 1 },
];

export default function DoctorHome() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);

  useEffect(() => {
    api.get('/doctor/patients').then(res => {
      setPatients(res.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // For the sake of the dashboard demo, map the first few patients to an upcoming schedule
  const appointments = patients.slice(0, 3).map((p, i) => ({
    id: `apt-${p.id}`,
    time: ['09:00', '10:30', '14:00'][i % 3],
    patient: p,
    reason: i === 0 ? 'Routine Follow-up' : i === 1 ? 'Test Results Review' : 'Chronic Care',
    status: 'Upcoming'
  }));

  // Identify potentially flagged patients (e.g. recent critical events inferred from data - mocking the condition here based on index for UI purposes since Patient entity doesn't contain a direct `status` field)
  const flagged = patients.slice(0, 2); 

  return (
    <div className="w-full pb-20 bg-background min-h-[calc(100vh-68px)] flex flex-col items-center">
      
      {/* PROFESSIONAL HEADER */}
      <div className="w-full bg-white border-b border-border pt-12 pb-10 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="flex flex-col">
             <p className="text-[13px] text-text-muted font-mono mb-2">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
             <h1 className="text-[32px] font-semibold text-text-black tracking-tight leading-none mb-4">Good morning, Dr. {user?.name?.split(' ').pop() || 'Doctor'}.</h1>
             <p className="text-[15px] text-text-mid">Your clinical brief for today, powered by MediSage AI.</p>
           </div>
           
           <div className="flex flex-wrap gap-4">
             <div className="bg-background border border-border px-6 py-3 rounded-card flex flex-col justify-center min-w-[120px]">
                <span className="font-mono text-[24px] text-text-black font-semibold leading-none mb-1">{patients.length}</span>
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wide">Assigned</span>
             </div>
             <div className="bg-danger/5 border border-danger/20 px-6 py-3 rounded-card flex flex-col justify-center min-w-[120px]">
                <span className="font-mono text-[24px] text-danger font-semibold leading-none mb-1">{flagged.length}</span>
                <span className="text-[11px] text-danger/70 uppercase font-bold tracking-wide">Alerts</span>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-2 flex flex-col gap-8">
            {/* TODAY'S SCHEDULE */}
            <section>
              <div className="flex items-end justify-between mb-6">
                 <div>
                   <h2 className="text-[20px] font-semibold text-text-black tracking-tight">Today's Schedule</h2>
                   <p className="text-text-mid text-[14px] mt-1">{appointments.length} appointments</p>
                 </div>
              </div>

              {loading ? <p className="text-text-mid text-[14px]">Loading schedule...</p> : (
                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-[70px] top-4 bottom-4 w-px bg-border/50 z-0 hidden md:block" />

                  {appointments.map((apt, i) => (
                    <motion.div 
                      key={apt.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="w-full bg-white rounded-card shadow-sm border border-border p-6 flex flex-col hover:border-border/80 transition-colors"
                    >
                       <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10 w-full">
                          {/* Time */}
                          <div className="w-[120px] shrink-0 flex items-baseline gap-1 relative">
                            <span className="font-mono text-[24px] font-semibold text-text-black">{apt.time}</span>
                            <span className="text-[12px] text-text-muted font-medium">AM</span>
                          </div>

                          {/* Center Info */}
                          <div className="flex-1 flex flex-col">
                             <div className="flex items-center gap-4 mb-2">
                               <div className="w-10 h-10 rounded-full bg-background border border-border text-text-mid font-semibold flex items-center justify-center text-[13px] uppercase">
                                 {apt.patient.name?.substring(0,2) || 'PT'}
                               </div>
                               <div>
                                 <h3 className="text-[18px] font-semibold text-text-black leading-none hover:text-primary transition-colors cursor-pointer">{apt.patient.name}</h3>
                                 <p className="text-[14px] text-text-mid mt-1">{apt.reason}</p>
                               </div>
                             </div>
                          </div>

                          {/* Right Actions */}
                          <div className="shrink-0 flex flex-col md:items-end gap-3 mt-4 md:mt-0">
                             <StatusBadge status="PENDING" text={apt.status} />
                             <Button 
                               onClick={() => setExpandedBrief(expandedBrief === apt.id ? null : apt.id)}
                               variant="secondary" 
                               className="bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 gap-2 px-4 shadow-none h-10"
                             >
                               <Sparkles className="w-4 h-4"/> AI Brief <ChevronDown className={cn("w-4 h-4 transition-transform", expandedBrief === apt.id && "rotate-180")} />
                             </Button>
                          </div>
                       </div>

                       {/* Expanded AI Brief */}
                       <AnimatePresence>
                          {expandedBrief === apt.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }} 
                              className="w-full overflow-hidden"
                            >
                               <div className="mt-6 pt-6 border-t border-border">
                                  <div className="bg-background border border-border rounded-xl p-5 mb-4">
                                    <p className="font-body text-[14px] text-text-black leading-relaxed">
                                      <TypingEffect text="AI pre-visit synthesis: Patient presents for routine follow-up. Based on latest records, metrics have remained generally stable. Review complete clinical history for full context." speed={10} />
                                    </p>
                                  </div>
                                  
                                  <div className="mt-4 flex justify-end">
                                    <Link to={`/doctor/patients/${apt.patient.id}`} className="text-[13px] font-medium text-primary hover:underline flex items-center gap-1">Open Full Flowsheet <ChevronRight className="w-4 h-4"/></Link>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </motion.div>
                  ))}
                  {!loading && appointments.length === 0 && <p className="text-text-mid text-[14px]">No appointments today.</p>}
                </div>
              )}
            </section>
         </div>

         {/* RIGHT COLUMN */}
         <div className="flex flex-col gap-8">
            
            {/* FLAGGED */}
            <section className="bg-white rounded-card shadow-sm p-6 lg:p-8 border border-border">
               <h2 className="text-[18px] font-semibold text-text-black tracking-tight mb-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-danger animate-pulse" /> Alerts & Flags
               </h2>
               
               <div className="flex flex-col gap-3">
                  {flagged.map(f => (
                    <div key={f.id} className="relative pl-4 border-l-[3px] border-danger py-2 group cursor-pointer hover:bg-black/5 rounded-r-lg transition-colors pr-2">
                       <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-semibold text-[15px] text-text-black">{f.name}</h3>
                       </div>
                       <p className="text-[13px] text-text-mid font-body mb-2 leading-snug">
                         Potential anomaly detected in recent lab results.
                       </p>
                       <Link to={`/doctor/patients/${f.id}`} className="text-[12px] text-danger font-medium flex items-center gap-1 group-hover:underline">Review Records →</Link>
                    </div>
                  ))}
                  {flagged.length === 0 && <p className="text-[13px] text-text-mid">No active flags.</p>}
               </div>
            </section>

            {/* ACTIVITY CHART */}
            <section className="bg-white rounded-card shadow-sm p-6 lg:p-8 border border-border">
               <h2 className="font-semibold text-[16px] text-text-black mb-6">Patient Uploads This Week</h2>
               <div className="w-full h-[180px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                      <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="records" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </section>
         </div>

      </div>
    </div>
  );
}
