# E-Brankas Soal FEB — SIKASA

**SIKASA** (Sistem Informasi Keamanan Soal Akademik) — aplikasi pengelolaan bank soal ujian terenkripsi untuk Fakultas Ekonomi dan Bisnis, Universitas Singaperbangsa Karawang.

> Dosen mengunggah soal ujian dalam bentuk **terenkripsi AES-256**, Kaprodi meninjau & membuka jendela cetak, Panitia/TU mencetak dengan **PIN Cetak harian**, dan seluruh aktivitas tercatat dalam log anti-bocor. **File soal tidak pernah tersimpan mentah di disk dan tidak pernah diunduh ke perangkat petugas** — hanya dicetak di sisi server dengan watermark keamanan.

## Tech Stack

| Lapisan    | Teknologi                                                  |
| ---------- | ---------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 8, Tailwind CSS v4              |
| Backend    | Laravel 10 (PHP ≥ 8.1), MySQL / MariaDB                    |
| Autentikasi| Laravel Sanctum (Bearer token disimpan di browser)         |
| PDF        | FPDI (impor halaman asli) + DomPDF (sampul & berita acara) |
| Deteksi OS | `wmic printer` untuk deteksi & scan printer Windows Server |

## Peran Pengguna & Hak Akses

| Peran      | Email demo                     | Menu utama                                                        | Hak khusus                                                         |
| ---------- | ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| Dosen      | `rina.kurniawati@feb.ac.id`    | Dashboard, Upload Soal, Soal Saya                                 | Unggah + kunci soal; ajukan revisi setelah dikunci                 |
| Kaprodi    | `dian.puspitasari@feb.ac.id`   | Rekap Soal, Approval Revisi, Log & Berita Acara                   | Buka jendela cetak; PIN Cetak harian; pengingat; berita acara PDF  |
| Panitia/TU | `siti.h@feb.ac.id`             | Antrian Cetak                                                     | Cetak soal (dengan PIN Kaprodi + pilihan printer)                  |
| Admin IT   | `rizky.it@feb.ac.id`           | Dashboard, Status Server, Manajemen User, Master Mata Kuliah      | Kelola printer (+ scan Windows), kelola user, infrastruktur        |

> Pembatasan keras di backend: **tidak ada endpoint yang mengembalikan isi file soal ke klien** — file tidak bisa diunduh/dilihat, bahkan oleh Admin IT.

## Alur Kerja Lengkap

### 1. Alur utama: dari unggah sampai cetak

```
DOSEN                 KAPRODI               PANITIA/TU            SERVER
  │                      │                      │                   │
  │ 1. Upload PDF + data │                      │                   │
  │ ──────────────────────────────────────────────────────────────► │
  │    (rename acak + enkripsi AES-256 + hash SHA-256 +             │
  │     status "terkunci" + jadwal buka cetak H-1 jam 07.00)        │
  │                      │◄── notifikasi "Soal baru diunggah" ──────│
  │                      │                      │                   │
  │                      │ 2. Rekap: cek MK yang belum upload       │
  │                      │    (opsional: kirim pengingat)           │
  │                      │ 3. Buka Cetak (terkunci → siap_cetak) ──►│
  │                      │◄── notifikasi "Soal siap dicetak" ───────│──► PANITIA
  │                      │                      │                   │
  │                      │                      │ 4. Antrian Cetak  │
  │                      │                      │ 5. Konfirmasi:    │
  │                      │                      │    jumlah + PIN   │
  │                      │                      │    + printer ────►│
  │                      │                      │                   │ validasi PIN
  │                      │                      │                   │ + jendela cetak
  │                      │                      │                   │ decrypt → PDF
  │                      │                      │                   │ + watermark →
  │                      │                      │                   │ spool → printer
  │                      │                      │◄── log cetak ─────│
```

Langkah detail:

