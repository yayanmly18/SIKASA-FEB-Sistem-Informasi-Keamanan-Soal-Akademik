<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Percetakan E-Brankas
    |--------------------------------------------------------------------------
    |
    | Job cetak ditulis sebagai PDF ber-watermark ke folder spool di server,
    | lalu (opsional) dikirim ke printer jaringan lewat perintah OS. File TIDAK
    | PERNAH dikirim ke perangkat petugas/TU — hanya dicetak di sisi server.
    |
    | print_command: perintah shell untuk mengirim PDF ke printer.
    |   Placeholder {file} diganti path PDF spool, {printer} nama/alamat printer.
    |   Contoh:
    |     Windows SumatraPDF : 'SumatraPDF.exe -print-to "{printer}" "{file}"'
    |     Windows PDFtoPrinter: 'PDFtoPrinter.exe "{file}" "{printer}"'
    |     Windows PowerShell (tanpa tools tambahan, pakai PDF reader default):
    |       'powershell -NoProfile -Command "Start-Process -FilePath \'{file}\' -Verb PrintTo \'{printer}\'"'
    |     Linux   : 'lp -d {printer} "{file}"'
    |   Kosongkan (null) untuk mode "spool saja" (PDF disimpan, tanpa kirim OS).
    |
    */
    'spool_path' => env('EBRANKAS_SPOOL_PATH', storage_path('app/spool')),

    'print_command' => env('EBRANKAS_PRINT_COMMAND', null),

    // Batas waktu (detik) menjalankan perintah printer.
    'command_timeout' => (int) env('EBRANKAS_PRINT_TIMEOUT', 60),
];
