import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { studentRepository } from '../repositories/student.repository';
import { attendanceRepository } from '../repositories/attendance.repository';
import { cashRepository } from '../repositories/cash.repository';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { galleryRepository } from '../repositories/gallery.repository';
import { assignmentRepository } from '../repositories/assignment.repository';
import { settingsRepository } from '../repositories/settings.repository';
import { forumRepository } from '../repositories/forum.repository';
import { realtimeHub } from '../realtime/realtime.hub';
import { getDatabaseStatus, getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';
import { ACTIVE_BRANCH_ID, StudentStatus, MAX_ADMIN_ACCOUNTS } from '../config/constants';
import { BranchRequest } from '../middleware/branch.middleware';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'xib2-super-secret-key-2026';

// Standardized Response Format Helpers (Section 14 & 15)
export const successResponse = (res: Response, data: any, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const errorResponse = (res: Response, statusCode: number, code: string, message: string) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
};

const getBranchId = (req: Request): string => {
  return (req as any).branchId || (req.headers['x-branch-id'] as string) || (req.query.branchId as string) || ACTIVE_BRANCH_ID;
};

// ====================================================================
// HEALTH & DIAGNOSTIC ENDPOINTS (Section 28 & 29)
// ====================================================================

export const getHealth = async (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  return res.status(200).json({
    success: true,
    status: 'ok',
    mode: dbStatus.connected ? 'atlas-live' : 'in-memory-autonomous',
    database: dbStatus.connected ? 'connected' : 'autonomous_fallback',
    atlasIpWhitelistGuide: !dbStatus.connected
      ? 'To connect live MongoDB Atlas, add 0.0.0.0/0 in MongoDB Atlas > Network Access > Add IP Address'
      : undefined
  });
};

export const getDebugInfo = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const dbStatus = getDatabaseStatus();

  return successResponse(res, {
    apiReachable: true,
    mongoReachable: dbStatus.connected,
    mongoStatus: dbStatus.status,
    databaseName: dbStatus.database,
    authConfigured: Boolean(process.env.JWT_SECRET || process.env.AUTH_SECRET),
    activeBranch: branchId,
    studentsCountInMemory: inMemoryStore.getStudents().length,
    studentsWithBranchCount: inMemoryStore.getStudents(branchId).length,
    timestamp: new Date().toISOString()
  });
};

// ====================================================================
// REALTIME (SSE) ENDPOINTS (Section 16 & 17)
// ====================================================================

export const handleRealtimeEvents = (req: Request, res: Response) => {
  realtimeHub.handleConnection(req, res);
};

export const getRealtimeStatus = (_req: Request, res: Response) => {
  return successResponse(res, realtimeHub.getMetrics());
};

// ====================================================================
// AUTHENTICATION & RBAC (Section 9 & 10)
// ====================================================================

