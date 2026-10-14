<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed data awal SIKASA FEB sesuai skema produksi.
     * Menjadi acuan uji untuk semua peran & alur kerja.
     */
    public function run(): void
    {
        $now = now();

        // 1) USERS — 4 dosen, 1 kaprodi, 1 panitia/TU, 1 admin IT
        // Kaprodi diberi PIN Cetak HARIAN awal "246810" (ter-hash, terpisah
        // password) dengan pin_cetak_at hari ini agar langsung bisa dipakai.
        $users = [
            ['id' => 1, 'nidn' => '0012088503', 'nama' => 'Dr. Rina Kurniawati, S.P., M.Si.', 'email' => 'rina.kurniawati@feb.ac.id', 'password' => Hash::make('dosen123'), 'role' => 'dosen'],
            ['id' => 2, 'nidn' => '0025049001', 'nama' => 'Dr. Ahmad Fauzi, M.E.', 'email' => 'ahmad.fauzi@feb.ac.id', 'password' => Hash::make('dosen123'), 'role' => 'dosen'],
            ['id' => 3, 'nidn' => '0009107702', 'nama' => 'Budi Santoso, S.E., M.Ak.', 'email' => 'budi.santoso@feb.ac.id', 'password' => Hash::make('dosen123'), 'role' => 'dosen'],
            ['id' => 4, 'nidn' => '0031059204', 'nama' => 'Nadia Permata, S.E., M.M.', 'email' => 'nadia.permata@feb.ac.id', 'password' => Hash::make('dosen123'), 'role' => 'dosen'],
            ['id' => 5, 'nidn' => '0104998505', 'nama' => 'Dr. Dian Puspitasari, M.M.', 'email' => 'dian.puspitasari@feb.ac.id', 'password' => Hash::make('kaprodi123'), 'pin_cetak' => Hash::make('246810'), 'pin_cetak_at' => $now, 'role' => 'kaprodi'],
            ['id' => 6, 'nidn' => '198501012010', 'nama' => 'Siti Handayani', 'email' => 'siti.h@feb.ac.id', 'password' => Hash::make('panitia123'), 'role' => 'panitia'],
            ['id' => 7, 'nidn' => '199707152019', 'nama' => 'Rizky Ananda', 'email' => 'rizky.it@feb.ac.id', 'password' => Hash::make('admin123'), 'role' => 'admin_it'],
        ];
        foreach ($users as &$u) {
            $u += ['pin_cetak' => null, 'pin_cetak_at' => null];
            $u['is_active'] = true;
            $u['created_at'] = $now;
            $u['updated_at'] = $now;
        }
        DB::table('users')->insert($users);

        // 2) MATA KULIAH
        $mks = [
            ['id' => 1, 'kode_mk' => 'EKO-301', 'nama_mk' => 'Ekonomi Pertanian', 'kelas' => 'A', 'semester' => 3, 'tahun_ajaran' => '2026/2027'],
            ['id' => 2, 'kode_mk' => 'AKT-212', 'nama_mk' => 'Akuntansi Biaya', 'kelas' => 'B', 'semester' => 2, 'tahun_ajaran' => '2026/2027'],
            ['id' => 3, 'kode_mk' => 'MJN-104', 'nama_mk' => 'Pengantar Manajemen', 'kelas' => 'C', 'semester' => 1, 'tahun_ajaran' => '2026/2027'],
            ['id' => 4, 'kode_mk' => 'EKO-205', 'nama_mk' => 'Ekonomi Mikro II', 'kelas' => 'A', 'semester' => 2, 'tahun_ajaran' => '2026/2027'],
        ];
        foreach ($mks as &$m) {
            $m['created_at'] = $now;
            $m['updated_at'] = $now;
        }
        DB::table('mata_kuliah')->insert($mks);

        // 3) DOSEN <-> MATA KULIAH (penugasan)
        $assign = [
            ['dosen_id' => 1, 'mk_id' => 1],
            ['dosen_id' => 2, 'mk_id' => 4],
            ['dosen_id' => 3, 'mk_id' => 2],
            ['dosen_id' => 4, 'mk_id' => 3],
        ];
        foreach ($assign as &$a) {
            $a['created_at'] = $now;
        }
        DB::table('dosen_mata_kuliah')->insert($assign);

        // 4) PRINTER — network printer Ruang Kaprodi
        DB::table('printer')->insert([
            'id' => 1,
            'nama_printer' => 'HP LaserJet · Ruang Kaprodi',
            'alamat_printer' => 'socket://192.168.1.50:9100',
            'lokasi' => 'Ruang Kaprodi Manajemen',
            'status' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $this->seedSoalDanLog();
    }

    private function seedSoalDanLog(): void
    {
        $now = now();

        // 5) BANK SOAL (INTI) — 2 siap cetak (jendela terbuka), 2 terkunci
        $soals = [
            [
                'id' => 1, 'user_id' => 1, 'mk_id' => 1, 'jenis' => 'UTS', 'judul' => 'UTS Ekonomi Pertanian Kelas A',
                'file_path' => 'soal/terkunci/X7s9d2f3.pdf', 'original_filename' => 'Soal-UTS-EkoPertanian.pdf',
                'file_hash' => hash('sha256', 'eko301'), 'status' => 'siap_cetak', 'jumlah_mahasiswa' => 40,
                'jadwal_ujian' => '2026-10-13 08:00:00', 'waktu_mulai_cetak' => '2026-10-13 07:00:00',
                'dikunci_pada' => '2026-10-12 16:42:00', 'arsip_pada' => null,
                'created_at' => '2026-10-12 16:42:00', 'updated_at' => '2026-10-13 07:00:00',
            ],
            [
                'id' => 2, 'user_id' => 3, 'mk_id' => 2, 'jenis' => 'UTS', 'judul' => 'UTS Akuntansi Biaya Kelas B',
                'file_path' => 'soal/terkunci/Q2m8v1k9.pdf', 'original_filename' => 'Soal-UTS-AktBiaya.pdf',
                'file_hash' => hash('sha256', 'akt212'), 'status' => 'siap_cetak', 'jumlah_mahasiswa' => 36,
                'jadwal_ujian' => '2026-10-13 10:30:00', 'waktu_mulai_cetak' => '2026-10-13 07:00:00',
                'dikunci_pada' => '2026-10-12 15:05:00', 'arsip_pada' => null,
                'created_at' => '2026-10-12 15:05:00', 'updated_at' => '2026-10-13 07:00:00',
            ],
            [
                'id' => 3, 'user_id' => 4, 'mk_id' => 3, 'jenis' => 'UTS', 'judul' => 'UTS Pengantar Manajemen Kelas C',
                'file_path' => 'soal/terkunci/Lp4n7b2x.pdf', 'original_filename' => 'Soal-UTS-Manajemen.pdf',
                'file_hash' => hash('sha256', 'mjn104'), 'status' => 'terkunci', 'jumlah_mahasiswa' => 42,
                'jadwal_ujian' => '2026-10-14 08:00:00', 'waktu_mulai_cetak' => '2026-10-14 07:00:00',
                'dikunci_pada' => '2026-10-12 14:28:00', 'arsip_pada' => null,
                'created_at' => '2026-10-12 14:28:00', 'updated_at' => '2026-10-12 14:28:00',
            ],
            [
                'id' => 4, 'user_id' => 2, 'mk_id' => 4, 'jenis' => 'UTS', 'judul' => 'UTS Ekonomi Mikro II Kelas A',
                'file_path' => 'soal/terkunci/Zx9c3h5t.pdf', 'original_filename' => 'Soal-UTS-EkoMikroII.pdf',
                'file_hash' => hash('sha256', 'eko205'), 'status' => 'terkunci', 'jumlah_mahasiswa' => 38,
                'jadwal_ujian' => '2026-10-14 13:00:00', 'waktu_mulai_cetak' => '2026-10-14 07:00:00',
                'dikunci_pada' => '2026-10-12 11:30:00', 'arsip_pada' => null,
                'created_at' => '2026-10-12 11:30:00', 'updated_at' => '2026-10-12 11:30:00',
            ],
        ];
        DB::table('bank_soal')->insert($soals);

        // 6) REVISI SOAL — contoh permintaan menunggu persetujuan Kaprodi
        DB::table('revisi_soal')->insert([
            'id' => 1, 'bank_soal_id' => 4, 'diajukan_oleh' => 2,
            'file_path' => 'soal/revisi/rev-eko205.pdf',
            'alasan_revisi' => 'Perbaikan typo nomor 12 dan 17',
            'status' => 'menunggu', 'diputuskan_oleh' => null, 'catatan_persetujuan' => null,
            'diajukan_pada' => '2026-10-12 15:10:00', 'diputuskan_pada' => null,
            'created_at' => '2026-10-12 15:10:00', 'updated_at' => '2026-10-12 15:10:00',
        ]);

        // 7) LOG AKTIVITAS (ANTI BOCOR)
        $logs = [
            ['user_id' => 6, 'aksi' => 'cetak', 'bank_soal_id' => 1, 'detail' => json_encode(['jumlah' => 40, 'mk' => 'Ekonomi Pertanian']), 'ip_address' => '192.168.1.24', 'waktu' => '2026-10-13 07:15:00'],
            ['user_id' => 1, 'aksi' => 'upload', 'bank_soal_id' => 1, 'detail' => json_encode(['file' => 'X7s9d2f3.pdf']), 'ip_address' => '192.168.1.18', 'waktu' => '2026-10-12 16:42:00'],
            ['user_id' => 2, 'aksi' => 'revisi', 'bank_soal_id' => 4, 'detail' => json_encode(['alasan' => 'typo nomor 12 & 17']), 'ip_address' => '192.168.1.31', 'waktu' => '2026-10-12 15:10:00'],
            ['user_id' => 4, 'aksi' => 'kunci', 'bank_soal_id' => 3, 'detail' => json_encode(['mk' => 'Pengantar Manajemen']), 'ip_address' => '192.168.1.20', 'waktu' => '2026-10-12 14:28:00'],
            ['user_id' => 5, 'aksi' => 'approval', 'bank_soal_id' => 2, 'detail' => json_encode(['keputusan' => 'siap_cetak']), 'ip_address' => '192.168.1.11', 'waktu' => '2026-10-12 09:04:00'],
        ];
        foreach ($logs as &$l) {
            $l['user_agent'] = 'Mozilla/5.0 (intranet)';
        }
        DB::table('log_aktivitas')->insert($logs);

        // 8) LOG CETAK — contoh cetak berhasil oleh Siti, disetujui Kaprodi
        DB::table('log_cetak')->insert([
            'id' => 1, 'bank_soal_id' => 1, 'dicetak_oleh' => 6, 'disetujui_oleh' => 5, 'printer_id' => 1,
            'jumlah_cetak' => 40, 'status' => 'berhasil', 'job_id' => 'PRINT-0001',
            'ip_address' => '192.168.1.24', 'waktu_cetak' => '2026-10-13 07:15:00',
            'keterangan' => 'DOKUMEN RAHASIA - dicetak oleh Siti Handayani',
            'created_at' => $now, 'updated_at' => $now,
        ]);

        // 9) PENGATURAN SISTEM
        $settings = [
            ['nama_pengaturan' => 'jam_mulai_cetak', 'nilai' => '07:00', 'deskripsi' => 'Jam paling awal soal boleh dicetak (H-1)'],
            ['nama_pengaturan' => 'hari_sebelum_ujian', 'nilai' => '1', 'deskripsi' => 'Berapa hari sebelum ujian jendela cetak dibuka'],
            ['nama_pengaturan' => 'watermark_footer', 'nilai' => 'DOKUMEN RAHASIA', 'deskripsi' => 'Teks watermark pada setiap hasil cetak'],
            ['nama_pengaturan' => 'arsip_otomatis_after_uas', 'nilai' => '1', 'deskripsi' => 'Kunci permanen file setelah UAS selesai'],
        ];
        foreach ($settings as &$s) {
            $s['updated_by'] = 7;
            $s['created_at'] = $now;
            $s['updated_at'] = $now;
        }
        DB::table('pengaturan_sistem')->insert($settings);
    }
}

