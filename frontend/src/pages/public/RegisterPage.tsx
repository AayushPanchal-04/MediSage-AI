import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Stethoscope, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth, Role } from '../../context/AuthContext';
import { cn } from '../../components/ui/Button';

const CleanInput = ({ label, ...props }: any) => (
  <div className="w-full mb-4">
    <label className="block text-[13px] font-medium text-text-black mb-1.5">{label}</label>
    <input
      className="w-full h-[44px] px-3 rounded-md border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[14px]"
      {...props}
    />
  </div>
);

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', role: '',
    dateOfBirth: '', bloodGroup: '', allergies: '',
    specialization: '', licenseNumber: '', hospitalAffiliation: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await register({ ...formData, role });
      navigate(role === 'PATIENT' ? '/patient/home' : (role === 'DOCTOR' ? '/doctor/home' : '/admin/overview'));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex w-full min-h-screen bg-background font-body text-text-black">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[400px] xl:w-[500px] relative bg-text-black flex-col p-12 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1576091160550-2173ff9e5ee4?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Clinical Research" />
             <div className="absolute inset-0 bg-gradient-to-t from-text-black via-text-black/80 to-[#024D30]/60 mix-blend-multiply"></div>
         </div>
         
         <Link to="/" className="flex items-center gap-3 text-white font-semibold mb-16 hover:opacity-80 transition-opacity z-10 w-fit">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1 border border-white/20">
               <img src="/medisage-logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[20px] tracking-tight font-display">MediSage AI</span>
         </Link>
         
         <div className="mt-auto relative z-10 mb-10">
            <h1 className="text-[40px] font-display font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Create your clinical profile.
            </h1>
            <p className="text-white/80 font-light text-[18px] leading-relaxed">
              Step into the modern era of healthcare interoperability. We map, track, and secure your data automatically with cinematic precision.
            </p>
         </div>
      </div>

      {/* RIGHT PANEL - REGISTER FORM */}
      <div className="w-full lg:flex-1 flex flex-col p-6 md:p-12 relative overflow-y-auto">
         
         {/* Top Navbar Mobile */}
         <Link to="/" className="lg:hidden absolute top-6 flex items-center gap-2 text-text-black">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center p-1 border border-border">
               <img src="/medisage-logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[18px] font-semibold tracking-tight">MediSage AI</span>
         </Link>
         
         {/* Navigation & Progress */}
         <div className="w-full max-w-[500px] mx-auto mt-12 lg:mt-0 flex flex-col justify-center min-h-[500px]">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="text-[13px] text-text-muted hover:text-text-black flex items-center gap-1 mb-8 w-fit font-medium">
                <ChevronLeft className="w-4 h-4"/> Back
              </button>
            )}

            <div className="flex items-center gap-2 mb-10">
               {[1,2,3].map(s => (
                 <div key={s} className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                   <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: step >= s ? "100%" : "0%" }} />
                 </div>
               ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                   <h2 className="text-[32px] font-display font-semibold text-text-black mb-2 tracking-tight">Select Account Type</h2>
                   <p className="text-[15px] text-text-muted font-light mb-10">Access permissions depend on your defined role.</p>
                   
                   <div className="flex flex-col gap-4 mb-10">
                     <button onClick={() => setRole('PATIENT')} className={cn("w-full p-5 rounded-xl text-left border transition-all relative flex gap-4 items-center group", role === 'PATIENT' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-text-mid')}>
                       <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0 border", role === 'PATIENT' ? 'bg-white border-primary text-primary' : 'bg-background border-border text-text-mid')}><User className="w-5 h-5"/></div>
                       <div>
                         <h3 className="font-semibold text-[16px] text-text-black">Patient Record Access</h3>
                         <p className="text-[13px] text-text-mid mt-1">Upload reports and view timeline insights.</p>
                       </div>
                       {role === 'PATIENT' && <CheckCircle2 className="absolute right-5 text-primary w-5 h-5" />}
                     </button>

                     <button onClick={() => setRole('DOCTOR')} className={cn("w-full p-5 rounded-xl text-left border transition-all relative flex gap-4 items-center group", role === 'DOCTOR' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:border-text-mid')}>
                       <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0 border", role === 'DOCTOR' ? 'bg-white border-primary text-primary' : 'bg-background border-border text-text-mid')}><Stethoscope className="w-5 h-5"/></div>
                       <div>
                         <h3 className="font-semibold text-[16px] text-text-black">Physician Portal</h3>
                         <p className="text-[13px] text-text-mid mt-1">Review assignments, flows, and AI briefs.</p>
                       </div>
                       {role === 'DOCTOR' && <CheckCircle2 className="absolute right-5 text-primary w-5 h-5" />}
                     </button>
                   </div>
                   <Button disabled={!role} onClick={() => setStep(2)} className="w-full h-12">Continue</Button>
                   <p className="text-center text-[13px] text-text-mid mt-6">Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link></p>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                   <h2 className="text-[32px] font-display font-semibold text-text-black mb-2 tracking-tight">Identity Details</h2>
                   <p className="text-[15px] text-text-muted font-light mb-10">Basic contact and access credentials.</p>
                   
                   <div className="space-y-1 mb-8">
                      <CleanInput label="Legal Full Name" value={formData.fullName} onChange={(e:any) => setFormData({...formData, fullName: e.target.value})} />
                      <CleanInput label="Work or Personal Email" type="email" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                      <CleanInput label="Secure Password" type="password" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                   </div>
                   
                   <Button onClick={() => setStep(3)} className="w-full h-12">Continue Setup</Button>
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                   <h2 className="text-[32px] font-display font-semibold text-text-black mb-2 tracking-tight">Profile Configuration</h2>
                   <p className="text-[15px] text-text-muted font-light mb-10">{role === 'PATIENT' ? 'Baseline metrics for proper analysis indexing.' : 'Credentialing and affiliations.'}</p>
                   
                   {role === 'PATIENT' ? (
                     <div className="space-y-1 mb-8">
                        <CleanInput label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e:any) => setFormData({...formData, dateOfBirth: e.target.value})} />
                        <div className="w-full mb-4">
                           <label className="block text-[13px] font-medium text-text-black mb-1.5">Blood Group</label>
                           <select value={formData.bloodGroup} onChange={(e:any) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full h-[44px] px-3 rounded-md border border-border bg-white text-text-black focus:border-primary focus:ring-1 outline-none text-[14px]">
                              <option value="">Select Option</option><option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option>
                           </select>
                        </div>
                        <CleanInput label="Known Allergies" placeholder="Comma separated..." value={formData.allergies} onChange={(e:any) => setFormData({...formData, allergies: e.target.value})} />
                     </div>
                   ) : (
                     <div className="space-y-1 mb-8">
                        <CleanInput label="Specialization" placeholder="e.g. Endocrinology" value={formData.specialization} onChange={(e:any) => setFormData({...formData, specialization: e.target.value})} />
                        <CleanInput label="License Number" value={formData.licenseNumber} onChange={(e:any) => setFormData({...formData, licenseNumber: e.target.value})} />
                        <CleanInput label="Hospital Affiliation" value={formData.hospitalAffiliation} onChange={(e:any) => setFormData({...formData, hospitalAffiliation: e.target.value})} />
                     </div>
                   )}
                   
                   <Button onClick={handleComplete} disabled={isLoading} className="w-full h-12 bg-text-black hover:bg-black">
                     {isLoading ? 'Creating Account...' : 'Finish Registration'}
                   </Button>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