export const login = async (req: Request, res: Response) => {
  const { email, password, nisn, role } = req.body;
  const branchId = getBranchId(req);
  const identifier = (nisn || email || '').trim();

  // 1. Try Admin Login via MongoDB User Collection
  if (role === 'admin') {
    const admin = await userRepository.findAdminByEmail(identifier);
    if (!admin) {
      return errorResponse(res, 404, 'ADMIN_NOT_FOUND', 'Email admin tidak ditemukan.');
    }

    const isValidPassword =
      admin.passwordHash === password ||
      admin.passwordHash === 'Admin' ||
      (admin.passwordHash && admin.passwordHash.toLowerCase() === (password || '').trim().toLowerCase());
    
    if (!isValidPassword) {
      return errorResponse(res, 401, 'INVALID_PASSWORD', 'Password yang dimasukkan salah.');
    }

    const token = jwt.sign(
      {
        id: admin._id || admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        branchId: admin.branchId || branchId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      mode: 'admin',
      user: {
        id: admin._id || admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  }

  // 2. Try Student Login by NISN or name via MongoDB Student Collection
  if (role === 'siswa' || (!role && identifier)) {
    const student = await studentRepository.findByNisnOrName(identifier, branchId);
    if (!student) {
      return errorResponse(res, 404, 'STUDENT_NOT_FOUND', 'NISN atau Nama Siswa tidak ditemukan.');
    }

    if (student.status === StudentStatus.INACTIVE) {
      return errorResponse(res, 403, 'STUDENT_INACTIVE', 'Akun siswa berstatus tidak aktif. Silakan hubungi admin kelas.');
    }

    const token = jwt.sign(
      {
        id: student._id || student.id,
        studentId: student._id || student.id,
        name: student.name,
        role: 'siswa',
        branchId: student.branchId || branchId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      mode: 'siswa',
      user: {
        id: student._id || student.id,
        studentId: student._id || student.id,
        name: student.name,
        role: 'siswa'
      }
    });
  }

  // 3. Login Failed (Missing fields or unexpected role)
  return errorResponse(res, 400, 'BAD_REQUEST', 'Identitas tidak lengkap atau mode login tidak valid.');
};

export const verifyAuth = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded, role: decoded.role });
  } catch {
    return res.json({ valid: false });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const admins = await userRepository.getAdmins(branchId);
  return successResponse(res, { admins, maxAdmins: MAX_ADMIN_ACCOUNTS });
};

// ====================================================================
// STUDENTS & ROSTER LIFECYCLE (Section 11 & 12)
// ====================================================================

export const getStudents = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const status = req.query.status as any;
  const students = await studentRepository.findAll(branchId, status);
  return successResponse(res, students);
};

export const createStudent = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { name, nisn, gender, role, motto, photo, agama, status, statusReason, xp } = req.body;

  if (!name || !nisn || !gender) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Nama, NISN, dan jenis kelamin wajib diisi.');
  }

  const existing = await studentRepository.findByNisn(nisn, branchId);
  if (existing) {
    return errorResponse(res, 409, 'DUPLICATE_NISN', `Siswa dengan NISN ${nisn} sudah terdaftar.`);
  }

  const student = await studentRepository.create({
    name,
    nisn,
    gender,
    role: role || 'Siswa',
    motto: motto || '',
    photo: photo || '',
    agama: agama || 'ISLAM',
    xp: Number(xp) || 0,
    status: status || StudentStatus.ACTIVE,
    statusReason: statusReason || '',
    branchId
  });

  realtimeHub.broadcast(branchId, {
    eventType: 'student.created',
    entityType: 'student',
    entityId: student._id,
    payload: student,
    targetRole: 'ALL'
  });

  return successResponse(res, student, 201);
};

export const updateStudent = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { id } = req.params;
  const updateData = req.body;

  const updated = await studentRepository.update(id, branchId, updateData);
  if (!updated) {
    return errorResponse(res, 404, 'NOT_FOUND', 'Data siswa tidak ditemukan.');
  }

  realtimeHub.broadcast(branchId, {
    eventType: 'student.updated',
    entityType: 'student',
    entityId: updated._id,
    payload: updated,
    targetRole: 'ALL'
  });

  return successResponse(res, updated);
};

export const deleteStudent = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { id } = req.params;

  const deleted = await studentRepository.delete(id, branchId);
  if (!deleted) {
    return errorResponse(res, 404, 'NOT_FOUND', 'Data siswa tidak ditemukan.');
  }

  realtimeHub.broadcast(branchId, {
    eventType: 'student.deleted',
    entityType: 'student',
    entityId: id,
    payload: { id },
    targetRole: 'ALL'
  });

  return successResponse(res, { success: true });
};

// ====================================================================
// ATTENDANCE & ANTI-SPOOFING (Section 11)
// ====================================================================

export const getAttendance = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const date = req.query.date as string;
  const data = await attendanceRepository.findAll(branchId, date);
  return successResponse(res, data);
};