1. **Dosen unggah soal** (`POST /api/soal`) — memilih mata kuliah, jenis (UTS/UAS), judul, jadwal ujian, jumlah mahasiswa, lalu mengunggah **satu file PDF**. Server: rename acak (`x7s9d2f3.pdf`), enkripsi AES-256, simpan di storage privat, catat SHA-256, status `terkunci`, hitung `waktu_mulai_cetak` (H-1, jam 07.00), dan kirim notifikasi ke Kaprodi.
2. **Kaprodi memantau Rekap Soal** — tahu MK mana yang sudah/belum unggah; bisa kirim **pengingat** (notifikasi in-app) ke dosen yang belum unggah.
3. **Kaprodi membuka cetak** (`POST /api/soal/{id}/buka-cetak`) — status `terkunci` → `siap_cetak`; Panitia menerima notifikasi "Soal siap dicetak".
4. **Revisi (opsional)** — setelah dikunci, dosen bisa mengajukan **PDF baru + alasan**; permintaan berstatus `menunggu` sampai Kaprodi **menyetujui/menolak** dengan catatan.
5. **Panitia mencetak** (`POST /api/cetak/{id}`) di halaman Antrian Cetak — memasukkan **jumlah salinan**, **PIN Cetak Kaprodi (6 digit)**, dan **memilih printer** (dropdown ala Word; boleh printer yang belum terhubung — job tetap masuk antrian). Server memvalidasi jendela cetak + PIN, lalu: decrypt file asli → susun PDF (halaman Berita Acara + seluruh halaman naskah asli) → tempel **watermark** `DOKUMEN RAHASIA - DICETAK OLEH {nama} - {waktu} - MK {mata kuliah}` + nomor halaman → tulis ke folder spool → (opsional) kirim ke printer lewat perintah OS → catat `log_cetak`.
6. **Log & Berita Acara** — semua aksi terekam di `log_aktivitas` (IP, user-agent, detail JSON); riwayat percetakan di `log_cetak`; Kaprodi bisa mengunduh **Berita Acara PDF** (rekap pengumpulan + riwayat cetak).

### 2. Status kehidupan soal (`bank_soal.status`)

```
 terkunci ──(Kaprodi buka cetak)──► siap_cetak ──(arsip setelah UAS)──► arsip
```

- `terkunci` — menunggu keputusan Kaprodi; belum bisa dicetak.
- `siap_cetak` — disetujui; bisa dicetak mulai `waktu_mulai_cetak` (H-1 jam 07.00).
- `arsip` — dikunci permanen; semua percetakan ditolak.

### 3. PIN Cetak harian (terpisah dari password)

- Setiap akun **Kaprodi** punya **PIN Cetak 6 digit** (`users.pin_cetak`, di-hash bcrypt) — dibuat otomatis saat akun dibuat, bisa direset dari Manajemen User (PIN baru ditampilkan **sekali**).
- PIN **berlaku satu hari** (dicek `pin_cetak_at`, zona waktu Asia/Jakarta) — kedaluwarsa otomatis besok; dalam satu hari PIN yang sama bisa dipakai berkali-kali (tidak hangus per cetakan).
- Server mencocokkan PIN ke semua Kaprodi aktif yang PIN-nya berlaku hari ini — Panitia tidak perlu tahu PIN milik Kaprodi tertentu.

### 4. Alur job cetak (`log_cetak.status`)

| Status     | Keterangan                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| `menunggu` | PDF sudah jadi & tersimpan di **folder spool server**; diteruskan ke printer saat Admin IT menghubungkan printer (mode spool — alur tidak terblokir). |
| `diproses` | Sedang dikirim ke perintah printer.                                                    |
| `berhasil` | Berhasil diteruskan ke printer fisik.                                                  |
| `gagal`    | Perintah printer dikonfigurasi tetapi gagal dijalankan.                                |

Setiap job punya `job_id` (mis. `PRINT-0001`) untuk penelusuran, serta IP perangkat petugas dan watermark identitas pada file cetak.

## Skema Database

10 tabel bisnis + tabel bawaan Laravel (`personal_access_tokens`, `password_reset_tokens`, `failed_jobs`). Dibuat oleh migration di `backend/database/migrations/`; bisa juga diimpor langsung dari dump `db/e_brankas_soal_feb.sql`.

