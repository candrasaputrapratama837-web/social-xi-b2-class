import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from './services/api';
import { realtimeClient, ConnectionStatus, RealtimeEvent } from './services/realtime';
import {
  StudentUser,
  ScheduleItem,
  MoodSummary,
  CountdownEventItem,
  ConfessionItem,
  ForumPostItem,
  GalleryImage,
  TaskSubmission,
  RekapKasItem,
  AuthSession,
  UserAuthMode
} from './types';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { MoodTracker } from './components/MoodTracker';
import { CountdownEvent } from './components/CountdownEvent';
import { SiswaSection } from './components/SiswaSection';
import { OrganisasiSection } from './components/OrganisasiSection';
import { AcademySection } from './components/AcademySection';
import { AgoraRoom } from './components/AgoraRoom';
import { TaskSection } from './components/TaskSection';
import { RekapKasSection } from './components/RekapKasSection';
import { AbsensiSection } from './components/AbsensiSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';

import { Sparkles, Users, Award, Wallet, FileCheck, ShieldAlert, BookOpen, MessageSquare, Image, Compass, ArrowRight, ShieldCheck, Eye, Play, CheckCircle2, BarChart3, TrendingUp, Layers, Zap, Flame, Shield, UserCheck, Database, ExternalLink, X, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to dark mode for neon theme
  const [authSession, setAuthSession] = useState<AuthSession>(() => api.getSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [realtimeStatus, setRealtimeStatus] = useState<ConnectionStatus>('connecting');
  const [healthInfo, setHealthInfo] = useState<{ mode?: string; database?: string; atlasIpWhitelistGuide?: string } | null>(null);
  const [showAtlasGuideModal, setShowAtlasGuideModal] = useState<boolean>(false);

  // Data states
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [moodData, setMoodData] = useState<MoodSummary | null>(null);
  const [events, setEvents] = useState<CountdownEventItem[]>([]);
  const [confessions, setConfessions] = useState<ConfessionItem[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPostItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [tasks, setTasks] = useState<TaskSubmission[]>([]);
  const [rekapKas, setRekapKas] = useState<RekapKasItem[]>([]);
  const [classPhotoUrl, setClassPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80');

  const handleUpdateClassPhoto = async (newUrl: string) => {
    try {
      const updatedUrl = await api.updateClassPhoto(newUrl);
      setClassPhotoUrl(updatedUrl);
      localStorage.setItem('class_photo_url', updatedUrl);
      addToast('success', 'Foto Kelas & Organisasi telah diperbarui di database sentral!');
    } catch (err: any) {
      addToast('error', err.message || 'Gagal memperbarui foto kelas');
    }
  };

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Initial & Live Data from Central Database
  const fetchAllData = useCallback(async () => {
    try {
      const [
        stdData,
        schData,
        mSummary,
        evtData,
        cnfData,
        frmData,
        galData,
        tskData,
        kasData,
        photoData
      ] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getSchedule().catch(() => []),
        api.getMoodSummary().catch(() => null),
        api.getEvents().catch(() => []),
        api.getConfessions().catch(() => []),
        api.getForumPosts().catch(() => []),
        api.getGallery().catch(() => []),
        api.getTasks().catch(() => []),
        api.getRekapKas().catch(() => []),
        api.getClassPhoto().catch(() => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80')
      ]);

      setStudents(Array.isArray(stdData) ? stdData : []);
      setSchedules(Array.isArray(schData) ? schData : []);
      setMoodData(mSummary);
      setEvents(Array.isArray(evtData) ? evtData : []);
      setConfessions(Array.isArray(cnfData) ? cnfData : []);
      setForumPosts(Array.isArray(frmData) ? frmData : []);
      setGallery(Array.isArray(galData) ? galData : []);
      setTasks(Array.isArray(tskData) ? tskData : []);
      setRekapKas(Array.isArray(kasData) ? kasData : []);
      if (photoData) {
        setClassPhotoUrl(photoData);
      }

      // Fetch connection mode and status
      api.getHealth().then((h) => setHealthInfo(h)).catch(() => {});
    } catch (err) {
      console.error('Error loading data from central database:', err);
    }
  }, []);

  // REALTIME EVENT SUBSCRIPTION ENGINE
  useEffect(() => {
    // 1. Initial full fetch
    fetchAllData();

    // 2. Connect to Central SSE Real-time Hub
    realtimeClient.connect(authSession.token);

    // 3. Listen to connection status changes
    const unsubStatus = realtimeClient.onStatusChange((status) => {
      setRealtimeStatus(status);
    });

    // 4. Handle incoming real-time events across all devices & clients
    const unsubEvents = realtimeClient.subscribe((event: RealtimeEvent) => {
      const { eventType, payload } = event;

      if (eventType.startsWith('student.')) {
        api.getUsers().then((data) => setStudents(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('task.')) {
        api.getTasks().then((data) => setTasks(Array.isArray(data) ? data : [])).catch(console.error);
        api.getUsers().then((data) => setStudents(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('kas.')) {
        api.getRekapKas().then((data) => setRekapKas(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('schedule.')) {
        api.getSchedule().then((data) => setSchedules(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('gallery.')) {
        api.getGallery().then((data) => setGallery(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('confession.')) {
        api.getConfessions().then((data) => setConfessions(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('forum.')) {
        api.getForumPosts().then((data) => setForumPosts(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('event.')) {
        api.getEvents().then((data) => setEvents(Array.isArray(data) ? data : [])).catch(console.error);
      } else if (eventType.startsWith('mood.')) {
        api.getMoodSummary().then(setMoodData).catch(console.error);
      } else if (eventType === 'class.photo.updated' && payload?.classPhotoUrl) {
        setClassPhotoUrl(payload.classPhotoUrl);
      } else if (eventType === 'system.settings.updated') {
        if (payload?.classPhotoUrl) setClassPhotoUrl(payload.classPhotoUrl);
      }
    });

    const handleFocus = () => {
      fetchAllData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubStatus();
      unsubEvents();
      realtimeClient.disconnect();
      window.removeEventListener('focus', handleFocus);
    };
  }, [authSession.token, fetchAllData]);

  // Login Handlers
  const handleLogin = async (email: string, pass: string, role?: 'admin' | 'siswa') => {
    const session = await api.login(email, pass, role);
    setAuthSession(session);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    if (session.mode === 'admin') {
      setActiveTab('admin');
    }
    await fetchAllData();
  };

  const handleSelectPublicMode = () => {
    const session = api.setSession('public');
    setAuthSession(session);
    if (activeTab === 'admin') setActiveTab('dashboard');
  };

  const handleLogout = () => {
    const session = api.clearSession();
    setAuthSession(session);
    if (activeTab === 'admin') setActiveTab('dashboard');
    addToast('info', 'Anda telah keluar dari sesi.');
  };

  const handleVoteMood = async (emoji: '😃' | '😐' | '😡' | '😭') => {
    await api.voteMood(emoji);
    const updated = await api.getMoodSummary();
    setMoodData(updated);
  };

  const handleAddXP = async (studentId: string, amount: number) => {
    await api.updateXP(studentId, amount);
    confetti({ particleCount: 60, spread: 60 });
    const updatedStudents = await api.getUsers();
    setStudents(updatedStudents);
  };

  // Task Handlers
  const handleCreateTask = async (task: any) => {
    await api.createTask(task);
    const updated = await api.getTasks();
    setTasks(Array.isArray(updated) ? updated : []);
  };

  const handleUpdateTaskStatus = async (
    id: string,
    payload: { status: 'Valid' | 'Ditolak' | 'Pending'; adminNote?: string; xpAwarded?: number; studentId?: string }
  ) => {
    await api.updateTaskStatus(id, payload);
    const updatedTasks = await api.getTasks();
    setTasks(Array.isArray(updatedTasks) ? updatedTasks : []);
    const updatedStudents = await api.getUsers();
    setStudents(Array.isArray(updatedStudents) ? updatedStudents : []);
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    const updated = await api.getTasks();
    setTasks(Array.isArray(updated) ? updated : []);
  };

  // Rekap Kas Handlers
  const handleAddKas = async (kas: Partial<RekapKasItem>) => {
    await api.addRekapKas(kas);
    const updated = await api.getRekapKas();
    setRekapKas(Array.isArray(updated) ? updated : []);
  };

  const handleDeleteKas = async (id: string) => {
    await api.deleteRekapKas(id);
    const updated = await api.getRekapKas();
    setRekapKas(Array.isArray(updated) ? updated : []);
  };

  // Admin Actions
  const handleAddUser = async (user: Partial<StudentUser>) => {
    await api.addUser(user);
    setStudents(await api.getUsers());
  };

  const handleUpdateUser = async (id: string, user: Partial<StudentUser>) => {
    await api.updateUser(id, user);
    setStudents(await api.getUsers());
  };

  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    setStudents(await api.getUsers());
  };

  const handleAddSchedule = async (item: Partial<ScheduleItem>) => {
    await api.addSchedule(item);
    setSchedules(await api.getSchedule());
  };

  const handleDeleteSchedule = async (id: string) => {
    await api.deleteSchedule(id);
    setSchedules(await api.getSchedule());
  };

  const handleApproveConfession = async (id: string, approved: boolean) => {
    await api.approveConfession(id, approved);
    setConfessions(await api.getConfessions());
  };

  const handleDeleteConfession = async (id: string) => {
    await api.deleteConfession(id);
    setConfessions(await api.getConfessions());
  };

  const handleSendConfession = async (to: string, message: string) => {
    await api.sendConfession(to, message);
    setConfessions(await api.getConfessions());
  };

  const handleAddForumPost = async (authorName: string, title: string, content: string, category: string) => {
    await api.createForumPost(authorName, title, content, category);
    setForumPosts(await api.getForumPosts());
  };

  const handleAddForumComment = async (postId: string, authorName: string, text: string) => {
    await api.addForumComment(postId, authorName, text);
    setForumPosts(await api.getForumPosts());
  };

  const handleLikeForumPost = async (postId: string) => {
    await api.likeForumPost(postId);
    setForumPosts(await api.getForumPosts());
  };

  const handleAddGallery = async (title: string, imageUrl: string, category: string) => {
    await api.addGalleryImage(title, imageUrl, category, 'Admin XI-B2');
    setGallery(await api.getGallery());
  };

  const handleDeleteGallery = async (id: string) => {
    await api.deleteGalleryImage(id);
    setGallery(await api.getGallery());
  };

  const handleAddEvent = async (evt: Partial<CountdownEventItem>) => {
    await api.addEvent(evt);
    setEvents(await api.getEvents());
  };

  const handleDeleteEvent = async (id: string) => {
    await api.deleteEvent(id);
    setEvents(await api.getEvents());
  };

  const safeStudents = Array.isArray(students) ? students : [];
  const topStudent = [...safeStudents].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0] || { name: 'FIZA', xp: 250 };
  const safeRekapKas = Array.isArray(rekapKas) ? rekapKas : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeConfessions = Array.isArray(confessions) ? confessions : [];
  const safeForumPosts = Array.isArray(forumPosts) ? forumPosts : [];
  const safeGallery = Array.isArray(gallery) ? gallery : [];
  const totalKasPemasukan = safeRekapKas.reduce((acc, curr) => acc + (curr?.totalKas || curr?.amountPaid || 0), 0);
  const totalKasPengeluaran = safeRekapKas.reduce((acc, curr) => acc + (curr?.pengeluaran || 0), 0);
  const saldoKasSekarang = totalKasPemasukan - totalKasPengeluaran;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors flex flex-col font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        authSession={authSession}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        realtimeStatus={realtimeStatus}
      />

      {/* Standalone In-Memory Notice & Atlas Setup Guide */}
      {healthInfo && healthInfo.mode === 'in-memory-autonomous' && (
        <div className="bg-slate-900 border-b border-indigo-500/20 px-3 sm:px-6 py-2 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-200">
                <strong className="text-emerald-400 font-semibold">Mode Mandiri Aktif:</strong> 33 Siswa XI-B2 & seluruh fitur akademik berjalan lancar.
              </span>
            </div>
            <button
              onClick={() => setShowAtlasGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 hover:text-indigo-200 border border-indigo-700/50 transition-colors cursor-pointer font-medium"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sinkronkan MongoDB Atlas Cloud</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. MAIN DASHBOARD VIEW (SHOPWAVE SAAS STYLE LANDING PAGE) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            {/* 🔹 1. HERO SECTION (SHOPWAVE STYLE 2-COLUMN) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                {/* Left Content Column */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  {/* Top Pill Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold rounded-full uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Backed by SMAN 1 Sandai • XI-B2
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
                    Streamline Class,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                      Maximize Growth
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-body">
                    Kendalikan seluruh aktivitas akademik, transparansi rekap kas, evaluasi tugas, dan interaksi sosial kelas XI-B2 SMAN 1 Sandai melalui dashboard terpadu.
                  </p>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Wali Kelas: <strong className="text-white font-bold">Indra Setiawan, S.Pd.</strong> • 33 Siswa Aktif
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      Presensi Mandiri Siswa
                    </button>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer hover:border-slate-500 active:scale-95"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Masuk Portal
                    </button>
                    <button
                      onClick={() => setActiveTab('agora')}
                      className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-800 transition-all flex items-center gap-2 cursor-pointer hover:border-slate-600 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                      Agora Room
                    </button>
                  </div>
                </div>

                {/* Right Interactive Mockup Column (ShopWave Inspired Stack) */}
                <div className="lg:col-span-5 relative">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
                    {/* Floating Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span className="text-xs font-mono text-slate-400 font-semibold ml-2">xi-b2-dashboard</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        LIVE REPOSITORI
                      </span>
                    </div>

                    {/* Metric Card 1: Top XP Student */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black">
                          🏆
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Top Keaktifan XP</span>
                          <span className="text-sm font-bold text-white block">{topStudent.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-blue-400">{topStudent.xp} XP</span>
                        <span className="text-[10px] text-emerald-400 block font-mono">Rank #1 Kelas</span>
                      </div>
                    </div>

                    {/* Metric Card 2: Saldo Kas Status */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Saldo Kas Terkumpul</span>
                          <span className="text-sm font-bold text-white block">Rp {saldoKasSekarang.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Audit Bendahara
                      </span>
                    </div>

                    {/* Metric Card 3: Evaluasi Tugas Valid */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:border-purple-500/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Tugas Terverifikasi</span>
                          <span className="text-sm font-bold text-white block">{safeTasks.filter(t => t.status === 'Valid').length} Tugas Selesai</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        Valid
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔹 2. TRUSTED BY / CLASS LOGO BAR (ShopWave Style) */}
            <div className="py-6 border-y border-slate-200 text-center space-y-4">
              <p className="text-xs text-slate-600 font-mono font-bold uppercase tracking-widest">
                Dipercaya oleh Wali Kelas & 33 Siswa Kelas Social XI-B2 SMAN 1 Sandai
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 font-black text-sm tracking-widest text-slate-700">
                <span className="hover:text-blue-600 transition-colors cursor-default">SMAN 1 SANDAI</span>
                <span className="hover:text-emerald-600 transition-colors cursor-default">SOCIAL XI-B2</span>
                <span className="hover:text-amber-600 transition-colors cursor-default">EKRAF KELAS</span>
                <span className="hover:text-indigo-600 transition-colors cursor-default">AKADEMIK DARING</span>
                <span className="hover:text-purple-600 transition-colors cursor-default">SARPRAS MANDIRI</span>
              </div>
            </div>

            {/* 🔹 3. "WHAT SETS US APART" FEATURE GRID (ShopWave Style) */}
            <div className="space-y-8 text-center pt-4">
              <div className="max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 block">
                  SYSTEM CAPABILITIES
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  What Sets Us Apart
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Jelajahi fitur-fitur yang membuat pengelolaan kelas XI-B2 menjadi lebih cerdas, modern, dan transparan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* Feature 1 */}
                <div
                  onClick={() => setActiveTab('academy')}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all cursor-pointer group space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors">
                      Customizable Views
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Jadwal pelajaran harian terorganisir, materi pembelajaran, serta sistem penyerahan tugas sekolah.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:underline pt-2">
                    Buka Akademik <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Feature 2 */}
                <div
                  onClick={() => setActiveTab('siswa')}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all cursor-pointer group space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                      Real-Time Analytics
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Statistik keaktifan siswa, akumulasi poin XP gamifikasi, serta pemetaan sosiogram jaringan kelas.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:underline pt-2">
                    Lihat Data Siswa <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Feature 3 */}
                <div
                  onClick={() => setActiveTab('agora')}
                  className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 transition-all cursor-pointer group space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-white group-hover:text-orange-400 transition-colors">
                      Multi-Channel Insights
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Confession Box rahasia terfilter, forum diskusi agora room, serta sarana komunikasi antarsiswa.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:underline pt-2">
                    Masuk Agora <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Feature 4 */}
                <div
                  onClick={() => setActiveTab('kas')}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all cursor-pointer group space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors">
                      Financial Transparency
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Laporan saldo kas bulanan terbuka dan pembuktian nota fisik foto buku kas yang akuntabel.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:underline pt-2">
                    Audit Kas Kelas <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* 🔹 4. INTERACTIVE CLASSROOM HUB (MOOD & COUNTDOWN) */}
            <div className="space-y-8 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-black text-xl text-slate-900 tracking-wider uppercase">
                    INTERACTIVE CLASSROOM HUB
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Monitor mood harian siswa dan hitung mundur agenda kegiatan kelas.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-mono font-bold rounded-lg hidden sm:block">
                  LIVE UPDATES
                </span>
              </div>

              {/* Interactive Hub Grid (2 Columns: Mood Tracker & Event Countdown) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mood Tracker */}
                <MoodTracker moodData={moodData} onVote={handleVoteMood} addToast={addToast} />

                {/* Event Countdown */}
                <CountdownEvent events={events} />
              </div>

              {/* Classroom Organization Chart */}
              <OrganisasiSection
                authMode={authSession.mode}
                classPhotoUrl={classPhotoUrl}
                onUpdateClassPhoto={handleUpdateClassPhoto}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* 2. STRUKTUR ORGANISASI VIEW */}
        {activeTab === 'organisasi' && (
          <OrganisasiSection
            authMode={authSession.mode}
            classPhotoUrl={classPhotoUrl}
            onUpdateClassPhoto={handleUpdateClassPhoto}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* 2. PRESENSI & ABSENSI SISWA VIEW */}
        {activeTab === 'attendance' && (
          <AbsensiSection
            students={safeStudents}
            authSession={authSession}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            addToast={addToast}
          />
        )}

        {/* 3. DATA SISWA VIEW */}
        {activeTab === 'siswa' && (
          <SiswaSection
            students={safeStudents}
            authMode={authSession.mode}
            onEditStudent={(std) => {
              setActiveTab('admin');
            }}
            onDeleteStudent={handleDeleteUser}
          />
        )}

        {/* 4. ACADEMY SYSTEM VIEW */}
        {activeTab === 'academy' && (
          <AcademySection
            schedules={safeSchedules}
            students={safeStudents}
            onAddXP={handleAddXP}
            addToast={addToast}
          />
        )}

        {/* 5. AGORA ROOM VIEW */}
        {activeTab === 'agora' && (
          <AgoraRoom
            forumPosts={safeForumPosts}
            confessions={safeConfessions}
            students={safeStudents}
            edges={[]}
            onAddForumPost={handleAddForumPost}
            onAddForumComment={handleAddForumComment}
            onLikeForumPost={handleLikeForumPost}
            onSendConfession={handleSendConfession}
            addToast={addToast}
          />
        )}

        {/* 6. TUGAS KELAS VIEW */}
        {activeTab === 'tasks' && (
          <TaskSection
            students={safeStudents}
            tasks={safeTasks}
            authMode={authSession.mode}
            onSubmitTask={handleCreateTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            showToast={(msg, type) => addToast(type, msg)}
          />
        )}

        {/* 7. REKAP KAS VIEW */}
        {activeTab === 'kas' && (
          <RekapKasSection
            kasList={safeRekapKas}
            authMode={authSession.mode}
            onAddKas={handleAddKas}
            onDeleteKas={handleDeleteKas}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            showToast={(msg, type) => addToast(type, msg)}
          />
        )}

        {/* 8. ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin' && authSession.mode === 'admin' && (
          <AdminDashboard
            students={safeStudents}
            schedules={safeSchedules}
            confessions={safeConfessions}
            gallery={safeGallery}
            events={safeEvents}
            tasks={safeTasks}
            classPhotoUrl={classPhotoUrl}
            onUpdateClassPhoto={handleUpdateClassPhoto}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onApproveConfession={handleApproveConfession}
            onDeleteConfession={handleDeleteConfession}
            onAddGallery={handleAddGallery}
            onDeleteGallery={handleDeleteGallery}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            addToast={addToast}
          />
        )}
      </main>

      {/* Admin / Siswa / Public Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSelectPublicMode={handleSelectPublicMode}
        addToast={addToast}
      />

      {/* 🔹 6. FOOTER (4 KOLOM DENGAN NAVIGASI DAN INFORMASI KELAS) */}
      <Footer onSelectTab={setActiveTab} onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* MongoDB Atlas IP Whitelist Guide Modal */}
      {showAtlasGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAtlasGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Panduan Sinkronisasi MongoDB Atlas</h3>
                <p className="text-xs text-slate-400">Cara mengizinkan akses IP Cloud Run ke Cluster Atlas</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <p className="font-semibold text-emerald-400">Mengapa aplikasi saat ini menggunakan mode data lokal?</p>
                <p className="text-slate-400 leading-relaxed">
                  Layanan cloud hosting memiliki IP keluar (egress) yang berubah-ubah. MongoDB Atlas secara default menolak IP yang belum didaftarkan pada whitelist firewall.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
                <li>
                  Buka dashboard <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">MongoDB Atlas <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li>
                  Di menu sebelah kiri (bawah <strong>Security</strong>), klik <strong>Network Access</strong>.
                </li>
                <li>
                  Klik tombol hijau <strong>+ Add IP Address</strong>.
                </li>
                <li>
                  Pilih tombol <strong>Allow Access from Anywhere</strong> (akan terisi IP <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">0.0.0.0/0</code>).
                </li>
                <li>
                  Klik <strong>Confirm</strong>. Tunggu ~30 detik hingga status menjadi <em>Active</em>.
                </li>
              </ol>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-300 text-[11px] leading-relaxed">
                  Server kami secara otomatis melakukan auto-reconnect setiap 60 detik. Begitu IP diizinkan di Atlas, sistem akan otomatis terhubung ke cloud MongoDB tanpa perlu me-restart server!
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAtlasGuideModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
