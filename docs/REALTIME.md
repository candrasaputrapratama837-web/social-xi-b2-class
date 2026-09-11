# ⚡ REALTIME.md: Arsitektur Server-Sent Events (SSE)

---

## 1. Spesifikasi Kanal SSE

- **Endpoint**: `GET /api/realtime/events`
- **MIME Type**: `text/event-stream`
- **Protokol**: HTTP/1.1 atau HTTP/2 Streaming
- **Headers Wajib**:
  - `Cache-Control: no-cache, no-transform`
  - `Connection: keep-alive`
  - `X-Accel-Buffering: no` (Mencegah proxy buffering di Nginx/Cloud Run)

---

## 2. Struktur Payload Event

Setiap siaran SSE dikemas dalam format JSON terstruktur:

```
id: evt-1725000000000-14
event: student.updated
data: {
  "eventId": "evt-1725000000000-14",
  "eventType": "student.updated",
  "entityType": "student",
  "entityId": "std-01",
  "payload": {
    "_id": "std-01",
    "name": "AHMAD DANI",
    "xp": 120,
    "version": 4
  },
  "version": 14,
  "timestamp": "2026-08-31T08:00:00.000Z",
  "targetRole": "all"
}
```

---

## 3. Daftar Event Wajib yang Disiarkan

| Nama Event | Entitas | Pemicu (Trigger) |
|---|---|---|
| `student.created` | `student` | Penambahan data siswa baru oleh admin |
| `student.updated` | `student` | Pembaruan profil siswa |
| `student.status_changed` | `student` | Perubahan status keaktifan siswa (`ACTIVE`/`INACTIVE`) |
| `student.deleted` | `student` | Penghapusan data siswa |
| `profile.updated` | `student` | Update data profil |
| `attendance.created` | `attendance` | Presensi mandiri baru berhasil dikirim |
| `attendance.updated` | `attendance` | Pembaruan catatan/status presensi |
| `attendance.verified` | `attendance` | Presensi diverifikasi admin (memicu reward XP) |
| `attendance.deleted` | `attendance` | Penghapusan presensi |
| `assignment.submitted` | `task` | Siswa mengunggah penugasan baru |
| `assignment.reviewed` | `task` | Admin menyetujui/menolak tugas |
| `task.deleted` | `task` | Penghapusan penugasan |
| `cash.updated` / `kas.created` | `kas` | Pencatatan mutasi kas bulanan baru |
| `kas.monthly.updated` | `kas` | Pembaruan buku kas bulanan |
| `gallery.created` / `deleted` | `gallery` | Penambahan/penghapusan foto galeri |
| `logo.updated` | `settings` | Penggantian logo kelas |
| `class.photo.updated` | `settings` | Penggantian foto utama kelas |
| `leaderboard.updated` | `leaderboard` | Rekalkulasi top 10 siswa berdasarkan XP |

---

## 4. Keandalan Koneksi (Heartbeat & Reconnection)
1. **Heartbeat**: Server mengirimkan komentar `:ping <timestamp>` setiap 15 detik untuk menjaga pipa koneksi tetap hidup dan mencegah timeout NAT/proxy.
2. **Replay Missed Events**: Klien mengirim header `Last-Event-ID` saat melakukan reconnect. Server secara otomatis memutar ulang 100 event terakhir yang belum diterima klien.
