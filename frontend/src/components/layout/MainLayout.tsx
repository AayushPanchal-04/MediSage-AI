import { Outlet } from 'react-router-dom';
import TopNav from '../ui/TopNav';
import Footer from '../ui/Footer';
import { useAuth } from '../../context/AuthContext';

export default function MainLayout() {
  const { role } = useAuth();
  
  // Admin gets full dark theme
  const bgClass = role === 'ADMIN' ? 'bg-dark-bg text-surface' : 'bg-background';

  return (
    <div className={`min-h-screen flex flex-col ${bgClass}`}>
      <TopNav />
      <main className="flex-1 w-full max-w-[1440px] mx-auto overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
