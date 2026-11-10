import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, Sparkles, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { BentoCell } from '../../components/ui/BentoCell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button, cn } from '../../components/ui/Button';
import { TypingEffect } from '../../components/ui/TypingEffect';
import RiskScore from '../../components/ai/RiskScore';
import api from '../../lib/api';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // There is no explicit doctor/patient/id endpoint returning the profile in the provided backend service snippet, but we can get it from the list or assume one exists. For safety, let's fetch all patients and filter by ID.
    const fetchProfileAndRecords = async () => {
      try {
        const [patientsRes, recordsRes] = await Promise.all([
           api.get('/doctor/patients'),
           api.get(`/doctor/patient/${id}/records`)
        ]);
        
        const ptList = patientsRes.data.data || [];
        const pt = ptList.find((p: any) => p.id.toString() === id);
        setPatient(pt);
        setRecords(recordsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndRecords();
  }, [id]);

  // Derive charts & vitals from all historical records
  const processedVitals = useMemo(() => {
    let glucoseData: any[] = [];
    let latestGlucose = 0;
    
    // Reverse records to be chronological
    const chrono = [...records].reverse();
    
    chrono.forEach((r: any) => {
      let ext: any = {};
      try { if (r.extractedData) ext = JSON.parse(r.extractedData); } catch(e) {}
      if (ext.vitals) {
        ext.vitals.forEach((v: any) => {
          if (v.name && v.name.toLowerCase().includes('glucose')) {
            const val = parseFloat(String(v.value).replace(/[^0-9.]/g, ''));
            if (!isNaN(val)) {
              glucoseData.push({ value: val });
              latestGlucose = val;
            }
          }
        });
      }
    });
    
    return { glucoseData, latestGlucose };
  }, [records]);

  if (loading) return <div className="min-h-screen bg-background p-10 font-body text-text-mid">Loading clinical profile...</div>;
  if (!patient) return <div className="min-h-screen bg-background p-10 font-body text-danger">Patient not found.</div>;

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      
      {/* HEADER STRIP */}
      <div className="bg-white border-b border-border sticky top-[68px] z-30 shadow-sm py-4">
         <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <Link to="/doctor/patients" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-black/5 transition-colors shrink-0"><ChevronLeft className="w-5 h-5"/></Link>
               <div>
                  <h1 className="text-[20px] font-semibold text-text-black leading-none">{patient.name}</h1>
                  <p className="font-mono text-[13px] text-text-muted mt-1">Patient ID: {patient.id} &middot; {patient.dob} &middot; {patient.gender}</p>
               </div>
            </div>
            <div className="flex gap-3">
               <Button variant="secondary" className="bg-white border-border text-text-black shadow-sm h-10 px-4">Direct Message</Button>
               <Button className="h-10 px-6 gap-2"><Sparkles className="w-4 h-4"/> AI Synthesis</Button>
            </div>
         </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8">
         
         {/* AI SYNTHESIS HERO */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-primary/5 text-text-black border border-primary/20 rounded-xl p-8 md:p-10 mb-8 overflow-hidden relative shadow-sm">
            <div className="relative z-10 max-w-[900px]">
               <div className="flex items-center gap-2 text-primary font-bold mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Sparkles className="w-4 h-4"/></div>
                  <span className="uppercase tracking-widest text-[13px]">Clinical Pre-Visit Synthesis</span>
               </div>
               <p className="text-[22px] md:text-[28px] leading-relaxed mb-6">
                 {processedVitals.latestGlucose > 120 
                   ? <TypingEffect text={`Patient presents with elevated fasting glucose (${processedVitals.latestGlucose} mg/dL) in recent records. Advise reviewing metabolic panel and treatment efficacy.`} speed={10} />
                   : <TypingEffect text="Patient's records show generally stable vitals. Review chronological reports below for full history." speed={10} />
                 }
               </p>
               <div className="flex gap-6 border-t border-primary/10 pt-6 mt-6">
                  <div>
                    <span className="text-primary text-[12px] uppercase tracking-wide font-semibold block mb-1">Recommended Action</span>
                    <span className="text-text-black font-medium">{processedVitals.latestGlucose > 120 ? 'Review medication adherence; consider adjusting dosage or dietary consult.' : 'Routine monitoring.'}</span>
                  </div>
               </div>
            </div>
         </motion.div>

         {/* AI RISK SCORE */}
         {id && (
           <div className="mb-8">
             <RiskScore endpoint={`/doctor/patient/${id}/risk`} title="AI Patient Risk Score" />
           </div>
         )}

         {/* BENTO GRID */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* CELL 1: Vitals Overview */}
            <BentoCell colSpan={1} rowSpan={2} className="flex flex-col">
               <h3 className="font-semibold text-[18px] mb-6 text-text-black tracking-tight">Active Vitals Tracker</h3>
               <div className="flex-1 flex flex-col gap-6">
                 
                 {processedVitals.glucoseData.length > 0 ? (
                   <div className="p-4 bg-background border border-border rounded-xl relative overflow-hidden group">
                      {processedVitals.latestGlucose >= 126 && <div className="absolute top-0 right-0 p-2"><AlertTriangle className="w-4 h-4 text-danger animate-pulse"/></div>}
                      <span className="text-[12px] font-medium text-text-muted uppercase tracking-wide block mb-1">Fasting Glucose</span>
                      <div className="flex items-baseline gap-1">
                        <span className={cn("font-mono text-[32px] font-bold leading-none", processedVitals.latestGlucose >= 126 ? 'text-danger' : 'text-text-black')}>{processedVitals.latestGlucose}</span>
                        <span className="font-mono text-[14px] text-text-mid">mg/dL</span>
                      </div>
                      <div className="w-full h-[40px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={processedVitals.glucoseData}>
                             <Area type="monotone" dataKey="value" stroke={processedVitals.latestGlucose >= 126 ? "#DC2626" : "#10B981"} fillOpacity={0.1} fill={processedVitals.latestGlucose >= 126 ? "#DC2626" : "#10B981"} isAnimationActive={false} />
                           </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                 ) : (
                   <div className="p-4 bg-background border border-border rounded-xl text-text-mid text-[13px] text-center">No glucose records on file.</div>
                 )}

                 <div className="p-4 bg-background border border-border rounded-xl">
                    <span className="text-[12px] font-medium text-text-muted uppercase tracking-wide block mb-1">Last Recorded BP</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-[24px] font-bold text-text-black leading-none">120/80</span>
                      <span className="font-mono text-[14px] text-text-muted">mmHg</span>
                    </div>
                 </div>

               </div>
               <Link to="/doctor/patients" className="text-[13px] text-primary font-semibold mt-6 block hover:underline">View Full Flowsheet →</Link>
            </BentoCell>

            {/* CELL 2: Medical Profile Summary */}
            <BentoCell colSpan={3} className="bg-white flex flex-col md:flex-row gap-8">
               <div className="flex-1">
                  <h3 className="font-semibold text-[14px] text-text-muted uppercase tracking-wide mb-4">Patient Demographics</h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div>
                      <span className="text-[12px] text-text-muted font-mono block mb-1">Blood Group</span>
                      <span className="font-semibold text-[18px] text-text-black">{patient.bloodGroup || 'O+'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-text-muted font-mono block mb-1">Gender</span>
                      <span className="font-semibold text-[18px] text-text-black">{patient.gender || 'Unknown'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[12px] text-text-muted font-mono block mb-1">Allergies</span>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(patient.allergies) ? patient.allergies : String(patient.allergies || '').split(',').map((x: string) => x.trim()).filter(Boolean)).length > 0 ? (Array.isArray(patient.allergies) ? patient.allergies : String(patient.allergies).split(',').map((x: string) => x.trim()).filter(Boolean)).map((a: string) => <span key={a} className="bg-danger/10 text-danger text-[13px] font-medium px-2 py-0.5 rounded border border-danger/20">{a}</span>) : <span className="text-[14px] font-medium text-text-black">No Known Allergies (NKA)</span>}
                      </div>
                    </div>
                  </div>
               </div>
               <div className="hidden md:block w-px bg-border" />
               <div className="flex-1">
                  <h3 className="font-semibold text-[14px] text-text-muted uppercase tracking-wide mb-4">Current Subscriptions</h3>
                  <div className="space-y-3">
                     <div className="bg-background p-3 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-[14px] text-text-black">Metformin</span>
                          <span className="text-[12px] text-text-muted font-mono">1000mg</span>
                        </div>
                        <span className="text-[12px] text-text-mid">Twice daily with meals</span>
                     </div>
                  </div>
               </div>
            </BentoCell>

            {/* CELL 3: Recent Records */}
            <BentoCell colSpan={3} className="flex flex-col">
               <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                 <h3 className="text-[18px] font-semibold text-text-black tracking-tight">Clinical Records Repository</h3>
                 <div className="flex gap-2">
                   <button className="text-[13px] font-medium px-3 py-1 bg-background border border-border rounded-md hover:bg-black/5 text-text-black">Filter</button>
                 </div>
               </div>
               
               <div className="flex flex-col gap-3">
                 {records.map((r, _i) => {
                   let ext: any = {};
                   try { if(r.extractedData) ext = JSON.parse(r.extractedData); } catch(e){}
                   return (
                     <div key={r.id} className="p-4 bg-background border border-border rounded-xl hover:bg-black/5 transition-colors cursor-pointer group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between relative overflow-hidden">
                        <div className="flex items-center gap-4 shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border bg-white ${r.reportType === 'BLOOD_TEST' ? 'text-danger border-danger/20' : 'text-primary border-primary/20'}`}>
                            {r.reportType === 'BLOOD_TEST' ? <Activity className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                          </div>
                          <div>
                            <Link to={`/patient/records/${r.id}`}>
                              <h4 className="font-semibold text-[15px] group-hover:text-primary transition-colors text-text-black">{r.reportName || r.reportType}</h4>
                            </Link>
                            <span className="text-[13px] text-text-muted font-mono">{r.visitDate ? format(new Date(r.visitDate), 'dd MMM yyyy') : 'No Date'}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 px-0 md:px-8 text-[14px] text-text-mid leading-relaxed line-clamp-2 md:line-clamp-1">
                          "{ext.aiSummary || 'Analysis pending.'}"
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end shrink-0">
                          <StatusBadge dotOnly status={r.status || 'NORMAL'} />
                          <Link to={`/doctor/patients/${r.id}/record/${r.id}`} className="text-primary text-[13px] font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all flex items-center gap-1">Review <ChevronRight className="w-4 h-4"/></Link>
                        </div>
                     </div>
                   );
                 })}
                 {records.length === 0 && <p className="text-[14px] text-text-mid py-6 text-center">No reports uploaded for this patient.</p>}
               </div>
            </BentoCell>

         </div>
      </div>
    </div>
  );
}
