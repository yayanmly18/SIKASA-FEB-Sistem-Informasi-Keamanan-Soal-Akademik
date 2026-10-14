// ============================================================================

// Unit test lapisan data (src/db.ts) — dijalankan dengan:

//

//   node --test src/db.test.ts

//

// Memakai mock `fetch` (bukan jaringan sungguhan) sehingga mapper dan

// apiFetch dapat diverifikasi terisolasi dari backend Laravel.

// ============================================================================

import assert from "node:assert/strict"

import { beforeEach, describe, it } from "node:test"

import {
  ApiError,
  API_BASE,
  addUser,
  authenticate,
  clearToken,
  createBankSoal,
  emptyDatabase,
  formatJam,
  formatLogDetail,
  formatTanggal,
  generatePassword,
  getToken,
  hasToken,
  labelAksi,
  loadDatabase,
  normalizeDateTime,
  recordPrint,
  resetUserPin,
  toApiRole,
  toExamViews,
  toLogRows,
  toUiAntrian,
  toUiLog,
  toUiRole,
  toUiSoal,
  toUiUser,
} from "./db.ts"

// ---------------------------------------------------------------------------

// Fasilitas uji: localStorage tiruan + mock fetch yang merekam panggilan.

// ---------------------------------------------------------------------------

interface RecordedCall {
  url: string

  init: RequestInit | undefined

  headers: Headers
}

let calls: RecordedCall[] = []

let respond: (url: string, init: RequestInit | undefined) => Response

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,

    headers: { "Content-Type": "application/json" },
  })
}

globalThis.fetch = ((async (url: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers)

  calls.push({ url, init, headers })

  return respond(url, init)
}) as typeof fetch)

// localStorage tiruan (Node tidak menyediakan localStorage default).

const store = new Map<string, string>()
;(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,

  setItem: (k: string, v: string) => void store.set(k, v),

  removeItem: (k: string) => void store.delete(k),
}

beforeEach(() => {
  calls = []

  store.clear()

  respond = () => jsonResponse({})
})

// ---------------------------------------------------------------------------

// Mapper peran & pengguna

// ---------------------------------------------------------------------------

describe("toUiRole / toApiRole", () => {
  it("memetakan admin_it (backend) ke admin (UI) dan sebaliknya", () => {
    assert.equal(toUiRole("admin_it"), "admin")

    assert.equal(toApiRole("admin"), "admin_it")
  })

  it("meneruskan dosen/kaprodi/panitia apa adanya", () => {
    for (const role of ["dosen", "kaprodi", "panitia"] as const) {
      assert.equal(toUiRole(role), role)

      assert.equal(toApiRole(role), role)
    }
  })

  it("menjatuhkan peran tak dikenal ke panitia", () => {
    assert.equal(toUiRole("hacker"), "panitia")
  })
})

describe("toUiUser", () => {
  it("memetakan is_active → aktif dan null → string kosong", () => {
    const user = toUiUser({
      id: 3,

      nidn: null,

      nama: "Siti",

      email: "siti@feb.ac.id",

      role: "panitia",

      is_active: true,
    })

    assert.deepEqual(user, {
      id: 3,

      nidn: "",

      nama: "Siti",

      email: "siti@feb.ac.id",

      role: "panitia",

      aktif: true,
    })
  })
})

// ---------------------------------------------------------------------------

// Waktu: normalisasi & format tampilan

// ---------------------------------------------------------------------------

describe("normalizeDateTime", () => {
  it('mengubah spasi server ("Y-m-d H:i") menjadi "T"', () => {
    assert.equal(normalizeDateTime("2026-10-13 07:00"), "2026-10-13T07:00")
  })

  it("meneruskan ISO dan mengosongkan null", () => {
    assert.equal(normalizeDateTime("2026-10-13T07:00"), "2026-10-13T07:00")

    assert.equal(normalizeDateTime(null), "")

    assert.equal(normalizeDateTime(undefined), "")
  })
})

describe("formatTanggal / formatJam", () => {
  it("menangformat ISO lokal tanpa konversi zona", () => {
    assert.equal(formatTanggal("2026-10-13T08:00"), "13 Okt 2026")

    assert.equal(formatJam("2026-10-13T08:00"), "08:00")
  })

  it('menangkap format log server PHP ("13 Oct 2026 07:15")', () => {
    assert.equal(formatTanggal("13 Oct 2026 07:15"), "13 Okt 2026")

    assert.equal(formatJam("13 Oct 2026 07:15"), "07:15")
  })

  it("aman untuk input kosong / rusak", () => {
    assert.equal(formatTanggal(""), "-")

    assert.equal(formatJam(""), "")

    assert.equal(formatTanggal("bukan-tanggal"), "bukan-tanggal")

    assert.equal(formatJam("bukan-tanggal"), "")
  })
})

