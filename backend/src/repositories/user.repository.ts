import { User } from '../models/User';
import { MAX_ADMIN_ACCOUNTS } from '../config/constants';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class UserRepository {
  async findAdminByEmail(email: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.findAdminByEmail(email);
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: cleanEmail, role: 'ADMIN' }).lean();
      return user || inMemoryStore.findAdminByEmail(email);
    } catch {
      return inMemoryStore.findAdminByEmail(email);
    }
  }

  async findByEmail(email: string): Promise<any | null> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.findByEmail(email);
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: cleanEmail }).lean();
      return user || inMemoryStore.findByEmail(email);
    } catch {
      return inMemoryStore.findByEmail(email);
    }
  }

  async getAdmins(branchId: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getAdmins(branchId);
    }
    try {
      const admins = await User.find({ branchId, role: 'ADMIN' }).select('-passwordHash').lean();
      return admins.length > 0 ? admins : inMemoryStore.getAdmins(branchId);
    } catch {
      return inMemoryStore.getAdmins(branchId);
    }
  }

  async countAdmins(branchId: string): Promise<number> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.countAdmins(branchId);
    }
    try {
      return await User.countDocuments({ branchId, role: 'ADMIN' });
    } catch {
      return inMemoryStore.countAdmins(branchId);
    }
  }

  async createAdmin(adminData: any): Promise<any> {
    const memoryAdmin = inMemoryStore.createAdmin(adminData);
    if (!getIsMongoConnected()) {
      return memoryAdmin;
    }
    try {
      const currentCount = await this.countAdmins(adminData.branchId);
      if (currentCount >= MAX_ADMIN_ACCOUNTS) {
        throw new Error(`Admin accounts strictly capped at maximum ${MAX_ADMIN_ACCOUNTS}`);
      }

      const admin = {
        _id: memoryAdmin._id,
        email: adminData.email.trim().toLowerCase(),
        name: adminData.name,
        passwordHash: adminData.passwordHash || 'Admin',
        role: 'ADMIN',
        branchId: adminData.branchId,
        studentId: null
      };

      const created = await User.create(admin);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryAdmin;
    }
  }

  async deleteAdmin(id: string, branchId?: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteAdmin(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await User.deleteOne({ _id: id });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }
}

export const userRepository = new UserRepository();

