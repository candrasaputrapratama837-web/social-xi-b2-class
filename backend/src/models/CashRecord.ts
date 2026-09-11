import mongoose from 'mongoose';

const cashRecordSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  month: { type: String, required: true, index: true }, // e.g., '2026-08' or 'September 2026'
  bulan: { type: String },
  studentId: { type: String, default: null, index: true },
  studentName: { type: String, default: 'Kas Kelas' },
  amountPaid: { type: Number, default: 0 },
  totalKas: { type: Number, default: 0 },
  pengeluaran: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  catatan: { type: String, default: '' },
  status: { type: String, enum: ['LUNAS', 'BELUM_LUNAS'], default: 'LUNAS' },
  branchId: { type: String, required: true, index: true }
}, { timestamps: true, _id: false });

cashRecordSchema.index({ branchId: 1, month: 1 });
cashRecordSchema.index({ studentId: 1, month: 1, branchId: 1 });

export const CashRecord = mongoose.models.CashRecord || mongoose.model('CashRecord', cashRecordSchema);
