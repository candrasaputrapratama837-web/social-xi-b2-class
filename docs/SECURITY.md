# 🛡️ SECURITY.md: Panduan Keamanan & Audit Trail

---

## 1. Perlindungan Keamanan Tingkat Server

1. **Pencegahan Insecure Direct Object References (IDOR)**:
   - Identitas siswa (`studentId`) dikunci langsung ke payload JWT terverifikasi saat absensi dan submit tugas.
   - Siswa A tidak dapat melihat/mengubah tugas atau presensi Siswa B.
2. **Penyembunyian Jejak Server (Error Sanitization)**:
   - Seluruh endpoint API tidak pernah membocorkan stack trace internal, path direktori server, atau sintaks database error ke klien.
3. **Rate Limiting Perlindungan Brute-Force**:
   - Algoritma sliding window membatasi percobaan login maksimal 15 kali per menit per alamat IP.
4. **Isolasi Multi-Tenant Cabang**:
   - Seluruh query dan mutasi database wajib menyertakan `branchId: 'smansandai-xib2'`.
5. **Kriptografi Kata Sandi**:
   - Kata sandi admin disimpan dengan hashing SHA-256 dan diverifikasi secara kriptografis.

---

## 2. Sistem Jejak Audit (Audit Logging)

Setiap aksi kritis secara otomatis dicatat ke dalam log audit (`/api/audit-logs`) dengan metadata lengkap:

```typescript
interface AuditLog {
  id: string;             // Identifier unik log
  branchId: string;       // smansandai-xib2
  action: string;         // Contoh: 'ATTENDANCE_VERIFIED', 'STUDENT_STATUS_CHANGED'
  actor: string;          // Email atau nama pengguna
  role: string;           // 'admin' | 'siswa' | 'system'
  entity: string;         // 'student' | 'attendance' | 'task' | 'kas' | 'auth'
  entityId?: string;      // ID dokumen yang diubah
  details?: any;          // Rincian perubahan
  status: 'SUCCESS' | 'FAILURE';
  timestamp: string;      // ISO 8601
}
```

---

## 3. Pelaporan Kerentanan
Jika ditemukan potensi celah keamanan, silakan laporkan langsung kepada tim pengembang sistem atau wali kelas XI-B2 SMAN 1 Sandai.
