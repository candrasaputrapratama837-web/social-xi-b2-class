import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileType: { type: String, default: '' },
  status: { type: String, enum: ['SUBMITTED', 'GRADED', 'REJECTED'], default: 'SUBMITTED' },
  grade: { type: Number },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

assignmentSchema.index({ branchId: 1, studentId: 1 });

export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
export const Submission = Assignment; // Alias for assignment submissions
