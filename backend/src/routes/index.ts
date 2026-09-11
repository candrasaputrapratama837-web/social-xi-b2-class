import { Router, Request, Response, NextFunction } from 'express';
import * as api from '../controllers/api.controller';
import { enforceBranch } from '../middleware/branch.middleware';
import { requireAdmin } from '../middleware/auth.middleware';
import { getIsMongoConnected } from '../config/database';

import { loginRateLimiter, generalApiLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();

// Apply general API rate limit to all routes
router.use(generalApiLimiter);

// Health check and diagnostic endpoints (Publicly reachable)
router.get('/health', api.getHealth);
router.get('/debug', api.getDebugInfo);

// Realtime SSE Hub endpoints
router.get('/realtime/events', api.handleRealtimeEvents);
router.get('/realtime/status', api.getRealtimeStatus);

// All subsequent data routes require branch enforcement
router.use(enforceBranch);

// Authentication routes
router.post('/auth/login', loginRateLimiter, api.login);
router.get('/auth/verify', api.verifyAuth);
router.get('/auth/admins', api.getAdmins);
router.post('/auth/admins', requireAdmin, api.createAdmin);
router.delete('/auth/admins/:id', requireAdmin, api.deleteAdmin);

// Student & User routes
router.get('/users', api.getStudents);
router.get('/students', api.getStudents);
router.post('/students', requireAdmin, api.createStudent);
router.post('/users', requireAdmin, api.createStudent);
router.put('/students/:id', requireAdmin, api.updateStudent);
router.put('/users/:id', requireAdmin, api.updateStudent);
router.delete('/students/:id', requireAdmin, api.deleteStudent);
router.delete('/users/:id', requireAdmin, api.deleteStudent);
router.post('/users/:id/xp', requireAdmin, api.updateStudentXP);
router.patch('/users/:id/xp', requireAdmin, api.updateStudentXP);
router.post('/students/:id/xp', requireAdmin, api.updateStudentXP);
router.patch('/students/:id/xp', requireAdmin, api.updateStudentXP);

// Attendance routes
router.get('/attendance', api.getAttendance);
router.post('/attendance', api.submitAttendance);
router.get('/attendance/recap', api.returnEmptyArray);

// Leaderboard
router.get('/leaderboard', api.getLeaderboard);

// Cash (Kas) routes
router.get('/kas', api.getKas);
router.post('/kas', api.createKas);
router.put('/kas/:id', api.updateKas);
router.delete('/kas/:id', api.deleteKas);
router.get('/kas/summary', api.getKasSummary);

// Gallery & Media
router.get('/gallery', api.getGallery);
router.post('/gallery', api.createGalleryItem);
router.delete('/gallery/:id', requireAdmin, api.deleteGallery);

// Forum & Community
router.get('/forum', api.getForum);
router.post('/forum', api.createForumPost);
router.post('/forum/:postId/comment', api.addForumComment);
router.post('/forum/:postId/like', api.likeForumPost);

// Tasks & Assignments
router.get('/tasks', api.getTasks);
router.post('/tasks', api.submitTask);
router.patch('/tasks/:id/status', requireAdmin, api.updateTaskStatus);
router.delete('/tasks/:id', requireAdmin, api.deleteTask);

// Schedules, Events, and Interactive Modules
router.get('/schedule', api.getSchedule);
router.post('/schedule', requireAdmin, api.createSchedule);
router.delete('/schedule/:id', requireAdmin, api.deleteSchedule);

router.get('/events', api.getEvents);
router.post('/events', requireAdmin, api.createEvent);
router.delete('/events/:id', requireAdmin, api.deleteEvent);

router.get('/confessions', api.getConfessions);
router.post('/confessions', api.createConfession);
router.post('/confessions/:id/approve', requireAdmin, api.approveConfession);
router.delete('/confessions/:id', requireAdmin, api.deleteConfession);

router.get('/mood', api.getMood);
router.post('/mood', api.voteMood);

router.get('/bazaar', api.returnEmptyArray);
router.get('/saham', api.returnEmptyObject);
router.get('/time-capsule', api.returnEmptyArray);
router.get('/sosiogram', api.returnEmptyObject);
router.get('/audit-logs', api.getAuditLogs);

// Class branding & Assets
router.get('/class-photo', api.getClassPhoto);
router.post('/class-photo', api.updateClassPhoto);
router.get('/class-logo', api.getClassLogo);
router.post('/class-logo', api.updateClassLogo);

export default router;