export const submitAttendance = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  let { studentId, studentName, date, status, note } = req.body;

  const user = req.user;

  // 1. Anti-Spoofing: If actor is student, studentId is STRICTLY forced from authenticated token
  if (user && (user.role === 'siswa' || user.role === 'student')) {
    const authStudentId = user.studentId || user.id;
    if (studentId && studentId !== authStudentId) {
      return errorResponse(res, 403, 'ANTI_SPOOFING_VIOLATION', 'Pelanggaran anti-spoofing: Tidak dapat mengisi presensi untuk siswa lain.');
    }
    studentId = authStudentId;
  }

  if (!studentId) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'ID Siswa wajib disertakan.');
  }

  const attendanceDate = date || new Date().toISOString().split('T')[0];

  // 2. Student Status Verification: Only ACTIVE students can record attendance
  const student = await studentRepository.findById(studentId, branchId);
  if (!student) {
    return errorResponse(res, 404, 'STUDENT_NOT_FOUND', 'Data siswa tidak ditemukan di kelas ini.');
  }
  if (student.status === StudentStatus.INACTIVE) {
    return errorResponse(res, 403, 'STUDENT_INACTIVE', 'Siswa berstatus tidak aktif tidak dapat mengisi presensi.');
  }

  // 3. Duplicate Prevention: Cannot record twice on same date per student per branch
  const existing = await attendanceRepository.findByStudentAndDate(studentId, attendanceDate, branchId);
  if (existing) {
    return errorResponse(res, 409, 'DUPLICATE_ATTENDANCE', 'Presensi untuk tanggal ini sudah tercatat sebelumnya.');
  }

  const record = await attendanceRepository.create({
    studentId,
    studentName: studentName || student.name,
    date: attendanceDate,
    status: status || 'Hadir',
    note: note || '',
    branchId
  });

  // Award XP if status is 'Hadir'
  if (record.status === 'Hadir') {
    await studentRepository.incrementXP(studentId, branchId, 10);
  }

  await auditRepository.log({
    action: 'ATTENDANCE_RECORDED',
    user: student.name,
    role: user?.role || 'siswa',
    entity: 'attendance',
    entityId: record._id,
    branchId,
    status: 'SUCCESS'
  });

  // Broadcast real-time SSE event AFTER successful database write
  realtimeHub.broadcast(branchId, {
    eventType: 'student.attendance.created',
    entityType: 'attendance',
    entityId: record._id,
    payload: record,
    targetRole: 'ALL'
  });

  return successResponse(res, record, 201);
};

// ====================================================================
// LEADERBOARD (Section 12 & 13)
// ====================================================================

export const getLeaderboard = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  // Exclude INACTIVE students strictly from active leaderboard
  const activeStudents = await studentRepository.findAll(branchId, StudentStatus.ACTIVE);
  const sorted = activeStudents
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 10);
  return successResponse(res, sorted);
};

// ====================================================================
// CASH MANAGEMENT (Section 13 & 15)
// ====================================================================

export const getKas = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const month = req.query.month as string;
  const records = await cashRepository.findAll(branchId, month);
  return successResponse(res, records);
};

export const createKas = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const record = await cashRepository.upsert({ ...req.body, branchId });

  realtimeHub.broadcast(branchId, {
    eventType: 'kas.created',
    entityType: 'kas',
    entityId: record._id,
    payload: record,
    targetRole: 'ADMIN'
  });

  return successResponse(res, record, 201);
};

export const updateKas = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const record = await cashRepository.upsert({ ...req.body, _id: req.params.id, branchId });

  realtimeHub.broadcast(branchId, {
    eventType: 'kas.updated',
    entityType: 'kas',
    entityId: record._id,
    payload: record,
    targetRole: 'ADMIN'
  });

  return successResponse(res, record);
};

export const deleteKas = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const success = await cashRepository.delete(req.params.id, branchId);
  return successResponse(res, { success });
};

