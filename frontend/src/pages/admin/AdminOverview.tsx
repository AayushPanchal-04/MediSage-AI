import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, Database, Activity, Server, AlertTriangle, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import api from '../../lib/api';
import PopulationInsights from '../../components/ai/PopulationInsights';
import { formatDistanceToNow } from 'date-fns';

const uptimeData = [
  { time: '00:00', load: 30 }, { time: '04:00', load: 20 }, { time: '08:00', load: 85 },
  { time: '12:00', load: 92 }, { time: '16:00', load: 60 }, { time: '20:00', load: 45 },
];

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, patients: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/doctors'),
      api.get('/admin/patients'),
      api.get('/admin/audit')
    ]).then(([uRes, dRes, pRes, aRes]) => {
      setStats({
        users: uRes.data.data?.length || 0,
        doctors: dRes.data.data?.length || 0,
        patients: pRes.data.data?.length || 0
      });
      setLogs((aRes.data.data || []).slice(0, 5)); // recent 5 logs
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-68px)] bg-background pb-20 font-body">
       
       <div className="w-full bg-white border-b border-border pt-12 pb-10 px-6 md:px-12">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-2 text-primary mb-3">
                 <Shield className="w-4 h-4"/>
                 <span className="uppercase tracking-widest text-[12px] font-bold">Administration Overview</span>
               </div>
               <h1 className="text-[32px] md:text-[36px] font-semibold text-text-black leading-none tracking-tight">Platform Dashboard</h1>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[13px] font-mono text-text-black font-medium">System Nominal (99.9%)</span>
               </div>
               <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-md">
                 <Server className="w-3.5 h-3.5 text-text-muted"/>
                 <span className="text-[13px] font-mono text-text-black font-medium">1.2ms latency</span>
               </div>
            </div>
         </div>
       </div>

       <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             {[
               { icon: <Users className="w-5 h-5 text-primary"/>, l: "Total Accounts", v: stats.users },
               { icon: <Activity className="w-5 h-5 text-accent"/>, l: "Active Patients", v: stats.patients },
               { icon: <Database className="w-5 h-5 text-text-black"/>, l: "Enrolled Doctors", v: stats.doctors },
               { icon: <AlertTriangle className="w-5 h-5 text-warning"/>, l: "System Anomalies", v: "0" }
             ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="bg-white border border-border rounded-card p-6 shadow-sm hover:border-border/80 transition-colors">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">{stat.icon}</div>
                     <p className="text-[12px] text-text-muted uppercase tracking-wide font-semibold">{stat.l}</p>
                   </div>
                   <p className="font-mono text-[36px] font-bold text-text-black leading-none">{stat.v}</p>
                </motion.div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white border border-border rounded-card p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-[18px] font-semibold text-text-black tracking-tight">System Load (24h)</h2>
                 <Link to="/admin/audit" className="text-[13px] text-primary hover:underline font-medium">View detailed metrics →</Link>
               </div>
               <div className="w-full h-[280px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={uptimeData}>
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontFamily: '"JetBrains Mono"' }} dy={10} />
                       <RechartsTooltip cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                       <Line type="monotone" dataKey="load" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', stroke: '#10B981', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={true} />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
             </motion.div>

             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white border border-border rounded-card p-8 shadow-sm flex flex-col">
               <h2 className="text-[18px] font-semibold text-text-black tracking-tight mb-6">Recent Audit Activity</h2>
               <div className="flex-1 space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start pb-4 border-b border-border last:border-0">
                       <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-primary/40" />
                       <div>
                         <p className="text-[14px] text-text-black font-medium">{log.action}: {log.details || log.action}</p>
                         <p className="font-mono text-[12px] text-text-muted mt-1">{formatDistanceToNow(new Date(log.createdAt))} ago</p>
                       </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-[13px] text-text-mid">No recent logs.</p>}
               </div>
               <Link to="/admin/audit" className="mt-8 flex items-center justify-center gap-2 w-full py-2.5 bg-background hover:bg-black/5 border border-border rounded-md text-[13px] font-medium text-text-black transition-colors">See complete trail <ArrowRight className="w-4 h-4"/></Link>
             </motion.div>

          </div>

          <div className="mt-8">
            <PopulationInsights />
          </div>

       </div>
    </div>
  );
}