### Diagram relasi

```
users ──┬──< dosen_mata_kuliah >──┬── mata_kuliah ──< bank_soal >── users (pemilik)
        │                         │                                     │
        ├──< revisi_soal ─────────┼───────────── bank_soal ─────────────┤
        ├──< log_aktivitas ───────┘                                     │
        ├──< log_cetak ────────────────────────────────────────────────┤
        ├──< notifikasi                                                │
        └──< pengaturan_sistem                                         │
printer ──< log_cetak >────────────────────────────────────────────────┘
```

### `users` — akun semua peran

| Kolom           | Tipe                      | Keterangan                                      |
| --------------- | ------------------------- | ----------------------------------------------- |
| `id`            | bigint (PK)               | —                                               |
| `nidn`          | varchar(30), unik, NULL   | Nomor induk dosen/pegawai                       |
| `nama`          | varchar(150)              | Nama lengkap (tampil di watermark & log)        |
| `email`         | varchar(150), unik        | Email login                                     |
| `password`      | varchar(255)              | Hash bcrypt                                     |
| `role`          | enum                      | `dosen` \| `kaprodi` \| `panitia` \| `admin_it` |
| `is_active`     | boolean                   | Nonaktif = tidak bisa login                     |
| `last_login_at` | timestamp                 | Login terakhir                                  |
| `pin_cetak`     | varchar(255), NULL        | PIN Cetak 6 digit (hash bcrypt) — khusus Kaprodi|
| `pin_cetak_at`  | timestamp, NULL           | Waktu PIN dibuat/di-reset (dasar kedaluwarsa harian) |

### `mata_kuliah` — master mata kuliah

| Kolom          | Tipe            | Keterangan            |
| -------------- | --------------- | --------------------- |
| `id`           | bigint (PK)     | —                     |
| `kode_mk`      | varchar(30), unik | Kode MK (`EKO-301`) |
| `nama_mk`      | varchar(150)    | Nama mata kuliah      |
| `kelas`        | varchar(50)     | Kelas (A/B/C)         |
| `semester`     | tinyint         | Semester (1–8)        |
| `tahun_ajaran` | varchar(20)     | Mis. `2026/2027`      |

### `dosen_mata_kuliah` — penugasan dosen ↔ MK (pivot)

| Kolom      | Tipe                 | Keterangan                            |
| ---------- | -------------------- | ------------------------------------- |
| `id`       | bigint (PK)          | —                                     |
| `dosen_id` | FK → `users`         | cascade delete                        |
| `mk_id`    | FK → `mata_kuliah`   | cascade delete                        |
| —          | unique `(dosen_id, mk_id)` | satu dosen satu kali per MK     |

### `printer` — daftar printer tujuan cetak

| Kolom            | Tipe         | Keterangan                                                         |
| ---------------- | ------------ | ------------------------------------------------------------------ |
| `id`             | bigint (PK)  | —                                                                  |
| `nama_printer`   | varchar(100) | **Disarankan sama persis dengan nama printer di Windows Server**   |
| `alamat_printer` | varchar(255) | Alamat tujuan: `socket://IP:9100` (jaringan) atau nama printer USB |
| `lokasi`         | varchar(150), NULL | Lokasi fisik (mis. "Ruang Kaprodi Manajemen")                |
| `status`         | enum         | `aktif` \| `nonaktif` — aktif = tujuan bila petugas tidak memilih  |

> Dikelola dari **Admin IT → Status Server → Kelola Printer**: tambah, edit, aktif/nonaktif, hapus, plus **scan otomatis** semua printer Windows (USB & jaringan) dengan tombol cepat "Daftarkan" dan "Samakan nama".

### `bank_soal` — inti aplikasi (metadata; file PDF terenkripsi di disk privat)

