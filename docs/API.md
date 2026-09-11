# 📡 API.md: Dokumentasi Endpoint REST API

---

## 1. Format Respons & Penanganan Kesalahan (Error Codes)

Semua respons kesalahan menggunakan struktur standar berikut:
```json
{
  "success": false,
  "error": "Pesan deskripsi kesalahan",
  "code": "UNAUTHORIZED",
  "message": "Pesan deskripsi kesalahan",
  "timestamp": "2026-08-31T08:00:00.000Z"
}
```

### Daftar Kode Kesalahan Standar:
- `UNAUTHORIZED` (401): Token JWT tidak valid atau sesi berakhir.
- `FORBIDDEN` (403): Pengguna tidak memiliki hak akses (misal: bukan Admin atau siswa non-aktif).
- `VALIDATION_ERROR` (400): Parameter input tidak lengkap atau tidak valid.
- `NOT_FOUND` (404): Entitas yang dicari tidak ditemukan.
- `CONFLICT` (409): Pelanggaran batasan unik (contoh: NISN duplikat atau presensi ganda).
- `RATE_LIMITED` (429): Terlalu banyak permintaan dalam waktu singkat.
- `INTERNAL_ERROR` (500): Terjadi kegagalan pemrosesan di server (stack trace disembunyikan).

---

## 2. Ringkasan Endpoint Utama

### 2.1. Autentikasi (`/api/auth`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Autentikasi admin, wali kelas, atau siswa via NISN/Email. |
| `GET` | `/api/auth/verify` | Admin | Validasi keabsahan token sesi admin. |
| `GET` | `/api/auth/admins` | Admin | Menampilkan daftar akun admin aktif (Maksimal 2). |
| `POST` | `/api/auth/admins` | Admin | Menambah akun admin baru (dibatasi maksimal 2). |
| `DELETE` | `/api/auth/admins/:id` | Admin | Menghapus akun admin tertentu. |

### 2.2. Manajemen Siswa (`/api/users`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users` | Publik | Mendapatkan daftar siswa kelas XI-B2. |
| `POST` | `/api/users` | Admin | Menambah siswa baru. |
| `PUT` | `/api/users/:id` | Admin | Memperbarui profil, status aktif, atau jabatan siswa. |
| `DELETE` | `/api/users/:id` | Admin | Menghapus / menonaktifkan siswa. |
| `PATCH` | `/api/users/:id/xp` | Admin | Menambah/mengurangi poin XP siswa secara manual. |
| `GET` | `/api/leaderboard` | Publik | Menampilkan 10 besar siswa dengan XP tertinggi. |

### 2.3. Presensi Siswa (`/api/attendance`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/attendance` | Publik | Mengambil riwayat absensi harian/bulanan. |
| `GET` | `/api/attendance/recap` | Publik | Mengambil persentase dan rekapitulasi kehadiran. |
| `POST` | `/api/attendance` | Siswa / Admin | Melakukan presensi mandiri (dengan validasi duplikasi). |
| `PATCH` | `/api/attendance/:id/verify` | Admin | Memverifikasi absensi dan memicu penambahan XP server. |
| `DELETE` | `/api/attendance/:id` | Admin | Menghapus data absensi tertentu. |

### 2.4. Penugasan Siswa (`/api/tasks`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/tasks` | Siswa / Admin | Mengambil daftar tugas yang masuk. |
| `POST` | `/api/tasks` | Siswa / Admin | Mengunggah tugas baru (status awal: `Pending`). |
| `PATCH` | `/api/tasks/:id/status` | Admin | Meninjau tugas (`Valid` / `Ditolak`) & memberi XP. |
| `DELETE` | `/api/tasks/:id` | Admin | Menghapus tugas. |

### 2.5. Buku Kas Kelas (`/api/kas`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/kas` | Publik (Masked) / Admin (Full) | Mengambil daftar kas bulanan. |
| `GET` | `/api/kas/summary` | Publik | Mengambil ringkasan saldo total kas. |
| `POST` | `/api/kas` | Admin | Menambahkan catatan kas dan bukti foto. |
| `PUT` | `/api/kas/:id` | Admin | Mengubah data kas atau daftar tunggakan. |
| `DELETE` | `/api/kas/:id` | Admin | Menghapus catatan kas. |

### 2.6. Pengunggahan Berkas (`/api/upload`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/upload` | Siswa / Admin | Mengunggah file tunggal atau batch (gambar, dokumen, pdf). |

### 2.7. Server-Sent Events (`/api/realtime`)
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `GET` | `/api/realtime/events` | Publik / Siswa / Admin | Streaming event real-time terfilter. |
| `GET` | `/api/realtime/status` | Publik | Status koneksi dan versi data real-time. |
