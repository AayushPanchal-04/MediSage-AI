import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { role, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = role === 'ADMIN';
  const navClass = isAdmin 
    ? 'bg-dark-bg/85 border-border/10 text-white' 
    : 'bg-background/85 border-border text-text-black';

  const linkClass = isAdmin ? 'text-white/70 hover:text-white' : 'text-text-mid hover:text-primary';

  const getLinks = () => {
    if (role === 'PATIENT') return [
      { name: 'Home', path: '/patient/home' },
      { name: 'My Records', path: '/patient/records' },
      { name: 'Upload', path: '/patient/upload' },
      { name: 'Health Trends', path: '/patient/trends' },
      { name: 'AI Care', path: '/patient/care' },
      { name: 'AI Chat', path: '/patient/chat' },
    ];
    if (role === 'DOCTOR') return [
      { name: 'Morning Brief', path: '/doctor/home' },
      { name: 'My Patients', path: '/doctor/patients' },
    ];
    if (role === 'ADMIN') return [
      { name: 'Overview', path: '/admin/overview' },
      { name: 'Users', path: '/admin/users' },
      { name: 'Assign Doctors', path: '/admin/assign' },
      { name: 'Audit Logs', path: '/admin/logs' },
    ];
    return [];
  };

  return (
    <header className={`sticky top-0 z-50 w-full h-[68px] backdrop-blur-[20px] transition-all duration-300 ${scrolled ? `border-b ${navClass}` : 'bg-transparent border-transparent'}`}>
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to={`/${role?.toLowerCase() || ''}/home`} className="flex items-center gap-2 relative z-50">
          <img src="/medisage-logo.png" alt="MediSage AI Logo" className="w-8 h-8 object-contain" />
          <span className={`font-display text-[22px] font-semibold ${isAdmin ? 'text-white' : 'text-text-black'}`}>MediSage AI</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {getLinks().map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link key={link.name} to={link.path} className={`font-body text-[14px] relative py-2 transition-colors ${isActive ? (isAdmin ? 'text-white font-medium' : 'text-primary font-medium') : linkClass}`}>
                {link.name}
                {isActive && (
                  <motion.div layoutId="nav-indicator" className={`absolute bottom-0 left-0 right-0 h-0.5 ${isAdmin ? 'bg-primary-light' : 'bg-primary'}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Bell className={`w-5 h-5 ${isAdmin? 'text-white/70' : 'text-text-mid'}`} />
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background" />
          </button>

          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium hover:ring-2 ring-primary/30 transition-all cursor-pointer">
              {/* @ts-ignore */}
              {user && 'avatarInitials' in user ? user.avatarInitials : user?.name ? user.name.charAt(0) : 'U'}
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute right-0 mt-2 w-56 rounded-card shadow-card border ${isAdmin ? 'bg-dark-surface border-border/10 text-white' : 'bg-white border-border/40 text-text-black'} overflow-hidden`}>
                  <div className="p-4 border-b border-border/10">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <p className="text-[12px] opacity-60">{role}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-[14px] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Profile</button>
                    <button className="w-full text-left px-4 py-2 text-[14px] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"><Settings className="w-4 h-4"/> Settings</button>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-[14px] hover:bg-danger/10 text-danger flex items-center gap-2 mt-2"><LogOut className="w-4 h-4"/> Sign Out</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden relative z-50 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className={isAdmin ? 'text-white' : 'text-text-black'} /> : <Menu className={isAdmin ? 'text-white' : 'text-text-black'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed inset-0 z-40 flex flex-col pt-24 px-6 ${isAdmin ? 'bg-dark-bg text-white' : 'bg-background text-text-black'}`}>
            <nav className="flex flex-col gap-6 text-[24px] font-display">
              {getLinks().map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={link.path} onClick={() => setMobileOpen(false)}>{link.name}</Link>
                </motion.div>
              ))}
              <motion.button onClick={logout} className="text-danger flex items-center gap-2 text-[18px] mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <LogOut className="w-5 h-5"/> Sign Out
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
