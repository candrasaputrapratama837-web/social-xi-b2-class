# 🛡️ RBAC.md: Role-Based Access Control

---

## 1. Matriks Kewenangan Hak Akses

| Fitur / Tindakan | GUEST / PUBLIK | SISWA (AKTIF) | ADMIN / WALI KELAS |
|---|:---:|:---:|:---:|
| **Melihat Profil & Roster Siswa** | ✅ | ✅ | ✅ |
| **Melihat Leaderboard XP** | ✅ | ✅ | ✅ |
| **Presensi Mandiri Harian** | ❌ | ✅ | ✅ (Bisa atas nama siswa) |
| **Verifikasi & Ubah Absensi** | ❌ | ❌ | ✅ |
| **Mengunggah Tugas** | ❌ | ✅ (Tugas sendiri) | ✅ |
| **Meninjau Tugas & Memberi XP** | ❌ | ❌ | ✅ |
| **Melihat Saldo Kas Terkumpul** | ✅ | ✅ | ✅ |
| **Melihat Bukti Foto Buku Kas** | ✅ | ✅ | ✅ |
| **Melihat Rincian Tunggakan Siswa**| ❌ (Masked) | ❌ (Masked) | ✅ |
| **Input / Ubah / Hapus Data Kas** | ❌ | ❌ | ✅ |
| **Unggah Galeri / Ganti Foto Logo** | ❌ | ❌ | ✅ |
| **Membuat Pengumuman & Jadwal** | ❌ | ❌ | ✅ |
| **Melihat Audit Log Sistem** | ❌ | ❌ | ✅ |
| **Mengelola Akun Admin** | ❌ | ❌ | ✅ (Maks 2 Admin) |

---

## 2. Aturan Server-Side Enforcement

1. **Role Header / Body Untrusted**: Server tidak pernah membaca status peran dari input `req.body.role` saat melakukan autorisasi.
2. **Server-Side XP Protection**: Klien tidak diizinkan mengirimkan nilai kenaikan XP secara langsung. Poin XP selalu dihitung dan ditambahkan di sisi server saat verifikasi tugas/absensi.
3. **Inactive Student Rule**:
   - Riwayat kehadiran dan tugas masa lampau tetap tersimpan utuh.
   - Presensi baru diblokir dengan pesan `403 FORBIDDEN`.
   - Dikeluarkan dari leaderboard aktif dan statistik kehadiran harian aktif.