| Kolom               | Tipe               | Keterangan                                           |
| ------------------- | ------------------ | ---------------------------------------------------- |
| `id`                | bigint (PK)        | —                                                    |
| `user_id`           | FK → `users`       | Dosen pemilik unggahan                               |
| `mk_id`             | FK → `mata_kuliah` | Mata kuliah soal                                     |
| `jenis`             | enum               | `UTS` \| `UAS`                                       |
| `judul`             | varchar(200)       | Judul soal                                           |
| `file_path`         | varchar(500)       | Path di storage privat (isi file terenkripsi AES-256)|
| `original_filename` | varchar(255)       | Nama file asli di laptop dosen (metadata saja)       |
| `file_hash`         | char(64)           | SHA-256 isi file asli (cek integritas)               |
| `status`            | enum               | `terkunci` \| `siap_cetak` \| `arsip`                |
| `jumlah_mahasiswa`  | unsigned int       | Jumlah peserta (dasar jumlah salinan default)        |
| `jadwal_ujian`      | dateTime           | Waktu ujian                                          |
| `waktu_mulai_cetak` | dateTime, NULL     | Jendela buka cetak (H-1 jam 07.00)                   |
| `dikunci_pada`      | dateTime           | Saat dosen mengunci soal                             |
| `arsip_pada`        | dateTime, NULL     | Saat diarsipkan (kunci permanen)                     |

### `revisi_soal` — permintaan revisi setelah soal dikunci

| Kolom                | Tipe                | Keterangan                                    |
| -------------------- | ------------------- | --------------------------------------------- |
| `id`                 | bigint (PK)         | —                                             |
| `bank_soal_id`       | FK → `bank_soal`    | Soal yang direvisi                            |
| `diajukan_oleh`      | FK → `users`        | Dosen pengaju                                 |
| `file_path`          | varchar(500)        | PDF revisi (terenkripsi, format sama)         |
| `alasan_revisi`      | text                | Alasan perbaikan                              |
| `status`             | enum                | `menunggu` \| `disetujui` \| `ditolak`        |
| `diputuskan_oleh`    | FK → `users`, NULL  | Kaprodi yang memutuskan                       |
| `catatan_persetujuan`| text, NULL          | Catatan persetujuan/penolakan                 |
| `diajukan_pada`      | dateTime            | Waktu pengajuan                               |
| `diputuskan_pada`    | dateTime, NULL      | Waktu keputusan                               |

### `log_aktivitas` — log anti-bocor (semua aksi, per peran)

| Kolom         | Tipe                | Keterangan                                          |
| ------------- | ------------------- | --------------------------------------------------- |
| `id`          | bigint (PK)         | —                                                   |
| `user_id`     | FK → `users`, NULL  | Pelaku aksi (NULL untuk login_gagal)                |
| `aksi`        | varchar(100)        | `login`, `upload`, `kunci`, `revisi`, `approval`, `buka_cetak`, `cetak`, `cetak_ditolak`, `kirim_pengingat`, dsb. |
| `bank_soal_id`| FK → `bank_soal`, NULL | Soal terkait (opsional)                          |
| `detail`      | JSON, NULL          | Konteks aksi (mis. `{"jumlah":40,"mk":"Ekonomi Pertanian"}`) |
| `ip_address`  | varchar(45)         | IP perangkat pelaku                                |
| `user_agent`  | text                | Browser/perangkat                                  |
| `waktu`       | timestamp           | Waktu aksi                                         |

> Tampilan disaring per peran: dosen melihat miliknya, panitia melihat aksi `cetak`, Kaprodi melihat log cetak terkait, Admin IT memantau sistem.

### `log_cetak` — riwayat percetakan (jejak siapa mencetak apa)

| Kolom            | Tipe              | Keterangan                                          |
| ---------------- | ----------------- | --------------------------------------------------- |
| `id`             | bigint (PK)       | —                                                   |
| `bank_soal_id`   | FK → `bank_soal`  | Soal yang dicetak                                   |
| `dicetak_oleh`   | FK → `users`      | Petugas Panitia/TU yang mencetak                    |
| `disetujui_oleh` | FK → `users`      | Kaprodi pemilik PIN Cetak yang dipakai              |
| `printer_id`     | FK → `printer`    | Printer tujuan                                      |
| `jumlah_cetak`   | unsigned int      | Jumlah salinan                                      |
| `status`         | enum              | `menunggu` \| `diproses` \| `berhasil` \| `gagal`   |
| `job_id`         | varchar(150)      | ID job (mis. `PRINT-0001`)                          |
| `ip_address`     | varchar(45)       | IP perangkat petugas                                |
| `waktu_cetak`    | dateTime          | Waktu pencetakan                                    |
| `keterangan`     | text, NULL        | Ringkasan watermark yang ditempel                   |

