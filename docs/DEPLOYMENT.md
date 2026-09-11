# 🚀 DEPLOYMENT.md: Panduan Deployment & Produksi

---

## 1. Persyaratan Lingkungan (Environment Requirements)
- **Node.js**: v18.0.0 atau lebih tinggi
- **Port Layanan**: Port `3000` (Wajib untuk Cloud Run container proxy)
- **Host**: `0.0.0.0`

---

## 2. Skrip Build & Eksekusi

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  }
}
```

### Langkah Deployment:
1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```
2. **Kompilasi Frontend & Backend Bundle**:
   ```bash
   npm run build
   ```
3. **Menjalankan Server Produksi**:
   ```bash
   npm run start
   ```

---

## 3. Konfigurasi Variabel Lingkungan (.env)
Pastikan seluruh variabel terkonfigurasi dengan benar sesuai template `.env.example`:
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `AUTH_SECRET`: Kunci enkripsi JWT
- `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`: Konfigurasi Cloud SQL / PostgreSQL (opsional untuk Drizzle)
