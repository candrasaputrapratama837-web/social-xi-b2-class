import { Attendance } from '../models/Attendance';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class AttendanceRepository {
  async findByStudentAndDate(studentId: string, date: string, branchId: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.findAttendanceByStudentAndDate(studentId, date, branchId);
    }
    try {
      return await Attendance.findOne({ studentId, date, branchId }).lean();
    } catch {
      return inMemoryStore.findAttendanceByStudentAndDate(studentId, date, branchId);
    }
  }

  async findAll(branchId: string, dateFilter?: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getAttendance(branchId, dateFilter);
    }
    try {
      const query: any = { branchId };
      if (dateFilter) query.date = dateFilter;
      return await Attendance.find(query).sort({ date: -1, createdAt: -1 }).limit(500).lean();
    } catch {
      return inMemoryStore.getAttendance(branchId, dateFilter);
    }
  }

  async create(record: any): Promise<any> {
    const memoryRecord = inMemoryStore.createAttendance(record);
    if (!getIsMongoConnected()) {
      return memoryRecord;
    }
    try {
      const att = {
        _id: memoryRecord._id,
        studentId: record.studentId,
        studentName: record.studentName,
        date: record.date,
        status: record.status || 'Hadir',
        note: record.note || '',
        verified: record.verified ?? false,
        xpAwarded: record.xpAwarded ?? 0,
        branchId: record.branchId
      };

      const created = await Attendance.create(att);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryRecord;
    }
  }

  async verify(id: string, branchId: string, xpAwarded: number = 10): Promise<any | null> {
    const memoryVerified = inMemoryStore.verifyAttendance(id, branchId, xpAwarded);
    if (!getIsMongoConnected()) {
      return memoryVerified;
    }
    try {
      const verified = await Attendance.findOneAndUpdate(
        { _id: id, branchId },
        { verified: true, xpAwarded },
        { new: true }
      ).lean();
      return verified || memoryVerified;
    } catch {
      return memoryVerified;
    }
  }

  async delete(id: string, branchId: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteAttendance(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await Attendance.deleteOne({ _id: id, branchId });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }
}

export const attendanceRepository = new AttendanceRepository();

