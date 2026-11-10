import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Terminal, Eye, FileText, Download, Activity, Shield, X, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function AdminAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('VIEW')) return <Eye className="w-4 h-4" />;
    if (act.includes('UPLOAD') || act.includes('EXTRACT')) return <FileText className="w-4 h-4" />;
    if (act.includes('EXPORT') || act.includes('BACKUP')) return <Download className="w-4 h-4" />;
    if (act.includes('AUTH') || act.includes('LOGIN')) return <Shield className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'text-primary bg-primary/10 border-primary/20';
      case 'DOCTOR': return 'text-accent bg-accent/10 border-accent/20';
      case 'PATIENT': return 'text-text-black bg-background border-border';
      case 'SYSTEM': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-text-mid bg-background border-border';
    }
  };

  const filteredLogs = logs.filter(l => 
    (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
    (l.user?.name && l.user.name.toLowerCase().includes(search.toLowerCase())) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-[calc(100vh-68px)] bg-background pb-20 font-body">
       
       <div className="w-full bg-white border-b border-border pt-12 pb-10 px-6 md:px-12">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-2 text-text-black font-semibold mb-3">
                 <Terminal className="w-5 h-5"/>
                 <span className="uppercase tracking-widest text-[12px]">Compliance Audit</span>
               </div>
               <h1 className="text-[32px] md:text-[36px] font-semibold text-text-black leading-none tracking-tight">System Audit Trail</h1>
               <p className="text-[15px] text-text-mid mt-3">Immutable log of all application activities</p>
            </div>
            <div className="flex gap-3">
               <button className="h-10 px-4 bg-white border border-border hover:bg-background rounded-md text-[13px] font-medium text-text-black transition-colors">Export CSV</button>
               <button onClick={fetchLogs} className="h-10 px-4 bg-background border border-border text-text-black hover:bg-black/5 rounded-md text-[13px] font-medium transition-colors shadow-sm flex items-center gap-2">
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/> Refresh
               </button>
            </div>
         </div>
       </div>

       <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 mt-8 flex flex-col md:flex-row gap-6 relative">
          
          {/* LOGS TABLE (Main Area) */}
          <div className="flex-1 bg-white border border-border rounded-card overflow-hidden flex flex-col h-[750px] shadow-sm">
             
             {/* Toolbar */}
             <div className="p-4 border-b border-border flex items-center gap-4 bg-background/50">
                <div className="relative w-full md:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event, user, or details..." className="w-full h-9 pl-9 pr-4 rounded-md border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-[13px]" />
                </div>
                <div className="hidden md:block w-px h-6 bg-border" />
                <button className="hidden md:flex items-center gap-2 text-[13px] text-text-mid hover:text-text-black font-medium"><Filter className="w-3.5 h-3.5"/> Filter Role</button>
             </div>

             {/* Table */}
             <div className="flex-1 overflow-auto custom-scrollbar">
                {loading ? (
                  <div className="p-10 text-center text-[14px] text-text-mid">Syncing audit logs...</div>
                ) : (
                  <table className="w-full text-left whitespace-nowrap">
                     <thead className="sticky top-0 bg-background border-b border-border z-10 shadow-sm">
                       <tr className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-mono">
                         <th className="px-6 py-4">Timestamp</th>
                         <th className="px-6 py-4">User</th>
                         <th className="px-6 py-4">Action</th>
                         <th className="px-6 py-4">Target Resource</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                        {filteredLogs.map((log) => (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className={`cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-primary/5' : 'hover:bg-black/[0.02]'}`}
                          >
                             <td className="px-6 py-4 text-text-mid text-[13px] font-mono">
                               {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                             </td>
                             <td className="px-6 py-4 flex items-center gap-3">
                                <span className="font-semibold text-text-black text-[13px]">{log.user?.name || 'Unknown'}</span>
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${getRoleColor(log.user?.role)}`}>{log.user?.role}</span>
                             </td>
                             <td className="px-6 py-4 text-[13px] font-semibold text-text-black">
                                <div className="flex items-center gap-2">
                                  {getActionIcon(log.action)} {log.action}
                                </div>
                             </td>
                             <td className="px-6 py-4 text-text-mid text-[13px] font-mono">{log.targetId ? `ID:${log.targetId}` : 'ALL'}</td>
                          </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-10 text-center text-text-mid text-[13px]">No audit logs found.</td></tr>
                        )}
                     </tbody>
                  </table>
                )}
             </div>
          </div>

          {/* INSPECTOR PANEL */}
          <AnimatePresence>
             {selectedLog && (
                <motion.div 
                  initial={{ opacity: 0, x: 20, width: 0 }} 
                  animate={{ opacity: 1, x: 0, width: 440 }} 
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  className="bg-white border border-border rounded-card overflow-hidden shrink-0 flex flex-col shadow-sm"
                >
                   <div className="p-5 border-b border-border flex items-center justify-between bg-background">
                      <h3 className="text-[14px] font-semibold text-text-black tracking-tight flex items-center gap-2">
                        Event Inspector
                      </h3>
                      <button onClick={() => setSelectedLog(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-text-muted hover:text-text-black transition-colors">
                        <X className="w-4 h-4"/>
                      </button>
                   </div>
                   
                   <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                      
                      {/* Formatted Attributes */}
                      <div className="bg-background border border-border rounded-xl p-5 overflow-x-auto shadow-sm">
                        
                        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-[13px]">
                           <div className="text-text-muted font-mono">Event ID</div>
                           <div className="font-mono font-medium text-text-black break-all">{selectedLog.id}</div>

                           <div className="text-text-muted font-mono">Date</div>
                           <div className="font-mono text-text-black">{format(new Date(selectedLog.createdAt), 'PPpp')}</div>
                           
                           <div className="text-text-muted font-mono">Identity</div>
                           <div className="text-text-black font-semibold">{selectedLog.user?.email || 'N/A'} <span className="font-normal text-text-mid">({selectedLog.user?.role})</span></div>
                           
                           <div className="text-text-muted font-mono">Action</div>
                           <div className="text-text-black font-semibold">{selectedLog.action}</div>
                           
                           <div className="text-text-muted font-mono">Target ID</div>
                           <div className="font-mono text-text-black">{selectedLog.targetId || 'N/A'}</div>
                           
                           <div className="col-span-2 border-t border-border my-2 pt-4">
                             <div className="text-text-muted font-mono mb-2">Details Payload</div>
                             <div className="bg-white border border-border p-3 rounded-md text-[13px] text-text-black leading-relaxed">
                               {selectedLog.details || 'No additional metadata attached to this event.'}
                             </div>
                           </div>
                        </div>

                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
       `}</style>
    </div>
  );
}
