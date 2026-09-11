import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ACTIVE_BRANCH_ID, StudentStatus, MAX_ADMIN_ACCOUNTS } from '../config/constants';

export interface InMemoryStoreData {
  branch: any;
  admins: any[];
  students: any[];
  schedules: any[];
  events: any[];
  tasks: any[];
  attendance: any[];
  cash: any[];
  gallery: any[];
  forumPosts: any[];
  confessions: any[];
  mood: { count: number; votes: Record<string, number> };
  settings: any;
  auditLogs: any[];
}

class InMemoryStore {
  private data: InMemoryStoreData;
  private initialized = false;

  constructor() {
    this.data = {
      branch: {
        branchId: ACTIVE_BRANCH_ID,
        tenantId: 'sman1sandai',
        className: 'XI-B2',
        schoolName: 'SMAN 1 Sandai',
        waliKelas: 'Guru Pembimbing XI-B2',
        classPhotoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        classLogoUrl: '',
        maxAdmins: MAX_ADMIN_ACCOUNTS,
      },
      admins: [
        {
          id: 'adm-1',
          _id: 'adm-1',
          email: 'Adminkelas@gmail.com',
          name: 'Admin Utama XI-B2',
          role: 'admin',
          passwordHash: 'Admin',
          branchId: ACTIVE_BRANCH_ID,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'adm-2',
          _id: 'adm-2',
          email: 'wali.indra@sman1sandai.sch.id',
          name: 'Indra Setiawan, S.Pd. (Wali Kelas)',
          role: 'admin',
          passwordHash: 'WaliKelas2026',
          branchId: ACTIVE_BRANCH_ID,
          createdAt: new Date().toISOString(),
        }
      ],
      students: [],
      schedules: [],
      events: [],
      tasks: [],
      attendance: [],
      cash: [],
      gallery: [],
      forumPosts: [],
      confessions: [],
      mood: {
        count: 0,
        votes: { '😃': 0, '😐': 0, '😡': 0, '😭': 0 }
      },
      settings: {
        branchId: ACTIVE_BRANCH_ID,
        className: 'XI-B2',
        schoolName: 'SMAN 1 Sandai',
        classPhotoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        classLogoUrl: '',
        waliKelas: 'Guru Pembimbing XI-B2',
        isAttendanceOpen: true,
      },
      auditLogs: []
    };

    this.loadInitialSeeds();
  }

  public loadInitialSeeds() {
    if (this.initialized) return;

    try {
      let currentDir = '';
      try {
        currentDir = path.dirname(fileURLToPath(import.meta.url));
      } catch {
        currentDir = process.cwd();
      }

      const seedPaths = [
        path.resolve(process.cwd(), 'database/seeds/initial_data.json'),
        path.resolve(currentDir, '../../../database/seeds/initial_data.json'),
        path.resolve(currentDir, '../../database/seeds/initial_data.json'),
      ];

      let seedJson: any = null;
      for (const p of seedPaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          seedJson = JSON.parse(raw);
          break;
        }
      }

      if (seedJson) {
        if (seedJson.branch) this.data.branch = { ...this.data.branch, ...seedJson.branch };
        if (Array.isArray(seedJson.admins) && seedJson.admins.length > 0) {
          this.data.admins = seedJson.admins.map((a: any) => ({
            ...a,
            _id: a.id || a._id,
            role: 'admin',
            branchId: a.branchId || ACTIVE_BRANCH_ID
          }));
        }
        if (Array.isArray(seedJson.students) && seedJson.students.length > 0) {
          this.data.students = seedJson.students.map((s: any) => ({
            ...s,
            _id: s._id || s.id,
            branchId: s.branchId || ACTIVE_BRANCH_ID,
            status: s.status || StudentStatus.ACTIVE,
            xp: s.xp || 0,
          }));
        }
        if (Array.isArray(seedJson.schedules) && seedJson.schedules.length > 0) {
          this.data.schedules = seedJson.schedules.map((sc: any) => ({
            ...sc,
            _id: sc._id || `sch-${Date.now()}-${Math.random()}`,
            branchId: sc.branchId || ACTIVE_BRANCH_ID
          }));
        }
        if (Array.isArray(seedJson.events) && seedJson.events.length > 0) {
          this.data.events = seedJson.events.map((ev: any) => ({
            ...ev,
            _id: ev._id || `evt-${Date.now()}-${Math.random()}`,
            branchId: ev.branchId || ACTIVE_BRANCH_ID
          }));
        }
        console.info(`[STORE] In-Memory seed store populated with ${this.data.students.length} students, ${this.data.schedules.length} schedules, ${this.data.events.length} events, ${this.data.admins.length} admins.`);
      }
    } catch (err) {
      console.warn('[STORE] Could not load initial_data.json into in-memory store:', err);
    }

