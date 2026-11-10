import { useEffect, useState } from 'react';
import { FileText, Bell, Activity, Sparkles, UploadCloud, ChevronRight, Stethoscope } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BentoCell } from '../../components/ui/BentoCell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { PageHero } from '../../components/ui/PageHero';
import { TypingEffect } from '../../components/ui/TypingEffect';
import api from '../../lib/api';

const glucoseData = [ { value: 110 }, { value: 115 }, { value: 105 }, { value: 98 }, { value: 102 }, { value: 95 }, { value: 98 } ];

export default function PatientHome() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, summaryRes] = await Promise.all([
          api.get('/patient/records'),
          api.get('/patient/summary')
        ]);
        setRecords(recordsRes.data.data || []);
        if (typeof summaryRes.data.data === 'string') {
           setInsight(summaryRes.data.data);
        } else {
           setInsight(JSON.stringify(summaryRes.data.data));
        }
      } catch (err) {
        console.error("Error fetching patient data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestRecord = records[0];

  return (
    <div className="w-full pb-20 bg-background min-h-screen">
      <PageHero 
        title={`Good morning, ${user?.name?.split(' ')[0] || 'Patient'}.`}
        subtitle="You have 2 flags and 1 pending report."
      >
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Link to="/patient/upload"><Button size="sm" className="px-6"><UploadCloud className="w-4 h-4 mr-2" />Upload Report</Button></Link>
          <Link to="/patient/care"><Button size="sm" variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 px-6 border-none shadow-none"><Stethoscope className="w-4 h-4 mr-2" />AI Care Hub</Button></Link>
          <Link to="/patient/chat"><Button size="sm" variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 px-6 border-none shadow-none"><Sparkles className="w-4 h-4 mr-2" />Ask AI</Button></Link>
        </div>
      </PageHero>

      <div className="max-w-[1440px] mx-auto px-6 mt-8">
        {loading ? (
          <div className="text-text-mid">Loading your dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* CELL A: Latest Record */}
            <BentoCell colSpan={2} className="flex flex-col md:flex-row gap-6">
               <div className="w-[80px] h-[80px] bg-background rounded-xl border border-border flex items-center justify-center flex-shrink-0">
                 <FileText className="w-8 h-8 text-primary" />
               </div>
               <div className="flex-1 flex flex-col">
                 <h3 className="font-semibold text-[20px] mb-1 text-text-black">{latestRecord?.reportName || "No Records Yet"}</h3>
                 {latestRecord && (
                   <>
                     <p className="text-[14px] text-text-muted mb-3 font-mono">{latestRecord.visitDate ? format(new Date(latestRecord.visitDate), 'dd MMM yyyy') : ''}</p>
                     <p className="text-text-mid mb-4 text-[14px] leading-relaxed line-clamp-2">
                       {latestRecord.extractedData ? "Data extracted successfully." : "Waiting for AI summary..."}
                     </p>
                     <div className="flex items-center justify-between mt-auto">
                       <StatusBadge status={latestRecord.status || 'NORMAL'} />
                       <Link to={`/patient/records/${latestRecord.id}`} className="text-[13px] text-primary font-medium hover:underline flex items-center gap-1">View Full Report <ChevronRight className="w-4 h-4"/></Link>
                     </div>
                   </>
                 )}
               </div>
            </BentoCell>

            {/* CELL C: Sparkline */}
            <BentoCell colSpan={1}>
               <span className="text-[12px] text-text-muted font-body uppercase font-bold tracking-wider block mb-2">Glucose</span>
               <div className="flex items-end gap-2 mb-2">
                 <span className="font-mono text-[32px] font-bold text-text-black leading-none">98</span>
                 <span className="font-mono text-[14px] text-text-muted mb-1">mg/dL</span>
               </div>
               <span className="text-[12px] text-primary flex items-center gap-1 mb-4 font-medium">↓ 8% from last visit</span>
               <div className="w-full h-[60px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={glucoseData}>
                     <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={0.1} fill="#10B981" isAnimationActive={false} />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </BentoCell>

            {/* CELL D: Active Flags */}
            <BentoCell colSpan={1} className="bg-danger/5 border-danger/20">
               <div className="flex items-center gap-2 mb-4">
                 <Bell className="w-4 h-4 text-danger" />
                 <span className="font-bold text-[13px] text-danger uppercase tracking-wide">2 Flags</span>
               </div>
               <ul className="space-y-3">
                 <li className="flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                   <span className="text-[13px] text-text-black font-medium leading-snug">Blood pressure slightly elevated</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                   <span className="text-[13px] text-text-black font-medium leading-snug">HbA1c needs review setup</span>
                 </li>
               </ul>
               <Link to="/patient/chat" className="text-[13px] text-danger font-medium hover:underline mt-6 block">Review with AI →</Link>
            </BentoCell>

            {/* CELL G: Recent Activity */}
            <BentoCell colSpan={3}>
               <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                 <span className="font-semibold text-[16px] text-text-black">Recent Records</span>
                 <Link to="/patient/records" className="text-[13px] text-primary font-medium hover:underline">View all →</Link>
               </div>
               <div className="space-y-1">
                 {records.slice(0, 3).map((r, _i) => (
                   <Link key={r.id} to={`/patient/records/${r.id}`}>
                     <div className="flex items-center p-3 rounded-lg hover:bg-black/5 transition-colors group cursor-pointer border border-transparent hover:border-border">
                       <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center mr-4 shrink-0">
                         <Activity className="w-4 h-4 text-text-mid group-hover:text-primary transition-colors" />
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-[14px] text-text-black group-hover:text-primary transition-colors">{r.reportName || r.reportType}</p>
                         <p className="text-[12px] text-text-muted font-mono mt-0.5">{r.visitDate ? format(new Date(r.visitDate), 'dd MMM yyyy') : ''}</p>
                       </div>
                       <StatusBadge dotOnly status={r.status || 'NORMAL'} />
                       <ChevronRight className="w-4 h-4 text-text-muted ml-4" />
                     </div>
                   </Link>
                 ))}
                 {records.length === 0 && <p className="text-[13px] text-text-mid py-4 text-center">No recent records found.</p>}
               </div>
            </BentoCell>

            {/* CELL F: Quick Upload */}
            <BentoCell colSpan={1} className="border-2 border-dashed border-border hover:border-primary/50 transition-colors bg-background cursor-pointer flex flex-col items-center justify-center text-center p-8 group">
              <Link to="/patient/upload" className="flex flex-col items-center justify-center h-full w-full">
                <div className="w-12 h-12 rounded-full bg-white border border-border text-primary flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[16px] mb-2 text-text-black">Drop a report</h3>
                <p className="text-[13px] text-text-muted">PDF or image, up to 10MB</p>
              </Link>
            </BentoCell>
          </div>
        )}

        {/* INSIGHT BAND */}
        {!loading && insight && insight.length > 5 && (
          <div className="w-full mt-6 bg-primary/5 border border-primary/20 rounded-panel p-6 flex flex-col md:flex-row md:items-start gap-6">
             <div className="flex items-center gap-2 text-primary font-bold w-48 shrink-0 pt-1">
               <Sparkles className="w-4 h-4"/>
               <span className="uppercase tracking-wide text-[12px]">AI Weekly Insight</span>
             </div>
             <p className="text-[14px] text-text-black leading-relaxed">
               <TypingEffect text={insight.replace(/["{}]/g, '')} speed={10} />
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
