# 📦 STORAGE.md: Pengelolaan Berkas & Penyimpanan Objek

---

## 1. Spesifikasi Penyimpanan Berkas

- **Direktori Fisik**: `data/uploads/`
- **Akses Publik**: `/uploads/<storageKey>`
- **Batas Ukuran Maksimal**: 25 MB per berkas
- **Tipe MIME yang Diizinkan**:
  - Gambar: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
  - Dokumen: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX), `application/msword` (DOC), `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
  - Multimedia: `video/mp4`, `video/webm`, `audio/mpeg`, `audio/wav`

---

## 2. Struktur Metadata Berkas (`FileMetadata`)

Setiap berkas yang diunggah disimpan bersama metadata persisten:

```typescript
interface FileMetadata {
  id: string;             // Identifier unik berkas
  storageKey: string;     // Nama file persisten pada disk dengan hash SHA-256
  originalName: string;   // Nama asli berkas dari pengguna
  mimeType: string;       // Validated MIME type
  sizeBytes: number;      // Ukuran dalam byte
  url: string;            // URL publik yang dapat diakses browser
  uploader: string;       // Nama pengunggah
  uploaderRole: string;   // Role pengunggah (admin/siswa)
  category: string;       // Kategori (gallery, task, kas, logo, avatar)
  branchId: string;       // Cabang/Kelas (smansandai-xib2)
  createdAt: string;      // ISO 8601 Timestamp
}
```

---

## 3. Unggah Massal (Batch Upload)
Endpoint `POST /api/upload` dan `POST /api/gallery` mendukung pengunggahan banyak berkas sekaligus (10, 50, hingga 100+ berkas) dalam satu transaksi request dengan konversi base64/buffer otomatis.
