import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut, LayoutDashboard, History as HistoryIcon } from 'lucide-react';

export default function Layout() {
  const logout = useStore(state => state.logout);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-pitch-black text-gray-200 flex flex-col relative">
      <header className="border-b border-lead sticky top-0 bg-pitch-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-display font-bold tracking-tight text-white">
              P<span className="text-acid-green">ARK</span>ING
            </h1>
            
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider font-semibold border-b-2 transition-colors ${location.pathname === '/' ? 'border-acid-green text-acid-green' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <LayoutDashboard size={16} /> Painel
              </Link>
              <Link 
                to="/history" 
                className={`flex items-center gap-2 px-3 py-2 text-sm uppercase tracking-wider font-semibold border-b-2 transition-colors ${location.pathname === '/history' ? 'border-acid-green text-acid-green' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <HistoryIcon size={16} /> Histórico
              </Link>
            </nav>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
}