// ---------------------------------------------------------------------------

// Mapper soal (termasuk kebijakan jendela cetak H-1)

// ---------------------------------------------------------------------------

const baseSoal = {
  id: 9,

  kode_mk: "EKM401",

  nama_mk: "Ekonomi Makro IV",

  kelas: "A",

  jenis: "UTS" as const,

  judul: "UTS Ganjil 2026",

  status: "terkunci",

  jumlah_mahasiswa: 40,

  jadwal_ujian: "2026-10-13 08:00",

  waktu_mulai_cetak: null,

  file_path: "soal/abc.pdf",
}

describe("toUiSoal — jendela cetak", () => {
  // Waktu dalam format lokal ("Y-m-d H:i") persis seperti yang dikirim server;

  // jangan pakai toISOString() (UTC) karena new Date("...THH:mm") berarti

  // waktu LOKAL sehingga tes bisa salah di zona waktu berbeda.

  function waktuLokal(offsetMs: number): string {
    const d = new Date(Date.now() + offsetMs)

    const pad = (n: number) => String(n).padStart(2, "0")

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  it("status terkunci → belum siap, menunggu Kaprodi", () => {
    const soal = toUiSoal(baseSoal)

    assert.equal(soal.print_ready, false)

    assert.equal(soal.window, "Menunggu pembukaan Kaprodi")

    assert.equal(soal.status, "terkunci")
  })

  it("status arsip → permanen tidak bisa dicetak", () => {
    const soal = toUiSoal({ ...baseSoal, status: "arsip" })

    assert.equal(soal.print_ready, false)

    assert.equal(soal.window, "Diarsipkan permanen")

    assert.equal(soal.status, "arsip")
  })

  it("siap_cetak tanpa jadwal buka → belum siap", () => {
    const soal = toUiSoal({ ...baseSoal, status: "siap_cetak" })

    assert.equal(soal.print_ready, false)

    assert.equal(soal.window, "Jadwal buka cetak belum diatur")
  })

  it("siap_cetak dengan waktu buka lampau → siap dicetak", () => {
    const soal = toUiSoal({
      ...baseSoal,

      status: "siap_cetak",

      waktu_mulai_cetak: waktuLokal(-60_000),
    })

    assert.equal(soal.print_ready, true)

    assert.equal(soal.window, "Jendela cetak terbuka")

    assert.equal(soal.status, "siap_cetak")
  })

  it("siap_cetak dengan waktu buka mendatang → belum siap + info jadwal", () => {
    const soal = toUiSoal({
      ...baseSoal,

      status: "siap_cetak",

      waktu_mulai_cetak: waktuLokal(3_600_000),
    })

    assert.equal(soal.print_ready, false)

    assert.match(soal.window, /^Bisa dicetak .+/)
  })

  it("memetakan tanggal ke normalisasi ISO & fallback join", () => {
    const soal = toUiSoal({
      ...baseSoal,

      kode_mk: null,

      nama_mk: null,

      kelas: null,
    })

    assert.equal(soal.jadwal_ujian, "2026-10-13T08:00")

    assert.equal(soal.kode_mk, "-")

    assert.equal(soal.nama_mk, "-")

    assert.equal(soal.kelas, "-")
  })
})

describe("toUiAntrian", () => {
  const row = {
    id: 1,

    kode_mk: "EKM401",

    nama_mk: "Ekonomi Makro IV",

    kelas: "A",

    dosen: "Dr. Rina",

    jenis: "UAS" as const,

    jadwal_ujian: "2026-10-14 10:00",

    jumlah_mahasiswa: 38,

    status_cetak: "bisa_cetak",

    alasan: null,
  }

  it("bisa_cetak → print_ready true", () => {
    const antrian = toUiAntrian(row)

    assert.equal(antrian.print_ready, true)

    assert.equal(antrian.window, "Jendela cetak terbuka")

    assert.equal(antrian.dosen, "Dr. Rina")
  })

  it("selain bisa_cetak → alasan server ditampilkan", () => {
    const antrian = toUiAntrian({
      ...row,

      status_cetak: "diluar_jendela",

      alasan: "Jendela belum dibuka",
    })

    assert.equal(antrian.print_ready, false)

    assert.equal(antrian.window, "Jendela belum dibuka")
  })
})

// ---------------------------------------------------------------------------

// Mapper log

// ---------------------------------------------------------------------------

describe("formatLogDetail / toUiLog", () => {
  it("objek detail → string kunci: nilai", () => {
    assert.equal(
      formatLogDetail({ file: "abc.pdf", mahasiswa: 40 }),

      "file: abc.pdf · mahasiswa: 40",
    )
  })

  it("string diteruskan; null → kosong", () => {
    assert.equal(formatLogDetail("sudah dicek"), "sudah dicek")

    assert.equal(formatLogDetail(null), "")
  })

  it("pengguna null → Sistem", () => {
    const log = toUiLog({
      id: 2,

      waktu: "13 Oct 2026 07:15",

      pengguna: null,

      aksi: "cetak",

      mata_kuliah: "Ekonomi Makro IV",

      detail: { jumlah: 40 },

      ip_address: null,
    })

    assert.equal(log.pengguna, "Sistem")

    assert.equal(log.detail, "jumlah: 40")

    assert.equal(log.ip_address, "-")

    assert.equal(labelAksi(log.aksi), "Cetak")
  })
})

describe("toExamViews / toLogRows", () => {
  it("toExamViews menurunkan field dari bank_soal termapper", () => {
    const db = emptyDatabase()

    db.bank_soal = [toUiSoal(baseSoal)]

    const [view] = toExamViews(db)

    assert.equal(view.code, "EKM401")

    assert.equal(view.course, "Ekonomi Makro IV")

    assert.equal(view.date, "13 Okt 2026")

    assert.equal(view.time, "08:00")

    assert.equal(view.status, "Terjadwal")
  })

  it("toLogRows menggabungkan waktu & mata kuliah", () => {
    const db = emptyDatabase()

    db.log_aktivitas = [
      toUiLog({
        id: 1,

        waktu: "13 Oct 2026 07:15",

        pengguna: "Dr. Rina",

        aksi: "upload",

        mata_kuliah: "Ekonomi Makro IV",

        detail: "file: x.pdf",

        ip_address: "127.0.0.1",
      }),
    ]

    const [row] = toLogRows(db)

    assert.equal(row.waktu, "13 Okt 2026 · 07:15")

    assert.equal(row.aksi, "Upload")

    assert.equal(row.detail, "Ekonomi Makro IV · file: x.pdf")

    assert.equal(row.ip, "127.0.0.1")
  })
})

// ---------------------------------------------------------------------------

// apiFetch melalui operasi domain: header, token, dan penanganan galat.

// ---------------------------------------------------------------------------

describe("authenticate", () => {
  it("mengirim kredensial, menyimpan token, memetakan profil", async () => {
    respond = () =>
      jsonResponse({
        token: "tok-123",

        user: {
          id: 1,

          nidn: "001",

          nama: "Siti",

          email: "siti@feb.ac.id",

          role: "panitia",

          is_active: true,
        },
      })

    const user = await authenticate("siti@feb.ac.id", "panitia123")

    assert.equal(calls.length, 1)

    assert.equal(calls[0].url, `${API_BASE}/login`)

    assert.equal(calls[0].init?.method, "POST")

    // Belum ada token tersimpan → login tanpa header Authorization.

    assert.equal(calls[0].headers.get("authorization"), null)

    assert.equal(
      calls[0].headers.get("content-type"),

      "application/json",
    )

    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
      email: "siti@feb.ac.id",

      password: "panitia123",
    })

    assert.equal(user.nama, "Siti")

    assert.equal(user.role, "panitia")

    assert.equal(getToken(), "tok-123")

    assert.equal(hasToken(), true)
  })

  it("422 validasi → ApiError dengan pesan field pertama", async () => {
    respond = () =>
      jsonResponse(
        { message: "Validation failed", errors: { email: ["Email salah."] } },

        422,
      )

    await assert.rejects(
      authenticate("x@feb.ac.id", "salah"),

      (err: unknown) => {
        assert.ok(err instanceof ApiError)

        assert.equal(err.status, 422)

        assert.equal(err.message, "Email salah.")

        return true
      },
    )
  })

  it("galat jaringan → ApiError status 0 dengan pesan ramah", async () => {
    respond = () => {
      throw new TypeError("fetch failed")
    }

    await assert.rejects(authenticate("a@b.c", "x"), (err: unknown) => {
      assert.ok(err instanceof ApiError)

      assert.equal(err.status, 0)

      assert.match(err.message, /Tidak dapat terhubung/)

      return true
    })
  })
})

