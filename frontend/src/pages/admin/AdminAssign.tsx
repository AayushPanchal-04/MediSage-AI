import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, User, Stethoscope, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { PageHero } from '../../components/ui/PageHero';
import api from '../../lib/api';

export default function AdminAssign() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  
  const [searchDoc, setSearchDoc] = useState('');
  const [searchPat, setSearchPat] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [dRes, pRes] = await Promise.all([
        api.get('/admin/doctors'),
        api.get('/admin/patients')
      ]);
      const docs = dRes.data.data || [];
      setDoctors(docs);
      setPatients(pRes.data.data || []);
      
      // Select first doctor by default if none selected
      if (!selectedDoctor && docs.length > 0) {
        setSelectedDoctor(docs[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async (patientId: string) => {
    if (!selectedDoctor) return;
    try {
      await api.post(`/admin/assign-patient?patientId=${patientId}&doctorId=${selectedDoctor}`);
      // Refresh list to show updated assignment
      fetchAssignments();
    } catch (err) {
      console.error('Failed to assign patient', err);
      alert('Assignment failed.');
    }
  };


  const assignedPatients = patients.filter(p => p.assignedDoctor && p.assignedDoctor.id.toString() === selectedDoctor);
  const unassignedPatients = patients.filter(p => !p.assignedDoctor);

  return (
    <div className="w-full min-h-screen bg-background pb-20 font-body">
       
       <PageHero 
         title="Patient Assignment" 
         subtitle="Map patients to doctors to govern clinical access."
       />

       <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: DOCTORS LIST */}
          <div className="lg:col-span-4 bg-white border border-border rounded-card p-6 flex flex-col h-[700px] shadow-sm">
             <h2 className="text-[18px] font-semibold text-text-black mb-6 flex items-center gap-2 tracking-tight">
               <Stethoscope className="w-5 h-5 text-primary"/> Select Physician
             </h2>
             <div className="relative mb-6 shrink-0">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
               <input type="text" value={searchDoc} onChange={e => setSearchDoc(e.target.value)} placeholder="Search directory..." className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-[14px]" />
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loading && <p className="text-[14px] text-text-mid">Loading doctors...</p>}
                {!loading && doctors.filter(d => (d.name||'').toLowerCase().includes(searchDoc.toLowerCase())).map(doc => {
                  const isSelected = selectedDoctor === doc.id.toString();
                  return (
                    <button 
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id.toString())}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group",
                        isSelected ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-transparent hover:border-border hover:bg-black/5"
                      )}
                    >
                       <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[14px]", isSelected ? "bg-primary text-white" : "bg-background border border-border text-text-mid group-hover:text-text-black uppercase")}>
                         {(doc.name||'D').charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className={cn("font-semibold text-[14px] truncate transition-colors", isSelected ? "text-primary" : "text-text-black")}>{doc.name}</p>
                         <p className="text-[12px] text-text-muted truncate font-mono mt-0.5">{doc.specialization || 'General Practice'}</p>
                       </div>
                    </button>
                  );
                })}
             </div>
          </div>

          {/* MIDDLE + RIGHT: ASSIGNMENT PANELS */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-[700px]">
             
             {/* Unassigned Patients */}
             <div className="bg-white border border-border rounded-card p-6 flex flex-col h-full shadow-sm">
                <h2 className="text-[18px] font-semibold text-text-black mb-6 flex items-center justify-between tracking-tight">
                  <span className="flex items-center gap-2"><User className="w-5 h-5 text-text-muted"/> Unallocated</span>
                  <span className="bg-background border border-border px-2 py-0.5 rounded-full text-[12px] font-mono text-text-mid">{unassignedPatients.length}</span>
                </h2>
                <div className="relative mb-6 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" value={searchPat} onChange={e => setSearchPat(e.target.value)} placeholder="Search patients..." className="w-full h-10 pl-10 pr-4 rounded-input border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-[14px]" />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                   {!loading && unassignedPatients.filter(p => (p.name||'').toLowerCase().includes(searchPat.toLowerCase())).map(pat => (
                     <div key={pat.id} className="w-full bg-white border border-border p-4 rounded-xl flex items-center justify-between group hover:border-border/80 hover:shadow-sm transition-all">
                        <div>
                          <p className="font-semibold text-text-black text-[14px]">{pat.name}</p>
                          <p className="text-[12px] text-text-muted font-mono mt-0.5">{pat.email || 'No email'}</p>
                        </div>
                        <button onClick={() => handleAssign(pat.id)} disabled={!selectedDoctor} className="w-8 h-8 rounded-full bg-background hover:bg-primary border border-border hover:border-primary text-text-muted hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                   {!loading && unassignedPatients.length === 0 && (
                     <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[13px]">
                       <span className="font-medium text-text-mid">Pool empty.</span>
                       All patients are assigned.
                     </div>
                   )}
                </div>
             </div>

             {/* Currently Assigned */}
             <div className="bg-white border border-border rounded-card p-6 flex flex-col h-full relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                
                <h2 className="text-[18px] font-semibold text-text-black mb-6 flex items-center justify-between relative z-10 tracking-tight">
                  <span className="flex items-center gap-2 text-primary"><User className="w-5 h-5"/> Assigned Panel</span>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[12px] font-mono font-bold">{assignedPatients.length}</span>
                </h2>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative z-10">
                   <AnimatePresence>
                     {!loading && assignedPatients.map(pat => (
                       <motion.div 
                         key={pat.id} 
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="w-full bg-white border border-border p-4 rounded-xl flex items-center justify-between"
                       >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background border border-border text-text-black flex items-center justify-center font-semibold text-[12px] uppercase">{pat.name.charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-text-black text-[14px] leading-tight">{pat.name}</p>
                              <p className="text-[12px] text-text-muted font-mono mt-0.5">Assigned</p>
                            </div>
                          </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                   
                   {!loading && assignedPatients.length === 0 && (
                     <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[13px]">
                        <ArrowRightLeft className="w-6 h-6 mb-3 opacity-30"/>
                        No patients selected.
                     </div>
                   )}
                </div>
             </div>

          </div>
       </div>

       <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
       `}</style>
    </div>
  );
}
