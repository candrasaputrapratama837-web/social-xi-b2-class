import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'STUDENT', 'GUEST'], default: 'GUEST', index: true },
  studentId: { type: String, default: null }, // String reference to Student _id
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

userSchema.index({ branchId: 1, role: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
