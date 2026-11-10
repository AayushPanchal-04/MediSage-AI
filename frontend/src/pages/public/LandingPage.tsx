import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle, Shield, Lock, Eye, ArrowRight, Activity, FileText, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import VideoModal from '../../components/ui/VideoModal';

const FadeInContent = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = "/videos/tour.mp4";

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      } else {
        setIsMuted(true);
        videoRef.current.muted = true;
      }
    }
  };

  return (
    <div className="w-full bg-background overflow-hidden font-body text-text-black">
      
      <VideoModal 
        isOpen={showVideo} 
        onClose={() => setShowVideo(false)} 
        videoUrl={videoUrl} 
      />
      
      {/* SECTION 1: HERO */}
      <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-between pt-32 pb-20 px-6 md:px-12 lg:px-24 bg-surface overflow-hidden">
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-[0.02]" />
        
        <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start text-left pr-0 md:pr-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#CDE5DA] text-text-mid text-[13px] font-semibold mb-8 uppercase tracking-wider">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             The New Standard in Clinical Flowsheets
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="font-display text-[56px] md:text-[72px] font-semibold leading-[1.05] text-text-black tracking-tight mb-6">
            Intelligent Medical Records <br className="hidden md:block"/> for Modern Healthcare.
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-[18px] md:text-[20px] text-text-muted max-w-[540px] mb-12 leading-relaxed font-light">
            Upload unstructured reports. MediSage AI extracts vitals, charts chronological trends, and synthesizes clear clinical briefs instantly with cinematic precision.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto"><Button size="lg" className="w-full sm:w-auto gap-2 px-8 h-14 bg-text-black text-white text-[15px] font-medium shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">Get Started Free <ArrowRight className="w-4 h-4"/></Button></Link>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto gap-2 px-8 h-14 bg-transparent border border-[#CDE5DA] text-text-black hover:bg-[#F0F7F4] text-[15px] font-medium transition-all duration-300"
            >
              <PlayCircle className="w-5 h-5"/> Cinematic Tour
            </Button>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-16 pt-8 border-t border-[#E8F3EE] flex flex-wrap justify-start gap-6 md:gap-12 text-[13px] text-text-muted font-medium w-full">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/> AES-256 Encryption</span>
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary"/> HIPAA Compliant Architecture</span>
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary"/> Real-time Analysis</span>
          </motion.div>
        </div>

        <div className="relative z-10 w-full md:w-1/2 mt-16 md:mt-0 flex justify-center md:justify-end perspective-1000">
           <motion.div 
             initial={{ opacity: 0, x: 50, rotateY: 10, scale: 0.95 }} 
             animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }} 
             transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} 
             className="relative w-full max-w-lg aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 group"
           >
              <div className="absolute inset-0 bg-text-black/10 mix-blend-overlay z-10 transition-opacity duration-700 group-hover:opacity-0"></div>
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" alt="Cinematic Medical Record Environment" className="object-cover w-full h-full scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out" />
              
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/40 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#E8F3EE] flex items-center justify-center text-primary"><Activity className="w-5 h-5"/></div>
                    <div>
                       <p className="text-[13px] font-bold text-text-black uppercase tracking-wider">AI Analysis</p>
                       <p className="text-[12px] text-text-muted font-mono">Processing patient scans...</p>
                    </div>
                 </div>
                 <div className="w-full h-1.5 bg-[#E8F3EE] rounded-full overflow-hidden mt-4">
                    <motion.div className="h-full bg-primary" initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} />
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* SECTION 2: MARQUEE */}
      <div className="w-full h-[60px] bg-background border-b border-border flex items-center overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex whitespace-nowrap text-text-mid font-mono text-[13px] uppercase tracking-widest items-center gap-12"
        >
          {Array(4).fill(["PDF Data Extraction", "Longitudinal Tracking", "AI Pre-Visit Summaries", "Biomarker Graphing", "Secure RBAC Access", "Anomaly Flagging"]).flat().map((item, i) => (
            <React.Fragment key={i}>
              <span>{item}</span>
              <span className="text-border">|</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="bg-white py-24 md:py-32 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1280px] mx-auto">
          <FadeInContent>
            <div className="text-center mb-24">
               <span className="text-primary text-[13px] font-bold tracking-widest uppercase mb-4 block">Platform Workflows</span>
               <h2 className="font-display text-[42px] md:text-[52px] font-semibold text-text-black tracking-tight">Data in. Insights out.</h2>
               <p className="text-[18px] text-text-muted font-light mt-6 max-w-2xl mx-auto">A streamlined, cinematic pipeline transforming raw PDFs into actionable continuous care models.</p>
            </div>
          </FadeInContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { icon: <FileText/>, step: "01", title: "Ingest & Digitize", desc: "Upload labs, prescriptions, or discharge summaries. Our engine parses unstructured text with extreme accuracy." },
               { icon: <Activity/>, step: "02", title: "Map & Chart", desc: "Vitals are extracted, standardized, and charted chronologically against historical data baselines automatically." },
               { icon: <Eye/>, step: "03", title: "Clinical Synthesis", desc: "Physicians receive a concise, prioritized AI brief emphasizing anomalies and significant deviations." }
             ].map((f, i) => (
               <FadeInContent key={i} delay={0.1 * i}>
                 <div className="bg-background border border-border rounded-card p-8 h-full shadow-sm hover:border-border/80 transition-colors">
                    <div className="flex items-center justify-between mb-8">
                       <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center text-primary shadow-sm">{f.icon}</div>
                       <span className="font-mono text-[24px] font-bold text-text-muted/30">{f.step}</span>
                    </div>
                    <h3 className="text-[20px] font-semibold text-text-black mb-3">{f.title}</h3>
                    <p className="text-[15px] text-text-mid leading-relaxed">{f.desc}</p>
                 </div>
               </FadeInContent>
             ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SECURITY */}
      <section className="bg-background py-24 md:py-32 px-6 md:px-12 text-center border-b border-border">
        <div className="max-w-[1000px] mx-auto">
           <FadeInContent>
             <h2 className="text-[36px] md:text-[42px] font-semibold text-text-black mb-6 tracking-tight">Enterprise-Grade Governance.</h2>
             <p className="text-[18px] text-text-mid max-w-2xl mx-auto mb-16">Designed for clinical compliance from day one. Your medical telemetry remains unequivocally yours.</p>
           </FadeInContent>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             {[
               { icon: <Shield className="w-6 h-6 text-text-black"/>, t: "End-to-End Encryption", d: "All patient files and structured JSON are AES-256 encrypted at rest inside PostgreSQL." },
               { icon: <Lock className="w-6 h-6 text-text-black"/>, t: "Role-Based Access (RBAC)", d: "Doctors only access mapped profiles. Strict demarcation between Patient, Doctor, and Admin layers." },
               { icon: <FileText className="w-6 h-6 text-text-black"/>, t: "Immutable Audit Logs", d: "Every system read, export, or assignment generates an auditable, timestamped security event." }
             ].map((feat, i) => (
                <FadeInContent key={i} delay={0.1 * i}>
                  <div className="bg-white border border-border p-8 rounded-card h-full shadow-sm">
                    <div className="w-10 h-10 bg-background border border-border rounded-md flex items-center justify-center mb-6">{feat.icon}</div>
                    <h3 className="text-[16px] font-semibold text-text-black mb-2">{feat.t}</h3>
                    <p className="text-text-mid text-[14px] leading-relaxed">{feat.d}</p>
                  </div>
                </FadeInContent>
             ))}
           </div>
        </div>
      </section>

      {/* SECTION 5: CINEMATIC SHOWCASE */}
      <section className="bg-white py-24 md:py-32 px-6 md:px-12 border-b border-border overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
           <FadeInContent>
             <div className="text-center mb-16">
                <span className="text-primary text-[13px] font-bold tracking-widest uppercase mb-4 block">Product Showcase</span>
                <h2 className="font-display text-[42px] md:text-[52px] font-semibold text-text-black tracking-tight">Experience the Precision.</h2>
                <p className="text-[18px] text-text-mid font-light mt-6 max-w-2xl mx-auto">Watch how MediSage AI transforms complex medical data into a cinematic clinical flowsheet.</p>
             </div>
           </FadeInContent>

           <FadeInContent delay={0.2}>
             <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(2,77,48,0.1)] border border-border bg-black group">
                <div className="absolute inset-0 bg-text-black/20 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700"></div>
                <video 
                   ref={videoRef}
                   src="/videos/tour.mp4" 
                   autoPlay 
                   loop 
                   muted={isMuted}
                   playsInline 
                   className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3">
                   <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/40 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[12px] font-bold text-text-black uppercase tracking-wider">Live Preview</span>
                   </div>
                </div>

                {/* VOLUME CONTROLS */}
                <div className="absolute bottom-10 right-10 z-20 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-full border border-white/20 group/volume hover:bg-black/80 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-primary/30">
                   <button 
                      onClick={toggleMute} 
                      className="text-white hover:text-primary hover:scale-125 transition-all duration-300"
                      title={isMuted ? "Unmute" : "Mute"}
                   >
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6 animate-pulse" /> : <Volume2 className="w-6 h-6" />}
                   </button>
                   <div className="flex flex-col items-start gap-1">
                      <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.01" 
                         value={isMuted ? 0 : volume} 
                         onChange={handleVolumeChange}
                         className="w-0 group-hover/volume:w-32 transition-all duration-700 bg-white/20 h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                   </div>
                </div>
             </div>
           </FadeInContent>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="w-full bg-text-black py-40 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1551076805-e1869043e560?q=80&w=2500&auto=format&fit=crop" alt="Medical Abstract" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-text-black via-text-black/80 to-transparent"></div>
         </div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <FadeInContent>
               <h2 className="font-display text-[44px] md:text-[56px] font-semibold text-white mb-6 tracking-tight">Ready to modernise your records?</h2>
               <p className="text-[20px] text-white/70 mb-12 font-light">Join modern clinics taking control of their medical history with cinematic clarity.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <Link to="/register"><Button size="lg" className="w-full sm:w-auto px-10 h-14 bg-primary hover:bg-primary-mid text-white text-[15px] shadow-2xl transition-all hover:scale-105">Create Free Account</Button></Link>
                 <Link to="/login"><Button size="lg" variant="secondary" className="w-full sm:w-auto px-10 h-14 bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 text-[15px] transition-all hover:scale-105">Sign In</Button></Link>
               </div>
            </FadeInContent>
         </div>
      </section>
      
      {/* FOOTER */}
      <footer className="w-full bg-background py-10 px-6 md:px-12 border-t border-border flex flex-col md:flex-row items-center justify-between text-[13px] text-text-muted font-mono">
         <span>&copy; {new Date().getFullYear()} MediSage AI Systems. All rights reserved.</span>
         <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-black transition-colors">Security Details</a>
         </div>
      </footer>
    </div>
  );
}