### `pengaturan_sistem` — parameter aplikasi (key–value)

| Kolom               | Tipe             | Keterangan                                    |
| ------------------- | ---------------- | --------------------------------------------- |
| `id`                | bigint (PK)      | —                                             |
| `nama_pengaturan`   | varchar(100), unik | Nama kunci                                  |
| `nilai`             | text             | Nilai saat ini                                |
| `deskripsi`         | varchar(255)     | Penjelasan singkat                            |
| `updated_by`        | FK → `users`, NULL | Admin yang terakhir mengubah                |

Isi awal: `jam_mulai_cetak=07:00`, `hari_sebelum_ujian=1`, `watermark_footer=DOKUMEN RAHASIA`, `arsip_otomatis_after_uas=1`.

### `notifikasi` — lonceng in-app per pengguna

| Kolom      | Tipe             | Keterangan                                        |
| ---------- | ---------------- | ------------------------------------------------- |
| `id`       | bigint (PK)      | —                                                 |
| `user_id`  | FK → `users`     | Penerima                                          |
| `judul`    | varchar(150)     | Judul notifikasi                                  |
| `pesan`    | text             | Isi pesan                                         |
| `tipe`     | varchar(30)      | `info` \| `sukses` \| `peringatan` \| `bahaya`    |
| `tautan`   | varchar(255), NULL | Label halaman tujuan di UI (mis. "Antrian Cetak") |
| `dibaca`   | boolean          | Sudah dibaca?                                     |

> Dibuat otomatis pada peristiwa: soal diunggah (→ Kaprodi), soal siap dicetak (→ Panitia), keputusan revisi (→ dosen), pengingat unggah (→ dosen).

## Keamanan (berlapis)

1. **Enkripsi file soal (AES-256)** — setiap PDF diunggah di-rename acak (`x7s9d2f3.pdf`) dan dienkripsi dengan `Crypt` Laravel (AES-256-CBC + HMAC) **sebelum** ditulis ke disk, di folder privat `storage/app/private/soal/YYYY/MM/` (di luar `public/`).
2. **Tidak ada unduhan** — backend tidak memiliki endpoint pengembalian file soal. Dekripsi hanya terjadi internal di server saat hendak dicetak.
3. **Integritas** — SHA-256 file asli disimpan di `bank_soal.file_hash`.
4. **PIN Cetak terpisah** — hash bcrypt, harian (`pin_cetak_at` + Asia/Jakarta), tidak menempel di password login; resetPIN ditampilkan sekali.
5. **Otorisasi berbasis peran (RBAC)** — middleware `role:...` di setiap endpoint; panitia tidak bisa mengelola user, dosen tidak bisa mencetak, Admin IT tidak bisa melihat isi soal.
6. **Watermark forensik** — setiap halaman hasil cetak diberi teks `DOKUMEN RAHASIA - DICETAK OLEH {nama petugas} - {tanggal jam} - MK {mata kuliah}` + nomor halaman, sehingga kebocoran kertas dapat ditelusuri.
7. **Log anti-bocor** — semua aksi (termasuk login gagal & percetakan) tercatat dengan IP + user-agent di `log_aktivitas`/`log_cetak`.
8. **.env & database privat** — kredensial DB & `APP_KEY` tidak di-commit; `db/*.sql` diabaikan Git karena memuat data nyata.

## Instalasi

### 1. Backend (Laravel + MySQL)

