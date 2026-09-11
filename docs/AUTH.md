# 🔑 AUTH.md: Autentikasi & Manajemen Sesi

---

## 1. Mekanisme Autentikasi

Platform menggunakan sistem autentikasi hibrida berbasis **JSON Web Token (JWT)** yang mendukung tiga jenis alur masuk:

1. **Admin Master / Pengurus Kelas**:
   - Email: `Adminkelas@gmail.com`
   - Password: `Admin` (atau kata sandi admin kustom ber-hash)
2. **Wali Kelas**:
   - Email: `wali.indra@sman1sandai.sch.id`
   - Password: `WaliKelas2026`
3. **Siswa XI-B2 (Mandiri via NISN)**:
   - Identitas: NISN Siswa (contoh: `0071234567`)
   - Kata Sandi: NISN Siswa atau `XI-B2 Jaya`
4. **Akun Kelas Kolektif**:
   - Email: `siswab2@gmail.com`
   - Kata Sandi: `XI-B2 Jaya` atau `siswa123`

---

## 2. Struktur Payload JWT
Token ditandatangani menggunakan algoritma HMAC SHA-256 dengan payload terstruktur:

```json
{
  "id": "std-01",
  "studentId": "std-01",
  "email": "0071234567@siswa.local",
  "role": "siswa",
  "name": "AHMAD DANI",
  "branchId": "smansandai-xib2",
  "iat": 1725000000,
  "exp": 1725604800
}
```

---

## 3. Keamanan & Pencegahan IDOR (Insecure Direct Object References)
- **Token-Bound Identity**: Saat siswa melakukan presensi atau mengunggah tugas, server mengekstrak `studentId` langsung dari JWT yang telah diverifikasi, bukan mempercayai `studentId` yang dikirimkan di body request.
- **Deactivated Student Lockout**: Siswa dengan status `INACTIVE` tidak dapat login dan ditolak saat mencoba melakukan aksi administratif atau presensi baru.
- **Password Hashing**: Kata sandi admin baru disimpan dalam bentuk hash SHA-256 dan diverifikasi secara kriptografis pada runtime server.
