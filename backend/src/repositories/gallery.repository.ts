import { Gallery } from '../models/Gallery';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class GalleryRepository {
  async findAll(branchId: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getGallery(branchId);
    }
    try {
      return await Gallery.find({ branchId }).sort({ createdAt: -1 }).lean();
    } catch {
      return inMemoryStore.getGallery(branchId);
    }
  }

  async create(data: any): Promise<any> {
    const memoryItem = inMemoryStore.createGalleryItem(data);
    if (!getIsMongoConnected()) {
      return memoryItem;
    }
    try {
      const item = {
        _id: memoryItem._id,
        title: data.title,
        imageUrl: data.imageUrl,
        category: data.category || 'Dokumentasi',
        uploadedBy: data.uploadedBy || 'Admin',
        branchId: data.branchId
      };
      const created = await Gallery.create(item);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryItem;
    }
  }

  async delete(id: string, branchId: string): Promise<boolean> {
    const memoryDeleted = inMemoryStore.deleteGalleryItem(id, branchId);
    if (!getIsMongoConnected()) {
      return memoryDeleted;
    }
    try {
      const res = await Gallery.deleteOne({ _id: id, branchId });
      return (res.deletedCount || 0) > 0 || memoryDeleted;
    } catch {
      return memoryDeleted;
    }
  }
}

export const galleryRepository = new GalleryRepository();