describe("recordPrint", () => {
  it("mengirim Bearer token + body JSON dan mengembalikan hasil cetak", async () => {
    store.set("ebrankas_token", "tok-abc")

    respond = () =>
      jsonResponse({
        message: "Cetak dikirim",

        job_id: "JOB-1",

        watermark: "Siti Handayani · 13 Okt 2026 08:00",

        jumlah_cetak: 40,
      })

    const result = await recordPrint(7, 40, "kaprodi123")

    assert.equal(calls[0].url, `${API_BASE}/cetak/7`)

    assert.equal(calls[0].init?.method, "POST")

    assert.equal(calls[0].headers.get("authorization"), "Bearer tok-abc")

    assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
      jumlah_cetak: 40,

      pin_kaprodi: "kaprodi123",
    })

    assert.equal(result.job_id, "JOB-1")

    assert.equal(result.jumlah_cetak, 40)
  })

  it("403 PIN salah → ApiError meneruskan pesan server", async () => {
    store.set("ebrankas_token", "tok-abc")

    respond = () => jsonResponse({ message: "PIN Kaprodi salah." }, 403)

    await assert.rejects(recordPrint(7, 40, "salah"), (err: unknown) => {
      assert.ok(err instanceof ApiError)

      assert.equal(err.status, 403)

      assert.equal(err.message, "PIN Kaprodi salah.")

      return true
    })
  })
})

