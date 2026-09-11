# 🏛️ Social-XI-B2 Platform (SMAN 1 Sandai)

Sistem Informasi Terpadu, Presensi Real-Time, Manajemen Penugasan, Transparansi Kas, dan Galeri Dokumentasi Kelas **XI-B2 SMAN 1 Sandai**.

---

## 🌟 Ringkasan Aplikasi
Platform ini dirancang dengan standar arsitektur **Full-Stack Production** menggunakan **React 18 + Vite**, **Express.js**, **Server-Sent Events (SSE)**, **PostgreSQL / Drizzle ORM Database Engine**, dan **Sistem RBAC Ketat Server-Side**.

### Fitur Utama:
1. **Roster 33 Siswa & Struktur Organisasi**: Profil lengkap 33 siswa kelas XI-B2 dengan pelacakan status aktif/non-aktif dan gamifikasi XP.
2. **Presensi Siswa Mandiri & Verifikasi Admin**: Pencatatan kehadiran harian dengan validasi constraint anti-duplikasi, penentuan identitas berbasis JWT, dan audit log lengkap.
3. **Pusat Tugas & Review Antrian**: Siswa dapat mengunggah file tugas (PDF, Dokumen, Gambar), admin meninjau kelayakan dan memberikan reward XP yang dihitung di server.
4. **Transparansi Buku Kas Kelas**: Pembukuan kas bulanan, upload bukti fisik nota/buku kas, dan perlindungan privasi data tunggakan untuk pengunjung umum.
5. **Galeri Dokumentasi & Unggah Massal**: Dukungan unggah foto multi-file (10–100+ file) dengan validasi MIME, ekstensi, batas ukuran, dan metadata persisten.
6. **Sinkronisasi Real-Time SSE**: Notifikasi pembaruan instan tanpa refresh halaman dengan urutan transaksi mutlak: `REQUEST -> AUTH -> VALIDATE -> DB COMMIT -> EVENT BROADCAST -> CLIENT UPDATE`.
7. **Jadwal Pelajaran & Kalender Kegiatan**: Jadwal harian terpadu beserta hitung mundur ujian dan kegiatan sekolah.
8. **Ruang Interaksi & Komunitas**: Forum diskusi siswa, kotak pesan anonim (Confession Box), Mood Tracker harian, dan Simulasi Indeks Kas Saham.

---

## 🏗️ Struktur Arsitektur & Teknologi

```
├── src/
│   ├── components/         # Komponen UI Modular (React + Tailwind CSS)
│   ├── db/                 # PostgreSQL Schema, Drizzle ORM, Indexing, Pool
│   │   ├── schema.ts       # 10 Tabel Relasional Lengkap
│   │   ├── index.ts        # PostgreSQL Pool Connection
│   │   └── drizzle.config.ts # Konfigurasi Migrasi Drizzle
│   ├── server/             # Backend Core Services
│   │   ├── database.ts     # Engine Transaksi & Atomic Persistence
│   │   ├── realtime.ts     # Server-Sent Events (SSE) Hub & Reconnect Replay
│   │   └── storage.ts      # Validasi & Manajemen File Object Storage
│   └── services/           # Frontend API & SSE Client Integration
├── data/
│   ├── central_database.json # Database Persisten Lokal Sandboxed
│   └── uploads/            # File Storage Nyata
├── server.ts               # Express Entrypoint & API Hardening
└── dist/                   # Bundled Output Produksi
```

---

## 🔐 Akun & Hak Akses (RBAC)

| Peran | Kredensial Login | Hak Akses Utama |
|---|---|---|
| **Admin Kelas** | `Adminkelas@gmail.com` / `Admin` | Kelola siswa, verifikasi presensi, review tugas, input kas, unggah galeri, atur logo/foto, audit log. |
| **Wali Kelas** | `wali.indra@sman1sandai.sch.id` / `WaliKelas2026` | Monitoring menyeluruh, evaluasi kehadiran, persetujuan administratif. |
| **Siswa XI-B2** | NISN Siswa (atau `siswab2@gmail.com` / `XI-B2 Jaya`) | Presensi mandiri (akun aktif), kirim tugas, posting forum, vote mood, lihat leaderboard. |
| **Pengunjung (Guest)** | Akses Publik / Mode Pengunjung | Melihat info umum, agregat kas, jadwal pelajaran, dokumentasi galeri, dan confession box. |

---

## 🚀 Menjalankan Aplikasi

### Mode Pengembangan (Dev Mode):
```bash
npm run dev
```

### Membangun untuk Produksi (Production Build):
```bash
npm run build
npm run start
```

### Menjalankan Pengujian Backend:
```bash
npx tsx scripts/test-backend.ts
```

---

## 📚 Indeks Dokumentasi Sistem
- [PRD.md](./PRD.md) - Product Requirements Document
- [CRD.md](./CRD.md) - Community & User Requirements
- [MRD.md](./MRD.md) - Mission & Roadmap Requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Full-Stack Architecture & Data Flow
- [DATABASE.md](./DATABASE.md) - PostgreSQL Relational Schema & Indices
- [API.md](./API.md) - REST API Endpoint Reference & Error Codes
- [AUTH.md](./AUTH.md) - Authentication & Token Specifications
- [RBAC.md](./RBAC.md) - Role-Based Access Control Rules
- [REALTIME.md](./REALTIME.md) - SSE Architecture & Event Sequence
- [STORAGE.md](./STORAGE.md) - File Storage & Batch Upload Handling
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment Guide & Environment Variables
- [SECURITY.md](./SECURITY.md) - Security Hardening & Audit Logging
