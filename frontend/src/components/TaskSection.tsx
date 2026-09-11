import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCheck, FileUp, CheckCircle, XCircle, Clock, Award, Upload, Lock, FileText, Trash2, Check, X, Filter } from 'lucide-react';
import { TaskSubmission, StudentUser, UserAuthMode } from '../types';

interface TaskSectionProps {
  tasks: TaskSubmission[];
  students: StudentUser[];
  authMode: UserAuthMode;
  onSubmitTask: (task: {
    studentId: string;
    studentName: string;
    title: string;
    subject: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }) => Promise<void>;
  onUpdateStatus: (id: string, payload: { status: 'Valid' | 'Ditolak' | 'Pending'; adminNote?: string; xpAwarded?: number; studentId?: string }) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onOpenLoginModal: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  tasks = [],
  students = [],
  authMode,
  onSubmitTask,
  onUpdateStatus,
  onDeleteTask,
  onOpenLoginModal,
  showToast,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Sosiologi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileData, setFileData] = useState<{ url: string; name: string; type: string } | null>(null);

  // Admin approval modal
  const [activeTaskToReview, setActiveTaskToReview] = useState<TaskSubmission | null>(null);
  const [adminXp, setAdminXp] = useState(20);
  const [adminNote, setAdminNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Valid' | 'Ditolak'>('All');

  const subjectsList = ['Sosiologi', 'Geografi', 'Bahasa Indonesia', 'Matematika', 'Sejarah', 'Ekonomi', 'PPKn', 'PJOK', 'Seni Budaya', 'Lainnya'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Ukuran file maksimal 15MB', 'error');
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType = 'other';
      if (['pdf'].includes(ext)) fileType = 'pdf';
      else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
      else if (['ppt', 'pptx'].includes(ext)) fileType = 'pptx';
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) fileType = 'image';
      else if (['mp4', 'mov', 'avi'].includes(ext)) fileType = 'video';

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          url: reader.result as string,
          name: file.name,
          type: fileType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Pilih nama siswa pengirim tugas!', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Judul tugas tidak boleh kosong!', 'error');
      return;
    }
    if (!fileData) {
      showToast('Harap pilih berkas tugas (PDF/DOCX/Foto/Video)!', 'error');
      return;
    }

    const studentObj = safeStudents.find((s) => s._id === selectedStudentId);
    try {
      setIsSubmitting(true);
      await onSubmitTask({
        studentId: selectedStudentId,
        studentName: studentObj ? studentObj.name : 'Siswa XI-B2',
        title: title.trim(),
        subject,
        fileUrl: fileData.url,
        fileName: fileData.name,
        fileType: fileData.type,
      });
      showToast('Tugas berhasil dikirim! Menunggu verifikasi admin.', 'success');
      setShowSubmitModal(false);
      setTitle('');
      setFileData(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim tugas', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (task: TaskSubmission, isApproved: boolean) => {
    try {
      if (isApproved) {
        await onUpdateStatus(task._id, {
          status: 'Valid',
          adminNote: adminNote || `Tugas disetujui (+${adminXp} XP)`,
          xpAwarded: Number(adminXp),
          studentId: task.studentId,
        });
        showToast(`Tugas disetujui! +${adminXp} XP diberikan ke ${task.studentName}`, 'success');
      } else {
        await onUpdateStatus(task._id, {
          status: 'Ditolak',
          adminNote: adminNote || 'Tugas ditolak. Silakan perbaiki dan unggah ulang.',
          xpAwarded: 0,
        });
        showToast('Tugas telah ditolak.', 'info');
      }
      setActiveTaskToReview(null);
      setAdminNote('');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status tugas', 'error');
    }
  };

  const filteredTasks = safeTasks.filter((t) => {
    if (filterStatus === 'All') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5" /> Portal Tugas & XP Kelas
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Sistem Pengumpulan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400">Tugas XI-B2</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Kirimkan tugas harian/kelompok dalam format PDF, DOCX, PPTX, foto, atau video. Kumpulkan XP dan raih peringkat teratas leaderboard kelas!
            </p>
          </div>

          {authMode !== 'public' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <FileUp className="w-5 h-5" /> Kirim Tugas Baru
            </button>
          )}
        </div>
      </div>

      {/* Lock Notice for Public Mode */}
      {authMode === 'public' && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 backdrop-blur-xl shadow-xl">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Ingin Mengirimkan Tugas?</h3>
            <p className="text-sm text-slate-400">
              Silakan login sebagai <span className="text-blue-400 font-semibold">Siswa XI-B2</span> atau <span className="text-emerald-400 font-semibold">Admin</span> untuk mengunggah tugas dan memperoleh poin XP.
            </p>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> Login Sekarang
          </button>
        </div>
      )}

      {/* Filters & Task List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Daftar Pengiriman Tugas ({safeTasks.length})
          </h3>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {(['All', 'Pending', 'Valid', 'Ditolak'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'All' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-medium text-slate-300">Belum ada tugas dalam kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
                      {task.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.status === 'Pending' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {task.status === 'Valid' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Valid (+{task.xpAwarded || 20} XP)
                        </span>
                      )}
                      {task.status === 'Ditolak' && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Ditolak
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-base line-clamp-2">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Oleh: <span className="text-slate-200 font-semibold">{task.studentName}</span>
                    </p>
                  </div>

                  {/* Attachment File Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium truncate">{task.fileName}</span>
                    </div>
                    {task.fileUrl && (
                      <a
                        href={task.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors shrink-0"
                      >
                        Buka
                      </a>
                    )}
                  </div>

                  {task.adminNote && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300 block mb-0.5">Catatan Admin:</span>
                      {task.adminNote}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {new Date(task.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {authMode === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setActiveTaskToReview(task);
                            setAdminNote(task.adminNote || '');
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus kiriman tugas ini?')) onDeleteTask(task._id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Task Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-blue-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-lg">
                  <FileUp className="w-5 h-5" /> Form Kirim Tugas Siswa
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitTask} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Nama Siswa Pengirim *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Nama Siswa XI-B2 --</option>
                    {safeStudents.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Mata Pelajaran *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {subjectsList.map((sb) => (
                      <option key={sb} value={sb}>
                        {sb}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Judul Tugas *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Makalah Interaksi Sosial Sosiologi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Unggah Berkas File (PDF, DOCX, PPTX, Foto, Video) *
                  </label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition-colors relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {fileData ? (
                      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 font-semibold text-xs">
                        ✓ {fileData.name} ({fileData.type.toUpperCase()})
                      </div>
                    ) : (
                      <div className="space-y-1 py-2">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                        <span className="text-xs font-semibold text-slate-300 block">Klik atau Seret File Tugas ke Sini</span>
                        <span className="text-[11px] text-slate-500 block">PDF, DOCX, PPTX, Foto atau Video (Maks 15MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirimkan Tugas'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Review / Approval Modal */}
      <AnimatePresence>
        {activeTaskToReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <Award className="w-5 h-5" /> Verifikasi & Hadiah XP Admin
                </div>
                <button
                  onClick={() => setActiveTaskToReview(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <p className="text-slate-400">
                  Pengirim: <strong className="text-white">{activeTaskToReview.studentName}</strong>
                </p>
                <p className="text-slate-400">
                  Judul: <strong className="text-white">{activeTaskToReview.title}</strong>
                </p>
                <p className="text-slate-400">
                  Mapel: <strong className="text-blue-400">{activeTaskToReview.subject}</strong>
                </p>
                {activeTaskToReview.fileUrl && (
                  <a
                    href={activeTaskToReview.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 font-semibold hover:underline pt-1"
                  >
                    <FileText className="w-4 h-4" /> Unduh / Periksa File Lampiran
                  </a>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bonus XP Diberikan (jika Valid)
                  </label>
                  <input
                    type="number"
                    value={adminXp}
                    onChange={(e) => setAdminXp(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Catatan Refleksi / Alasan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Tugas sangat rapi dan tepat waktu!"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleApprove(activeTaskToReview, false)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Tolak Tugas
                </button>
                <button
                  onClick={() => handleApprove(activeTaskToReview, true)}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Setujui & Tambah XP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
