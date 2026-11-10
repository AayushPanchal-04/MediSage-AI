import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PageHero } from '../../components/ui/PageHero';
import api from '../../lib/api';

export default function AdminUsers() {
  const [tab, setTab] = useState<'PATIENTS' | 'DOCTORS' | 'ALL'>('PATIENTS');
  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/doctors'),
      api.get('/admin/patients')
    ]).then(([uRes, dRes, pRes]) => {
      setUsers(uRes.data.data || []);
      setDoctors(dRes.data.data || []);
      setPatients(pRes.data.data || []);
    }).catch(console.error);
  }, []);

  const displayData = useMemo(() => {
    let base = tab === 'PATIENTS' ? patients : tab === 'DOCTORS' ? doctors : users;
    if (search) {
      base = base.filter((x: any) => 
        (x.name && x.name.toLowerCase().includes(search.toLowerCase())) || 
        (x.email && x.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return base;
  }, [tab, patients, doctors, users, search]);

  return (
    <div className="w-full min-h-screen bg-background pb-20 font-body">
       
       <PageHero 
         title="User Directory" 
         subtitle="Manage system access, institutional roles, and profiles."
       />

       <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8">
          
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6 pt-4">
             <div className="flex p-1 bg-white border border-border rounded-lg w-full lg:w-fit shadow-sm">
                <button onClick={() => setTab('PATIENTS')} className={`px-6 py-2 text-[13px] font-medium rounded-md transition-colors ${tab === 'PATIENTS' ? 'bg-background shadow-sm text-text-black border border-border/50' : 'text-text-mid hover:text-text-black'}`}>Patients ({patients.length})</button>
                <button onClick={() => setTab('DOCTORS')} className={`px-6 py-2 text-[13px] font-medium rounded-md transition-colors ${tab === 'DOCTORS' ? 'bg-background shadow-sm text-text-black border border-border/50' : 'text-text-mid hover:text-text-black'}`}>Doctors ({doctors.length})</button>
                <button onClick={() => setTab('ALL')} className={`px-6 py-2 text-[13px] font-medium rounded-md transition-colors ${tab === 'ALL' ? 'bg-background shadow-sm text-text-black border border-border/50' : 'text-text-mid hover:text-text-black'}`}>All Accounts ({users.length})</button>
             </div>
             
             <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab.toLowerCase()}...`} className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-[14px]" />
                </div>
                <Button className="h-10 px-4 gap-2 bg-primary text-white"><UserPlus className="w-4 h-4"/> New User</Button>
             </div>
          </div>

          {/* TABLE */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white border border-border rounded-card overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                   <thead>
                     <tr className="bg-background border-b border-border text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                       <th className="px-6 py-4">Name & Contact</th>
                       <th className="px-6 py-4">{tab === 'PATIENTS' ? 'Demographics' : tab === 'DOCTORS' ? 'Specialty' : 'Role'}</th>
                       <th className="px-6 py-4">{tab === 'PATIENTS' ? 'Assigned Doctor' : tab === 'DOCTORS' ? 'License No' : 'Created At'}</th>
                       <th className="px-6 py-4">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      {displayData.map((record) => (
                        <tr key={record.id} className="hover:bg-black/[0.02] transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-[13px] font-semibold text-text-black border border-border uppercase">
                                   {record.name ? record.name.substring(0,2) : 'U'}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-semibold text-[14px] text-text-black">{record.name}</span>
                                   <span className="text-[12px] font-mono text-text-muted mt-0.5">{record.email || record.user?.email || 'No email provided'}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-[13px] text-text-mid">
                              {tab === 'PATIENTS' ? (
                                `${record.dob ? record.dob : 'Unknown'} • ${record.gender || 'Unknown'}`
                              ) : tab === 'DOCTORS' ? (
                                record.specialization || 'General Practice'
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${record.role === 'ADMIN' ? 'bg-primary/10 text-primary' : record.role === 'DOCTOR' ? 'bg-accent/10 text-accent' : 'bg-background border border-border text-text-mid'}`}>{record.role}</span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-[13px] text-text-mid font-mono">
                              {tab === 'PATIENTS' ? 
                                (record.assignedDoctor?.name || 'Unassigned') : 
                               tab === 'DOCTORS' ? 
                                `MED-${record.id.toString().padStart(4, '0')}` :
                                new Date().toISOString().split('T')[0]}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[12px] text-text-black font-medium">Active</span>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             {displayData.length === 0 && (
               <div className="w-full p-12 flex flex-col items-center justify-center text-text-muted">
                  <AlertCircle className="w-6 h-6 mb-3 opacity-50"/>
                  <span className="text-[14px]">No records found matching criteria.</span>
               </div>
             )}
          </motion.div>
          
          <div className="mt-6 flex justify-between items-center text-[13px] text-text-muted font-mono mb-10">
             <span>Showing {displayData.length} records</span>
          </div>

       </div>
    </div>
  );
}
