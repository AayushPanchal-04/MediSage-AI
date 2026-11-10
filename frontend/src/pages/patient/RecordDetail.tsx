import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Sparkles, AlertTriangle, Pill, ChevronDown, Activity, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { cn } from '../../components/ui/Button';
import { TypingEffect } from '../../components/ui/TypingEffect';
import ReportComparison from '../../components/ai/ReportComparison';
import api from '../../lib/api';

const Accordion = ({ title, icon, defaultOpen = false, children, badge }: any) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-white rounded-card overflow-hidden border border-border shadow-sm mb-4">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-black/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-[16px] text-text-black">{title}</span>
          {badge}
        </div>
        <ChevronDown className={cn("w-5 h-5 text-text-mid transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }} 
             animate={{ height: 'auto', opacity: 1 }} 
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.3 }}
           >
             <div className="p-5 pt-0 border-t border-border">
               {children}
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function RecordDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    // We fetch all records and filter by id since there's no single record endpoint in our current backend setup
    api.get('/patient/records').then(res => {
      const records = res.data.data || [];
      const found = records.find((r: any) => r.id.toString() === id);
      setRecord(found);
      
      // Fetch PDF explicitly to include auth headers
      if (found && found.fileUrl) {
         setPdfLoading(true);
         api.get(`/files/${found.fileUrl}`, { responseType: 'blob' })
           .then(fileRes => {
              const fileBlobUrl = URL.createObjectURL(fileRes.data);
              setPdfUrl(fileBlobUrl);
           })
           .catch(err => console.error("Could not fetch PDF:", err))
           .finally(() => setPdfLoading(false));
      } else {
         setPdfLoading(false);
      }
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
      setPdfLoading(false);
    });
    
    return () => {
       if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

  if (loading) return <div className="p-10 font-body text-text-mid text-center">Loading record...</div>;
  if (!record) return <div className="p-10 text-center font-body text-danger">Record not found.</div>;

  let extracted: any = { vitals: [], anomalies: [], medications: [], aiSummary: '' };
  try { if (record.extractedData) extracted = JSON.parse(record.extractedData); } catch(e) {}

  const vitals = extracted.vitals || [];
  const anomalies = extracted.anomalies || [];
  const medications = extracted.medications || [];

  const getValuePosition = (valStr: string, rangeStr: string) => {
    try {
      const val = parseFloat(valStr);
      if (isNaN(val)) return { width: '100%', color: 'bg-primary' };
      
      if (!rangeStr || rangeStr === 'N/A') return { width: '100%', color: 'bg-primary' };
      
      if (rangeStr.includes('-')) {
        const [minStr, maxStr] = rangeStr.split('-');
        const min = parseFloat(minStr.replace(/[^0-9.]/g, ''));
        const max = parseFloat(maxStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(min) && !isNaN(max) && max > min) {
          const scaleMax = max * 1.25; 
          const pct = (val / scaleMax) * 100;
          return {
             width: `${Math.max(2, Math.min(100, pct))}%`,
             color: (val < min || val > max) ? 'bg-danger' : 'bg-primary'
          };
        }
      } else if (rangeStr.startsWith('<')) {
        const max = parseFloat(rangeStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(max) && max > 0) {
           const scaleMax = max * 1.25;
           const pct = (val / scaleMax) * 100;
           return {
             width: `${Math.max(2, Math.min(100, pct))}%`,
             color: (val > max) ? 'bg-danger' : 'bg-primary'
           };
        }
      } else if (rangeStr.startsWith('>')) {
        const min = parseFloat(rangeStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(min) && min > 0) {
           const scaleMax = min * 1.5;
           const pct = (val / scaleMax) * 100;
           return {
             width: `${Math.max(2, Math.min(100, pct))}%`,
             color: (val < min) ? 'bg-danger' : 'bg-primary'
           };
        }
      }
    } catch(e) {}
    return { width: '100%', color: 'bg-primary' };
  };

  return (
    <div className="w-full bg-background min-h-screen pb-20">
      {/* PROFESSIONAL HEADER */}
      <div className="w-full bg-white border-b border-border pt-32 pb-8 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between md:items-end gap-6">
           <div className="flex flex-col">
             <Link to="/patient/records" className="text-text-mid text-[13px] hover:text-text-black transition-colors flex items-center gap-1 mb-4"><ChevronLeft className="w-4 h-4"/> Back to Records</Link>
             <h1 className="text-[32px] font-display text-text-black font-semibold tracking-tight">{record.reportName || record.reportType}</h1>
             <p className="font-mono text-text-mid text-[14px] mt-2">Added on {record.visitDate ? format(new Date(record.visitDate), 'dd MMMM yyyy') : 'Unknown Date'}</p>
             <div className="mt-4"><StatusBadge status={record.status || 'NORMAL'} /></div>
           </div>
           
           <Button variant="secondary" className="border border-border bg-background hover:bg-border/50 shrink-0 self-start md:self-auto"><Download className="w-4 h-4 mr-2"/> Download Original</Button>
        </div>
      </div>

      {/* BODY SPLIT */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-8 flex flex-col lg:flex-row gap-8 items-start">
         
         {/* Left: Document Viewer */}
         <div className="flex-1 w-full bg-white rounded-card shadow-sm border border-border flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
               <span className="font-medium text-[13px] flex items-center gap-2"><FileText className="w-4 h-4 text-primary"/> {record.originalFileName || "document.pdf"}</span>
               <div className="flex items-center gap-2">
                 <button className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-[16px] hover:bg-black/5">-</button>
                 <span className="font-mono text-[13px] text-text-mid">100%</span>
                 <button className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-[16px] hover:bg-black/5">+</button>
               </div>
            </div>
            
            <div className="w-full h-[700px] bg-background flex items-center justify-center relative overflow-hidden">
               {pdfUrl ? (
                  <iframe 
                    src={pdfUrl} 
                    className="w-full h-full border-none"
                    title="Medical Document"
                  />
               ) : (
                  <div className="text-text-muted flex flex-col items-center">
                    <FileText className="w-12 h-12 mb-4 opacity-20"/>
                    <p>{pdfLoading ? "Loading preview..." : "Document preview unavailable"}</p>
                  </div>
               )}
            </div>
         </div>

         {/* Right: AI Intelligence Panel */}
         <div className="w-full lg:w-[45%] lg:sticky lg:top-[100px] flex flex-col gap-2">
            
            <Accordion 
              title="AI Clinical Summary" 
              icon={<Sparkles className="w-5 h-5 text-primary"/>} 
              defaultOpen 
              badge={<span className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2 py-0.5 rounded-full ml-2">Verified AI</span>}
            >
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg">
                 <p className="font-body text-[15px] text-text-black leading-relaxed">
                   <TypingEffect text={extracted.summary || extracted.aiSummary || "The AI is still processing the full clinical summary for this report. Please check back in a few seconds."} speed={10} />
                 </p>
               </div>
            </Accordion>

            <ReportComparison recordId={record.id} />

            {vitals.length > 0 && (
              <Accordion title="Extracted Vitals" icon={<Activity className="w-5 h-5 text-text-mid"/>} defaultOpen>
                <div className="flex flex-col gap-4 mt-2">
                  {vitals.map((v: any) => {
                    const pos = getValuePosition(String(v.value), v.normalRange);
                    return (
                    <div key={v.name} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className={cn("font-medium text-[14px]", v.status === 'ANOMALY' || v.status === 'CRITICAL' ? 'text-danger' : 'text-text-black')}>{v.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("font-mono text-[15px] font-bold", v.status === 'ANOMALY' || v.status === 'CRITICAL' ? 'text-danger' : 'text-primary')}>{v.value}</span>
                          <span className="font-mono text-[12px] text-text-muted">{v.unit}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden">
                         <div className={cn("absolute left-0 top-0 bottom-0 rounded-full", pos.color)} style={{ width: pos.width }} />
                      </div>
                      <span className="font-mono text-[11px] text-text-muted text-right">Range: {v.normalRange || 'N/A'}</span>
                    </div>
                  )})}
                </div>
              </Accordion>
            )}

            <Accordion 
              title="Anomalies Detected" 
              icon={<AlertTriangle className={anomalies.length > 0 ? "text-danger w-5 h-5" : "text-text-mid w-5 h-5"} />} 
              badge={anomalies.length > 0 && <span className="bg-danger text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ml-2">{anomalies.length}</span>}
              defaultOpen={anomalies.length > 0}
            >
              {anomalies.length > 0 ? (
                <div className="bg-danger/5 border border-danger/20 p-4 rounded-lg space-y-3 mt-2">
                  {anomalies.map((a: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-2" />
                      <span className="text-[14px] font-medium text-text-black">{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-center gap-3 mt-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-bold shrink-0">✓</div>
                  <span className="text-[14px] font-medium text-text-black">All values within normal range.</span>
                </div>
              )}
            </Accordion>

            {medications.length > 0 && (
              <Accordion title="Medications Prescribed" icon={<Pill className="text-accent w-5 h-5"/>}>
                <div className="flex flex-wrap gap-3 mt-2">
                  {medications.map((m: any) => (
                    <div key={m.name} className="flex flex-col bg-background px-4 py-2 border border-border rounded-card">
                      <span className="font-semibold text-[14px] text-text-black tracking-wide">{m.name}</span>
                      <span className="font-mono text-[12px] text-text-mid">{m.dosage} &middot; {m.frequency}</span>
                    </div>
                  ))}
                </div>
              </Accordion>
            )}

            <Button variant="secondary" className="mt-4 border border-border bg-white" fullWidth>Share with Doctor</Button>
         </div>

      </div>
    </div>
  );
}
