# 📋 PRD (Product Requirements Document)
## Platform Sistem Terpadu Social XI-B2 (SMAN 1 Sandai)

---

### 1. Tujuan & Latar Belakang Produk
Platform **Social XI-B2** dibangun untuk memodernisasi tata kelola kelas, absensi, penugasan, akuntabilitas keuangan kelas, dan pelestarian dokumentasi kegiatan siswa kelas XI-B2 di **SMAN 1 Sandai**. Aplikasi ini mengedepankan otomasi digital, transparansi, ketepatan data real-time, serta gamifikasi pendidikan untuk memacu kedisiplinan dan keterlibatan aktif para siswa.

---

### 2. Sasaran Pengguna
1. **Wali Kelas & Guru Pengajar**: Memantau statistik kehadiran harian, mengevaluasi kedisiplinan pengumpulan tugas, dan menerima rekapitulasi berkala.
2. **Pengurus Kelas (Ketua, Sekretaris, Bendahara / Admin)**: Mengelola database anggota kelas, memverifikasi presensi harian, mencatat mutasi uang kas, memoderasi pesan, dan memperbarui foto/logo kelas.
3. **Siswa Kelas XI-B2 (33 Siswa Aktif)**: Melakukan absensi mandiri, mengunggah penugasan akademik, melihat peringkat XP di leaderboard, dan berpartisipasi dalam forum kelas.
4. **Orang Tua Siswa & Publik / Tamu**: Memantau keterbukaan kas dan dokumentasi prestasi kelas secara transparan tanpa mengorbankan privasi individu siswa.

---

### 3. Persyaratan Fungsional Produk (Functional Requirements)

#### 3.1. Manajemen Siswa & Roster
- **FR-01**: Menyimpan daftar resmi 33 siswa kelas XI-B2 lengkap dengan NISN, nama lengkap, jenis kelamin, agama, jabatan kelas, foto profil, motto, dan akun Instagram.
- **FR-02**: Mendukung perubahan status siswa menjadi `ACTIVE` atau `INACTIVE` beserta alasan administratif.
- **FR-03**: Siswa non-aktif secara otomatis dicegah melakukan presensi baru, dikeluarkan dari perhitungan statistik aktif, dan dikeluarkan dari leaderboard XP tanpa menghapus riwayat historisnya.

#### 3.2. Presensi Harian Real-Time
- **FR-04**: Siswa aktif dapat melakukan presensi mandiri dengan status: `Hadir`, `Terlambat`, `Izin`, `Sakit`, atau `Alpa`.
- **FR-05**: Sistem memberlakukan validasi ketat anti-duplikasi: satu siswa hanya dapat melakukan satu kali pencatatan pada tanggal yang sama.
- **FR-06**: Admin memiliki kewenangan penuh memverifikasi absensi, mengubah status jika diperlukan, dan memberikan verifikasi resmi.
- **FR-07**: Verifikasi absensi memberikan penambahan XP terukur di sisi server (10 XP untuk Hadir, 5 XP untuk Terlambat).

#### 3.3. Penugasan & Pusat Tugas Siswa
- **FR-08**: Siswa dapat mengunggah file penugasan sesuai mata pelajaran dengan lampiran yang divalidasi.
- **FR-09**: Status penugasan dimulai dari `Pending`, lalu dinilai oleh admin menjadi `Valid` atau `Ditolak` disertai catatan koreksi.
- **FR-10**: Reward XP tugas dihitung dan diaplikasikan langsung oleh server saat disetujui.

#### 3.4. Transparansi Kas Kelas
- **FR-11**: Pencatatan mutasi kas bulanan dengan bukti unggahan foto buku kas/nota fisik.
- **FR-12**: Ringkasan kesehatan kas (saldo total, tren bulanan, status kelengkapan).
- **FR-13**: Perlindungan privasi: daftar rincian tunggakan individu hanya dapat diakses oleh Admin, sementara Tamu/Publik hanya melihat data agregat.

#### 3.5. Galeri & Dokumentasi Terpusat
- **FR-14**: Admin dapat mengunggah foto tunggal maupun batch (10–100+ gambar sekaligus).
- **FR-15**: Validasi format gambar (JPEG, PNG, WebP) dan ukuran maksimal 25 MB per berkas.

#### 3.6. Sistem Real-Time Server-Sent Events (SSE)
- **FR-16**: Seluruh perubahan data langsung disiarkan ke semua klien aktif via SSE tanpa reload browser.
- **FR-17**: Eksekusi selalu mematuhi urutan mutlak: Validasi -> Transaksi Database -> Commit -> Broadcast Event.
- **FR-18**: Reconnection handling dengan mekanisme `Last-Event-ID` dan heartbeat ping 15 detik.

---

### 4. Persyaratan Non-Fungsional (Non-Functional Requirements)
- **Keamanan (Security)**: Password disimpan dalam bentuk hash SHA-256; token JWT aman; perlindungan dari serangan IDOR dan manipulasi parameter URL.
- **Integritas Data (Data Integrity)**: Transaksi ACID dengan rollback jika terjadi kegagalan; validasi schema relasional.
- **Performa (Performance)**: Waktu respons API rata-rata < 100ms; koneksi SSE ringan dengan konsumsi memori minimal.
- **Isolasi Kelas (Tenant Isolation)**: Seluruh data diproteksi dan diasosiasikan dengan identifier cabang `smansandai-xib2`.
