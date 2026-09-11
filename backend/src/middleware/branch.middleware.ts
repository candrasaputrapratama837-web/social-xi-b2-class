import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ACTIVE_BRANCH_ID } from '../config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'xib2-super-secret-key-2026';

export interface BranchRequest extends Request {
  branchId?: string;
  user?: any;
}

export const enforceBranch = (req: BranchRequest, res: Response, next: NextFunction) => {
  const branchHeader = (req.headers['x-branch-id'] as string) || (req.query.branchId as string) || ACTIVE_BRANCH_ID;
  req.branchId = branchHeader;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // invalid token, user remains undefined
    }
  }

  next();
};
