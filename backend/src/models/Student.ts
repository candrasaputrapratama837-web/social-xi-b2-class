import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  nisn: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  gender: { type: String, enum: ['L', 'P'], required: true },
  agama: { type: String, default: 'ISLAM' },
  photo: { type: String, default: '' },
  role: { type: String, default: 'Siswa' }, // organizational role
  xp: { type: Number, default: 0, index: true },
  motto: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  statusReason: { type: String, default: '' },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

studentSchema.index({ branchId: 1, nisn: 1 }, { unique: true });
studentSchema.index({ branchId: 1, status: 1, xp: -1 });
studentSchema.index({ branchId: 1, name: 1 });

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
