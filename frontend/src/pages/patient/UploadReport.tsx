import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, Lock, Sparkles, FileText, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { cn } from '../../components/ui/Button';
import api from '../../lib/api';

export default function UploadReport() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ reportType: 'BLOOD_TEST', visitDate: '', reportName: '' });
  const [progress, setProgress] = useState<'idle'|'uploading'|'extracting'|'analysing'|'complete'>('idle');
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setProgress('uploading');
    
    // Create FormData
    const data = new FormData();
    data.append('file', file);
    data.append('reportType', formData.reportType);
    if (formData.reportName) data.append('reportName', formData.reportName);
    if (formData.visitDate) data.append('visitDate', formData.visitDate);

    // Helper for minimum wait
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // 1. Minimum 2s for 'uploading' -> 'extracting'
      const uploadPromise = api.post('/patient/upload-record', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await wait(1800);
      setProgress('extracting');

      // 2. Minimum 2s for 'extracting' -> 'analysing'
      await wait(2200);
      setProgress('analysing');

      // 3. Wait for API to finish if it hasn't already, then minimum 1.5s for 'analysing' -> 'complete'
      const response = await uploadPromise;
      await wait(1500);
      
      setProgress('complete');
      
      const newRecordId = response.data.data?.id;
      if (newRecordId) {
        setTimeout(() => {
          navigate(`/patient/records/${newRecordId}`);
        }, 3000);
      }
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
      setProgress('idle');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-68px)] flex bg-white flex-col lg:flex-row">
      
      {/* LEFT: INFO */}
      <div className="hidden lg:flex w-[35%] relative bg-text-black flex-col p-12 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Clinical Laboratory" />
             <div className="absolute inset-0 bg-gradient-to-t from-text-black via-text-black/80 to-[#024D30]/60 mix-blend-multiply"></div>
         </div>
         
         <div className="relative z-10 w-full mt-auto mb-8">
            <h2 className="text-[36px] font-display font-semibold text-white leading-[1.15] mb-6 tracking-tight">
              Upload carefully and let the AI extract your medical data.
            </h2>
            <p className="text-white/80 font-light text-[17px] leading-relaxed">
              Our clinical AI securely reads PDF, JPG, and PNG formats. Data is stored safely and meticulously analyzed to provide a comprehensive picture of your health trajectory in cinematic detail.
            </p>
         </div>
      </div>

      {/* RIGHT: CONTENT */}
      <div className="w-full lg:w-[65%] bg-white min-h-screen px-6 py-12 md:p-16">
        <div className="max-w-[560px] mx-auto">
          
          <Link to="/patient/home" className="text-text-mid text-[13px] font-medium hover:text-primary transition-colors flex items-center gap-2 mb-8"><ChevronLeft className="w-4 h-4"/> Back to Dashboard</Link>
          
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-2 text-text-black">Upload New Report</h1>
          <p className="text-[15px] text-text-mid mb-10">Drop your file below. MediSage AI will extract the vital metrics automatically.</p>

          <AnimatePresence mode="wait">
             {progress === 'idle' ? (
               <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                 
                 {/* DROP ZONE */}
                 <div 
                   onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                   onDragLeave={() => setDrag(false)}
                   onDrop={(e) => { e.preventDefault(); setDrag(false); if(e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
                   className={cn(
                     "w-full h-[220px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 relative cursor-pointer",
                     drag ? "border-primary bg-primary/5" : 
                     file ? "border-primary/50 bg-background" : "border-border bg-background hover:border-primary/50"
                   )}
                 >
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                   
                   {!file ? (
                     <>
                       <div className="w-14 h-14 bg-white border border-border text-text-mid rounded-full flex items-center justify-center mb-4"><UploadCloud className="w-6 h-6"/></div>
                       <h3 className="text-[16px] font-semibold text-text-black mb-1">{drag ? 'Release to upload' : 'Drag and drop your file here'}</h3>
                       <p className="text-[13px] text-text-muted">or click to browse from device</p>
                     </>
                   ) : (
                     <>
                       <div className="w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center mb-4"><File className="w-6 h-6"/></div>
                       <h3 className="text-[16px] font-semibold text-text-black mb-1 truncate max-w-[80%]">{file.name}</h3>
                       <p className="text-[13px] font-mono text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                       <button className="text-primary text-[13px] font-medium hover:underline mt-4 relative z-10 pointer-events-auto" onClick={(e) => { e.preventDefault(); setFile(null); }}>Change file</button>
                     </>
                   )}
                 </div>

                 {/* FORM DETAILS */}
                 <div className="mt-8 space-y-4">
                   <div className="relative">
                     <select value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})} className="w-full h-12 px-4 rounded-input border border-border bg-white text-[14px] outline-none focus:border-primary appearance-none cursor-pointer">
                       <option value="BLOOD_TEST">Blood Test</option>
                       <option value="SCAN">MRI/Scan</option>
                       <option value="X_RAY">X-Ray</option>
                       <option value="PRESCRIPTION">Prescription</option>
                       <option value="OTHER">Discharge Summary / Other</option>
                     </select>
                   </div>
                   <input type="text" placeholder="Report Name (Optional)" value={formData.reportName} onChange={e => setFormData({...formData, reportName: e.target.value})} className="w-full h-12 px-4 rounded-input border border-border bg-white text-[14px] outline-none focus:border-primary" />
                   <input type="date" placeholder="Visit Date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className="w-full h-12 px-4 rounded-input border border-border bg-white text-[14px] outline-none focus:border-primary" />
                 </div>

                 <Button onClick={handleUpload} disabled={!file} size="lg" fullWidth className="mt-8 h-12 text-[15px]"><Sparkles className="w-4 h-4 mr-2"/> Run Extraction Analysis</Button>
                 
                 <div className="mt-6 flex justify-center items-center gap-2 text-text-muted text-[13px]">
                   <Lock className="w-3.5 h-3.5"/> End-to-end encrypted storage
                 </div>
               </motion.div>
             ) : (
               <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-card shadow-sm border border-border p-8 py-12">
                  <div className="flex flex-col relative">
                     <div className="absolute left-[15px] top-[24px] bottom-[24px] w-px bg-border z-0" />

                     {/* Step 1 */}
                     <div className="flex items-center gap-6 relative z-10 mb-8">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 border border-transparent", progress === 'uploading' ? 'bg-background border-primary text-primary' : 'bg-primary text-white')}>✓</div>
                        <div className="flex-1">
                          <p className={cn("font-medium text-[15px]", progress === 'uploading' ? 'text-text-black' : 'text-text-mid')}>Uploading file...</p>
                        </div>
                     </div>

                     {/* Step 2 */}
                     <div className="flex items-center gap-6 relative z-10 mb-8">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 transition-colors duration-500 border", progress === 'extracting' ? 'bg-background border-primary text-primary shadow-sm scale-110' : progress === 'uploading' ? 'bg-white border-border text-text-muted' : 'bg-primary border-primary text-white')}>
                          {progress === 'uploading' || progress === 'extracting' ? '2' : '✓'}
                        </div>
                        <div className="flex-1">
                          <p className={cn("font-medium text-[15px] transition-colors", progress === 'extracting' ? 'text-black' : progress === 'uploading' ? 'text-text-muted' : 'text-text-muted')}>Extracting OCR text...</p>
                        </div>
                     </div>

                     {/* Step 3 */}
                     <div className="flex items-center gap-6 relative z-10 mb-8">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 transition-colors duration-500 border", progress === 'analysing' ? 'bg-background border-primary text-primary shadow-sm scale-110' : progress === 'complete' ? 'bg-primary border-primary text-white' : 'bg-white border-border text-text-muted')}>
                          {progress === 'complete' ? '✓' : '3'}
                        </div>
                        <div className="flex-1">
                          <p className={cn("font-medium text-[15px] transition-colors", progress === 'analysing' ? 'text-primary' : 'text-text-muted')}>Validating Medical Data...</p>
                        </div>
                     </div>

                      {/* Step 4 */}
                      <div className="flex items-center gap-6 relative z-10">
                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 transition-colors border", progress === 'complete' ? 'bg-primary border-primary text-white shadow-sm scale-110' : 'bg-white border-border text-text-muted')}>
                           ✓
                         </div>
                         <div className="flex-1">
                           <p className={cn("text-[18px] font-semibold transition-colors tracking-tight", progress === 'complete' ? 'text-text-black' : 'text-text-muted')}>
                             {progress === 'complete' ? 'Analysis Complete' : 'System Ready'}
                           </p>
                           {progress === 'complete' && <p className="text-[13px] text-text-mid mt-1">Taking you to your clinical report...</p>}
                         </div>
                      </div>
                  </div>

                  <AnimatePresence>
                     {progress === 'complete' && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex justify-end">
                          <Button onClick={() => navigate('/patient/records')} size="lg" className="px-8"><FileText className="w-5 h-5 mr-2" /> View Clinical Report</Button>
                       </motion.div>
                     )}
                  </AnimatePresence>

               </motion.div>
             )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
