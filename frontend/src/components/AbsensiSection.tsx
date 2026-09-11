import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  HeartPulse,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Users,
  Info,
  ChevronRight,
  ShieldAlert,
  CalendarDays,
  Award,
  Lock,
  RefreshCw,
  Send
} from 'lucide-react';
import { StudentUser, AttendanceItem, AuthSession } from '../types';
import { api } from '../services/api';

interface AbsensiSectionProps {
  students: StudentUser[];
  authSession: AuthSession;
  onOpenLoginModal: () => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AbsensiSection: React.FC<AbsensiSectionProps> = ({
  students,
  authSession,
  onOpenLoginModal,
  addToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'recap'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
  const [recapData, setRecapData] = useState<any[]>([]);
  const [recapMeta, setRecapMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Self-attendance form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'Hadir' | 'Terlambat' | 'Izin' | 'Sakit'>('Hadir');
  const [note, setNote] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter active students only for self-attendance
  const activeStudents = useMemo(() => {
    return students.filter((s) => s.status !== 'INACTIVE');
  }, [students]);

  // Set default student if logged in with matching NISN or student identity
  useEffect(() => {
    if (authSession.mode === 'siswa' && activeStudents.length > 0) {
      if (authSession.email && authSession.email.includes('@')) {
        const nisnFromEmail = authSession.email.split('@')[0];
        const matched = activeStudents.find((s) => s.nisn === nisnFromEmail || s.name.toLowerCase() === (authSession.name || '').toLowerCase());
        if (matched) {
          setSelectedStudentId(matched._id);
          return;
        }
      }
      if (!selectedStudentId && activeStudents[0]) {
        setSelectedStudentId(activeStudents[0]._id);
      }
    }
  }, [authSession, activeStudents, selectedStudentId]);

  // Fetch Attendance & Recap data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [list, recapRes] = await Promise.all([
        api.getAttendance(selectedDate),
        api.getAttendanceRecap()
      ]);
      setAttendances(list || []);
      if (recapRes && recapRes.recap) {
        setRecapData(recapRes.recap || []);
        setRecapMeta(recapRes);
      } else if (Array.isArray(recapRes)) {
        setRecapData(recapRes);
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Check if current selected student has already submitted today
  const myTodayAttendance = useMemo(() => {
    if (!selectedStudentId) return null;
    const targetStudent = activeStudents.find((s) => s._id === selectedStudentId);
    if (!targetStudent) return null;

    return attendances.find(
      (a) =>
        (a.studentId === selectedStudentId ||
          (a.studentName && a.studentName.toLowerCase() === targetStudent.name.toLowerCase())) &&
        a.date === selectedDate
    );
  }, [selectedStudentId, activeStudents, attendances, selectedDate]);

  // Handle student self-attendance submission
  const handleSelfAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authSession.mode === 'public') {
      onOpenLoginModal();
      addToast('info', 'Silakan login sebagai Siswa untuk melakukan presensi mandiri.');
      return;
    }

    const student = activeStudents.find((s) => s._id === selectedStudentId);
    if (!student) {
      addToast('error', 'Pilih nama siswa terlebih dahulu.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitAttendance({
        studentId: student._id,
        studentName: student.name,
        date: selectedDate,
        status: selectedStatus,
        note: note.trim(),
      });

      addToast(
        'success',
        `Presensi mandiri berhasil direkam: ${student.name} (${selectedStatus})`
      );
      setNote('');
      await fetchData();
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menyimpan presensi mandiri.');
    } finally {
      setSubmitting(false);
    }
  };

  // Combine active students with today's attendance records
  const classAttendanceFeed = useMemo(() => {
    return activeStudents.map((std) => {
      const att = attendances.find(
        (a) =>
          a.studentId === std._id ||
          (a.studentName && a.studentName.toLowerCase() === std.name.toLowerCase())
      );
      return {
        student: std,
        attendance: att || null,
        status: att ? att.status : ('Belum Absen' as const),
      };
    });
  }, [activeStudents, attendances]);

  // Filtered feed
  const filteredFeed = useMemo(() => {
    return classAttendanceFeed.filter((item) => {
      const matchSearch =
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.nisn.includes(searchQuery) ||
        (item.student.role && item.student.role.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'BELUM') return item.status === 'Belum Absen';
      return item.status === statusFilter;
    });
  }, [classAttendanceFeed, searchQuery, statusFilter]);

  // Statistics for selected date
  const stats = useMemo(() => {
    const total = activeStudents.length;
    const hadir = attendances.filter((a) => a.status === 'Hadir').length;
    const terlambat = attendances.filter((a) => a.status === 'Terlambat').length;
    const izin = attendances.filter((a) => a.status === 'Izin').length;
    const sakit = attendances.filter((a) => a.status === 'Sakit').length;
    const alpa = attendances.filter((a) => a.status === 'Alpa').length;
    const sudahAbsen = hadir + terlambat + izin + sakit + alpa;
    const belumAbsen = Math.max(0, total - sudahAbsen);
    const persentase = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0;

    return {
      total,
      hadir,
      terlambat,
      izin,
      sakit,
      alpa,
      sudahAbsen,
      belumAbsen,
      persentase,
    };
  }, [activeStudents, attendances]);

  const selectedStudentObj = activeStudents.find((s) => s._id === selectedStudentId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 🔹 Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-[11px] font-mono font-bold tracking-wider text-blue-300 uppercase">
              <UserCheck className="w-3.5 h-3.5" />
              Sistem Presensi Digital XI-B2
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
              Presensi Mandiri & Rekap Kehadiran
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Setiap siswa yang login dengan role siswa dapat melakukan presensi mandiri harian secara realtime. Hak akses modifikasi data rekap kelas dikelola oleh pengurus & admin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                  Waktu Sistem (WIB)
                </p>
                <p className="text-base font-black font-mono text-white tracking-wide">
                  {currentTime || '--:--:--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-left">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Siswa Aktif</p>
            <p className="text-lg font-black text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40">
            <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Hadir
            </p>
            <p className="text-lg font-black text-emerald-300">{stats.hadir}</p>
          </div>
          <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
            <p className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
              <Clock3 className="w-3 h-3" /> Terlambat
            </p>
            <p className="text-lg font-black text-amber-300">{stats.terlambat}</p>
          </div>
          <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-800/40">
            <p className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1">
              <FileText className="w-3 h-3" /> Izin
            </p>
            <p className="text-lg font-black text-blue-300">{stats.izin}</p>
          </div>
          <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-800/40">
            <p className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1">
              <HeartPulse className="w-3 h-3" /> Sakit
            </p>
            <p className="text-lg font-black text-purple-300">{stats.sakit}</p>
          </div>
          <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-800/40">
            <p className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Belum Absen
            </p>
            <p className="text-lg font-black text-rose-300">{stats.belumAbsen}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Main Content Navigation (Presensi Hari Ini vs Rekap Bulanan) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'daily'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Presensi Hari Ini
          </button>
          <button
            onClick={() => setActiveSubTab('recap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'recap'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-blue-600 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Rekap Bulanan & Statistik
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            Tanggal:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          />
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 🔹 SUBTAB 1: DAILY ATTENDANCE & SELF-ATTENDANCE FORM */}
      {activeSubTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Presensi Mandiri (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Form Absensi Mandiri</h3>
                    <p className="text-[11px] text-slate-500">Khusus Siswa Social-XI-B2</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold rounded-lg uppercase">
                  Online
                </span>
              </div>

              {/* Status Notice if User is Public */}
              {authSession.mode === 'public' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Anda Masuk Sebagai Mode Pengunjung</p>
                      <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                        Untuk merekam presensi mandiri Anda ke sistem kelas, silakan login dengan akun Siswa.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    Masuk Sebagai Siswa
                  </button>
                </div>
              ) : (
                /* Authenticated Self-Attendance Form */
                <form onSubmit={handleSelfAttendanceSubmit} className="space-y-4 text-left">
                  {/* Today's Submission Status Warning */}
                  {myTodayAttendance && (
                    <div
                      className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                        myTodayAttendance.verified
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                    >
                      {myTodayAttendance.verified ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <p className="font-bold">
                          {myTodayAttendance.verified
                            ? '✅ Presensi Terverifikasi oleh Admin'
                            : 'ℹ️ Presensi Sudah Dikirim (Menunggu Verifikasi)'}
                        </p>
                        <p className="text-[11px] opacity-90">
                          Status tercatat: <span className="font-bold">{myTodayAttendance.status}</span>
                          {myTodayAttendance.note ? ` • "${myTodayAttendance.note}"` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Student Identity Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Identitas Siswa
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {activeStudents.map((std) => (
                        <option key={std._id} value={std._id}>
                          {std.name} (NISN: {std.nisn}) {std.role ? `• ${std.role}` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedStudentObj && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
                        <span>Role: {selectedStudentObj.role || 'Siswa'}</span>
                        <span className="text-emerald-600 font-bold font-mono">
                          {selectedStudentObj.xp || 0} XP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Selection Cards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pilih Status Kehadiran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStatus('Hadir')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedStatus === 'Hadir'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            selectedStatus === 'Hadir' ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="text-left">
                          <div>Hadir</div>
                          <div className="text-[10px] font-normal text-emerald-600">+10 XP Bonus</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStatus('Terlambat')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedStatus === 'Terlambat'
                            ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm ring-1 ring-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Clock3
                          className={`w-4 h-4 ${
                            selectedStatus === 'Terlambat' ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="text-left">
                          <div>Terlambat</div>
                          <div className="text-[10px] font-normal text-amber-600">+5 XP Bonus</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStatus('Izin')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedStatus === 'Izin'
                            ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <FileText
                          className={`w-4 h-4 ${
                            selectedStatus === 'Izin' ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="text-left">
                          <div>Izin</div>
                          <div className="text-[10px] font-normal text-blue-600">Surat Izin</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStatus('Sakit')}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedStatus === 'Sakit'
                            ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm ring-1 ring-purple-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <HeartPulse
                          className={`w-4 h-4 ${
                            selectedStatus === 'Sakit' ? 'text-purple-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="text-left">
                          <div>Sakit</div>
                          <div className="text-[10px] font-normal text-purple-600">Surat Dokter</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Note / Keterangan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Catatan / Keterangan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: Mengikuti olimpiade geografi / Sakit demam tinggi..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting
                      ? 'Merekam Presensi...'
                      : myTodayAttendance
                      ? 'Perbarui Status Presensi Mandiri'
                      : 'Kirim Presensi Mandiri Sekarang'}
                  </button>

                  {/* Privacy & Rule Policy */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Tata Tertib Presensi Siswa:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      <li>Siswa berhak melakukan absensi mandiri untuk dirinya sendiri.</li>
                      <li>Penghapusan data & perubahan nilai rekap kelas adalah hak prerogatif Admin.</li>
                      <li>Presensi yang telah diverifikasi oleh Wali/Admin akan otomatis menambah XP.</li>
                    </ul>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Live Class Attendance Feed (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Daftar Kehadiran Siswa Hari Ini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tanggal: <span className="font-bold text-slate-800">{selectedDate}</span> (
                    {stats.sudahAbsen} dari {stats.total} siswa terdata)
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-emerald-700">Real-time Feed</span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa atau NISN..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'ALL', label: 'Semua' },
                    { id: 'Hadir', label: 'Hadir' },
                    { id: 'Terlambat', label: 'Terlambat' },
                    { id: 'Izin', label: 'Izin' },
                    { id: 'Sakit', label: 'Sakit' },
                    { id: 'BELUM', label: 'Belum' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setStatusFilter(chip.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        statusFilter === chip.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed List Table */}
              <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Siswa</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFeed.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          Tidak ada data siswa yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredFeed.map((item, idx) => {
                        const { student, attendance, status } = item;
                        return (
                          <tr
                            key={student._id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              attendance ? '' : 'opacity-70 bg-slate-50/30'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                NISN: {student.nisn} {student.role ? `• ${student.role}` : ''}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              {status === 'Hadir' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> Hadir
                                </span>
                              ) : status === 'Terlambat' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock3 className="w-3 h-3" /> Terlambat
                                </span>
                              ) : status === 'Izin' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <FileText className="w-3 h-3" /> Izin
                                </span>
                              ) : status === 'Sakit' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <HeartPulse className="w-3 h-3" /> Sakit
                                </span>
                              ) : status === 'Alpa' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertCircle className="w-3 h-3" /> Alpa
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                                  Belum Absen
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 max-w-[160px] truncate text-slate-600">
                              {attendance?.note || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {attendance ? (
                                attendance.verified ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    title={`Diverifikasi oleh ${attendance.verifiedBy || 'Admin'}`}
                                  >
                                    <ShieldCheck className="w-3 h-3" /> Terverifikasi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" /> Menunggu
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 SUBTAB 2: MONTHLY RECAP & ANALYTICS */}
      {activeSubTab === 'recap' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-display">
                Rekapitulasi Kehadiran Siswa Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-500">
                Agregat kehadiran seluruh {recapMeta?.activeStudents || activeStudents.length} siswa aktif Social-XI-B2
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Recap Summary Table */}
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">NISN</th>
                  <th className="py-3 px-3">Nama Lengkap</th>
                  <th className="py-3 px-3">Role Kelas</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Hadir</th>
                  <th className="py-3 px-3 text-center text-amber-700">Terlambat</th>
                  <th className="py-3 px-3 text-center text-blue-700">Izin</th>
                  <th className="py-3 px-3 text-center text-purple-700">Sakit</th>
                  <th className="py-3 px-3 text-center text-rose-700">Alpa</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recapData
                  .filter((r) =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.nisn.includes(searchQuery)
                  )
                  .map((row, idx) => {
                    const pct = row.attendancePercent ?? 100;
                    return (
                      <tr key={row.studentId || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{row.nisn}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.role || 'Siswa'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{row.hadir || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-600">{row.terlambat || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600">{row.izin || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-purple-600">{row.sakit || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600">{row.alpa || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">{row.total || 0}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`font-mono font-bold ${
                                pct >= 90
                                  ? 'text-emerald-600'
                                  : pct >= 75
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {pct}%
                            </span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 90
                                    ? 'bg-emerald-500'
                                    : pct >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
