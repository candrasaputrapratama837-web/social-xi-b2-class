import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  date: { type: String, required: true, index: true }, // Format YYYY-MM-DD
  status: { type: String, enum: ['Hadir', 'Sakit', 'Izin', 'Alfa'], required: true },
  note: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  xpAwarded: { type: Number, default: 0 },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

// Prevent duplicate attendance per student per date per branch
attendanceSchema.index({ studentId: 1, date: 1, branchId: 1 }, { unique: true });
attendanceSchema.index({ branchId: 1, date: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
