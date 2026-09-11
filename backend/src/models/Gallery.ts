import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'Dokumentasi' },
  uploadedBy: { type: String, required: true },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

gallerySchema.index({ branchId: 1, createdAt: -1 });

export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
