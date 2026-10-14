<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Berita Acara Ujian - SIKASA FEB</title>
    <style>
        @page { margin: 20mm 16mm; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 11px; }
        .header { text-align: center; border-bottom: 2px solid #202126; padding-bottom: 10px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 17px; }
        .header .sub { color: #6b7280; font-size: 10px; margin-top: 3px; }
        .secret { display: inline-block; background: #202126; color: #f5cf25; padding: 5px 12px; border-radius: 5px; font-weight: bold; font-size: 10px; letter-spacing: 1px; }
        h2 { font-size: 13px; margin: 18px 0 8px; border-left: 4px solid #202126; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { padding: 6px 8px; border: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; letter-spacing: .3px; color: #374151; }
        .meta td { border: none; padding: 3px 0; }
        .meta td.label { width: 30%; color: #6b7280; font-weight: bold; }
        .badge { padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: bold; }
        .ok { background: #d1fae5; color: #065f46; }
        .no { background: #fef3c7; color: #92400e; }
        .footer { position: fixed; bottom: -8mm; left: 0; right: 0; text-align: center; border-top: 1px solid #d1d5db; padding-top: 5px; font-size: 9px; color: #6b7280; }
        .summary { display: flex; gap: 10px; margin: 10px 0; }
        .summary .box { flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; text-align: center; }
        .summary .box .num { font-size: 20px; font-weight: bold; }
        .summary .box .lbl { font-size: 9px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SIKASA FEB</h1>
        <div class="sub">Sistem Informasi Keamanan Soal Akademik</div>
        <div class="sub">Berita Acara Pengumpulan &amp; Percetakan Naskah Soal Ujian</div>
    </div>

    <div style="text-align:center; margin-bottom: 14px;">
        <span class="secret">DOKUMEN RAHASIA</span>
    </div>

    <table class="meta">
        <tr><td class="label">Penanggung Jawab</td><td>: {{ $penanggungJawab->nama }} ({{ $penanggungJawab->role === 'kaprodi' ? 'Ketua Program Studi' : strtoupper($penanggungJawab->role) }})</td></tr>
        <tr><td class="label">Dibuat Pada</td><td>: {{ $dibuatPada->translatedFormat('d F Y H:i') }}</td></tr>
    </table>

    <div class="summary">
        <div class="box"><div class="num">{{ $totalMk }}</div><div class="lbl">Total Mata Kuliah</div></div>
        <div class="box"><div class="num" style="color:#065f46">{{ $sudahUpload }}</div><div class="lbl">Sudah Upload</div></div>
        <div class="box"><div class="num" style="color:#92400e">{{ $belumUpload }}</div><div class="lbl">Belum Upload</div></div>
        <div class="box"><div class="num">{{ $logCetak->count() }}</div><div class="lbl">Riwayat Cetak</div></div>
    </div>

    <h2>Rekap Pengumpulan Soal</h2>
    <table>
        <thead>
            <tr>
                <th style="width:12%">Kode</th>
                <th>Mata Kuliah</th>
                <th style="width:10%">Kelas</th>
                <th style="width:24%">Dosen</th>
                <th style="width:16%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rekap as $row)
                <tr>
                    <td>{{ $row->kode_mk }}</td>
                    <td>{{ $row->nama_mk }}</td>
                    <td>{{ $row->kelas }}</td>
                    <td>{{ $row->dosen ?? '-' }}</td>
                    <td>
                        @if ($row->status)
                            <span class="badge ok">{{ ucfirst($row->status) }}</span>
                        @else
                            <span class="badge no">Belum Upload</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" style="text-align:center; color:#9ca3af;">Belum ada data mata kuliah.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Riwayat Percetakan</h2>
    <table>
        <thead>
            <tr>
                <th style="width:18%">Waktu</th>
                <th>Mata Kuliah</th>
                <th style="width:18%">Dicetak Oleh</th>
                <th style="width:8%">Eks</th>
                <th style="width:14%">Printer</th>
                <th style="width:10%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($logCetak as $log)
                <tr>
                    <td>{{ optional($log->waktu_cetak)->format('d M Y H:i') }}</td>
                    <td>{{ $log->bankSoal?->mataKuliah?->nama_mk ?? '-' }}</td>
                    <td>{{ $log->petugas?->nama ?? '-' }}</td>
                    <td>{{ $log->jumlah_cetak }}</td>
                    <td>{{ $log->printer?->nama_printer ?? '-' }}</td>
                    <td>{{ ucfirst($log->status) }}</td>
                </tr>
            @empty
                <tr><td colspan="6" style="text-align:center; color:#9ca3af;">Belum ada percetakan.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dokumen dibuat otomatis oleh SIKASA FEB · {{ $dibuatPada->translatedFormat('d F Y H:i') }} · Rahasia
    </div>
</body>
</html>
