import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHero } from '../../components/ui/PageHero';
import api from '../../lib/api';

export default function MyPatients() {
  const [filter, setFilter] = useState('All');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/patients').then(res => {
      setPatients(res.data.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-background pb-20">
      
      <PageHero 
        title="My Patients" 
        subtitle={`${patients.length} active patients assigned to your care.`}
      />

      {/* FILTER BAR */}
      <div className="sticky top-[68px] z-30 bg-white/90 backdrop-blur-md border-b border-border py-4 px-6 md:px-12 shadow-sm">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search patients..." className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-background focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[14px]" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {['All', 'Flagged', 'Recent'].map((chip) => (
                <button 
                  key={chip} 
                  onClick={() => setFilter(chip)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-badge text-[13px] font-medium transition-colors ${filter === chip ? 'bg-primary text-white shadow-sm' : 'border border-border text-text-mid hover:bg-black/5 bg-white'}`}
                >
                  {chip}
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* PATIENT LIST */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8 space-y-4">
         {loading ? <p className="text-text-mid text-[14px]">Loading your patients...</p> : patients.map((p, i) => {
           // Define flag logic based on index or properties (for UI mock purposes)
           const hasFlag = i % 3 === 1; 
           
           return (
             <motion.div 
               key={p.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="group relative w-full bg-white rounded-card shadow-sm border border-border hover:shadow-md hover:border-border/80 transition-all p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden"
             >
               {/* Colored highlight tab on left */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasFlag ? 'bg-danger' : 'bg-transparent'} transition-colors`} />

               <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0 font-semibold text-[18px] border transition-colors ${hasFlag ? 'bg-danger/5 text-danger border-danger/20' : 'bg-background text-text-mid border-border group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20'}`}>
                 {p.name?.substring(0, 2).toUpperCase() || 'PT'}
               </div>

               <div className="flex-1 flex flex-col md:flex-row justify-between w-full">
                  <div className="flex flex-col gap-1 w-full md:w-[35%]">
                     <Link to={`/doctor/patients/${p.id}`}><h3 className="text-[20px] font-semibold text-text-black hover:text-primary transition-colors cursor-pointer">{p.name}</h3></Link>
                     <p className="font-mono text-[13px] text-text-muted mt-1">{p.dob ? p.dob.split('-')[0] : 'Unknown'} &middot; {p.gender}</p>
                     
                     {hasFlag && (
                       <div className="mt-2 flex items-center gap-2 self-start">
                         <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                         <span className="text-[11px] font-bold text-danger uppercase tracking-wide">Review Recommended</span>
                       </div>
                     )}
                  </div>

                  <div className="flex flex-col gap-3 justify-center w-full md:w-[30%] mt-6 md:mt-0 items-start md:items-end ml-auto">
                     <Link to={`/doctor/patients/${p.id}`} className="px-6 py-2 bg-primary text-white rounded-btn text-[13px] font-medium hover:bg-primary-mid w-full text-center transition-colors">Clinical Profile</Link>
                     <button className="px-6 py-2 border border-border text-text-mid hover:bg-background hover:text-text-black rounded-btn text-[13px] font-medium w-full transition-colors text-center">AI Synthesis</button>
                  </div>
               </div>
             </motion.div>
           );
         })}
         {!loading && patients.length === 0 && <p className="text-text-mid text-[14px] text-center p-10 bg-white border border-border rounded-card">You have no patients assigned currently.</p>}
      </div>
    </div>
  );
}