Prasyarat: PHP ≥ 8.1, Composer, MySQL/MariaDB.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Sesuaikan di .env:
#   DB_DATABASE=e_brankas_soal_feb
#   DB_USERNAME=root
#   DB_PASSWORD=***
```

Database — pilih salah satu:

```bash
# Opsi A: migrasi + seed data demo (7 user, 4 MK, soal contoh, dsb.)
php artisan migrate --seed

# Opsi B: impor dump yang sudah ada (berisi data produksi/demo)
mysql -u root -p e_brankas_soal_feb < ../db/e_brankas_soal_feb.sql
```

Jalankan API:

```bash
php artisan serve        # http://127.0.0.1:8000/api
```

### 2. Frontend (React + Vite)

Prasyarat: Node.js ≥ 22 + pnpm.

```bash
pnpm install
pnpm dev                 # http://localhost:8443
```

Alamat API dibaca dari `src/db.ts` (`API_BASE`, default `http://127.0.0.1:8000/api`); bisa dioverride lewat env `VITE_API_BASE`.

Perintah lain:

```bash
pnpm build               # bundel produksi ke dist/
pnpm preview             # pratinjau hasil build
pnpm test                # unit test lapisan data (node --test — 38 test)
pnpm typecheck           # pemeriksaan TypeScript tanpa kompilasi
pnpm format              # format kode dengan oxfmt
```

### 3. Konfigurasi cetak (Windows server)

Di `backend/.env` (lihat `config/ebrankas.php`):

```env
# Folder antrian PDF hasil cetak (default: storage/app/spool)
EBRANKAS_SPOOL_PATH=C:\ebrankas\spool

# Perintah kirim PDF ke printer — {file} = path PDF, {printer} = nama/alamat.
# Kosongkan untuk mode spool saja (PDF disimpan, tanpa kirim ke printer).
EBRANKAS_PRINT_COMMAND=SumatraPDF.exe -print-to "{printer}" "{file}"
# atau tanpa tools tambahan:
# EBRANKAS_PRINT_COMMAND=powershell -NoProfile -Command "Start-Process -FilePath '{file}' -Verb PrintTo '{printer}'"

# Batas waktu eksekusi perintah printer (detik)
EBRANKAS_PRINT_TIMEOUT=60
```

Contoh perintah lain: `PDFtoPrinter.exe "{file}" "{printer}"` (Windows), `lp -d {printer} "{file}"` (Linux).

## API Reference

Semua endpoint di bawah `/api`, memakai header `Authorization: Bearer <token>` (kecuali login). Peran yang diizinkan disingkat: **D**=dosen, **K**=kaprodi, **P**=panitia, **A**=admin_it.

### Autentikasi & umum

| Method | Endpoint                | Peran    | Fungsi                                    |
| ------ | ----------------------- | -------- | ----------------------------------------- |
| POST   | `/login`                | publik   | Login → `{token, user}`                   |
| POST   | `/logout`               | semua    | Cabut token                               |
| GET    | `/me`                   | semua    | Profil pengguna aktif                     |
| GET    | `/dashboard`            | semua    | Kartu dashboard sesuai peran              |
| GET    | `/notifikasi`           | semua    | Lonceng (belum dibaca)                    |
| PATCH  | `/notifikasi/{id}/baca` | semua    | Tandai satu dibaca                        |
| PATCH  | `/notifikasi/baca-semua`| semua    | Tandai semua dibaca                       |
| GET    | `/log/aktivitas`        | semua*   | Log aktivitas (disaring per peran)        |

### Master mata kuliah & user

| Method | Endpoint                          | Peran     | Fungsi                                 |
| ------ | --------------------------------- | --------- | -------------------------------------- |
| GET    | `/mata-kuliah`                    | semua     | Daftar MK (dropdown)                   |
| POST   | `/mata-kuliah`                    | K, A      | Tambah MK                              |
| PUT    | `/mata-kuliah/{id}`               | K, A      | Ubah MK                                |
| DELETE | `/mata-kuliah/{id}`               | K, A      | Hapus MK                               |
| GET    | `/users`                          | K, A      | Daftar pengguna                        |
| POST   | `/users`                          | K, A      | Tambah user (generate password + PIN)  |
| PUT    | `/users/{id}`                     | K, A      | Ubah profil/peran                      |
| PATCH  | `/users/{id}/toggle`              | K, A      | Aktif/nonaktifkan akun                 |
| POST   | `/users/{id}/reset-password`      | K, A      | Reset password (hasil ditampilkan sekali) |
| POST   | `/users/{id}/reset-pin`           | K, A      | Reset PIN Cetak (ditampilkan sekali)   |

