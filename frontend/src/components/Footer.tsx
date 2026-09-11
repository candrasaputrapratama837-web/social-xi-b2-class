import React from 'react';
import { Heart, School, Sparkles, Navigation, Users, Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onSelectTab?: (tab: string) => void;
  onOpenLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenLogin }) => {
  return (
    <footer className="bg-[#0f172a] text-slate-300 py-14 px-4 sm:px-6 lg:px-8 mt-24 border-t border-slate-800 relative overflow-hidden">
      {/* Subtle top accent divider line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#22c55e] via-[#f97316] to-[#22c55e]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Info Kelas */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#f97316] flex items-center justify-center text-slate-950 font-black font-display text-lg shadow-lg">
              XI
            </div>
            <div>
              <span className="font-display font-black text-xl text-white tracking-wider block uppercase">
                SOCIAL-XI-B2
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#22c55e] uppercase">
                SMA Negeri 1 Sandai
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-body">
            Platform Digital Resmi Kelas Social XI-B2 SMAN 1 Sandai (TP 2026-2027). Wadah akademis, gamifikasi XP, manajemen tugas, rekap kas, dan ruang interaksi sosial siswa.
          </p>
          <div className="p-3 bg-[#020617] rounded-xl border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Wali Kelas</span>
              <span className="text-white font-bold font-display">Indra Setiawan, S.Pd.</span>
            </div>
          </div>
        </div>

        {/* Column 2: Navigasi Platform */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Navigation className="w-4 h-4 text-[#22c55e]" />
            Navigasi Cepat
          </h4>
          <ul className="text-xs space-y-2.5 font-medium text-slate-300">
            {onSelectTab && (
              <>
                <li>
                  <button onClick={() => onSelectTab('dashboard')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Home / Dashboard Utama
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('attendance')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Presensi Mandiri Siswa
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('academy')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Jadwal & Sistem Akademik
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('siswa')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Data 33 Siswa XI-B2
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('tasks')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Submisi & Evaluasi Tugas
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('kas')} className="hover:text-[#22c55e] transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" /> Transparansi Rekap Kas
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Column 3: Sosial & Komunitas */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-[#f97316]" />
            Sosial & Komunitas
          </h4>
          <div className="flex flex-wrap gap-2 text-[11px] font-medium">
            {onSelectTab && (
              <>
                <button onClick={() => onSelectTab('agora')} className="px-3 py-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-[#22c55e]/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer">
                  💬 Agora Forum
                </button>
                <button onClick={() => onSelectTab('agora')} className="px-3 py-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-[#22c55e]/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer">
                  💌 Confession Box
                </button>
                <button onClick={() => onSelectTab('dashboard')} className="px-3 py-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-[#22c55e]/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer">
                  😃 Daily Mood Tracker
                </button>
                <button onClick={() => onSelectTab('agora')} className="px-3 py-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-[#22c55e]/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer">
                  🕸️ Sosiogram Kelas
                </button>
                <button onClick={() => onSelectTab('organisasi')} className="px-3 py-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-[#22c55e]/50 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer">
                  🏛️ Struktur Organisasi
                </button>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Terbuka untuk masukan siswa & transparansi wali kelas.
          </p>
        </div>

        {/* Column 4: Kontak & Alamat Sekolah */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <MapPin className="w-4 h-4 text-[#22c55e]" />
            Kontak & Lokasi
          </h4>
          <ul className="text-xs space-y-2.5 text-slate-400 font-body">
            <li className="flex items-start gap-2">
              <School className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
              <span><strong>SMA Negeri 1 Sandai</strong><br />Jl. Pramuka No. 01, Kecamatan Sandai, Kab. Ketapang, Kalimantan Barat</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#f97316] shrink-0" />
              <span>social.xib2.sandai@gmail.com</span>
            </li>
          </ul>

          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full mt-2 py-2 px-3 bg-[#020617] hover:bg-slate-900 text-[#22c55e] border border-[#22c55e]/40 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              Akses Portal Login Admin / Siswa
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-body">
        <p>© 2026 Social-XI-B2. Dikelola oleh Pengurus Kelas & Tim IT XI-B2 SMAN 1 Sandai.</p>
        <div className="flex items-center gap-1.5">
          <span>Dikembangkan dengan</span>
          <Heart className="w-3.5 h-3.5 text-[#f97316] fill-[#f97316]" />
          <span>untuk Kebersamaan XI-B2</span>
        </div>
      </div>
    </footer>
  );
};

