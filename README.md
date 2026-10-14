# E-Brankas Soal FEB — SIKASA

**SIKASA** (Sistem Informasi Keamanan Soal Akademik) — aplikasi pengelolaan bank soal ujian untuk Fakultas Ekonomi dan Bisnis, Universitas Singaperbangsa Karawang.

Dosen mengunggah soal ujian dalam bentuk terenkripsi, Kaprodi meninjau & menyetujui, pencetakan dilakukan dengan PIN sekali pakai, dan seluruh aktivitas tercatat dalam log — tanpa menyimpan file soal mentah di disk lokal.

## Tech Stack

| Lapisan    | Teknologi                                          |
| ---------- | -------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 8, Tailwind CSS v4      |
| Backend    | Laravel 10 (PHP ≥ 8.1), MySQL                      |
| Autentikasi| Bearer token (login → token disimpan di browser)   |

## Struktur Repositori

```
├── src/          # Aplikasi React (frontend)
│   ├── App.tsx   # Seluruh UI: login, dashboard, alur unggah/cetak soal
│   ├── db.ts     # Lapisan data: API client + mapper API → model UI
│   ├── db.test.ts# Unit test lapisan data (mock fetch, tanpa jaringan)
│   └── brand.ts  # Konstanta branding (judul, kop, hak cipta)
├── public/       # Aset statis (favicon)
├── backend/      # Aplikasi Laravel (API + cetak + berita acara PDF)
├── db/           # (lokal) dump database — tidak di-commit
└── index.html    # Shell HTML + meta branding SIKASA FEB
```

## Menjalankan Frontend

Prasyarat: **Node.js ≥ 22** dan pnpm.

```bash
pnpm install
pnpm dev          # development server di http://localhost:8443
```

Perintah lain:

```bash
pnpm build        # bundel produksi ke dist/
pnpm preview      # pratinjau hasil build
pnpm test         # unit test lapisan data (node --test)
pnpm typecheck    # pemeriksaan TypeScript tanpa kompilasi
pnpm format       # format kode dengan oxfmt
```

> Backend API harus berjalan agar login & data berfungsi. Alamat API dibaca dari `src/db.ts` (`API_BASE`).

## Menjalankan Backend

Prasyarat: PHP ≥ 8.1, Composer, MySQL.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Sesuaikan kredensial DB_DATABASE / DB_USERNAME / DB_PASSWORD di .env
php artisan migrate --seed
php artisan serve     # http://127.0.0.1:8000
```

### Konfigurasi cetak (opsional, Windows)

Di `backend/.env`, tentukan perintah pengiriman ke printer (kosongkan untuk mode spool PDF saja):

```env
EBRANKAS_PRINT_COMMAND=powershell -NoProfile -Command "Start-Process -FilePath '{file}' -Verb PrintTo '{printer}'"
EBRANKAS_PRINT_TIMEOUT=60
```

## Kredensial Demo

Empat akun demo tersedia langsung di halaman login (lihat `demoCredentials` di `src/App.tsx`):

| Peran    | Email                          | Password    |
| -------- | ------------------------------ | ----------- |
| Panitia  | siti.h@feb.ac.id               | panitia123  |
| Dosen    | rina.kurniawati@feb.ac.id      | dosen123    |
| Kaprodi  | dian.puspitasari@feb.ac.id     | kaprodi123  |
| Admin IT | rizky.it@feb.ac.id             | admin123    |

## Keamanan (sebelum dipublikasikan)

- `backend/.env` (kredensial DB & APP_KEY) **tidak** di-commit — sudah masuk `.gitignore`.
- `backend/vendor/` dan `node_modules/` diabaikan Git; pasang ulang lewat `composer install` / `pnpm install`.
- File `db/*.sql` diabaikan karena dapat berisi data nyata (akun, PIN cetak). Buat dump skema bersih (tanpa `INSERT`) bila ingin membagikan skema database.

