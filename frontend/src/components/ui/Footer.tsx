import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-dark-bg text-white/50 py-16 px-6 font-body text-[14px]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-dark-surface pb-12">
        
        {/* Brand */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-white">
            <img src="/medisage-logo.png" alt="MediSage AI Logo" className="w-8 h-8 object-contain brightness-0 invert" />
            <span className="font-display text-[22px] font-semibold">MediSage AI</span>
          </div>
          <p className="text-[15px] max-w-[200px]">AI that understands your health.</p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium mb-2">Product</h4>
          <Link to="/" className="hover:text-white transition-colors">Features</Link>
          <Link to="/" className="hover:text-white transition-colors">Security</Link>
          <Link to="/" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/" className="hover:text-white transition-colors">Enterprise</Link>
        </div>

        {/* For Patients */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium mb-2">For Patients</h4>
          <Link to="/patient/home" className="hover:text-white transition-colors">Health Journal</Link>
          <Link to="/patient/upload" className="hover:text-white transition-colors">Upload Records</Link>
          <Link to="/patient/trends" className="hover:text-white transition-colors">Vital Trends</Link>
          <Link to="/patient/chat" className="hover:text-white transition-colors">AI Assistant</Link>
        </div>

        {/* For Doctors */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium mb-2">For Doctors</h4>
          <Link to="/doctor/home" className="hover:text-white transition-colors">Morning Brief</Link>
          <Link to="/doctor/patients" className="hover:text-white transition-colors">Patient Roster</Link>
          <Link to="/" className="hover:text-white transition-colors">Clinical Notes</Link>
          <Link to="/" className="hover:text-white transition-colors">AI Insights API</Link>
        </div>

      </div>

      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <p>&copy; {new Date().getFullYear()} MediSage AI Systems Inc.</p>
        <p>Designed with care in India 🇮🇳</p>
      </div>
    </footer>
  );
}