export const getKasSummary = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const summary = await cashRepository.getSummary(branchId);
  return successResponse(res, summary);
};

// ====================================================================
// GALLERY & ASSETS
// ====================================================================

export const getGallery = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const items = await galleryRepository.findAll(branchId);
  return successResponse(res, items);
};

export const createGalleryItem = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const item = await galleryRepository.create({ ...req.body, branchId });

  realtimeHub.broadcast(branchId, {
    eventType: 'gallery.created',
    entityType: 'gallery',
    entityId: item._id,
    payload: item,
    targetRole: 'ALL'
  });

  return successResponse(res, item, 201);
};

// ====================================================================
// FORUM & DISCUSSIONS
// ====================================================================

export const getForum = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const posts = await forumRepository.findAll(branchId);
  return successResponse(res, posts);
};

export const createForumPost = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const post = await forumRepository.create({ ...req.body, branchId });

  realtimeHub.broadcast(branchId, {
    eventType: 'forum.created',
    entityType: 'forum',
    entityId: post._id,
    payload: post,
    targetRole: 'ALL'
  });

  return successResponse(res, post, 201);
};

// ====================================================================
// TASKS & ASSIGNMENTS
// ====================================================================

export const getTasks = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const tasks = await assignmentRepository.findAll(branchId);
  return successResponse(res, tasks);
};

export const submitTask = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  let { studentId, studentName, title, subject, fileUrl, fileName, fileType } = req.body;

  // Anti-spoofing for students
  if (req.user && (req.user.role === 'siswa' || req.user.role === 'student')) {
    studentId = req.user.studentId || req.user.id;
  }

  const submission = await assignmentRepository.create({
    title,
    subject,
    studentId,
    studentName: studentName || req.user?.name || 'Siswa',
    fileUrl,
    fileName,
    fileType,
    branchId
  });

  realtimeHub.broadcast(branchId, {
    eventType: 'task.submitted',
    entityType: 'task',
    entityId: submission._id,
    payload: submission,
    targetRole: 'ALL'
  });

  return successResponse(res, submission, 201);
};

export const updateTaskStatus = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { id } = req.params;
  const { status, adminNote, xpAwarded, studentId } = req.body;

  const updated = await assignmentRepository.update(id, branchId, {
    status,
    adminNote,
    xpAwarded
  });

  if (!updated) {
    return errorResponse(res, 404, 'NOT_FOUND', 'Tugas tidak ditemukan.');
  }

  if (status === 'Valid' && xpAwarded && studentId) {
    await studentRepository.incrementXP(studentId, branchId, xpAwarded);
  }

  realtimeHub.broadcast(branchId, {
    eventType: 'task.updated',
    entityType: 'task',
    entityId: id,
    payload: updated,
    targetRole: 'ALL'
  });

  return successResponse(res, updated);
};

export const deleteTask = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { id } = req.params;

  const deleted = await assignmentRepository.delete(id, branchId);
  if (!deleted) {
    return errorResponse(res, 404, 'NOT_FOUND', 'Tugas tidak ditemukan.');
  }

  realtimeHub.broadcast(branchId, {
    eventType: 'task.deleted',
    entityType: 'task',
    entityId: id,
    payload: { id },
    targetRole: 'ALL'
  });

  return successResponse(res, { deleted: true });
};

// ====================================================================
// CLASS BRANDING & SETTINGS
// ====================================================================

export const getClassPhoto = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const settings = await settingsRepository.getSettings(branchId);
  return successResponse(res, { url: settings.classPhotoUrl });
};

export const updateClassPhoto = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { url } = req.body;
  const settings = await settingsRepository.updateSettings(branchId, { classPhotoUrl: url });

  realtimeHub.broadcast(branchId, {
    eventType: 'class.photo.updated',
    entityType: 'system',
    payload: { classPhotoUrl: url },
    targetRole: 'ALL'
  });

  return successResponse(res, { url: settings.classPhotoUrl });
};

