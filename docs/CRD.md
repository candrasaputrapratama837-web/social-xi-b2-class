# 👥 CRD (Community / Customer Requirements Document)
## Platform Social XI-B2 SMAN 1 Sandai

---

### 1. Profil Pengguna & Komunitas
Komunitas pengguna platform ini mencakup civitas akademika kelas XI-B2 SMAN 1 Sandai yang terdiri atas:
- **Wali Kelas**: Pembina utama kelas yang membutuhkan transparansi dan data cepat untuk pelaporan ke pihak sekolah.
- **Siswa (33 Anggota)**: Remaja generasi digital yang menginginkan antarmuka modern, interaktif, responsif di ponsel, serta apresiasi berupa sistem gamifikasi XP.
- **Pengurus Kelas (Admin)**: Siswa yang bertugas mengelola presensi harian, buku kas, dan publikasi kegiatan kelas.
- **Orang Tua / Alumni**: Pengamat yang membutuhkan bukti akuntabilitas pengelolaan uang kas dan kegiatan siswa.

---

### 2. Kebutuhan Kunci Pengguna (User Needs)

| Segmen Pengguna | Kebutuhan Utama | Solusi yang Diberikan |
|---|---|---|
| **Siswa** | Kemudahan absensi harian tanpa antre manual, unggah tugas tanpa hilang file, melihat ranking prestasi. | Presensi mandiri 1-klik, upload penugasan aman, sistem XP dan Leaderboard real-time. |
| **Pengurus Kelas** | Rekapitulasi absensi otomatis, pembukuan kas yang tidak mudah hilang, update pengumuman cepat. | Dashboard admin all-in-one, filter presensi bulanan/harian, unggah foto buku kas, broadcast SSE instan. |
| **Wali Kelas** | Pemantauan kedisiplinan siswa yang akurat dan kemampuan menonaktifkan siswa yang pindah/mutasi tanpa merusak data lampau. | Fitur deaktifasi akun administratif, ekspor/ringkasan data kehadiran, audit trail aktivitas. |
| **Orang Tua / Publik** | Mengetahui transparansi uang kas tanpa melihat aib tunggakan siswa lain. | Tampilan kas publik yang mengagregasikan total dana kas secara terbuka dengan penyaringan data privat. |

---

### 3. Skenario Penggunaan Utama (User Journeys)

#### Skenario A: Presensi Mandiri Siswa
1. Siswa membuka aplikasi di ponsel pintar dan masuk menggunakan NISN.
2. Siswa memilih status kehadiran hari ini (`Hadir` / `Izin` / `Sakit` / dll).
3. Server memverifikasi status keaktifan akun dan memastikan belum ada data presensi pada tanggal tersebut.
4. Server mencatat presensi, memancarkan event SSE, dan dashboard Admin langsung terupdate seketika.

#### Skenario B: Verifikasi Tugas & Poin XP
1. Siswa mengirimkan berkas laporan penugasan Bahasa Indonesia.
2. Tugas masuk ke antrean admin dengan status `Pending`.
3. Admin memeriksa kelengkapan berkas, mengklik `Valid`, dan memasukkan bobot XP (contoh: 25 XP).
4. Server memperbarui skor total siswa, menyiarkan pembaruan leaderboard, dan siswa melihat kenaikan peringkat seketika.

#### Skenario C: Laporan Uang Kas Bulanan
1. Bendahara kelas menghitung saldo kas bulanan dan memotret buku kas fisik.
2. Bendahara mengunggah foto bukti beserta nominal total saldo kas bulan berjalan.
3. Seluruh siswa dan wali kelas menerima notifikasi real-time saldo kas terkini.
