export type UserAuthMode = 'admin' | 'siswa' | 'public';

export interface AuthSession {
  mode: UserAuthMode;
  email?: string;
  token?: string;
  name?: string;
}

export interface TaskSubmission {
  _id: string;
  studentId: string;
  studentName: string;
  title: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'video' | 'other';
  status: 'Pending' | 'Valid' | 'Ditolak';
  adminNote?: string;
  xpAwarded?: number;
  createdAt: string;
}

export interface RekapKasItem {
  _id: string;
  bulan: string;
  totalKas: number;
  imageUrl: string;
  catatan: string;
  createdAt: string;
  amountPaid?: number;
  pengeluaran?: number;
}

export interface StudentUser {
  _id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  agama: 'ISLAM' | 'KATHOLIK' | 'PROTESTAN' | 'HINDU' | 'BUDDHA';
  photo: string;
  role: string;
  xp: number;
  motto?: string;
  instagram?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  statusReason?: string;
}

export interface ScheduleItem {
  _id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  subject: string;
  time: string;
  teacher: string;
  room?: string;
  materialUrl?: string;
  notes?: string;
}

export interface MoodRecord {
  _id: string;
  emoji: '😃' | '😐' | '😡' | '😭';
  timestamp: string;
}

export interface MoodSummary {
  counts: Record<'😃' | '😐' | '😡' | '😭', number>;
  totalVotes: number;
  percentages: Record<'😃' | '😐' | '😡' | '😭', number>;
  dominantMood: '😃' | '😐' | '😡' | '😭';
}

export interface CountdownEventItem {
  _id: string;
  title: string;
  targetDate: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface ConfessionItem {
  _id: string;
  to: string;
  message: string;
  isApproved: boolean;
  createdAt: string;
  colorTheme?: string;
}

export interface ForumComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ForumPostItem {
  _id: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: ForumComment[];
  createdAt: string;
}

export interface GalleryImage {
  _id: string;
  title: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
  createdAt: string;
}

export interface BazaarProductItem {
  _id: string;
  title: string;
  creatorName: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  contactNumber?: string;
}

export interface SahamMarketState {
  indexValue: number;
  changePercent: number;
  totalKas: number;
  history: { time: string; value: number }[];
}

export interface TimeCapsuleItem {
  _id: string;
  senderName: string;
  title: string;
  message: string;
  unlockDate: string;
  createdAt: string;
}

export interface InteractionEdge {
  _id: string;
  sourceId: string;
  targetId: string;
  relation: 'Sahabat' | 'Rekan Belajar' | 'Teman Diskusi';
}

export interface AttendanceItem {
  _id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
  note?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  xpAwarded?: number;
  submittedAt?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  role: string;
  entity: string;
  entityId?: string;
  details?: any;
  timestamp: string;
}

export interface SystemSettings {
  className: string;
  schoolName: string;
  waliKelas: string;
  classPhotoUrl: string;
  classLogoUrl: string;
  maxAdmins: number;
}

export interface AdminAuthResponse {
  token: string;
  admin: {
    email: string;
    role: string;
  };
}
