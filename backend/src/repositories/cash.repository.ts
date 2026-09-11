import { CashRecord } from '../models/CashRecord';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class CashRepository {
  async findAll(branchId: string, month?: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getCash(branchId, month);
    }
    try {
      const query: any = { branchId };
      if (month) query.month = month;
      return await CashRecord.find(query).sort({ studentName: 1, month: -1 }).lean();
    } catch {
      return inMemoryStore.getCash(branchId, month);
    }
  }

  async getSummary(branchId: string): Promise<{ totalCollected: number; totalRecords: number; paidCount: number; unpaidCount: number }> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getCashSummary(branchId);
    }
    try {
      const all = await this.findAll(branchId);
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
    } catch {
      return inMemoryStore.getCashSummary(branchId);
    }
  }

  async upsert(record: any): Promise<any> {
    const memoryRecord = inMemoryStore.upsertCash(record);
    if (!getIsMongoConnected()) {
      return memoryRecord;
    }
    try {
      const data = {
        _id: memoryRecord._id,
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
        branchId: record.branchId
      };

      const filter: any = { branchId: record.branchId, month: record.month };
      if (record.studentId) {
        filter.studentId = record.studentId;
      } else {
        filter.studentName = data.studentName;
      }

      const updated = await CashRecord.findOneAndUpdate(
        filter,
        data,
        { upsert: true, new: true }
      ).lean();
      return updated || memoryRecord;
    } catch {
      return memoryRecord;
    }
  }

  async delete(id: string, branchId: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteCash(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await CashRecord.deleteOne({ _id: id, branchId });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }
}

export const cashRepository = new CashRepository();

