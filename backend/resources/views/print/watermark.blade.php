<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Berita Acara Cetak - {{ $soal->judul }}</title>
    <style>
        @page { margin: 22mm 18mm; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #202126; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; letter-spacing: .5px; }
        .header .sub { color: #6b7280; font-size: 11px; margin-top: 4px; }
        .secret { display: inline-block; background: #202126; color: #f5cf25; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 11px; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        td.label { width: 34%; color: #6b7280; font-weight: bold; }
        .footer { position: fixed; bottom: -10mm; left: 0; right: 0; text-align: center;
                  border-top: 1px solid #d1d5db; padding-top: 6px; font-size: 9px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SIKASA FEB</h1>
        <div class="sub">Sistem Informasi Keamanan Soal Akademik</div>
        <div class="sub">Berita Acara Cetak Naskah Soal Ujian</div>
    </div>

    <div style="text-align:center; margin-bottom: 18px;">
        <span class="secret">DOKUMEN RAHASIA</span>
    </div>

    <table>
        <tr><td class="label">Mata Kuliah</td><td>{{ $mataKuliah->nama_mk ?? '-' }} ({{ $soal->mataKuliah->kode_mk ?? '-' }})</td></tr>
        <tr><td class="label">Kelas</td><td>{{ $mataKuliah->kelas ?? '-' }}</td></tr>
        <tr><td class="label">Jenis Ujian</td><td>{{ $soal->jenis }}</td></tr>
        <tr><td class="label">Judul Soal</td><td>{{ $soal->judul }}</td></tr>
        <tr><td class="label">Jadwal Ujian</td><td>{{ $soal->jadwal_ujian?->translatedFormat('d F Y H:i') }}</td></tr>
        <tr><td class="label">Jumlah Peserta / Cetak</td><td>{{ $jumlah }} eksemplar</td></tr>
        <tr><td class="label">Dicetak Oleh</td><td>{{ $petugas->nama }}</td></tr>
        <tr><td class="label">Waktu Cetak</td><td>{{ now()->translatedFormat('d F Y H:i') }}</td></tr>
    </table>

    <p style="margin-top: 22px; color:#374151;">
        Dokumen ini dicetak langsung ke printer ruang Kaprodi melalui sistem SIKASA FEB.
        Naskah soal tidak disimpan pada perangkat petugas. Setiap percetakan tercatat
        pada log audit sistem (identitas, waktu, IP, dan jumlah salinan).
    </p>

    <div class="footer">{{ $watermark }}</div>
</body>
</html>
