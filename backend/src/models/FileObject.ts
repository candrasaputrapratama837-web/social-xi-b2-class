import mongoose from 'mongoose';

const fileObjectSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  originalName: { type: String, required: true },
  storageUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  category: {
    type: String,
    enum: ['student_photo', 'class_photo', 'class_logo', 'gallery', 'assignment', 'cash_receipt', 'general'],
    default: 'general'
  },
  uploadedBy: { type: String, required: true },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

fileObjectSchema.index({ branchId: 1, category: 1 });

export const FileObject = mongoose.models.FileObject || mongoose.model('FileObject', fileObjectSchema);
