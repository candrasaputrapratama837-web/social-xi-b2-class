# 🏛️ Arsitektur Sistem Social XI-B2

---

## 1. Diagram Arsitektur Tingkat Tinggi

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   +-----------------------------------------------------------------+   |
|   |         React 18 + Vite (SPA) + Tailwind CSS + Lucide Icons     |   |
|   |   - AbsensiSection    - SiswaSection      - RekapKasSection     |   |
|   |   - TaskSection       - OrganisasiSection - AgoraRoom (Forum)   |   |
|   |   - AdminDashboard    - MoodTracker       - CountdownEvent      |   |
|   +-----------------------------------------------------------------+   |
|                                    |                                    |
|              REST API (JSON)       |        SSE Stream (text/event-stream)
|              (Authorization: Bearer)        (Last-Event-ID recovery)   |
|                                    v                                    v
+-------------------------------------------------------------------------+
|                             BACKEND LAYER                               |
|   +-----------------------------------------------------------------+   |
|   |                  Express.js Full-Stack Application              |   |
|   |                                                                 |   |
|   |  [Middlewares]                                                  |   |
|   |   - Rate Limiter (IP sliding window)                            |   |
|   |   - JWT Token Extractor & Authenticator                         |   |
|   |   - RBAC Enforcer (Admin, Siswa, Public)                        |   |
|   |   - Error Sanitizer & Structured Error Responder                |   |
|   |                                                                 |   |
|   |  [Core Services]                                                |   |
|   |   - StorageService (MIME & Size Validator, Batch File Processor)|   |
|   |   - RealtimeHub (Client Registry, Filtered Event Broadcaster)   |   |
|   |   - AuditLogger (Immutable Security & Operation Trail)          |   |
|   +-----------------------------------------------------------------+   |
|                                    |                                    |
|                                    v                                    |
|   +-----------------------------------------------------------------+   |
|   |                         DATA ENGINE                             |   |
|   |   - PostgreSQL Schema & Pool (Drizzle ORM Engine)               |   |
|   |   - Central Database Engine (ACID In-Memory + Disk Sync)        |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

---

## 2. Alur Transaksi & Real-Time SSE (Urutan Mutlak)

Sistem memberlakukan aturan keras eksekusi satu arah untuk menjamin konsistensi data:

```
[ CLIENT ACTION ]
       |
       v
1. REQUEST DISPATCH (Mengirim permintaan HTTP dengan payload & token)
       |
       v
2. AUTHENTICATION & RBAC (Server mengekstrak user, memeriksa hak akses role)
       |
       v
3. BUSINESS VALIDATION (Pemeriksaan status aktif, batas kuota, constraint duplikasi)
       |
       v
4. DATABASE TRANSACTION (Eksekusi mutasi data dalam atomic transaction runner)
       |
       v
5. DATABASE COMMIT (Data tersimpan permanen dan konsisten)
       |
       v
6. AUDIT TRAIL LOGGING (Pencatatan aktor, role, aksi, timestamp ke audit log)
       |
       v
7. REALTIME BROADCAST (RealtimeHub menyiarkan event SSE ke klien terotorisasi)
       |
       v
8. CLIENT STATE UPDATE (Frontend menerima event dan memperbarui UI seketika)
```

---

## 3. Isolasi Cabang / Kelas (Branch Isolation)
Setiap rekaman data (siswa, presensi, tugas, kas, jadwal, galeri, log) diasosiasikan dengan `branchId: 'smansandai-xib2'`. Hal ini mencegah kebocoran data antar-kelas atau antar-cabang sekolah.
