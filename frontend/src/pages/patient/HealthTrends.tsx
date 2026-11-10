import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Sparkles } from 'lucide-react';
import { cn } from '../../components/ui/Button';
import { PageHero } from '../../components/ui/PageHero';
import MonthlyAnalysis from '../../components/ai/MonthlyAnalysis';
import { format } from 'date-fns';
import api from '../../lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border">
        <p className="font-semibold text-[13px] text-text-black mb-1">{label}</p>
        <p className="font-mono text-[16px] font-bold text-text-black flex items-baseline gap-1">
          {data.value} <span className="text-[12px] text-text-muted font-body font-normal">{data.unit}</span>
        </p>
        {data.anomaly && <span className="inline-block mt-2 px-2 py-0.5 bg-danger/10 text-danger text-[11px] font-bold rounded-sm uppercase tracking-wide">Anomaly</span>}
      </div>
    );
  }
  return null;
};

export default function HealthTrends() {
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

  // Process data from records
  const processedData = useMemo(() => {
    const rawSeries: Record<string, any[]> = {};
    
    // Sort records oldest first for time-series
    const sortedRecords = [...records].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

    sortedRecords.forEach(r => {
      let extracted: any = {};
      try { if (r.extractedData) extracted = JSON.parse(r.extractedData); } catch(e) {}
      if (!extracted.vitals) return;

      const dateStr = r.visitDate ? format(new Date(r.visitDate), 'MMM dd') : 'Unknown';

      extracted.vitals.forEach((v: any) => {
        const name = v.name;
        // extract numerical value if possible
        const numVal = parseFloat(String(v.value).replace(/[^0-9.]/g, ''));
        if (isNaN(numVal)) return;

        if (!rawSeries[name]) rawSeries[name] = [];
        rawSeries[name].push({
          date: dateStr,
          rawDate: new Date(r.visitDate),
          value: numVal,
          unit: v.unit || '',
          anomaly: v.status === 'WARNING' || v.status === 'CRITICAL',
          rangeStr: v.normalRange || ''
        });
      });
    });

    // Build specs and filtered series
    const metricsSpec: Record<string, any> = {};
    const seriesData: Record<string, any[]> = {};

    Object.keys(rawSeries).forEach(key => {
      const data = rawSeries[key];
      if (data.length === 0) return;

      const limits = data[0].rangeStr.split('-').map((s: string) => parseFloat(s.replace(/[^0-9.]/g, '')));
      const range = (limits.length === 2 && !isNaN(limits[0]) && !isNaN(limits[1])) ? limits : [Math.min(...data.map(d => d.value)) * 0.8, Math.max(...data.map(d => d.value)) * 1.2];

      const vals = data.map(d => d.value);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
      const latest = vals[vals.length - 1];
      const change = vals.length > 1 ? Math.round(((latest - vals[0]) / vals[0]) * 100) : 0;
      const changeStr = change > 0 ? `+${change}%` : change < 0 ? `${change}%` : `0%`;

      metricsSpec[key] = {
        name: key,
        unit: data[0].unit,
        range: range,
        latest,
        min,
        max,
        avg,
        change: changeStr
      };
      seriesData[key] = data;
    });

    return { metricsSpec, seriesData };
  }, [records]);

  const availableMetrics = Object.keys(processedData.metricsSpec);
  const [activeMetric, setActiveMetric] = useState<string>('');

  useEffect(() => {
    if (availableMetrics.length > 0 && !activeMetric) {
      setActiveMetric(availableMetrics[0]);
    }
  }, [availableMetrics, activeMetric]);

  const [key, setKey] = useState(0);

  if (loading) {
    return <div className="min-h-screen bg-background p-10 font-body text-text-mid">Loading health trends...</div>;
  }

  if (availableMetrics.length === 0) {
    return (
      <div className="w-full bg-background min-h-screen pb-20">
        <PageHero title="Health Trends" subtitle="Track your medical history over time." />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-10">
          <div className="bg-white p-12 rounded-card border border-border text-center text-text-mid font-body">
            Not enough data extracted yet to generate health trends. Please upload more clinical reports.
          </div>
        </div>
      </div>
    );
  }

  const spec = processedData.metricsSpec[activeMetric];
  const data = processedData.seriesData[activeMetric];

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      
      <PageHero 
        title="Health Trends" 
        subtitle="Track every vital across every report to spot patterns before they become problems." 
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-10">
         
         {/* TABS */}
         <div className="flex border-b border-border w-full overflow-x-auto hide-scrollbar sticky top-[68px] z-20 bg-background/90 backdrop-blur-md pt-4 pb-0">
           {availableMetrics.map((mKey) => (
             <button 
               key={mKey}
               onClick={() => { setActiveMetric(mKey); setKey(k => k+1); }}
               className={cn(
                 "px-6 py-4 font-semibold text-[15px] transition-colors relative whitespace-nowrap",
                 activeMetric === mKey ? "text-primary" : "text-text-mid hover:text-text-black"
               )}
             >
               {processedData.metricsSpec[mKey].name}
               {activeMetric === mKey && (
                 <motion.div layoutId="trend-tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
               )}
             </button>
           ))}
         </div>

         {/* MAIN CHART CARD */}
         <motion.div 
           key={`chart-${key}`}
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
           className="w-full bg-white rounded-card shadow-sm border border-border p-6 md:p-10 mt-8 mb-8"
         >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-[28px] font-semibold text-text-black tracking-tight">{spec?.name}</h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-mono text-[40px] font-bold text-text-black leading-none">{spec?.latest}</span>
                  <span className="font-mono text-[16px] text-text-mid">{spec?.unit}</span>
                  <span className={cn("text-[14px] font-bold ml-4", spec?.change.startsWith('+') && activeMetric.toLowerCase().includes('hemoglobin') ? 'text-primary' : spec?.change.startsWith('-') && activeMetric.toLowerCase().includes('glucose') ? 'text-primary' : 'text-danger')}>
                    {spec?.change.startsWith('-') ? '↓' : '↑'} {spec?.change.slice(1)} vs first record
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary/20 rounded-sm" /><span className="text-[12px] text-text-muted font-mono">Normal Range</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-danger" /><span className="text-[12px] text-text-muted font-mono">Anomaly</span></div>
              </div>
            </div>

            <div className="w-full h-[320px] md:h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748B', fontFamily: '"JetBrains Mono"' }} />
                    <Tooltip cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
                    
                    {spec?.range && spec.range.length === 2 && (
                      <ReferenceArea y1={spec.range[0]} y2={spec.range[1]} fill="#10B981" fillOpacity={0.05} />
                    )}
                    
                    <Area type="monotone" dataKey="value" stroke="none" fill="url(#chartGradient)" isAnimationActive={true} animationDuration={1000} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={(props: any) => {
                       const { cx, cy, payload } = props;
                       if (payload.anomaly) return <circle cx={cx} cy={cy} r={6} fill="#DC2626" stroke="#FEE2E2" strokeWidth={2} />;
                       return <circle cx={cx} cy={cy} r={4} fill="#10B981" stroke="#ffffff" strokeWidth={2} />;
                    }} activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }} isAnimationActive={true} animationDuration={1000} />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* STATS ROW */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Minimum', val: spec?.min },
              { label: 'Maximum', val: spec?.max },
              { label: 'Average', val: spec?.avg },
              { label: 'Latest', val: spec?.latest },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} className="bg-white p-6 rounded-card shadow-sm border border-border">
                <span className="text-[13px] font-medium text-text-muted mb-2 block">{stat.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[28px] font-bold text-text-black">{stat.val}</span>
                  <span className="font-mono text-[14px] text-text-mid">{spec?.unit}</span>
                </div>
              </motion.div>
            ))}
         </div>

         {/* AI INSIGHT */}
         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="w-full bg-primary/5 border border-primary/20 rounded-xl p-8 flex flex-col md:flex-row md:items-center gap-6 shadow-sm mb-8">
           <div className="flex items-center gap-3 text-primary font-bold w-48 shrink-0">
             <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20"><Sparkles className="w-5 h-5"/></div>
             <span className="uppercase tracking-wide text-[13px]">AI Insight</span>
           </div>
           <p className="font-body text-[16px] text-text-black leading-relaxed">
             Analysis of your {spec?.name?.toLowerCase()} measurements indicates {spec?.change.startsWith('-') ? 'a decrease' : 'an increase'} of {spec?.change} across the recorded timeline. Focus on maintaining values within the target {spec?.range?.join(' - ')} range.
           </p>
         </motion.div>

         {/* MONTH-BY-MONTH AI ANALYSIS */}
         <div className="mb-20">
           <MonthlyAnalysis />
         </div>

      </div>
    </div>
  );
}
