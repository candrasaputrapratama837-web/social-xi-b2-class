import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  branchId: { type: String, required: true, unique: true },
  className: { type: String, default: 'XI-B2' },
  schoolName: { type: String, default: 'SMAN 1 Sandai' },
  classPhotoUrl: { type: String, default: '' },
  classLogoUrl: { type: String, default: '' },
  waliKelas: { type: String, default: '' },
  themeColor: { type: String, default: 'emerald' },
  isAttendanceOpen: { type: Boolean, default: true }
}, { timestamps: true });

export const Settings = mongoose.model('Settings', settingsSchema);
