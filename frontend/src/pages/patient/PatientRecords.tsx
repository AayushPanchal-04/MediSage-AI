import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Search, Activity, Heart, Dna, FileScan } from 'lucide-react';
import { format } from 'date-fns';
import { PageHero } from '../../components/ui/PageHero';
import { StatusBadge } from '../../components/ui/StatusBadge';
import api from '../../lib/api';

export default function PatientRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patient/records').then(res => {
      setRecords(res.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'BLOOD_TEST': return <Activity className="w-6 h-6 text-danger" />;
      case 'SCAN': return <FileScan className="w-6 h-6 text-primary" />;
      case 'PRESCRIPTION': return <Heart className="w-6 h-6 text-accent" />;
      case 'OTHER': return <Dna className="w-6 h-6 text-text-mid" />;
      default: return <FileText className="w-6 h-6 text-text-mid" />;
    }
  };

  return (
    <div className="w-full pb-20 bg-background min-h-screen">
      <PageHero 
        title="My Records" 
        subtitle="All your clinical reports, securely extracted and organized." 
      />

      {/* FILTER BAR */}
      <div className="sticky top-[68px] z-30 bg-white/90 backdrop-blur-md border-b border-border py-4 px-6 md:px-12 shadow-sm">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search reports..." className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-background focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[14px] font-body" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'Blood', 'Scan', 'X-Ray', 'Prescription'].map((chip, i) => (
                <button key={chip} className={`whitespace-nowrap px-4 py-1.5 rounded-badge text-[13px] font-medium transition-colors ${i === 0 ? 'bg-primary text-white shadow-sm' : 'border border-border text-text-mid hover:bg-black/5 bg-white'}`}>
                  {chip}
                </button>
              ))}
            </div>
         </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8 space-y-4">
         {loading ? <p className="text-text-mid">Loading records...</p> : records.map((r, i) => {
           let extracted: any = { vitals: [], aiSummary: '' };
           try { if (r.extractedData) extracted = JSON.parse(r.extractedData); } catch(e) {}
           return (
             <motion.div 
               key={r.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="w-full bg-white rounded-card shadow-sm border border-border p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
             >
               <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 bg-background border border-border`}>
                 {getIcon(r.reportType)}
               </div>

               <div className="flex-1 flex flex-col">
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                   <div>
                     <Link to={`/patient/records/${r.id}`}>
                       <h3 className="text-[20px] font-semibold text-text-black hover:text-primary transition-colors cursor-pointer">{r.reportName || r.reportType}</h3>
                     </Link>
                     <p className="font-mono text-[13px] text-text-muted mt-1">
                       {r.visitDate ? format(new Date(r.visitDate), 'dd MMM yyyy') : 'No Date'}
                     </p>
                   </div>
                   <StatusBadge status={r.status || 'NORMAL'} />
                 </div>

                 <p className="text-[14px] text-text-mid line-clamp-2 mt-2 mb-4 leading-relaxed">
                   {extracted.aiSummary || "No AI summary available yet."}
                 </p>

                 <div className="mt-auto pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                     {extracted.vitals?.slice(0, 3).map((v: any) => (
                       <div key={v.name} className="flex items-baseline gap-2">
                         <span className="text-[12px] font-medium text-text-muted">{v.name}</span>
                         <span className={`font-mono text-[14px] font-bold ${v.status === 'CRITICAL' ? 'text-danger' : v.status === 'WARNING' ? 'text-warning' : 'text-text-black'}`}>{v.value}</span>
                       </div>
                     ))}
                   </div>
                   
                   <Link to={`/patient/records/${r.id}`} className="inline-flex items-center gap-2 text-[13px] font-medium text-primary hover:underline">
                     View Details →
                   </Link>
                 </div>
               </div>
             </motion.div>
           );
         })}
         {!loading && records.length === 0 && <p className="text-text-mid">No records found.</p>}
      </div>
    </div>
  );
}