    this.initialized = true;
  }

  // --- Students ---
  getStudents(branchId?: string, statusFilter?: string) {
    return this.data.students.filter((s) => {
      if (branchId && s.branchId !== branchId) return false;
      if (statusFilter && statusFilter !== 'ALL') return s.status === statusFilter;
      if (!statusFilter) return s.status !== StudentStatus.INACTIVE;
      return true;
    });
  }

  getStudentById(id: string, branchId?: string) {
    return this.data.students.find((s) => s._id === id && (!branchId || s.branchId === branchId)) || null;
  }

  getStudentByNisn(nisn: string, branchId?: string) {
    return this.data.students.find((s) => s.nisn === nisn && (!branchId || s.branchId === branchId)) || null;
  }

  getStudentByNisnOrName(query: string, branchId?: string) {
    const lowerQuery = query.toLowerCase();
    return this.data.students.find((s) => 
      (s.nisn === query || s.name.toLowerCase() === lowerQuery) && 
      (!branchId || s.branchId === branchId)
    ) || null;
  }

  createStudent(studentData: any) {
    const student = {
      _id: studentData._id || `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...studentData,
      xp: studentData.xp || 0,
      status: studentData.status || StudentStatus.ACTIVE,
      branchId: studentData.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.students.push(student);
    return student;
  }

  updateStudent(id: string, branchId: string, updateData: any) {
    const idx = this.data.students.findIndex((s) => s._id === id && s.branchId === branchId);
    if (idx === -1) return null;
    this.data.students[idx] = { ...this.data.students[idx], ...updateData };
    return this.data.students[idx];
  }

  deleteStudent(id: string, branchId: string) {
    const initialLen = this.data.students.length;
    this.data.students = this.data.students.filter((s) => !(s._id === id && s.branchId === branchId));
    return this.data.students.length < initialLen;
  }

  incrementStudentXP(id: string, branchId: string, amount: number) {
    const std = this.data.students.find((s) => s._id === id && s.branchId === branchId);
    if (!std) return null;
    std.xp = (std.xp || 0) + amount;
    return std;
  }

  // --- Admins & Users ---
  findAdminByEmail(email: string) {
    const clean = email.trim().toLowerCase();
    return this.data.admins.find((a) => a.email.trim().toLowerCase() === clean && a.role?.toLowerCase() === 'admin') || null;
  }

  findByEmail(email: string) {
    const clean = email.trim().toLowerCase();
    return this.data.admins.find((a) => a.email.trim().toLowerCase() === clean) || null;
  }

  getAdmins(branchId?: string) {
    return this.data.admins
      .filter((a) => !branchId || a.branchId === branchId)
      .map(({ passwordHash, ...rest }) => rest);
  }

  countAdmins(branchId?: string) {
    return this.data.admins.filter((a) => !branchId || a.branchId === branchId).length;
  }

  createAdmin(adminData: any) {
    if (this.countAdmins(adminData.branchId) >= MAX_ADMIN_ACCOUNTS) {
      throw new Error(`Admin accounts strictly capped at maximum ${MAX_ADMIN_ACCOUNTS}`);
    }
    const admin = {
      _id: adminData._id || adminData.id || `adm-${Date.now()}`,
      id: adminData._id || adminData.id || `adm-${Date.now()}`,
      email: adminData.email.trim().toLowerCase(),
      name: adminData.name,
      passwordHash: adminData.passwordHash || 'Admin',
      role: 'admin',
      branchId: adminData.branchId || ACTIVE_BRANCH_ID,
      studentId: null,
      createdAt: new Date().toISOString()
    };
    this.data.admins.push(admin);
    const { passwordHash, ...rest } = admin;
    return rest;
  }

  deleteAdmin(id: string, branchId?: string) {
    const initialLen = this.data.admins.length;
    this.data.admins = this.data.admins.filter((a) => !(a._id === id && (!branchId || a.branchId === branchId)));
    return this.data.admins.length < initialLen;
  }

  // --- Schedules ---
  getSchedules(branchId?: string) {
    return this.data.schedules.filter((s) => !branchId || s.branchId === branchId);
  }

  createSchedule(item: any) {
    const sch = {
      _id: item._id || `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...item,
      branchId: item.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.schedules.push(sch);
    return sch;
  }

  deleteSchedule(id: string, branchId?: string) {
    const initialLen = this.data.schedules.length;
    this.data.schedules = this.data.schedules.filter((s) => !(s._id === id && (!branchId || s.branchId === branchId)));
    return this.data.schedules.length < initialLen;
  }

  // --- Events ---
  getEvents(branchId?: string) {
    return this.data.events.filter((e) => !branchId || e.branchId === branchId);
  }

  createEvent(item: any) {
    const evt = {
      _id: item._id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...item,
      branchId: item.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.events.push(evt);
    return evt;
  }

  deleteEvent(id: string, branchId?: string) {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter((e) => !(e._id === id && (!branchId || e.branchId === branchId)));
    return this.data.events.length < initialLen;
  }

  // --- Tasks (Assignments) ---
  getTasks(branchId?: string) {
    return this.data.tasks.filter((t) => !branchId || t.branchId === branchId);
  }

  getTasksByStudent(studentId: string, branchId?: string) {
    return this.data.tasks.filter((t) => t.studentId === studentId && (!branchId || t.branchId === branchId));
  }

  createTask(data: any) {
    const task = {
      _id: data._id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title,
      subject: data.subject,
      studentId: data.studentId,
      studentName: data.studentName,
      fileUrl: data.fileUrl || '',
      fileName: data.fileName || '',
      fileType: data.fileType || '',
      status: data.status || 'Pending',
      grade: data.grade,
      branchId: data.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.tasks.unshift(task);
    return task;
  }

  updateTask(id: string, branchId: string, updateData: any) {
    const idx = this.data.tasks.findIndex((t) => t._id === id && t.branchId === branchId);
    if (idx === -1) return null;
    this.data.tasks[idx] = { ...this.data.tasks[idx], ...updateData };
    return this.data.tasks[idx];
  }

  deleteTask(id: string, branchId: string) {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => !(t._id === id && t.branchId === branchId));
    return this.data.tasks.length < initialLen;
  }

  // --- Attendance ---
  getAttendance(branchId?: string, dateFilter?: string) {
    return this.data.attendance.filter((a) => {
      if (branchId && a.branchId !== branchId) return false;
      if (dateFilter && a.date !== dateFilter) return false;
      return true;
    });
  }

  findAttendanceByStudentAndDate(studentId: string, date: string, branchId?: string) {
    return this.data.attendance.find((a) => a.studentId === studentId && a.date === date && (!branchId || a.branchId === branchId)) || null;
  }

  createAttendance(record: any) {
    const att = {
      _id: record._id || `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: record.studentId,
      studentName: record.studentName,
      date: record.date,
      status: record.status || 'Hadir',
      note: record.note || '',
      verified: record.verified ?? false,
      xpAwarded: record.xpAwarded ?? 0,
      branchId: record.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.attendance.unshift(att);
    return att;
  }

  verifyAttendance(id: string, branchId: string, xpAwarded: number = 10) {
    const att = this.data.attendance.find((a) => a._id === id && a.branchId === branchId);
    if (!att) return null;
    att.verified = true;
    att.xpAwarded = xpAwarded;
    return att;
  }

  deleteAttendance(id: string, branchId: string) {
    const initialLen = this.data.attendance.length;
    this.data.attendance = this.data.attendance.filter((a) => !(a._id === id && a.branchId === branchId));
    return this.data.attendance.length < initialLen;
  }

  // --- Cash (Kas) ---
  getCash(branchId?: string, month?: string) {
    return this.data.cash.filter((c) => {
      if (branchId && c.branchId !== branchId) return false;
      if (month && c.month !== month) return false;
      return true;
    });
  }

  getCashSummary(branchId?: string) {
    const all = this.getCash(branchId);
    let totalCollected = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    for (const r of all) {
      totalCollected += Number(r.amountPaid) || 0;
      if (r.status === 'LUNAS') paidCount++;
      else unpaidCount++;
    }
    return {
      totalCollected,
      totalRecords: all.length,
      paidCount,
      unpaidCount
    };
  }

  upsertCash(record: any) {
    const item = {
      _id: record._id || `kas-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: record.studentId || null,
      studentName: record.studentName || 'Kas Kelas',
      month: record.month,
      bulan: record.bulan || record.month,
      amountPaid: Number(record.amountPaid) || 0,
      totalKas: Number(record.totalKas) || 0,
      pengeluaran: Number(record.pengeluaran) || 0,
      imageUrl: record.imageUrl || '',
      catatan: record.catatan || '',
      status: record.status || 'LUNAS',
      branchId: record.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };

    const idx = this.data.cash.findIndex((c) =>
      c.branchId === item.branchId && c.month === item.month && (c.studentId === item.studentId || c.studentName === item.studentName)
    );

    if (idx !== -1) {
      this.data.cash[idx] = { ...this.data.cash[idx], ...item };
      return this.data.cash[idx];
    } else {
      this.data.cash.unshift(item);
      return item;
    }
  }

  deleteCash(id: string, branchId: string) {
    const initialLen = this.data.cash.length;
    this.data.cash = this.data.cash.filter((c) => !(c._id === id && c.branchId === branchId));
    return this.data.cash.length < initialLen;
  }

  // --- Gallery ---
  getGallery(branchId?: string) {
    return this.data.gallery.filter((g) => !branchId || g.branchId === branchId);
  }

  createGalleryItem(data: any) {
    const item = {
      _id: data._id || `gal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title || 'Foto Kelas',
      caption: data.caption || '',
      imageUrl: data.imageUrl,
      uploadedBy: data.uploadedBy || 'Admin',
      branchId: data.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.gallery.unshift(item);
    return item;
  }

  deleteGalleryItem(id: string, branchId: string) {
    const initialLen = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter((g) => !(g._id === id && g.branchId === branchId));
    return this.data.gallery.length < initialLen;
  }

  // --- Forum ---
  getForum(branchId?: string) {
    return this.data.forumPosts.filter((f) => !branchId || f.branchId === branchId);
  }

  createForumPost(data: any) {
    const post = {
      _id: data._id || `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      authorName: data.authorName,
      title: data.title,
      content: data.content,
      category: data.category || 'Umum',
      likes: 0,
      comments: [],
      branchId: data.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.forumPosts.unshift(post);
    return post;
  }

  addForumComment(postId: string, comment: any, branchId?: string) {
    const post = this.data.forumPosts.find((p) => p._id === postId && (!branchId || p.branchId === branchId));
    if (!post) return null;
    if (!post.comments) post.comments = [];
    post.comments.push({
      _id: `cmt-${Date.now()}`,
      author: comment.author || 'Anonim',
      text: comment.text || '',
      createdAt: new Date().toISOString()
    });
    return post;
  }

  likeForumPost(postId: string, branchId?: string) {
    const post = this.data.forumPosts.find((p) => p._id === postId && (!branchId || p.branchId === branchId));
    if (!post) return 0;
    post.likes = (post.likes || 0) + 1;
    return post.likes;
  }

  // --- Confessions ---
  getConfessions(branchId?: string) {
    return this.data.confessions.filter((c) => !branchId || c.branchId === branchId);
  }

  createConfession(data: any) {
    const item = {
      _id: data._id || `cnf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message: data.message,
      isApproved: false,
      branchId: data.branchId || ACTIVE_BRANCH_ID,
      createdAt: new Date().toISOString()
    };
    this.data.confessions.unshift(item);
    return item;
  }

  approveConfession(id: string, branchId?: string) {
    const item = this.data.confessions.find((c) => c._id === id && (!branchId || c.branchId === branchId));
    if (!item) return null;
    item.isApproved = true;
    return item;
  }

  deleteConfession(id: string, branchId?: string) {
    const initialLen = this.data.confessions.length;
    this.data.confessions = this.data.confessions.filter((c) => !(c._id === id && (!branchId || c.branchId === branchId)));
    return this.data.confessions.length < initialLen;
  }

  // --- Mood Tracker ---
  getMoodSummary() {
    return {
      count: this.data.mood.count,
      votes: { ...this.data.mood.votes }
    };
  }

  voteMood(emoji: '😃' | '😐' | '😡' | '😭') {
    if (this.data.mood.votes[emoji] !== undefined) {
      this.data.mood.votes[emoji] += 1;
      this.data.mood.count += 1;
    }
    return this.getMoodSummary();
  }

  // --- Settings ---
  getSettings(branchId?: string) {
    return { ...this.data.settings, branchId: branchId || ACTIVE_BRANCH_ID };
  }

  updateSettings(branchId: string, updateData: any) {
    this.data.settings = { ...this.data.settings, ...updateData, branchId };
    return this.data.settings;
  }

  // --- Audit Logs ---
  logAudit(entry: any) {
    const log = {
      _id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
    return log;
  }

  getAuditLogs(branchId?: string) {
    return this.data.auditLogs.filter((l) => !branchId || l.branchId === branchId);
  }
}

export const inMemoryStore = new InMemoryStore();
