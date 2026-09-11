import { Response, NextFunction } from 'express';
import { BranchRequest } from './branch.middleware';

export const requireAdmin = (req: BranchRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Access denied: Admin role required for detailed financial and administrative records' });
  }
  next();
};

export const antiSpoofingCheck = (req: BranchRequest, res: Response, next: NextFunction) => {
  const targetStudentId = req.body.studentId;
  const actorRole = req.user?.role?.toLowerCase();

  // Admins can record on behalf of students if needed
  if (actorRole === 'admin') {
    return next();
  }

  // If student is acting, they can ONLY record for themselves
  if (actorRole === 'siswa' || actorRole === 'student') {
    if (req.user?.studentId && req.user.studentId !== targetStudentId) {
      return res.status(403).json({
        error: 'Anti-spoofing violation: Students cannot record attendance or submit tasks for other students'
      });
    }
  }

  next();
};
