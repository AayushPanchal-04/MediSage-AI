import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth, Role } from '../../context/AuthContext';
import { cn } from '../../components/ui/Button';

const CleanInput = ({ label, type = "text", value, onChange, ...props }: any) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full mb-5">
      <label className="block text-[13px] font-medium text-text-black mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          className="w-full h-[48px] px-4 rounded-md border border-border bg-white text-text-black focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-[14px]"
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-black">
            {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        )}
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('PATIENT');
  const [email, setEmail] = useState('aryan@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    if (r === 'PATIENT') setEmail('aryan@example.com');
    if (r === 'DOCTOR') setEmail('sarah@medisage.com');
    if (r === 'ADMIN') setEmail('admin@medisage.com');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(email, password);
      if (role === 'PATIENT') navigate('/patient/home');
      if (role === 'DOCTOR') navigate('/doctor/home');
      if (role === 'ADMIN') navigate('/admin/overview');
    } catch (err) {
      console.error(err);
      alert('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-background font-body text-text-black">
      {/* LEFT PANEL */}
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative bg-text-black flex-col justify-between p-12 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Hospital Environment" />
             <div className="absolute inset-0 bg-gradient-to-br from-text-black/90 to-[#024D30]/80 mix-blend-multiply"></div>
         </div>
         
         <div className="relative z-10 w-full max-w-[500px] mt-10">
            <Link to="/" className="flex items-center gap-3 text-white font-semibold mb-12 hover:opacity-80 transition-opacity">
               <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-md flex items-center justify-center text-white border border-white/20"><Activity className="w-5 h-5"/></div>
               <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1 border border-border">
                  <img src="/medisage-logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <span className="text-[20px] tracking-tight font-display">MediSage AI</span>
            </Link>
            <h1 className="text-[46px] font-display font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Clinical telemetry.<br/>Structured natively.
            </h1>
            <p className="text-white/80 font-light text-[18px] leading-relaxed">
              Log in to your continuous care portal to review extracted diagnostics, AI workflows, and active patient cohorts in cinematic detail.
            </p>
         </div>

         <div className="relative z-10 w-full max-w-[500px]">
           <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
             <div className="flex items-center gap-4 mb-4 text-white">
               <div className="w-10 h-10 rounded-full bg-white/20 font-bold text-[14px] flex items-center justify-center">S</div>
               <div>
                  <p className="font-bold text-[13px] tracking-wider uppercase">System Status</p>
                  <p className="text-[12px] font-mono text-white/60">All services operational</p>
               </div>
             </div>
             <p className="text-[15px] text-white/90 italic font-light">"Data digestion pipelines are running optimally at 99.9% uptime."</p>
           </div>
         </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background relative">
         <Link to="/" className="lg:hidden absolute top-6 flex items-center gap-2 text-text-black">
            <div className="w-6 h-6 bg-primary rounded animate-pulse"/> 
            <span className="text-[18px] font-semibold tracking-tight">MediSage AI</span>
         </Link>

          <motion.div 
           initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }} 
           animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="w-full max-w-[440px] bg-white border border-border rounded-2xl p-10 shadow-2xl"
         >
            <h2 className="text-[28px] font-display font-semibold text-text-black mb-2 tracking-tight">Sign in to your account</h2>
            <p className="text-text-muted mb-10 text-[15px] font-light">Select your operational role to continue.</p>

            <form onSubmit={handleLogin} className="w-full">
               
               {/* Role Selector */}
               <div className="flex w-full p-[3px] bg-background border border-border rounded-lg mb-8 relative">
                 {(['PATIENT', 'DOCTOR', 'ADMIN'] as Role[]).map((r) => {
                   const isActive = role === r;
                   return (
                     <button
                       key={r}
                       type="button"
                       onClick={() => handleRoleChange(r)}
                       className={cn("flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-all relative z-10 uppercase tracking-wide", isActive ? "text-text-black shadow-sm bg-white border border-border/50" : "text-text-muted hover:text-text-black")}
                     >
                       {r}
                     </button>
                   );
                 })}
               </div>

               <CleanInput label="Email Address" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} />
               <CleanInput label="Password" type="password" value={password} onChange={(e:any) => setPassword(e.target.value)} />
               
               <div className="flex justify-between items-center mb-8">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
                   <span className="text-[13px] text-text-mid">Remember me</span>
                 </label>
                 <button type="button" className="text-[13px] text-primary font-medium hover:underline">Forgot password?</button>
               </div>

               <Button type="submit" className="w-full h-12 bg-text-black hover:bg-black text-white text-[14px] font-medium tracking-wide shadow-sm" disabled={isLoading}>
                 {isLoading ? 'Authenticating...' : 'Sign In'}
               </Button>
               
               <div className="mt-8 pt-6 border-t border-border mt-8 flex flex-col items-center">
                 <p className="text-[14px] text-text-mid">
                   Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register now</Link>
                 </p>
               </div>
            </form>
         </motion.div>
      </div>
    </div>
  );
}
