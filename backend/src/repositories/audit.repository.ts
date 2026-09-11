import { AuditLog } from '../models/AuditLog';

export class AuditRepository {
  async log(entry: {
    action: string;
    user: string;
    role: string;
    entity: string;
    entityId?: string;
    details?: any;
    status?: 'SUCCESS' | 'FAILURE';
    branchId: string;
  }): Promise<void> {
    const record = {
      _id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: entry.action,
      user: entry.user,
      role: entry.role,
      entity: entry.entity,
      entityId: entry.entityId || '',
      details: entry.details || {},
      status: entry.status || 'SUCCESS',
      branchId: entry.branchId
    };

    try {
      await AuditLog.create(record);
    } catch (err: any) {
      console.error(`[AUDIT LOG ERROR] Failed to record audit log: ${err.message}`);
    }
  }

  async findAll(branchId: string, limit = 100): Promise<any[]> {
    return await AuditLog.find({ branchId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

export const auditRepository = new AuditRepository();