### Alur soal

| Method | Endpoint                | Peran | Fungsi                                                        |
| ------ | ----------------------- | ----- | ------------------------------------------------------------- |
| GET    | `/soal-saya`            | D     | Daftar soal milik dosen                                       |
| POST   | `/soal`                 | D     | Upload PDF (multipart: `mk_id`, `jenis`, `judul`, `file`, ...) |
| POST   | `/soal/{id}/revisi`     | D     | Ajukan revisi (PDF baru + `alasan_revisi`)                     |
| GET    | `/rekap`                | K     | Rekap upload per MK                                           |
| POST   | `/soal/{id}/buka-cetak` | K     | `terkunci` → `siap_cetak` + notifikasi Panitia                |
| GET    | `/revisi`               | K     | Daftar revisi menunggu                                        |
| PATCH  | `/revisi/{id}`          | K     | Setujui/tolak revisi (`keputusan`, `catatan`)                 |
| POST   | `/pengingat/kirim`      | K     | Pengingat ke dosen yang belum unggah                          |
| GET    | `/laporan/berita-acara` | K     | Unduh Berita Acara PDF                                        |

### Percetakan

| Method | Endpoint             | Peran | Fungsi                                                                |
| ------ | -------------------- | ----- | --------------------------------------------------------------------- |
| GET    | `/antrian-cetak`     | P     | Daftar soal `siap_cetak` + jendela waktu                              |
| POST   | `/cetak/{id}`        | P     | Cetak: `jumlah_cetak`, `pin_kaprodi`, `printer_id` (opsional)         |
| GET    | `/printer-status`    | P     | Status printer (DB + deteksi Windows) untuk dropdown modal cetak      |
| GET    | `/log/cetak`         | K     | Riwayat percetakan (Log Cetak)                                        |

### Manajemen printer (Admin IT)

| Method | Endpoint               | Peran | Fungsi                                                            |
| ------ | ---------------------- | ----- | ----------------------------------------------------------------- |
| GET    | `/printers`            | A     | Daftar printer + status Windows + jumlah job                      |
| GET    | `/printers/scan`       | A     | **Scan otomatis** semua printer Windows (USB & jaringan) + pencocokan DB |
| POST   | `/printers`            | A     | Tambah printer                                                    |
| PUT    | `/printers/{id}`       | A     | Ubah printer (mis. samakan nama dengan Windows)                   |
| PATCH  | `/printers/{id}/toggle`| A     | Aktif/nonaktifkan                                                 |
| DELETE | `/printers/{id}`       | A     | Hapus (ditolak bila sudah ada riwayat cetak)                      |

\* Log aktivitas tersedia untuk semua peran tetapi isinya disaring (mis. panitia hanya melihat aksi `cetak`).

## Struktur Repositori

