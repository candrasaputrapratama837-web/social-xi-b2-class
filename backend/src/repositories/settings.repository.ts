import { Settings } from '../models/Settings';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class SettingsRepository {
  async getSettings(branchId: string): Promise<any> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getSettings(branchId);
    }
    try {
      let settings = await Settings.findOne({ branchId }).lean();
      if (!settings) {
        settings = await Settings.create({
          _id: `set-${branchId}`,
          branchId,
          className: 'XI-B2',
          schoolName: 'SMAN 1 Sandai',
          classPhotoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          classLogoUrl: '',
          waliKelas: 'Guru Pembimbing XI-B2',
          isAttendanceOpen: true
        });
        return (settings as any).toObject ? (settings as any).toObject() : settings;
      }
      return settings;
    } catch {
      return inMemoryStore.getSettings(branchId);
    }
  }

  async updateSettings(branchId: string, updateData: any): Promise<any> {
    const memoryUpdated = inMemoryStore.updateSettings(branchId, updateData);
    if (!getIsMongoConnected()) {
      return memoryUpdated;
    }
    try {
      const updated = await Settings.findOneAndUpdate(
        { branchId },
        { ...updateData },
        { upsert: true, new: true }
      ).lean();
      return updated || memoryUpdated;
    } catch {
      return memoryUpdated;
    }
  }
}

export const settingsRepository = new SettingsRepository();

