import { Assignment } from '../models/Assignment';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class AssignmentRepository {
  async findAll(branchId: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getTasks(branchId);
    }
    try {
      return await Assignment.find({ branchId }).sort({ createdAt: -1 }).lean();
    } catch {
      return inMemoryStore.getTasks(branchId);
    }
  }

  async findByStudent(studentId: string, branchId: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getTasksByStudent(studentId, branchId);
    }
    try {
      return await Assignment.find({ studentId, branchId }).sort({ createdAt: -1 }).lean();
    } catch {
      return inMemoryStore.getTasksByStudent(studentId, branchId);
    }
  }

  async create(data: any): Promise<any> {
    const memoryTask = inMemoryStore.createTask(data);
    if (!getIsMongoConnected()) {
      return memoryTask;
    }
    try {
      const item = {
        _id: memoryTask._id,
        title: data.title,
        subject: data.subject,
        studentId: data.studentId,
        studentName: data.studentName,
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || '',
        fileType: data.fileType || '',
        status: data.status || 'SUBMITTED',
        grade: data.grade,
        branchId: data.branchId
      };
      const created = await Assignment.create(item);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryTask;
    }
  }

  async update(id: string, branchId: string, updateData: any): Promise<any | null> {
    const memoryUpdated = inMemoryStore.updateTask(id, branchId, updateData);
    if (!getIsMongoConnected()) {
      return memoryUpdated;
    }
    try {
      const updated = await Assignment.findOneAndUpdate(
        { _id: id, branchId },
        { ...updateData },
        { new: true }
      ).lean();
      return updated || memoryUpdated;
    } catch {
      return memoryUpdated;
    }
  }

  async delete(id: string, branchId: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteTask(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await Assignment.deleteOne({ _id: id, branchId });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }
}

export const assignmentRepository = new AssignmentRepository();