describe("createBankSoal", () => {
  it("mengirim multipart tanpa Content-Type manual + tanggal spasi", async () => {
    respond = () =>
      jsonResponse({
        data: {
          ...baseSoal,

          status: "terkunci",
        },
      })

    const file = new File([new Uint8Array([80, 68, 70])], "soal.pdf", {
      type: "application/pdf",
    })

    const soal = await createBankSoal({
      mkId: 1,

      jenis: "UTS",

      judul: "UTS Ganjil 2026",

      jadwalUjian: "2026-10-13T08:00",

      jumlahMahasiswa: 40,

      file,
    })

    // FormData tidak boleh diberi header manual agar boundary otomatis.

    assert.equal(calls[0].headers.get("content-type"), null)

    assert.ok(calls[0].init?.body instanceof FormData)

    const form = calls[0].init?.body as FormData

    assert.equal(form.get("mk_id"), "1")

    assert.equal(form.get("jenis"), "UTS")

    assert.equal(form.get("judul"), "UTS Ganjil 2026")

    assert.equal(form.get("jumlah_mahasiswa"), "40")

    // Backend menerima "Y-m-d H:i" (spasi), bukan huruf T.

    assert.equal(form.get("jadwal_ujian"), "2026-10-13 08:00")

    assert.equal(soal.id, 9)

    assert.equal(soal.status, "terkunci")
  })
})

describe("addUser", () => {
  it("generate password dan kembalikan sekali bersama profil", async () => {
    respond = (url) => {
      assert.equal(url, `${API_BASE}/users`)

      return jsonResponse({
        data: {
          id: 5,

          nidn: null,

          nama: "Dr. Budi",

          email: "budi@feb.ac.id",

          role: "dosen",

          is_active: true,
        },
      })
    }

    const created = await addUser({
      nama: "Dr. Budi",

      email: "budi@feb.ac.id",

      nidn: "",

      role: "dosen",
    })

    const body = JSON.parse(
      String(calls[0].init?.body),
    ) as Record<string, unknown>

    assert.equal(body.role, "dosen")

    assert.equal(typeof body.password, "string")

    assert.ok(String(body.password).length >= 8)

    assert.equal(created.password, body.password)

    assert.equal(created.pinCetak, null)

    assert.equal(created.user.nama, "Dr. Budi")
  })

  it("role kaprodi menerima PIN Cetak awal sekali dari server", async () => {
    respond = () =>
      jsonResponse({
        data: {
          id: 9,

          nidn: null,

          nama: "Kaprodi Baru",

          email: "kaprodi.baru@feb.ac.id",

          role: "kaprodi",

          is_active: true,
        },

        pin_cetak: "584736",
      })

    const created = await addUser({
      nama: "Kaprodi Baru",

      email: "kaprodi.baru@feb.ac.id",

      nidn: "",

      role: "kaprodi",
    })

    assert.equal(created.pinCetak, "584736")

    assert.match(created.pinCetak, /^[0-9]{6}$/)
  })

  it("role admin dikirim sebagai admin_it", async () => {
    respond = () =>
      jsonResponse({
        data: {
          id: 6,

          nidn: null,

          nama: "Admin",

          email: "admin@feb.ac.id",

          role: "admin_it",

          is_active: true,
        },
      })

    await addUser({
      nama: "Admin",

      email: "admin@feb.ac.id",

      nidn: "",

      role: "admin",
    })

    const body = JSON.parse(
      String(calls[0].init?.body),
    ) as Record<string, unknown>

    assert.equal(body.role, "admin_it")
  })
})

