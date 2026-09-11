import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  branchId: { type: String, required: true, index: true },
  position: { type: String, required: true },
  studentId: { type: String, default: null },
  studentName: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true, _id: false });

organizationSchema.index({ branchId: 1, order: 1 });

export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