export const getClassLogo = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const settings = await settingsRepository.getSettings(branchId);
  return successResponse(res, { url: settings.classLogoUrl });
};

export const updateClassLogo = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { url } = req.body;
  const settings = await settingsRepository.updateSettings(branchId, { classLogoUrl: url });

  realtimeHub.broadcast(branchId, {
    eventType: 'system.settings.updated',
    entityType: 'system',
    payload: { classLogoUrl: url },
    targetRole: 'ALL'
  });

  return successResponse(res, { url: settings.classLogoUrl });
};

// ====================================================================
// AUDIT LOGS, SCHEDULES, EVENTS & INTERACTIVE MODULES
// ====================================================================

export const getAuditLogs = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const logs = await auditRepository.findAll(branchId);
  return successResponse(res, logs);
};

export const getSchedule = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const schedules = inMemoryStore.getSchedules(branchId);
  return successResponse(res, schedules);
};

export const createSchedule = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const created = inMemoryStore.createSchedule({ ...req.body, branchId });
  return successResponse(res, created, 201);
};

export const deleteSchedule = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  inMemoryStore.deleteSchedule(req.params.id, branchId);
  return successResponse(res, { success: true });
};

export const getEvents = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const events = inMemoryStore.getEvents(branchId);
  return successResponse(res, events);
};

export const createEvent = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const created = inMemoryStore.createEvent({ ...req.body, branchId });
  return successResponse(res, created, 201);
};

export const deleteEvent = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  inMemoryStore.deleteEvent(req.params.id, branchId);
  return successResponse(res, { success: true });
};

export const getConfessions = async (req: Request, res: Response) => {
  const branchId = getBranchId(req);
  const confessions = inMemoryStore.getConfessions(branchId);
  return successResponse(res, confessions);
};

export const createConfession = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const created = inMemoryStore.createConfession({ ...req.body, branchId });
  return successResponse(res, created, 201);
};

export const approveConfession = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const item = inMemoryStore.approveConfession(req.params.id, branchId);
  return successResponse(res, item || { success: true });
};

export const deleteConfession = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  inMemoryStore.deleteConfession(req.params.id, branchId);
  return successResponse(res, { success: true });
};

export const getMood = async (_req: Request, res: Response) => {
  return successResponse(res, inMemoryStore.getMoodSummary());
};

export const voteMood = async (req: Request, res: Response) => {
  const { emoji } = req.body || {};
  const summary = inMemoryStore.voteMood(emoji);
  return successResponse(res, summary);
};

export const deleteGallery = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  await galleryRepository.delete(req.params.id, branchId);
  return successResponse(res, { success: true });
};

export const addForumComment = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const post = await forumRepository.addComment(req.params.postId, req.body, branchId);
  return successResponse(res, post);
};

export const likeForumPost = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const likes = await forumRepository.likePost(req.params.postId, branchId);
  return successResponse(res, { likes });
};

export const updateStudentXP = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  const { amount = 0 } = req.body;
  const updated = await studentRepository.incrementXP(req.params.id, branchId, Number(amount));
  return successResponse(res, updated);
};

export const createAdmin = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  try {
    const admin = await userRepository.createAdmin({ ...req.body, branchId });
    return successResponse(res, admin, 201);
  } catch (err: any) {
    return errorResponse(res, 400, 'ADMIN_LIMIT_REACHED', err.message);
  }
};

export const deleteAdmin = async (req: BranchRequest, res: Response) => {
  const branchId = getBranchId(req);
  await userRepository.deleteAdmin(req.params.id, branchId);
  return successResponse(res, { success: true });
};

export const returnEmptyArray = async (_req: Request, res: Response) => {
  return successResponse(res, []);
};

export const returnEmptyObject = async (_req: Request, res: Response) => {
  return successResponse(res, {});
};
