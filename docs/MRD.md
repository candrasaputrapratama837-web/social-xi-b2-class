# 🎯 MRD (Market & Mission Requirements Document)
## Platform Social XI-B2 SMAN 1 Sandai

---

### 1. Visi & Misi Produk
- **Visi**: Mewujudkan tata kelola kelas berbasis digital yang transparan, modern, interaktif, dan akuntabel sebagai percontohan kelas digital unggulan di SMAN 1 Sandai.
- **Misi**:
  1. Mengeliminasi pencatatan manual berbasis kertas yang rentan hilang atau rusak.
  2. Mendorong keterbukaan finansial kas kelas kepada seluruh pemangku kepentingan.
  3. Meningkatkan motivasi belajar dan kehadiran siswa melalui gamifikasi XP edukatif.
  4. Menyediakan wadah kolaborasi, komunikasi positif, dan arsip kenangan kelas yang abadi.

---

### 2. Analisis Nilai Tambah & Diferensiasi

| Aspek | Tata Kelola Konvensional | Platform Social XI-B2 |
|---|---|---|
| **Presensi Siswa** | Buku kertas, rentan titip absen atau manipulasi. | Presensi digital real-time dengan validasi JWT & deteksi duplikasi. |
| **Kas Kelas** | Buku tulis bendahara, rawan selisih dan curiga. | Pembukuan digital disertai bukti foto nota fisik transparan. |
| **Pengumpulan Tugas** | Bertumpuk di meja guru/ketua kelas, rawan terselip. | Antrean digital terstruktur dengan feedback koreksi dan riwayat waktu. |
| **Apresiasi Siswa** | Tidak terukur secara objektif harian. | Sistem Leaderboard XP otomatis yang memicu kompetisi positif. |
| **Arsip Dokumentasi** | Tersebar di grup chat dan memori HP individu. | Galeri awan terpusat dengan dukungan unggah massal resolusi tinggi. |

---

### 3. Matriks Roadmap Keberlanjutan

```
Fase 1: Fondasi Inti (Selesai)
- Roster 33 Siswa, RBAC Server-Side, Database Persistence, SSE Realtime
- Presensi Harian, Penugasan Akademik, Kas Kelas, Galeri

Fase 2: Penguatan & Keandalan (Saat Ini)
- PostgreSQL Schema & Drizzle ORM Setup
- Rate Limiting, Audit Logging, Batch File Storage
- Multi-Branch Isolation Architecture

Fase 3: Pengembangan Masa Depan (Rencana)
- Integrasi Notifikasi WhatsApp/Telegram Wali Murid
- Generator Rapor Karakter & Kedisiplinan Otomatis
- Kapsul Waktu Kelulusan dengan Penguncian Kriptografis Otomatis
```