```
├── src/                 # Frontend React
│   ├── App.tsx          # Seluruh UI: login, dashboard, alur unggah/cetak, halaman admin
│   ├── db.ts            # Lapisan data: apiFetch (Bearer token) + mapper API → model UI
│   ├── db.test.ts       # 38 unit test lapisan data (mock fetch, tanpa jaringan)
│   ├── brand.ts         # Konstanta branding (judul, kop, hak cipta)
│   └── index.css        # Tailwind + komponen kustom (splash, transisi halaman)
├── public/              # Aset statis (favicon)
├── backend/             # Laravel
│   ├── app/Http/Controllers/   # 13 controller (auth, soal, cetak, printer, ...)
│   ├── app/Services/           # FileProtectionService, PrintService,
│   │                           # NotifikasiService, ActivityLogger
│   ├── app/Models/             # User, MataKuliah, BankSoal, RevisiSoal,
│   │                           # LogCetak, LogAktivitas, Printer, Notifikasi
│   ├── database/migrations/    # Skema 10 tabel bisnis
│   ├── database/seeders/       # Data demo (7 user, 4 MK, soal contoh)
│   ├── resources/views/        # Blade: sampul watermark & berita acara
│   └── routes/api.php          # Seluruh endpoint + middleware peran
├── db/                  # (lokal) dump database — tidak di-commit
├── backup/              # (lokal) salinan cadangan — tidak di-commit
├── index.html           # Shell HTML + meta SIKASA FEB
├── vite.config.ts       # Vite + Tailwind + plugin Figma Make
└── package.json         # Skrip frontend
```

## Kredensial Demo

Tersedia langsung di halaman login (lihat `demoCredentials` di `src/App.tsx`) dan dibuat oleh `php artisan migrate --seed`:

| Peran    | Email                       | Password   | Catatan                                   |
| -------- | --------------------------- | ---------- | ----------------------------------------- |
| Dosen    | `rina.kurniawati@feb.ac.id` | `dosen123` | Dosen lain (`ahmad`, `budi`, `nadia`) sama |
| Kaprodi  | `dian.puspitasari@feb.ac.id`| `kaprodi123` | PIN Cetak seed: `246810` (berlaku hari instalasi) |
| Panitia  | `siti.h@feb.ac.id`          | `panitia123` | —                                       |
| Admin IT | `rizky.it@feb.ac.id`        | `admin123` | —                                         |

## Troubleshooting

| Gejala | Penyebab & solusi |
| ------- | ----------------- |
| Badge printer merah "Tidak terdaftar di Windows" | Nama di tabel `printer` tidak persis dengan nama printer di Windows Server. Login Admin IT → **Status Server → Kelola Printer → Scan Printer Windows → Samakan nama** (sekali klik). |
| Printer tidak muncul di hasil scan | Driver printer belum terpasang di **mesin server** (bukan PC lain). Pasang driver, lalu Scan Ulang. Kalau backend tidak berjalan di Windows, scan otomatis tidak tersedia — daftarkan manual. |
| Status "Terdaftar, offline" | Printer terdaftar di Windows tapi mati/offline — nyalakan printer & cek kabel/jaringan. |
| Job cetak status `menunggu` | `EBRANKAS_PRINT_COMMAND` kosong atau printer belum siap — PDF tersimpan di folder spool; teruskan ke printer setelah tersambung. |
| "PIN Cetak salah / kedaluwarsa" | PIN sudah lewat tengah malam (waktu server Asia/Jakarta) — minta Kaprodi reset PIN baru di Manajemen User. |
| "Soal baru bisa dicetak ..." | Jendela cetak belum tiba (`waktu_mulai_cetak` = H-1 jam 07.00). Cetak baru diizinkan mulai waktu itu. |
| Login gagal "Tidak dapat terhubung ke server" | Backend (`php artisan serve`) tidak jalan atau `API_BASE` di `src/db.ts` salah. |
| Modal/kartu tampil aneh setelah pindah server | Jalankan ulang `pnpm dev` agar dev server memuat konfigurasi terbaru. |

## Catatan Sebelum Upload ke GitHub

- `backend/.env` (kredensial DB & `APP_KEY`), `backend/vendor/`, `node_modules/`, `dist/` sudah masuk `.gitignore`.
- `db/*.sql` diabaikan — dump memuat data nyata (akun, PIN hash). Buat dump skema bersih (tanpa `INSERT`) bila ingin membagikan skema.
- `backup/` (salinan cadangan lokal) juga sebaiknya tidak ikut ter-commit.
- Ganti semua kredensial demo & `APP_KEY` sebelum dipakai produksi nyata.

<<<<<<< HEAD
=======
## Lisensi

Proyek tugas akhir — gunakan sesuai kebijakan institusi.









>>>>>>> 25722f7 (readme update)
