import React, { useState } from 'react';
import { StudentUser, UserAuthMode } from '../types';
import { Search, User, Filter, Award, Sparkles, Trophy, Crown, ShieldCheck, Edit2, Medal, Users, ArrowUpRight } from 'lucide-react';

interface SiswaProps {
  students: StudentUser[];
  authMode?: UserAuthMode;
  onEditStudent?: (student: StudentUser) => void;
  onDeleteStudent?: (id: string) => void;
}

export const SiswaSection: React.FC<SiswaProps> = ({
  students,
  authMode = 'public',
  onEditStudent,
  onDeleteStudent,
}) => {
  const [viewMode, setViewMode] = useState<'direktori' | 'leaderboard'>('direktori');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('ALL');
  const [filterAgama, setFilterAgama] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  // Filter students for directory
  const filteredStudents = (students || []).filter((s) => {
    const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchGender = filterGender === 'ALL' || s.gender === filterGender;
    const matchAgama = filterAgama === 'ALL' || s.agama === filterAgama;
    const matchStatus = filterStatus === 'ALL' || (s.status || 'ACTIVE') === filterStatus;
    return matchName && matchGender && matchAgama && matchStatus;
  });

  // A-Z sorted list for directory
  const sortedByName = [...filteredStudents].sort((a, b) => a.name.localeCompare(b.name));

  // XP sorted list for Leaderboard (Only ACTIVE students appear on leaderboard rankings)
  const activeStudents = (students || []).filter((s) => s.status !== 'INACTIVE');
  const sortedByXp = [...activeStudents].sort((a, b) => b.xp - a.xp);

  const top1 = sortedByXp[0];
  const top2 = sortedByXp[1];
  const top3 = sortedByXp[2];

  const totalL = students.filter((s) => s.gender === 'L' && s.status !== 'INACTIVE').length;
  const totalP = students.filter((s) => s.gender === 'P' && s.status !== 'INACTIVE').length;
  const totalActive = students.filter((s) => s.status !== 'INACTIVE').length;
  const totalInactive = students.filter((s) => s.status === 'INACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Header Banner (Light Mode SaaS Banner) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider inline-block">
              Sistem Database & Leaderboard Siswa
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Siswa & Klasemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Social XI-B2</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              SMAN 1 Sandai • Wali Kelas: Indra Setiawan, S.Pd. • Total 33 Siswa
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0 backdrop-blur-md">
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-2xl font-black text-emerald-400">{totalActive}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Siswa Aktif</span>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-xl font-bold text-blue-300">{totalL}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Laki-laki</span>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-xl font-bold text-rose-300">{totalP}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Perempuan</span>
            </div>
            {totalInactive > 0 && (
              <div className="text-center px-3">
                <span className="block text-xl font-bold text-slate-400">{totalInactive}</span>
                <span className="block text-[10px] uppercase font-bold text-rose-400">Nonaktif</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('direktori')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'direktori'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            📂 Direktori Siswa A-Z ({students.length})
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            🏆 Leaderboard XP Keaktifan ({activeStudents.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          {viewMode === 'direktori' ? 'Urutan alfabetis A-Z' : 'Peringkat berdasarkan perolehan XP (Siswa Aktif)'}
        </span>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Status ({students.length})</option>
            <option value="ACTIVE">Status Aktif ({totalActive})</option>
            <option value="INACTIVE">Status Nonaktif ({totalInactive})</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Gender</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          <select
            value={filterAgama}
            onChange={(e) => setFilterAgama(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Agama</option>
            <option value="ISLAM">Islam</option>
            <option value="KATHOLIK">Katholik</option>
            <option value="PROTESTAN">Protestan</option>
            <option value="HINDU">Hindu</option>
            <option value="BUDDHA">Buddha</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: DIREKTORI SISWA (A-Z GRID) */}
      {viewMode === 'direktori' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedByName.map((s, index) => {
            const isFemale = s.gender === 'P';
            const isInactive = s.status === 'INACTIVE';

            return (
              <div
                key={s._id}
                onClick={() => setSelectedStudent(s)}
                className={`bg-white border hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3 ${
                  isInactive ? 'border-rose-200 bg-rose-50/20 opacity-75' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isInactive ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-rose-50 text-rose-600 border-rose-200 font-mono">
                          NONAKTIF
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            isFemale
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}
                        >
                          JK: {s.gender}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {s.photo ? (
                      <img
                        src={s.photo}
                        alt={s.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {s.name.substring(0, 2)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500">NISN: {s.nisn}</p>
                      {s.statusReason && (
                        <p className="text-[10px] text-rose-500 font-medium truncate">Ket: {s.statusReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-[11px] text-slate-400">Agama:</span>
                      <span className="font-semibold text-slate-700">{s.agama}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-[11px] text-slate-400">Jabatan:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                        {s.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {s.xp} XP
                  </span>

                  <div className="flex items-center gap-2">
                    {authMode === 'admin' && onEditStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(s);
                        }}
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Siswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                      Profil <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LEADERBOARD KLASEMEN XP */}
      {viewMode === 'leaderboard' && (
        <div className="space-y-8">
          {/* Podium Top 3 */}
          {sortedByXp.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
              {/* Rank 2 - Silver */}
              {top2 && (
                <div
                  onClick={() => setSelectedStudent(top2)}
                  className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-md relative hover:scale-102 transition-all cursor-pointer text-center space-y-3 order-2 md:order-1"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-200 text-slate-800 font-black text-xs rounded-full border border-slate-300 shadow-sm flex items-center gap-1">
                    <Medal className="w-3.5 h-3.5 text-slate-600" /> RANK #2 (SILVER)
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900 font-black text-2xl flex items-center justify-center mx-auto border-4 border-slate-300 shadow-md">
                    {top2.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">{top2.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">NISN: {top2.nisn} • {top2.role}</p>
                  </div>
                  <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-900 font-black text-sm rounded-xl border border-slate-300">
                    {top2.xp} XP
                  </div>
                </div>
              )}

              {/* Rank 1 - Gold */}
              {top1 && (
                <div
                  onClick={() => setSelectedStudent(top1)}
                  className="bg-gradient-to-b from-amber-50 to-white border-4 border-amber-400 rounded-3xl p-8 shadow-xl relative hover:scale-105 transition-all cursor-pointer text-center space-y-4 order-1 md:order-2"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Crown className="w-4 h-4 text-slate-950 fill-slate-950" /> JUARA 1 (GOLD)
                  </div>
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto border-4 border-amber-200 shadow-lg">
                    {top1.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900">{top1.name}</h3>
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">{top1.role}</p>
                    <p className="text-xs text-slate-500 font-mono">NISN: {top1.nisn}</p>
                  </div>
                  <div className="inline-block px-6 py-2 bg-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-md">
                    👑 {top1.xp} XP
                  </div>
                </div>
              )}

              {/* Rank 3 - Bronze */}
              {top3 && (
                <div
                  onClick={() => setSelectedStudent(top3)}
                  className="bg-white border-2 border-amber-600/40 rounded-3xl p-6 shadow-md relative hover:scale-102 transition-all cursor-pointer text-center space-y-3 order-3"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full border border-amber-300 shadow-sm flex items-center gap-1">
                    <Medal className="w-3.5 h-3.5 text-amber-700" /> RANK #3 (BRONZE)
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-800 text-white font-black text-2xl flex items-center justify-center mx-auto border-4 border-amber-300 shadow-md">
                    {top3.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">{top3.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">NISN: {top3.nisn} • {top3.role}</p>
                  </div>
                  <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-900 font-black text-sm rounded-xl border border-amber-200">
                    {top3.xp} XP
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Table List (#1 to #33) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Klasemen Lengkap XP Siswa ({sortedByXp.length} Siswa)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Diperbarui secara real-time</span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {sortedByXp.map((s, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={s._id}
                    onClick={() => setSelectedStudent(s)}
                    className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isTop3 ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        #{rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {s.name.substring(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200 hidden sm:inline">
                            {s.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">NISN: {s.nisn} • Gender: {s.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900 block">{s.xp} XP</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Poin Keaktifan</span>
                      </div>

                      {authMode === 'admin' && onEditStudent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStudent(s);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit XP Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {selectedStudent.name.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-blue-600 font-bold">{selectedStudent.role}</p>
                <p className="text-[11px] text-slate-500 font-mono">NISN: {selectedStudent.nisn}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Status Keaktifan:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono border ${
                  selectedStudent.status === 'INACTIVE'
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {selectedStudent.status || 'ACTIVE'}
                </span>
              </div>
              {selectedStudent.statusReason && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Alasan Nonaktif:</span>
                  <span className="font-semibold text-rose-600">{selectedStudent.statusReason}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Jenis Kelamin:</span>
                <span className="font-bold text-slate-800">
                  {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Agama:</span>
                <span className="font-bold text-slate-800">{selectedStudent.agama}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total Poin XP:</span>
                <span className="font-black text-amber-600">{selectedStudent.xp} XP</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Motto Hidup:</span>
                <p className="text-slate-700 italic font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                  "{selectedStudent.motto || 'Berjuang bersama untuk kejayaan XI-B2!'}"
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md cursor-pointer transition-all"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
