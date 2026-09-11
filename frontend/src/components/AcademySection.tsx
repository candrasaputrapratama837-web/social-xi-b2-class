import React, { useState } from 'react';
import { ScheduleItem, StudentUser } from '../types';
import { Calendar, Award, BookOpen, ExternalLink, Trophy, PlusCircle, CheckCircle2, Search, Zap } from 'lucide-react';

interface AcademyProps {
  schedules: ScheduleItem[];
  students: StudentUser[];
  onAddXP: (studentId: string, amount: number) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AcademySection: React.FC<AcademyProps> = ({ schedules = [], students = [], onAddXP, addToast }) => {
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const safeStudents = Array.isArray(students) ? students : [];

  const [selectedDay, setSelectedDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState<string>('');
  const [taskNote, setTaskNote] = useState('');

  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat')[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const filteredSchedule = safeSchedules.filter((s) => s.day === selectedDay);

  const activeStudents = safeStudents.filter((s) => s.status !== 'INACTIVE');
  const topLeaderboard = [...activeStudents].sort((a, b) => b.xp - a.xp).slice(0, 10);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForTask) {
      addToast('error', 'Pilih nama siswa terlebih dahulu!');
      return;
    }
    try {
      setSubmittingTask(true);
      await onAddXP(selectedStudentForTask, 10);
      const student = safeStudents.find((s) => s._id === selectedStudentForTask);
      addToast('success', `🎉 Selamat ${student?.name || 'Siswa'}! Tugas berhasil dikumpulkan (+10 XP added)`);
      setTaskNote('');
      setSelectedStudentForTask('');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal mengirim tugas');
    } finally {
      setSubmittingTask(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
            Academy System XI-B2
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Jadwal Pelajaran & XP Leaderboard</h2>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Akses jadwal harian, unduh materi sosiologi & pelajaran lainnya, kumpulkan tugas untuk meraih +10 XP, serta bersaing secara sehat di Leaderboard Kelas!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* JADWAL PELAJARAN (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Jadwal Pelajaran Harian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih hari untuk melihat susunan jam pelajaran, pengajar, dan tautan materi.
              </p>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
              {days.map((d) => (
                <button
                  key={d}
                  id={`btn-day-${d}`}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDay === d
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule List */}
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Belum ada jadwal untuk hari {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchedule.map((item, idx) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.subject}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Guru: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.teacher}</span>
                        {item.room && ` • Ruang: ${item.room}`}
                      </p>
                      {item.notes && (
                        <span className="mt-1 inline-block text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md font-medium border border-amber-200 dark:border-amber-800">
                          Catatan: {item.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      {item.time}
                    </span>
                    {item.materialUrl ? (
                      <a
                        href={item.materialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Materi
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">
                        Materi di kelas
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* XP TASK SUBMITTER FORM */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              Simulasi Submit Tugas (+10 XP)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Kumpulkan catatan/tugas harianmu untuk mengumpulkan poin XP dan tingkatkan posisi di Leaderboard!
            </p>

            <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                id="select-student-task"
                value={selectedStudentForTask}
                onChange={(e) => setSelectedStudentForTask(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Nama Siswa --</option>
                {activeStudents.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.role}) - {s.xp} XP
                  </option>
                ))}
              </select>

              <input
                id="input-task-note"
                type="text"
                placeholder="Judul / Catatan Tugas (Misal: Sosiologi Bab 3)"
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />

              <button
                id="btn-submit-task"
                type="submit"
                disabled={submittingTask}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl p-2.5 text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Kirim Tugas (+10 XP)
              </button>
            </form>
          </div>
        </div>

        {/* LEADERBOARD (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Leaderboard XP Kelas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top siswa teraktif di kelas XI-B2 SMAN 1 Sandai
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              Real-time
            </span>
          </div>

          <div className="space-y-2.5">
            {topLeaderboard.map((student, rank) => {
              const isTop3 = rank < 3;
              const trophyColors = ['text-amber-400', 'text-slate-400', 'text-amber-600'];

              return (
                <div
                  key={student._id}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 border transition-all ${
                    rank === 0
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        isTop3
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {rank + 1}
                    </span>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                        {student.name}
                        {isTop3 && <Trophy className={`w-3.5 h-3.5 shrink-0 ${trophyColors[rank]}`} />}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {student.role}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-xl border border-emerald-300 dark:border-emerald-800 shrink-0">
                    {student.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
