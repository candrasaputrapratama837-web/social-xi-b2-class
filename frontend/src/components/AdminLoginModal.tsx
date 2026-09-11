import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, KeyRound, X, UserCheck, Eye, Sparkles, User } from 'lucide-react';
import { UserAuthMode } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string, role: 'admin' | 'siswa') => Promise<void>;
  onSelectPublicMode: () => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminLoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSelectPublicMode,
  addToast,
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'siswa'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectRole = (role: 'admin' | 'siswa') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || (selectedRole === 'admin' && !password.trim())) {
      addToast('error', 'Silakan isi identitas yang diperlukan.');
      return;
    }

    try {
      setLoading(true);
      await onLogin(email.trim(), password.trim(), selectedRole);
      addToast(
        'success',
        selectedRole === 'admin'
          ? '🔐 Login Admin Berhasil! Selamat datang Pengurus Kelas XI-B2.'
          : '🎓 Login Siswa Berhasil! Selamat datang di Portal XI-B2.'
      );
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'Login Gagal. Periksa identitas & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">Sistem Login Portal XI-B2</h3>
          <p className="text-xs text-slate-400">
            Pilih hak akses: Admin Kelas, Siswa XI-B2, atau Mode Publik
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedRole === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin Mode
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole('siswa')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedRole === 'siswa'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Siswa XI-B2
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {selectedRole === 'admin' ? 'Email Admin' : 'NISN / Nama / Email Siswa'}
            </label>
            <div className="relative">
              {selectedRole === 'admin' ? (
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              ) : (
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              )}
              <input
                type={selectedRole === 'admin' ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'Masukkan Email Admin' : 'Masukkan NISN atau Nama Siswa'}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {selectedRole === 'admin' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password Admin"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Memproses Authentikasi...' : `Masuk Sebagai ${selectedRole === 'admin' ? 'Admin' : 'Siswa'}`}
          </button>
        </form>

        {/* PUBLIC MODE BUTTON */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Atau jelajahi dengan mode pengunjung tanpa login:</p>
          <button
            type="button"
            onClick={() => {
              onSelectPublicMode();
              addToast('info', 'Anda masuk dalam Mode Publik (Read-only)');
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-400" />
            "Want to see the XI-B2 in action? Press this button!"
          </button>
        </div>
      </div>
    </div>
  );
};
