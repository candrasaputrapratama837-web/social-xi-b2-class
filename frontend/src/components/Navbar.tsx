import React from 'react';
import {
  Users,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Moon,
  Sun,
  Sparkles,
  Network,
  Wallet,
  FileCheck,
  UserCheck,
  Eye,
  LogOut,
  Lock
} from 'lucide-react';
import { UserAuthMode, AuthSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  authSession: AuthSession;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  realtimeStatus?: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  authSession,
  onOpenLoginModal,
  onLogout,
  realtimeStatus = 'connected',
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: 'Absensi', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'academy', label: 'Akademik', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'siswa', label: 'Siswa & XP', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'tasks', label: 'Tugas', icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'kas', label: 'Rekap Kas', icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'agora', label: 'Agora Forum', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'organisasi', label: 'Organisasi & Foto', icon: <Network className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black font-display text-base sm:text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
              XI
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-black text-sm sm:text-lg text-white tracking-wider uppercase truncate">
                  Social-XI-B2
                </span>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold tracking-widest uppercase bg-blue-900/60 text-blue-300 rounded border border-blue-700/60 shrink-0">
                  SMAN 1 Sandai
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block truncate">
                Digital Classroom Ecosystem • Wali Kelas: Indra Setiawan, S.Pd.
              </p>
            </div>
          </div>

          {/* Desktop Horizontal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-display tracking-wide uppercase whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Auth Session Badge & Login Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Realtime Live Indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase border transition-all ${
                realtimeStatus === 'connected'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  : realtimeStatus === 'reconnecting'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 animate-pulse'
                  : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
              }`}
              title={realtimeStatus === 'connected' ? 'Terkoneksi ke Database Sentral Real-time' : 'Menghubungkan ke database...'}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  realtimeStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : realtimeStatus === 'reconnecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span className="hidden xs:inline">
                {realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'reconnecting' ? 'Sync' : 'Offline'}
              </span>
            </div>

            {/* Auth Session Display */}
            {authSession.mode === 'admin' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-display uppercase tracking-wider ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-rose-400 hover:bg-rose-950/50 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : authSession.mode === 'siswa' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 max-w-[140px] truncate">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{authSession.name || 'Siswa XI-B2'}</span>
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-rose-400 hover:bg-rose-950/50 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
                  title="Logout Siswa"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row (Horizontal Touch Carousel) */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1 border-t border-slate-800 scrollbar-none no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap uppercase tracking-wider shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-400 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
