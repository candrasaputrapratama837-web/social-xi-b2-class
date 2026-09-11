import { Student } from '../models/Student';
import { StudentStatus } from '../config/constants';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class StudentRepository {
  async findAll(branchId: string, statusFilter?: 'ACTIVE' | 'INACTIVE' | 'ALL'): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getStudents(branchId, statusFilter);
    }
    try {
      const query: any = { branchId };
      if (statusFilter && statusFilter !== 'ALL') {
        query.status = statusFilter;
      } else if (!statusFilter) {
        query.status = StudentStatus.ACTIVE;
      }
      return await Student.find(query).sort({ name: 1 }).lean();
    } catch {
      return inMemoryStore.getStudents(branchId, statusFilter);
    }
  }

  async findById(id: string, branchId: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getStudentById(id, branchId);
    }
    try {
      return await Student.findOne({ _id: id, branchId }).lean();
    } catch {
      return inMemoryStore.getStudentById(id, branchId);
    }
  }

  async findByNisn(nisn: string, branchId: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getStudentByNisn(nisn, branchId);
    }
    try {
      return await Student.findOne({ nisn, branchId }).lean();
    } catch {
      return inMemoryStore.getStudentByNisn(nisn, branchId);
    }
  }

  async findByNisnOrName(query: string, branchId: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getStudentByNisnOrName(query, branchId);
    }
    try {
      // Create a case-insensitive regex for the name
      const regexQuery = new RegExp(`^${query}$`, 'i');
      return await Student.findOne({ 
        $or: [{ nisn: query }, { name: regexQuery }],
        branchId 
      }).lean();
    } catch {
      return inMemoryStore.getStudentByNisnOrName(query, branchId);
    }
  }

  async create(studentData: any): Promise<any> {
    const memoryCreated = inMemoryStore.createStudent(studentData);
    if (!getIsMongoConnected()) {
      return memoryCreated;
    }
    try {
      const student = {
        _id: memoryCreated._id,
        ...studentData,
        xp: studentData.xp || 0,
        status: studentData.status || StudentStatus.ACTIVE,
      };
      const created = await Student.create(student);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryCreated;
    }
  }

  async update(id: string, branchId: string, updateData: any): Promise<any | null> {
    const memoryUpdated = inMemoryStore.updateStudent(id, branchId, updateData);
    if (!getIsMongoConnected()) {
      return memoryUpdated;
    }
    try {
      const { _id, id: sid, ...cleanUpdateData } = updateData;
      const updated = await Student.findOneAndUpdate(
        { $or: [{ _id: id }, { id }], branchId },
        { ...cleanUpdateData },
        { new: true }
      ).lean();
      return updated || memoryUpdated;
    } catch {
      return memoryUpdated;
    }
  }

  async delete(id: string, branchId: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteStudent(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await Student.deleteOne({ $or: [{ _id: id }, { id }], branchId });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }

  async incrementXP(id: string, branchId: string, amount: number): Promise<any | null> {
    const memoryUpdated = inMemoryStore.incrementStudentXP(id, branchId, amount);
    if (!getIsMongoConnected()) {
      return memoryUpdated;
    }
    try {
      const updated = await Student.findOneAndUpdate(
        { _id: id, branchId },
        { $inc: { xp: amount } },
        { new: true }
      ).lean();
      return updated || memoryUpdated;
    } catch {
      return memoryUpdated;
    }
  }
}

export const studentRepository = new StudentRepository();

