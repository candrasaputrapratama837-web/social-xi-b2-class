import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  StudentUser,
  ScheduleItem,
  ConfessionItem,
  GalleryImage,
  CountdownEventItem,
  TaskSubmission
} from '../types';
import {
  Users,
  Calendar,
  Lock,
  ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  ShieldAlert,
  Upload,
  Clock,
  FileCheck,
  X,
  Award,
  Camera,
  UserCheck,
  KeyRound,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  students: StudentUser[];
  schedules: ScheduleItem[];
  confessions: ConfessionItem[];
  gallery: GalleryImage[];
  events: CountdownEventItem[];
  tasks?: TaskSubmission[];
  classPhotoUrl?: string;
  onUpdateClassPhoto?: (url: string) => void;
  onAddUser: (user: Partial<StudentUser>) => Promise<void>;
  onUpdateUser: (id: string, user: Partial<StudentUser>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onAddSchedule: (item: Partial<ScheduleItem>) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onApproveConfession: (id: string, approved: boolean) => Promise<void>;
  onDeleteConfession: (id: string) => Promise<void>;
  onAddGallery: (title: string, url: string, category: string) => Promise<void>;
  onDeleteGallery: (id: string) => Promise<void>;
  onAddEvent: (evt: Partial<CountdownEventItem>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onUpdateTaskStatus?: (id: string, payload: { status: 'Valid' | 'Ditolak' | 'Pending'; adminNote?: string; xpAwarded?: number; studentId?: string }) => Promise<void>;
  onDeleteTask?: (id: string) => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  schedules,
  confessions,
  gallery,
  events,
  tasks = [],
  classPhotoUrl,
  onUpdateClassPhoto,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddSchedule,
  onDeleteSchedule,
  onApproveConfession,
  onDeleteConfession,
  onAddGallery,
  onDeleteGallery,
  onAddEvent,
  onDeleteEvent,
  onUpdateTaskStatus,
  onDeleteTask,
  addToast,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeStudents = Array.isArray(students) ? students : [];
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const safeConfessions = Array.isArray(confessions) ? confessions : [];
  const safeGallery = Array.isArray(gallery) ? gallery : [];
  const safeEvents = Array.isArray(events) ? events : [];

  const [activeTab, setActiveTab] = useState<'users' | 'attendance' | 'tasks' | 'organisasi' | 'schedule' | 'confession' | 'gallery' | 'event' | 'admins' | 'audit'>('users');
  const [photoInput, setPhotoInput] = useState(classPhotoUrl || '');
  const [photoPreview, setPhotoPreview] = useState(classPhotoUrl || '');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [adminList, setAdminList] = useState<any[]>([]);
  const [maxAdmins, setMaxAdmins] = useState(2);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Attendance State
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [attendanceRecap, setAttendanceRecap] = useState<any[]>([]);
  const [attDateFilter, setAttDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [attStatusFilter, setAttStatusFilter] = useState<string>('ALL');
  const [attStudentId, setAttStudentId] = useState('');
  const [attStatus, setAttStatus] = useState<'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'>('Hadir');
  const [attNote, setAttNote] = useState('');

  const loadAttendanceData = async () => {
    try {
      const [list, recapRes] = await Promise.all([
        api.getAttendance(attDateFilter),
        api.getAttendanceRecap()
      ]);
      setAttendanceList(list || []);
      if (recapRes && recapRes.recap) {
        setAttendanceRecap(recapRes.recap || []);
      } else if (Array.isArray(recapRes)) {
        setAttendanceRecap(recapRes || []);
      }
    } catch (err) {
      console.warn('Failed to load attendance data:', err);
    }
  };

  // Fetch Audit Logs & Realtime Stats
  const loadAuditData = async () => {
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      const res = await fetch('/api/realtime/status');
      if (res.ok) {
        const stats = await res.json();
        setRealtimeStats(stats);
      }
    } catch (err) {
      console.warn('Failed to fetch audit data:', err);
    }
  };

  // Add User Form
  const [newName, setNewName] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newAgama, setNewAgama] = useState<'ISLAM' | 'KATHOLIK' | 'PROTESTAN' | 'HINDU' | 'BUDDHA'>('ISLAM');
  const [newRole, setNewRole] = useState('Siswa');
  const [newXp, setNewXp] = useState('0');
  const [newMotto, setNewMotto] = useState('');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [newStatusReason, setNewStatusReason] = useState('');

  // Edit User Modal State
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editAgama, setEditAgama] = useState<'ISLAM' | 'KATHOLIK' | 'PROTESTAN' | 'HINDU' | 'BUDDHA'>('ISLAM');
  const [editRole, setEditRole] = useState('Siswa');
  const [editXp, setEditXp] = useState(0);
  const [editMotto, setEditMotto] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editStatusReason, setEditStatusReason] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<StudentUser | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Schedule Form
  const [schDay, setSchDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin');
  const [schTime, setSchTime] = useState('08:00 - 09:30');
  const [schSubject, setSchSubject] = useState('');
  const [schTeacher, setSchTeacher] = useState('');
  const [schMaterial, setSchMaterial] = useState('');

  // Gallery Form (Real File Upload & URL)
  const [galTitle, setGalTitle] = useState('');
  const [galCat, setGalCat] = useState('Dokumentasi');
  const [galFilePreview, setGalFilePreview] = useState('');

  // Event Form
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtDesc, setEvtDesc] = useState('');

  // Load Admin Accounts
  const loadAdminAccounts = async () => {
    try {
      const data = await api.getAdmins();
      setAdminList(data.admins || []);
      setMaxAdmins(data.maxAdmins || 2);
    } catch (err: any) {
      console.warn('Failed to load admin accounts:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      loadAdminAccounts();
    } else if (activeTab === 'attendance') {
      loadAttendanceData();
    } else if (activeTab === 'audit') {
      loadAuditData();
    }
  }, [activeTab, attDateFilter]);

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminName || !newAdminPassword) {
      return addToast('error', 'Semua kolom admin wajib diisi!');
    }
    if (adminList.length >= maxAdmins) {
      return addToast('error', `Batas maksimal ${maxAdmins} akun admin telah tercapai!`);
    }
    try {
      await api.createAdmin({
        email: newAdminEmail,
        name: newAdminName,
        password: newAdminPassword
      });
      addToast('success', `Admin baru (${newAdminName}) berhasil didaftarkan!`);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPassword('');
      loadAdminAccounts();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNisn) return addToast('error', 'Nama dan NISN wajib diisi');
    try {
      await onAddUser({
        name: newName,
        nisn: newNisn,
        gender: newGender,
        agama: newAgama,
        role: newRole,
        xp: Number(newXp) || 0,
        motto: newMotto,
        status: newStatus,
        statusReason: newStatus === 'INACTIVE' ? newStatusReason : '',
      });
      addToast('success', 'Siswa baru berhasil ditambahkan!');
      setNewName('');
      setNewNisn('');
      setNewMotto('');
      setNewStatus('ACTIVE');
      setNewStatusReason('');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleOpenEditModal = (student: StudentUser) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditNisn(student.nisn);
    setEditGender(student.gender);
    setEditAgama(student.agama);
    setEditRole(student.role);
    setEditXp(student.xp);
    setEditMotto(student.motto || '');
    setEditPhoto(student.photo || '');
    setEditStatus(student.status || 'ACTIVE');
    setEditStatusReason(student.statusReason || '');
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await onUpdateUser(editingStudent._id, {
        name: editName,
        nisn: editNisn,
        gender: editGender,
        agama: editAgama,
        role: editRole,
        xp: Number(editXp),
        motto: editMotto,
        photo: editPhoto,
        status: editStatus,
        statusReason: editStatus === 'INACTIVE' ? editStatusReason : '',
      });
      addToast('success', `Data & status siswa ${editName} berhasil diperbarui!`);
      setEditingStudent(null);
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAdminSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attStudentId) {
      return addToast('error', 'Pilih siswa terlebih dahulu!');
    }
    const std = students.find(s => s._id === attStudentId);
    if (!std) return addToast('error', 'Siswa tidak valid');

    try {
      await api.submitAttendance({
        studentId: std._id,
        studentName: std.name,
        date: attDateFilter,
        status: attStatus,
        note: attNote,
      });
      addToast('success', `Presensi untuk ${std.name} (${attStatus}) berhasil disimpan!`);
      setAttNote('');
      loadAttendanceData();
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menyimpan presensi.');
    }
  };

  const handleVerifyAttendance = async (id: string, verified: boolean, status?: string) => {
    try {
      await api.verifyAttendance(id, { verified, status });
      addToast('success', 'Presensi berhasil diverifikasi!');
      loadAttendanceData();
    } catch (err: any) {
      addToast('error', err.message || 'Gagal memverifikasi presensi');
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm('Yakin ingin menghapus rekaman absensi ini?')) return;
    try {
      await api.deleteAttendance(id);
      addToast('success', 'Rekaman absensi berhasil dihapus.');
      loadAttendanceData();
    } catch (err: any) {
      addToast('error', err.message || 'Gagal menghapus presensi.');
    }
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galFilePreview) return addToast('error', 'Pilih atau unggah file foto terlebih dahulu!');
    try {
      await onAddGallery(galTitle || 'Foto Kegiatan XI-B2', galFilePreview, galCat);
      addToast('success', 'Foto berhasil diunggah ke galeri kelas!');
      setGalTitle('');
      setGalFilePreview('');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAddScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schSubject || !schTeacher) return addToast('error', 'Mata pelajaran dan Guru wajib diisi');
    try {
      await onAddSchedule({
        day: schDay,
        time: schTime,
        subject: schSubject,
        teacher: schTeacher,
        materialUrl: schMaterial,
      });
      addToast('success', 'Jadwal pelajaran berhasil ditambahkan!');
      setSchSubject('');
      setSchTeacher('');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDate) return addToast('error', 'Judul dan Tanggal event wajib diisi!');
    try {
      await onAddEvent({
        title: evtTitle,
        targetDate: new Date(evtDate).toISOString(),
        description: evtDesc,
        category: 'Agenda Kelas',
      });
      addToast('success', 'Event countdown berhasil diset!');
      setEvtTitle('');
      setEvtDesc('');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Admin */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 border border-amber-500/30 text-white rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Dashboard XI-B2</h2>
            <p className="text-xs text-amber-300 font-mono">Centralized Control System • SMAN 1 Sandai</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
          Pusat kendali admin: Kelola & edit data siswa, verifikasi kehadiran harian & tugas belajar, moderasi confession box, serta kelola akun admin & audit real-time.
        </p>

        {/* Admin Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-amber-500/20">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" /> Kelola & Edit Siswa ({students.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('attendance');
              loadAttendanceData();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" /> Presensi & Absensi Siswa
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Verifikasi Tugas ({safeTasks.filter(t => t.status === 'Pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('organisasi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'organisasi'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" /> Foto Kelas & Organisasi
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" /> Jadwal Pelajaran
          </button>
          <button
            onClick={() => setActiveTab('confession')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'confession'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" /> Confessions ({confessions.filter(c => !c.isApproved).length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Upload Galeri Real
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'event'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" /> Event Countdown
          </button>
          <button
            onClick={() => {
              setActiveTab('admins');
              loadAdminAccounts();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Akun Admin ({adminList.length}/{maxAdmins})
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              loadAuditData();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Audit & Realtime DB
          </button>
        </div>
      </div>

      {/* TAB 1: USER MANAGEMENT WITH EDIT SISWA */}
      {activeTab === 'organisasi' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Kelola Foto Bersama Kelas XI-B2
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Foto ini akan langsung dapat dilihat oleh seluruh siswa, pengunjung, maupun admin di halaman Organisasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 block">
                  1. Unggah Gambar dari Perangkat/Komputer:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = reader.result as string;
                        setPhotoPreview(base64);
                        setPhotoInput(base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 block">
                  2. Atau Masukkan URL Gambar Langsung:
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoInput}
                  onChange={(e) => {
                    setPhotoInput(e.target.value);
                    setPhotoPreview(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (photoInput && onUpdateClassPhoto) {
                    onUpdateClassPhoto(photoInput);
                    addToast('success', 'Foto Kelas berhasil diperbarui & disimpan!');
                  } else {
                    addToast('error', 'Masukkan foto terlebih dahulu!');
                  }
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                Simpan & Publikasikan Foto Kelas
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 block">Pratinjau Foto Kelas Aktif:</span>
              <div className="rounded-2xl overflow-hidden border border-slate-800 h-64 bg-slate-950 shadow-inner">
                {photoPreview || classPhotoUrl ? (
                  <img
                    src={photoPreview || classPhotoUrl}
                    alt="Class Photo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                    Belum ada foto dipilih
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT WITH EDIT SISWA */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-amber-400" />
              Tambah Siswa Baru
            </h3>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: AHMAD JUAN ALDIAN"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">NISN *</label>
                <input
                  type="text"
                  required
                  placeholder="0108365405"
                  value={newNisn}
                  onChange={(e) => setNewNisn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Agama</label>
                  <select
                    value={newAgama}
                    onChange={(e) => setNewAgama(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ISLAM">ISLAM</option>
                    <option value="KATHOLIK">KATHOLIK</option>
                    <option value="PROTESTAN">PROTESTAN</option>
                    <option value="HINDU">HINDU</option>
                    <option value="BUDDHA">BUDDHA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jabatan / Role Kelas</label>
                <input
                  type="text"
                  placeholder="Ketua / Wakil / Kasi / Siswa"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Keaktifan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVE">AKTIF (ACTIVE)</option>
                    <option value="INACTIVE">NONAKTIF (INACTIVE)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Poin XP Awal</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={(e) => setNewXp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {newStatus === 'INACTIVE' && (
                <div>
                  <label className="block font-semibold text-rose-400 mb-1">Alasan Nonaktif</label>
                  <input
                    type="text"
                    placeholder="Misal: Pindah sekolah / Mutasi / Cuti"
                    value={newStatusReason}
                    onChange={(e) => setNewStatusReason(e.target.value)}
                    className="w-full bg-slate-950 border border-rose-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                + Simpan Siswa Baru
              </button>
            </form>
          </div>

          {/* Table List of All Students with EDIT Button */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center justify-between">
              <span>Daftar Siswa XI-B2 ({students.length} Terdata A-Z)</span>
              <span className="text-xs font-normal text-amber-400">
                Aktif: {students.filter(s => s.status !== 'INACTIVE').length} • Nonaktif: {students.filter(s => s.status === 'INACTIVE').length}
              </span>
            </h3>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 font-bold uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">XP</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((s) => (
                  <tr key={s._id} className={`hover:bg-slate-800/40 transition-colors ${s.status === 'INACTIVE' ? 'opacity-60 bg-rose-950/10' : ''}`}>
                    <td className="p-3 font-bold text-white">
                      <div>{s.name}</div>
                      {s.statusReason && <div className="text-[10px] text-rose-400 font-normal italic">Ket: {s.statusReason}</div>}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{s.nisn}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                        s.status === 'INACTIVE'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-emerald-400">{s.role}</td>
                    <td className="p-3 font-extrabold text-amber-400">{s.xp} XP</td>
                    <td className="p-3 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Edit Siswa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT SISWA MODAL */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                  <Edit2 className="w-5 h-5" /> Edit Data & Status Siswa
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUserSubmit} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={editNisn}
                    onChange={(e) => setEditNisn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Status Keaktifan</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                        editStatus === 'INACTIVE' ? 'border-rose-500 text-rose-400 font-bold' : 'border-slate-800'
                      }`}
                    >
                      <option value="ACTIVE">AKTIF (ACTIVE)</option>
                      <option value="INACTIVE">NONAKTIF (INACTIVE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Poin XP</label>
                    <input
                      type="number"
                      value={editXp}
                      onChange={(e) => setEditXp(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {editStatus === 'INACTIVE' && (
                  <div>
                    <label className="block font-semibold text-rose-400 mb-1">Alasan Nonaktif</label>
                    <input
                      type="text"
                      placeholder="Alasan status nonaktif (Misal: Pindah sekolah)"
                      value={editStatusReason}
                      onChange={(e) => setEditStatusReason(e.target.value)}
                      className="w-full bg-slate-950 border border-rose-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as 'L' | 'P')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Agama</label>
                    <select
                      value={editAgama}
                      onChange={(e) => setEditAgama(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="ISLAM">ISLAM</option>
                      <option value="KATHOLIK">KATHOLIK</option>
                      <option value="PROTESTAN">PROTESTAN</option>
                      <option value="HINDU">HINDU</option>
                      <option value="BUDDHA">BUDDHA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jabatan / Role</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Motto Hidup</label>
                  <input
                    type="text"
                    value={editMotto}
                    onChange={(e) => setEditMotto(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Foto Profil Siswa</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditPhoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-2 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Atau tempel URL foto (https://...)"
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  {editPhoto && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={editPhoto} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-amber-500/50" />
                      <span className="text-[10px] text-amber-400 font-mono">Foto profil siap disimpan</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* DELETE SISWA CONFIRMATION MODAL */}
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 text-rose-400 font-bold text-base mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>Konfirmasi Hapus Siswa</div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Apakah Anda yakin ingin menghapus data siswa <strong className="text-white font-bold">{studentToDelete.name}</strong> (NISN: <span className="font-mono text-amber-400 font-bold">{studentToDelete.nisn}</span>)? Tindakan ini akan menghapus data siswa dari sistem database.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={() => setStudentToDelete(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeletingStudent}
                  onClick={async () => {
                    try {
                      setIsDeletingStudent(true);
                      await onDeleteUser(studentToDelete._id);
                      addToast('success', `Data siswa ${studentToDelete.name} berhasil dihapus.`);
                      setStudentToDelete(null);
                    } catch (err: any) {
                      addToast('error', err.message || 'Gagal menghapus data siswa.');
                    } finally {
                      setIsDeletingStudent(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isDeletingStudent ? 'Menghapus...' : 'Ya, Hapus Siswa'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TAB: ATTENDANCE / PRESENSI SISWA */}
      {activeTab === 'attendance' && (
        <div className="space-y-8">
          {/* Top Presensi Header & Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Presensi & Rekap Kehadiran Harian Siswa
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pantau kehadiran mandiri siswa, catat presensi kelas, verifikasi status (+10 XP Hadir / +5 XP Terlambat), dan rekapitulasi bulanan.
                </p>
              </div>

              {/* Date & Filter Picker */}
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Tanggal Absensi</label>
                  <input
                    type="date"
                    value={attDateFilter}
                    onChange={(e) => setAttDateFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Filter Status</label>
                  <select
                    value={attStatusFilter}
                    onChange={(e) => setAttStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ALL">Semua Status ({attendanceList.length})</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>

                <div className="self-end">
                  <button
                    onClick={loadAttendanceData}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">Hadir</span>
                <span className="text-xl font-black text-emerald-300">{attendanceList.filter(a => a.status === 'Hadir').length}</span>
              </div>
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">Terlambat</span>
                <span className="text-xl font-black text-amber-300">{attendanceList.filter(a => a.status === 'Terlambat').length}</span>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-blue-400 block font-bold">Izin</span>
                <span className="text-xl font-black text-blue-300">{attendanceList.filter(a => a.status === 'Izin').length}</span>
              </div>
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-3.5 text-center">
                <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">Sakit</span>
                <span className="text-xl font-black text-purple-300">{attendanceList.filter(a => a.status === 'Sakit').length}</span>
              </div>
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3.5 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">Alpa / Belum Absen</span>
                <span className="text-xl font-black text-rose-300">{attendanceList.filter(a => a.status === 'Alpa').length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Catat Presensi Admin */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
              <h4 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-amber-400" />
                Catat Presensi Siswa
              </h4>
              <form onSubmit={handleAdminSubmitAttendance} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pilih Siswa Aktif *</label>
                  <select
                    value={attStudentId}
                    onChange={(e) => setAttStudentId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.filter(s => s.status !== 'INACTIVE').map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Kehadiran *</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hadir">Hadir (+10 XP saat terverifikasi)</option>
                    <option value="Terlambat">Terlambat (+5 XP saat terverifikasi)</option>
                    <option value="Izin">Izin (Surat / Keterangan)</option>
                    <option value="Sakit">Sakit (Keterangan Medis)</option>
                    <option value="Alpa">Alpa (Tanpa Keterangan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Keterangan / Catatan</label>
                  <input
                    type="text"
                    placeholder="Misal: Hadir jam 06.45 WIB / Surat dokter terlampir"
                    value={attNote}
                    onChange={(e) => setAttNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  + Simpan Presensi
                </button>
              </form>
            </div>

            {/* Attendance Logs Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
              <h4 className="text-base font-extrabold text-white mb-4 flex items-center justify-between">
                <span>Daftar Log Presensi Tanggal: {attDateFilter}</span>
                <span className="text-xs font-normal text-amber-400">Total: {attendanceList.length} Rekaman</span>
              </h4>

              {attendanceList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Belum ada rekaman presensi pada tanggal {attDateFilter}. Siswa dapat mengisi mandiri atau admin mencatat secara langsung.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 font-bold uppercase text-[10px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Verifikasi</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {attendanceList
                      .filter(a => attStatusFilter === 'ALL' || a.status === attStatusFilter)
                      .map((att) => (
                        <tr key={att._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-white">
                            <div>{att.studentName}</div>
                            {att.note && <div className="text-[10px] text-slate-400 font-normal">{att.note}</div>}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {att.time ? att.time : (att.createdAt ? new Date(att.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                              att.status === 'Hadir'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : att.status === 'Terlambat'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : att.status === 'Izin'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : att.status === 'Sakit'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {att.verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                <Check className="w-3 h-3" /> Verified {att.xpAwarded ? `(+${att.xpAwarded} XP)` : ''}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyAttendance(att._id, true, att.status)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] shadow transition-all cursor-pointer"
                              >
                                Verifikasi (+XP)
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteAttendance(att._id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Log Absensi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* REKAPITULASI PRESENSI BULANAN */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-x-auto">
            <h4 className="text-base font-extrabold text-white mb-2 flex items-center justify-between">
              <span>Rekapitulasi Kehadiran Siswa Bulanan (Tahun Ajaran 2025/2026)</span>
              <span className="text-xs font-normal text-slate-400">Database Realtime</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Akumulasi kehadiran per siswa dari database sentral. Hanya siswa berstatus AKTIF yang dihitung dalam rekapitulasi.
            </p>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 font-bold uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NISN</th>
                  <th className="p-3 text-center text-emerald-400">Hadir</th>
                  <th className="p-3 text-center text-amber-400">Terlambat</th>
                  <th className="p-3 text-center text-blue-400">Izin</th>
                  <th className="p-3 text-center text-purple-400">Sakit</th>
                  <th className="p-3 text-center text-rose-400">Alpa</th>
                  <th className="p-3 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {attendanceRecap.map((r, idx) => {
                  const totalRecorded = r.hadir + r.terlambat + r.izin + r.sakit + r.alpa;
                  const percent = totalRecorded > 0 ? Math.round(((r.hadir + r.terlambat) / totalRecorded) * 100) : 100;
                  return (
                    <tr key={r.studentId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{r.name || r.studentName}</td>
                      <td className="p-3 font-mono text-slate-400">{r.nisn || '-'}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{r.hadir}</td>
                      <td className="p-3 text-center font-bold text-amber-400">{r.terlambat}</td>
                      <td className="p-3 text-center font-bold text-blue-400">{r.izin}</td>
                      <td className="p-3 text-center font-bold text-purple-400">{r.sakit}</td>
                      <td className="p-3 text-center font-bold text-rose-400">{r.alpa}</td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          percent >= 85 ? 'bg-emerald-500/10 text-emerald-400' : percent >= 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TASK VERIFICATION */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center justify-between">
            <span>Daftar Pengiriman Tugas Siswa ({safeTasks.length})</span>
          </h3>

          {safeTasks.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada tugas yang dikirimkan oleh siswa.</p>
          ) : (
            <div className="space-y-3">
              {safeTasks.map((t) => (
                <div
                  key={t._id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {t.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.status === 'Valid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.status === 'Ditolak'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-slate-400">Siswa: <strong className="text-slate-200">{t.studentName}</strong> • File: {t.fileName}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.fileUrl && (
                      <a
                        href={t.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold"
                      >
                        Lihat Berkas
                      </a>
                    )}
                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(t._id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONFESSION MODERATION */}
      {activeTab === 'confession' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" /> Moderasi Confession Box Anonim
          </h3>

          {confessions.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada confession di database.</p>
          ) : (
            <div className="space-y-3">
              {confessions.map((c) => (
                <div
                  key={c._id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    c.isApproved
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Untuk: {c.to}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {c.isApproved ? 'TERPUBLIKASI' : 'PENDING'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white">"{c.message}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!c.isApproved ? (
                      <button
                        onClick={() => onApproveConfession(c._id, true)}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => onApproveConfession(c._id, false)}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteConfession(c._id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GALLERY UPLOAD (REAL FILE) */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-base font-extrabold text-white mb-4">Upload Foto Galeri Fisik</h3>
            <form onSubmit={handleAddGallerySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Foto *</label>
                <input
                  type="text"
                  placeholder="Misal: Foto Bersama Pengurus Kelas"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Upload Berkas Foto (Real File Upload) *</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {galFilePreview ? (
                    <img src={galFilePreview} alt="Preview" className="h-32 object-contain mx-auto rounded-lg border border-slate-800" />
                  ) : (
                    <div className="space-y-1 py-2">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <span className="text-xs font-semibold text-slate-300 block">Klik / Seret Foto ke Sini</span>
                      <span className="text-[11px] text-slate-500 block">Format JPG/PNG (Maks 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Dokumentasi / Belajar / Kebersihan"
                  value={galCat}
                  onChange={(e) => setGalCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                + Simpan ke Galeri Kelas
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-4">Galeri Dokumentasi Kelas ({gallery.length})</h3>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((g) => (
                <div key={g._id} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={g.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80'} alt={g.title} className="w-full h-36 object-cover" />
                  <div className="p-3 bg-slate-900 flex justify-between items-center text-xs border-t border-slate-800">
                    <span className="font-bold text-white truncate">{g.title}</span>
                    <button onClick={() => onDeleteGallery(g._id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: JADWAL PELAJARAN */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <h3 className="text-base font-extrabold text-white mb-4">Tambah Jadwal Pelajaran</h3>
            <form onSubmit={handleAddScheduleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hari</label>
                <select
                  value={schDay}
                  onChange={(e) => setSchDay(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jam Pelajaran</label>
                <input
                  type="text"
                  placeholder="08:00 - 09:30"
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Sosiologi"
                  value={schSubject}
                  onChange={(e) => setSchSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  required
                  placeholder="Indra Setiawan, S.Pd."
                  value={schTeacher}
                  onChange={(e) => setSchTeacher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl hover:bg-amber-400 cursor-pointer"
              >
                + Simpan Jadwal
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-4">Jadwal Terdata ({schedules.length})</h3>
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s._id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-400">{s.day} ({s.time})</span>: <strong className="text-white">{s.subject}</strong> - {s.teacher}
                  </div>
                  <button onClick={() => onDeleteSchedule(s._id)} className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EVENT COUNTDOWN */}
      {activeTab === 'event' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-xl mx-auto">
          <h3 className="text-base font-extrabold text-white mb-4">Set Countdown Event Kelas</h3>
          <form onSubmit={handleAddEventSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Judul Agenda / Event</label>
              <input
                type="text"
                required
                placeholder="Penilaian Tengah Semester (PTS)"
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tanggal Target</label>
              <input
                type="datetime-local"
                required
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Deskripsi</label>
              <textarea
                rows={3}
                placeholder="Detail kegiatan..."
                value={evtDesc}
                onChange={(e) => setEvtDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl hover:bg-amber-400 cursor-pointer"
            >
              Set Event Countdown
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: ADMIN ACCOUNTS MANAGEMENT (MAX 2 STRICT ENFORCEMENT) */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                Registrasi Admin Baru
              </h3>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                adminList.length >= maxAdmins
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {adminList.length}/{maxAdmins} Terisi
              </span>
            </div>

            {adminList.length >= maxAdmins ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Kapasitas Admin Maksimal
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Sesuai kebijakan keamanan dan otorisasi kelas XI-B2, kuota administrator dibatasi ketat maksimum <strong>{maxAdmins} akun</strong> (Admin Utama & Wali Kelas).
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAdminSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap Admin</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Admin Pendamping XI-B2"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email Akun Admin</label>
                  <input
                    type="email"
                    required
                    placeholder="admin2@sman1sandai.sch.id"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Password rahasia..."
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl hover:bg-amber-400 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  + Daftarkan Admin ({adminList.length + 1}/{maxAdmins})
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Daftar Administrator Terverifikasi
              </span>
              <span className="text-xs font-mono font-normal text-slate-400">
                Single Source of Truth: Central Server DB
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Hanya akun terdaftar berikut yang memiliki hak akses mutasi database, verifikasi tugas siswa, moderasi, serta perombakan jadwal.
            </p>

            <div className="space-y-3">
              {adminList.map((adm, index) => (
                <div key={adm.id || index} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                      0{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {adm.name}
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {adm.role?.toUpperCase()}
                        </span>
                      </h4>
                      <p className="text-slate-400 font-mono mt-0.5">{adm.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif & Terotorisasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS & CENTRAL DATABASE HEALTH */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Status Realtime SSE Hub</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-black text-emerald-400">Online & Broadcasting</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                {realtimeStats?.stats?.total ?? 1} Connected Client(s)
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Central Database Version</span>
              <span className="text-xl font-black text-white">v{realtimeStats?.dbVersion ?? 1}</span>
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                ACID Transactions Active
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Total Audit Records</span>
              <span className="text-xl font-black text-amber-400">{auditLogs.length} Events</span>
              <button
                onClick={loadAuditData}
                className="text-[11px] text-blue-400 hover:underline mt-2 block font-bold cursor-pointer"
              >
                🔄 Refresh Audit Trail
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center justify-between">
              <span>📜 Real-Time Audit Trail (Single Source of Truth)</span>
              <span className="text-xs font-mono font-normal text-slate-400">Recorded directly from backend API transactions</span>
            </h3>

            <div className="overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-slate-700">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Belum ada aktivitas baru tercatat.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">{log.action}</td>
                        <td className="py-2.5 px-3 text-white">{log.actor}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
