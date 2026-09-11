# 🗄️ DATABASE.md: Dokumentasi Skema & Relasi Database

---

## 1. Skema PostgreSQL (Drizzle ORM Definition)

Sistem menggunakan skema relasional terstruktur dengan 10 entitas utama yang didefinisikan dalam `src/db/schema.ts`:

### 1.1. Tabel `branches`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key (contoh: `smansandai-xib2`) |
| `tenant_id` | `VARCHAR(64)` | Identifier organisasi sekolah |
| `name` | `VARCHAR(128)` | Nama kelas |
| `school_name` | `VARCHAR(128)` | Nama sekolah |
| `wali_kelas` | `VARCHAR(128)` | Nama wali kelas |
| `class_photo_url` | `TEXT` | URL foto bersama kelas |
| `class_logo_url` | `TEXT` | URL lambang/logo kelas |
| `max_admins` | `INTEGER` | Batas maksimum admin (default: 2) |
| `version` | `INTEGER` | Nomor versi optimistik |
| `created_at` / `updated_at` | `TIMESTAMP` | Timestamps audit |

### 1.2. Tabel `users`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key |
| `branch_id` | `VARCHAR(64)` | Foreign Key -> `branches.id` |
| `email` | `VARCHAR(191)` | Unique Email |
| `name` | `VARCHAR(128)` | Nama lengkap |
| `role` | `VARCHAR(32)` | `admin` \| `siswa` \| `guest` |
| `password_hash` | `TEXT` | Hash SHA-256 kata sandi |
| `student_id` | `VARCHAR(64)` | Nullable, relasi ke `students.id` |
| `is_active` | `BOOLEAN` | Status akun aktif |

### 1.3. Tabel `students` (Roster 33 Siswa)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key (`std-01`, dll) |
| `branch_id` | `VARCHAR(64)` | Foreign Key -> `branches.id` |
| `nisn` | `VARCHAR(32)` | Unique NISN Siswa |
| `name` | `VARCHAR(128)` | Nama Siswa |
| `gender` | `VARCHAR(2)` | `L` (Laki-laki) \| `P` (Perempuan) |
| `agama` | `VARCHAR(32)` | Agama siswa |
| `photo` | `TEXT` | URL foto profil |
| `role` | `VARCHAR(64)` | Jabatan organisasi kelas |
| `xp` | `INTEGER` | Poin gamifikasi terkumpul |
| `motto` | `TEXT` | Motto hidup siswa |
| `instagram` | `VARCHAR(64)` | Handle Instagram |
| `status` | `VARCHAR(32)` | `ACTIVE` \| `INACTIVE` |
| `status_reason` | `TEXT` | Alasan jika non-aktif |

### 1.4. Tabel `attendances` (Presensi Harian)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key |
| `student_id` | `VARCHAR(64)` | Foreign Key -> `students.id` |
| `date` | `VARCHAR(10)` | Format `YYYY-MM-DD` |
| `status` | `VARCHAR(32)` | `Hadir` \| `Terlambat` \| `Izin` \| `Sakit` \| `Alpa` |
| `verified` | `BOOLEAN` | Status verifikasi oleh Admin |
| `xp_awarded` | `INTEGER` | Poin XP yang diberikan server |

*Indeks Unik*: `uniqueIndex('attendance_student_date_unique').on(studentId, date)` mencegah pencatatan ganda pada hari yang sama.

### 1.5. Tabel `tasks` (Pusat Penugasan)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key |
| `student_id` | `VARCHAR(64)` | Foreign Key -> `students.id` |
| `title` | `VARCHAR(256)` | Judul tugas |
| `subject` | `VARCHAR(128)` | Mata pelajaran |
| `file_url` | `TEXT` | URL file tersimpan |
| `status` | `VARCHAR(32)` | `Pending` \| `Valid` \| `Ditolak` |
| `admin_note` | `TEXT` | Catatan koreksi dari admin |
| `xp_awarded` | `INTEGER` | Reward XP dari server |

### 1.6. Tabel `cash_records` (Kas Kelas)
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `VARCHAR(64)` | Primary Key |
| `bulan` | `VARCHAR(64)` | Nama periode bulan |
| `total_kas` | `INTEGER` | Saldo kas terkumpul |
| `image_url` | `TEXT` | Foto bukti fisik buku kas |
| `unpaid_students` | `JSONB` | Daftar siswa yang belum lunas (Privat) |

### 1.7. Tabel `gallery` & `file_objects`
Menyimpan foto dokumentasi kegiatan kelas dan seluruh metadata objek file terunggah.

### 1.8. Tabel `audit_logs`
Menyimpan catatan audit trail yang tidak dapat diubah (immutable), merekam setiap operasi penting beserta aktor, peran, dan timestamp.