describe("generatePassword", () => {
  it("panjang 10 dan tanpa karakter ambigu", () => {
    const password = generatePassword()

    assert.equal(password.length, 10)

    assert.ok(
      /^[abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(
        password,
      ),
    )
  })
})

describe("resetUserPin", () => {
  it("kirim POST reset-pin dan terima PIN 6 digit sekali", async () => {
    store.set("ebrankas_token", "tok-abc")

    respond = (url) => {
      assert.equal(url, `${API_BASE}/users/5/reset-pin`)

      return jsonResponse({ pin_cetak: "042813" })
    }

    const pin = await resetUserPin(5)

    assert.equal(calls[0].init?.method, "POST")
    assert.equal(pin, "042813")

    assert.match(pin, /^[0-9]{6}$/)
  })

  it("error backend (422 non-kaprodi) diteruskan sebagai ApiError", async () => {
    store.set("ebrankas_token", "tok-abc")

    respond = () =>
      jsonResponse({ message: "PIN Cetak hanya berlaku untuk Kaprodi." }, 422)

    await assert.rejects(resetUserPin(3), (err: unknown) => {
      assert.ok(err instanceof ApiError)

      assert.equal(err.status, 422)

      return true
    })
  })
})

// ---------------------------------------------------------------------------

// loadDatabase: orkestrasi token + data peran

// ---------------------------------------------------------------------------

describe("loadDatabase", () => {
  it("tanpa token → database kosong, fetch tidak dipanggil", async () => {
    const db = await loadDatabase()

    assert.deepEqual(db, emptyDatabase())

    assert.equal(calls.length, 0)
  })

  it("token kedaluwarsa (401 di /me) → token dibuang, db kosong", async () => {
    store.set("ebrankas_token", "kedaluwarsa")

    respond = () => jsonResponse({ message: "Unauthenticated." }, 401)

    const db = await loadDatabase()

    assert.deepEqual(db, emptyDatabase())

    assert.equal(hasToken(), false)
  })

  it("kaprodi: memuat users + mk + log, tanpa soal-saya/antrian", async () => {
    store.set("ebrankas_token", "tok")

    respond = (url) => {
      if (url.endsWith("/me"))
        return jsonResponse({
          user: {
            id: 2,

            nidn: null,

            nama: "Dr. Rina",

            email: "rina@feb.ac.id",

            role: "kaprodi",

            is_active: true,
          },
        })

      if (url.endsWith("/users"))
        return jsonResponse({
          data: [
            {
              id: 2,

              nidn: null,

              nama: "Dr. Rina",

              email: "rina@feb.ac.id",

              role: "kaprodi",

              is_active: true,
            },

            {
              id: 4,

              nidn: null,

              nama: "Dr. Budi",

              email: "budi@feb.ac.id",

              role: "dosen",

              is_active: false,
            },
          ],
        })

      if (url.endsWith("/mata-kuliah"))
        return jsonResponse({
          data: [
            {
              id: 1,

              kode_mk: "EKM401",

              nama_mk: "Ekonomi Makro IV",

              kelas: "A",

              semester: 3,

              tahun_ajaran: "2026/2027",
            },
          ],
        })

      if (url.endsWith("/log/aktivitas")) return jsonResponse({ data: [] })

      return jsonResponse({ message: "Not Found" }, 404)
    }

    const db = await loadDatabase()

    assert.equal(db.session.userId, 2)

    assert.equal(db.users.length, 2)

    assert.equal(db.users[1].aktif, false)

    assert.equal(db.mata_kuliah[0].nama_mk, "Ekonomi Makro IV")

    const urls = calls.map((c) => c.url)

    assert.ok(!urls.some((u) => u.endsWith("/soal-saya")))

    assert.ok(!urls.some((u) => u.endsWith("/antrian-cetak")))

    assert.ok(urls.some((u) => u.endsWith("/users")))

    // Semua panggilan wajib membawa Bearer token.

    for (const call of calls) {
      assert.equal(call.headers.get("authorization"), "Bearer tok")
    }
  })
})

describe("clearToken", () => {
  it("menghapus token dari penyimpanan", () => {
    store.set("ebrankas_token", "x")

    assert.equal(hasToken(), true)

    clearToken()

    assert.equal(hasToken(), false)
  })
})
