import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchId: { type: String, required: true, unique: true, index: true },
  tenantId: { type: String, required: true, index: true },
  className: { type: String, required: true },
  schoolName: { type: String, required: true },
  waliKelas: { type: String, required: true },
  classPhotoUrl: { type: String, default: '' },
  classLogoUrl: { type: String, default: '' },
  maxAdmins: { type: Number, default: 2 },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' }
}, { timestamps: true });

export const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
