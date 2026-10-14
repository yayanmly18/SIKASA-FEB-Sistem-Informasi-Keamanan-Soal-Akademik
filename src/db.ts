// ============================================================================

//

// SIKASA FEB (Sistem Informasi Keamanan Soal Akademik) — Lapisan Data
// (Klien API Laravel)

//

// ----------------------------------------------------------------------------

//

// Modul ini adalah SATU-SATUNYA tempat aplikasi berbicara dengan backend

// Laravel (http://127.0.0.1:8000/api). Semua operasi bersifat async dan

// memakai Bearer token (Laravel Sanctum). Respons server dipetakan (mapper)

// ke bentuk tampilan yang dipakai UI sehingga komponen di atasnya tidak

// perlu tahu detail skema MySQL.

//

//   Endpoint: /login /logout /me /mata-kuliah /soal-saya /soal

//             /antrian-cetak /cetak/{id} /users /log/aktivitas

//

// ============================================================================

export type UserRole = "dosen" | "kaprodi" | "panitia" | "admin"

// a. Tabel `users` (dipetakan dari profil API)

export interface User {
  id: number

  nidn: string

  nama: string

  email: string

  role: UserRole

  aktif: boolean
}

// b. Tabel `mata_kuliah`

export interface MataKuliah {
  id: number

  kode_mk: string

  nama_mk: string

  kelas: string

  semester: number

  tahun_ajaran: string
}

// c. Tabel `bank_soal` (INTI) — bentuk tampilan hasil mapper.

//

//    `print_ready` & `window` adalah kebijakan jendela cetak (H-1 07:00)

//    yang dihitung server (PrintService::canPrint) dan dipetakan ke sini

//    untuk menandai "Siap dicetak" vs "Terjadwal" di UI.

export interface BankSoal {
  id: number

  jenis: "UTS" | "UAS"

  judul: string

  status: "terkunci" | "siap_cetak" | "arsip"

  jadwal_ujian: string

  waktu_mulai_cetak: string | null

  jumlah_mahasiswa: number

  file_path: string

  // Denormalisasi dari join server (mataKuliah + dosen)

  kode_mk: string

  nama_mk: string

  kelas: string

  dosen: string

  print_ready: boolean

  window: string
}

// d. Tabel `log_aktivitas` (ANTI BOCOR) — baris dari GET /log/aktivitas

export interface LogAktivitas {
  id: number

  aksi: string

  waktu: string

  pengguna: string

  mata_kuliah: string | null

  detail: string

  ip_address: string
}

export interface RekapRow {
  mk_id: number

  kode_mk: string

  nama_mk: string

  kelas: string

  dosen: string | null

  bank_soal_id: number | null

  status: string

  jenis: string | null

  jadwal_ujian: string | null
}

export interface RevisiRequest {
  id: number

  nama_mk: string | null

  kode_mk: string | null

  dosen: string | null

  alasan_revisi: string

  diajukan_pada: string | null

  bank_soal_id: number
}

export interface DashboardCard {
  label: string

  value: string | number
}

export interface DashboardData {
  role: string

  cards: DashboardCard[]

  aktivitas?: {
    aksi: string
    waktu: string | null
  }[]
}

export interface LogCetakRow {
  id: number

  waktu: string

  mata_kuliah: string | null

  kode_mk: string | null

  dicetak_oleh: string | null

  disetujui_oleh: string | null

  jumlah_cetak: number

  printer: string | null

  status: string

  job_id: string

  ip_address: string
}

export interface PrinterStatus {
  id: number

  nama_printer: string

  lokasi: string | null

  status_db: string

  ada_di_windows: boolean

  default: boolean

  offline: boolean

  online: boolean
}

// Status printer asli untuk UI Panitia: gabungan data DB + deteksi Windows.
// null = belum dimuat / gagal dimuat (UI tampilkan "Memeriksa...").
export interface Database {
  users: User[]

  mata_kuliah: MataKuliah[]

  bank_soal: BankSoal[]

  log_aktivitas: LogAktivitas[]

  rekap: RekapRow[]

  revisi: RevisiRequest[]

  dashboard: DashboardData | null

  log_cetak: LogCetakRow[]

  session: { userId: number | null }
}

export function emptyDatabase(): Database {
  return {
    users: [],

    mata_kuliah: [],

    bank_soal: [],

    log_aktivitas: [],

    rekap: [],

    revisi: [],

    dashboard: null,

    log_cetak: [],

    session: { userId: null },
  }
}

// ----------------------------------------------------------------------------

// Koneksi API

// ----------------------------------------------------------------------------

const TOKEN_KEY = "ebrankas_token"

// Basis API bisa dioverride lewat env VITE_API_BASE (mis. saat backend

// di-hosting terpisah). Default: server Laravel lokal.

export const API_BASE =
  import.meta.env?.VITE_API_BASE as string | undefined ??
  "http://127.0.0.1:8000/api"

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = "ApiError"

    this.status = status
  }
}

function browserStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return browserStorage()?.getItem(TOKEN_KEY) ?? null
}

function setToken(token: string): void {
  browserStorage()?.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  browserStorage()?.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
  return getToken() != null
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>

  // Utamakan pesan per-field dari `errors`: untuk kegagalan validasi Laravel,
  // `message` hanya berisi ringkasan ("... (and 1 more error)"), sedangkan
  // `errors[field][0]` berisi teks yang layak ditampilkan. Pesan kustom
  // (mis. "PIN Kaprodi salah.") tidak menyertakan `errors` sehingga jatuh ke
  // `message` pada langkah berikutnya.
  const errors = record.errors

  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0]
    }
  }

  if (typeof record.message === "string" && record.message.trim() !== "") {
    return record.message
  }

  return null
}

async function apiFetch<T>(
  path: string,

  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)

  headers.set("Accept", "application/json")

  const token = getToken()

  if (token) headers.set("Authorization", `Bearer ${token}`)

  const isFormData =
    init.body != null &&
    typeof FormData !== "undefined" &&
    init.body instanceof FormData

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let res: Response

  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(
      0,

      "Tidak dapat terhubung ke server SIKASA FEB. Pastikan layanan backend berjalan.",
    )
  }

  const text = await res.text()

  let body: unknown = null

  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,

      extractErrorMessage(body) ?? `Permintaan gagal (HTTP ${res.status}).`,
    )
  }

  return body as T
}

// ----------------------------------------------------------------------------

// Bentuk mentah respons API (sesuai controller backend) + mapper ke tipe UI.

// ----------------------------------------------------------------------------

interface ApiUser {
  id: number

  nidn?: string | null

  nama: string

  email: string

  role: string

  is_active: boolean
}

// BankSoalController::transform() — dipakai /soal-saya dan /soal (create)

interface ApiSoal {
  id: number

  kode_mk?: string | null

  nama_mk?: string | null

  kelas?: string | null

  jenis: "UTS" | "UAS"

  judul: string

  status: string

  jumlah_mahasiswa: number

  jadwal_ujian?: string | null

  waktu_mulai_cetak?: string | null

  file_path: string
}

// CetakController::antrian() — baris antrian untuk Panitia/TU

interface ApiAntrian {
  id: number

  kode_mk?: string | null

  nama_mk?: string | null

  kelas?: string | null

  dosen?: string | null

  jenis: "UTS" | "UAS"

  jadwal_ujian?: string | null

  jumlah_mahasiswa: number

  status_cetak: string

  alasan?: string | null
}

// LogController::aktivitas()

interface ApiLog {
  id: number

  waktu?: string | null

  pengguna?: string | null

  aksi: string

  mata_kuliah?: string | null

  detail?: unknown

  ip_address?: string | null
}

interface ApiMataKuliah {
  id: number

  kode_mk: string

  nama_mk: string

  kelas: string

  semester: number

  tahun_ajaran: string
}

// Backend memakai role "admin_it"; UI memakai "admin".

export function toUiRole(role: string): UserRole {
  if (role === "admin_it") return "admin"

  return role === "dosen" || role === "kaprodi" || role === "panitia"
    ? role
    : "panitia"
}

export function toApiRole(role: UserRole): string {
  return role === "admin" ? "admin_it" : role
}

export function toUiUser(api: ApiUser): User {
  return {
    id: api.id,

    nidn: api.nidn ?? "",

    nama: api.nama,

    email: api.email,

    role: toUiRole(api.role),

    aktif: Boolean(api.is_active),
  }
}

function toUiMataKuliah(api: ApiMataKuliah): MataKuliah {
  return {
    id: api.id,

    kode_mk: api.kode_mk,

    nama_mk: api.nama_mk,

    kelas: api.kelas,

    semester: api.semester,

    tahun_ajaran: api.tahun_ajaran,
  }
}

// Normalisasi waktu server ("Y-m-d H:i" atau ISO "Y-m-d\TH:i") ke "Y-m-d\TH:i"

// agar aman dipakai `new Date(...)` maupun dikirim kembali ke input.

export function normalizeDateTime(value: string | null | undefined): string {
  if (!value) return ""

  return value.trim().replace(" ", "T")
}

// Hitung print_ready + teks jendela cetak dari status & waktu_mulai_cetak.

function resolvePrintWindow(
  status: string,

  waktuMulai: string | null | undefined,
): {
  print_ready: boolean
  window: string
} {
  if (status === "arsip") {
    return {
      print_ready: false,

      window: "Diarsipkan permanen",
    }
  }

  if (status !== "siap_cetak") {
    return {
      print_ready: false,

      window: "Menunggu pembukaan Kaprodi",
    }
  }

  const mulai = normalizeDateTime(waktuMulai)

  if (!mulai) {
    return {
      print_ready: false,

      window: "Jadwal buka cetak belum diatur",
    }
  }

  if (Date.now() < new Date(mulai).getTime()) {
    return {
      print_ready: false,

      window: `Bisa dicetak ${formatTanggal(mulai)} ${formatJam(mulai)}`,
    }
  }

  return { print_ready: true, window: "Jendela cetak terbuka" }
}

export function toUiSoal(api: ApiSoal): BankSoal {
  const { print_ready, window } = resolvePrintWindow(
    api.status,

    api.waktu_mulai_cetak,
  )

  return {
    id: api.id,

    jenis: api.jenis,

    judul: api.judul,

    status:
      "siap_cetak" === api.status
        ? "siap_cetak"
        : api.status === "arsip"
          ? "arsip"
          : "terkunci",

    jadwal_ujian: normalizeDateTime(api.jadwal_ujian),

    waktu_mulai_cetak: normalizeDateTime(api.waktu_mulai_cetak) || null,

    jumlah_mahasiswa: api.jumlah_mahasiswa,

    file_path: api.file_path,

    kode_mk: api.kode_mk ?? "-",

    nama_mk: api.nama_mk ?? "-",

    kelas: api.kelas ?? "-",

    dosen: "-",

    print_ready,

    window,
  }
}

export function toUiAntrian(api: ApiAntrian): BankSoal {
  const bisaCetak = api.status_cetak === "bisa_cetak"

  return {
    id: api.id,

    jenis: api.jenis,

    judul: api.nama_mk ?? "-",

    status: "siap_cetak",

    jadwal_ujian: normalizeDateTime(api.jadwal_ujian),

    waktu_mulai_cetak: null,

    jumlah_mahasiswa: api.jumlah_mahasiswa,

    file_path: "",

    kode_mk: api.kode_mk ?? "-",

    nama_mk: api.nama_mk ?? "-",

    kelas: api.kelas ?? "-",

    dosen: api.dosen ?? "-",

    print_ready: bisaCetak,

    window: bisaCetak ? "Jendela cetak terbuka" : (api.alasan ?? "Terkunci"),
  }
}

// Server mengirim `detail` sebagai objek JSON; UI hanya menampilkan string.

export function formatLogDetail(detail: unknown): string {
  if (detail == null) return ""

  if (typeof detail === "string") return detail

  if (typeof detail === "object") {
    return Object.entries(detail as Record<string, unknown>)

      .map(([key, value]) => `${key}: ${String(value)}`)

      .join(" · ")
  }

  return String(detail)
}

export function toUiLog(api: ApiLog): LogAktivitas {
  return {
    id: api.id,

    aksi: api.aksi,

    waktu: api.waktu ?? "",

    pengguna: api.pengguna ?? "Sistem",

    mata_kuliah: api.mata_kuliah ?? null,

    detail: formatLogDetail(api.detail),

    ip_address: api.ip_address ?? "-",
  }
}

// ----------------------------------------------------------------------------

// Operasi domain async — setiap fungsi setara dengan satu aksi di aplikasi.

// ----------------------------------------------------------------------------

// Langkah 0 — Login: ambil token Sanctum + profil, lalu simpan token.

export async function authenticate(
  email: string,
  password: string,
): Promise<User> {
  const res = await apiFetch<{
    token: string
    user: ApiUser
  }>("/login", {
    method: "POST",

    body: JSON.stringify({ email, password }),
  })

  setToken(res.token)

  return toUiUser(res.user)
}

// Logout: cabut token di server (best effort) lalu hapus token lokal.

export async function logout(): Promise<void> {
  try {
    await apiFetch("/logout", { method: "POST" })
  } catch {
    // Token mungkin sudah kedaluwarsa — tetap lanjut bersih-bersih lokal.
  }

  clearToken()
}

// Muat seluruh data yang relevan peran dari API. Jika token tidak ada atau

// tidak valid, kembalikan database kosong (UI menampilkan halaman login).

export async function loadDatabase(): Promise<Database> {
  const db = emptyDatabase()

  if (!hasToken()) return db

  let me: User

  try {
    const res = await apiFetch<{ user: ApiUser }>("/me")

    me = toUiUser(res.user)
  } catch (error) {
    // 401 = token kedaluwarsa/hapus; error jaringan = biarkan kosong juga.

    if (error instanceof ApiError && error.status === 401) clearToken()

    return db
  }

  db.users = [me]

  db.session.userId = me.id

  // Ambil data peran secara paralel; kegagalan satu endpoint (mis. 403

  // karena peran tidak berwenang) tidak boleh menjatuhkan yang lain.

  const jobs: Promise<void>[] = [
    apiFetch<{ data: ApiMataKuliah[] }>("/mata-kuliah")

      .then((res) => {
        db.mata_kuliah = (res.data ?? []).map(toUiMataKuliah)
      })

      .catch(() => {}),

    apiFetch<{ data: ApiLog[] }>("/log/aktivitas")

      .then((res) => {
        db.log_aktivitas = (res.data ?? []).map(toUiLog)
      })

      .catch(() => {}),

    apiFetch<ApiDashboardResp>("/dashboard")

      .then((res) => {
        db.dashboard = toUiDashboard(res)
      })

      .catch(() => {}),

    apiFetch<{ data: ApiRekap[] }>("/rekap")

      .then((res) => {
        db.rekap = (res.data ?? []).map(toUiRekap)
      })

      .catch(() => {}),

    apiFetch<{ data: ApiRevisiItem[] }>("/revisi")

      .then((res) => {
        db.revisi = (res.data ?? []).map(toUiRevisi)
      })

      .catch(() => {}),

    apiFetch<{ data: ApiLogCetak[] }>("/log/cetak")

      .then((res) => {
        db.log_cetak = (res.data ?? []).map(toUiLogCetak)
      })

      .catch(() => {}),
  ]

  if (me.role === "dosen") {
    jobs.push(
      apiFetch<{ data: ApiSoal[] }>("/soal-saya")

        .then((res) => {
          db.bank_soal = (res.data ?? []).map(toUiSoal)
        })

        .catch(() => {}),
    )
  } else if (me.role === "panitia") {
    jobs.push(
      apiFetch<{ data: ApiAntrian[] }>("/antrian-cetak")

        .then((res) => {
          db.bank_soal = (res.data ?? []).map(toUiAntrian)
        })

        .catch(() => {}),
    )
  }

  if (me.role === "kaprodi" || me.role === "admin") {
    jobs.push(
      apiFetch<{ data: ApiUser[] }>("/users")

        .then((res) => {
          db.users = (res.data ?? []).map(toUiUser)
        })

        .catch(() => {}),
    )
  }

  await Promise.all(jobs)

  // Pastikan pengguna yang sedang login selalu ada di daftar (untuk lookup

  // profil ketika endpoint /users tidak berwenang dipanggil).

  if (!db.users.some((u) => u.id === me.id)) db.users.unshift(me)

  return db
}

export function findUser(db: Database, id: number | null): User | null {
  if (id == null) return null

  return db.users.find((u) => u.id === id) ?? null
}

export interface UploadSoalInput {
  mkId: number

  jenis: "UTS" | "UAS"

  judul: string

  jadwalUjian: string

  jumlahMahasiswa: number

  file: File
}

export interface NewUserInput {
  nama: string

  email: string

  role: UserRole

  nidn: string
}

// Langkah 1 — Dosen upload PDF final + data, lalu KUNCI. File dikirim sebagai

// multipart; server yang me-rename acak + mengenkripsi (AES-256).

export async function createBankSoal(
  input: UploadSoalInput,
): Promise<BankSoal> {
  const form = new FormData()

  form.append("mk_id", String(input.mkId))

  form.append("jenis", input.jenis)

  form.append("judul", input.judul)

  form.append("jumlah_mahasiswa", String(input.jumlahMahasiswa))

  form.append("jadwal_ujian", input.jadwalUjian.replace("T", " "))

  form.append("file", input.file)

  const res = await apiFetch<{ data: ApiSoal }>("/soal", {
    method: "POST",

    body: form,
  })

  return toUiSoal(res.data)
}

export interface PrintResult {
  message: string

  job_id: string

  // Status job: "berhasil" | "menunggu" (masuk antrian, printer belum terhubung) | "gagal".
  status?: string

  printer?: string

  watermark: string

  jumlah_cetak: number

  pin_hangus?: boolean
}

// Langkah 2 — Panitia/TU cetak soal. Wajib menyertakan PIN Kaprodi HARIAN;
// server memvalidasi jendela cetak (H-1) + PIN hari ini sebelum mengirim ke
// printer jaringan. PIN tidak hangus per cetakan; kedaluwarsa otomatis besok.
// printerId (opsional) = pilihan printer ala Word; bila kosong server pakai
// printer aktif. Job tetap masuk antrian walau printer belum terhubung.

export async function recordPrint(
  bankSoalId: number,

  jumlahCetak: number,

  pinKaprodi: string,

  printerId?: number | null,
): Promise<PrintResult> {
  return apiFetch<PrintResult>(`/cetak/${bankSoalId}`, {
    method: "POST",

    body: JSON.stringify({
      jumlah_cetak: jumlahCetak,
      pin_kaprodi: pinKaprodi,
      ...(printerId ? { printer_id: printerId } : {}),
    }),
  })
}

// Status printer asli (DB + deteksi Windows) untuk pemilihan printer pada
// modal cetak. Gagal dimuat (mis. peran bukan panitia) → kembalikan null agar
// UI jujur menampilkan "Memeriksa..." bukan "Online & siap" palsu.
export async function fetchPrinterStatus(): Promise<{
  utama: PrinterStatus | null
  semua: PrinterStatus[]
  printCommandAktif: boolean
} | null> {
  try {
    const res = await apiFetch<{
      data: PrinterStatus[]
      utama: PrinterStatus | null
      print_command_aktif: boolean
    }>("/printer-status")

    return {
      utama: res.utama ?? null,
      semua: res.data ?? [],
      printCommandAktif: res.print_command_aktif,
    }
  } catch {
    return null
  }
}

// --- Kelola Printer (halaman Admin IT) ---

// Daftar printer lengkap untuk layar "Kelola Printer": alamat + status
// Windows nyata + jumlah job tercatat.

export interface PrinterAdmin {
  id: number

  nama_printer: string

  alamat_printer: string

  lokasi: string | null

  status_db: string

  ada_di_windows: boolean

  offline: boolean

  online: boolean

  jumlah_cetak: number
}

export interface PrinterInput {
  nama_printer: string

  alamat_printer: string

  lokasi: string
}

export async function fetchPrintersAdmin(): Promise<PrinterAdmin[]> {
  const res = await apiFetch<{ data: PrinterAdmin[] }>("/printers")

  return res.data ?? []
}

// Tambah printer (id kosong) atau ubah data printer (id terisi) — Admin IT.

export async function savePrinter(
  input: PrinterInput,

  id?: number,
): Promise<PrinterAdmin> {
  const res = await apiFetch<{ data: PrinterAdmin }>(
    id ? `/printers/${id}` : "/printers",
    {
      method: id ? "PUT" : "POST",

      body: JSON.stringify(input),
    },
  )

  return res.data
}

// Aktif/nonaktifkan printer. Printer aktif dipakai sebagai tujuan cetak

// bila petugas tidak memilih printer secara spesifik.

export async function togglePrinter(id: number): Promise<PrinterAdmin> {
  const res = await apiFetch<{ data: PrinterAdmin }>(`/printers/${id}/toggle`, {
    method: "PATCH",
  })

  return res.data
}

// Hapus printer. Backend menolak bila sudah ada riwayat cetak tercatat.

export async function deletePrinter(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/printers/${id}`, {
    method: "DELETE",
  })
}

// Hasil scan printer Windows Server (USB & jaringan) untuk layar Kelola
// Printer: nama asli di OS + pencocokan otomatis dengan database.

export interface PrinterScan {
  nama_windows: string

  port: string | null

  default: boolean

  offline: boolean

  sudah_terdaftar: boolean

  nama_persis: boolean

  printer_id: number | null
}

// Scan otomatis printer yang dikenal Windows Server. serverWindows=false
// berarti backend tidak berjalan di Windows sehingga scan tidak tersedia.

export async function scanPrinters(): Promise<{
  serverWindows: boolean

  daftar: PrinterScan[]
}> {
  const res = await apiFetch<{ data: PrinterScan[]; server_windows: boolean }>(
    "/printers/scan",
  )

  return { serverWindows: res.server_windows, daftar: res.data ?? [] }
}

// Tambah pengguna (Kaprodi/Admin IT). Backend mewajibkan password awal

// (min 8 karakter); kita generate di sini dan kembalikan agar bisa ditampilkan

// sekali kepada admin saat berhasil ditambahkan. Untuk akun kaprodi, backend

// juga menghasilkan PIN Cetak awal (6 digit) yang dikembalikan sekali.

export function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

  let out = ""

  for (let i = 0; i < 10; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }

  return out
}

export async function addUser(
  input: NewUserInput,
): Promise<{
  user: User
  password: string
  pinCetak: string | null
}> {
  const password = generatePassword()

  const res = await apiFetch<{
    data: ApiUser

    pin_cetak?: string | null
  }>("/users", {
    method: "POST",

    body: JSON.stringify({
      nama: input.nama,

      email: input.email,

      nidn: input.nidn || null,

      role: toApiRole(input.role),

      password,
    }),
  })

  return {
    user: toUiUser(res.data),

    password,

    pinCetak: res.pin_cetak ?? null,
  }
}

// ----------------------------------------------------------------------------

// Helper tampilan — memformat data API menjadi bentuk yang dipakai UI.

// ----------------------------------------------------------------------------

const BULAN = [
  "Jan",

  "Feb",

  "Mar",

  "Apr",

  "Mei",

  "Jun",

  "Jul",

  "Agu",

  "Sep",

  "Okt",

  "Nov",

  "Des",
]

// Bahasa Inggris (format PHP 'M') → indeks bulan Indonesia.

const BULAN_EN: Record<string, number> = {
  Jan: 0,

  Feb: 1,

  Mar: 2,

  Apr: 3,

  May: 4,

  Jun: 5,

  Jul: 6,

  Aug: 7,

  Sep: 8,

  Oct: 9,

  Nov: 10,

  Dec: 11,
}

export function formatTanggal(iso: string): string {
  if (!iso) return "-"

  // Format server untuk log: "13 Oct 2026 07:15" (PHP 'd M Y H:i').

  const server = iso.match(/^(\d{1,2}) (\w{3}) (\d{4})(?: (\d{2}:\d{2}))?$/)

  if (server && server[2] in BULAN_EN) {
    return `${server[1]} ${BULAN[BULAN_EN[server[2]]]} ${server[3]}`
  }

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return iso

  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export function formatJam(iso: string): string {
  if (!iso) return ""

  // Format server untuk log: "13 Oct 2026 07:15".

  const server = iso.match(/^(\d{1,2}) \w{3} \d{4} (\d{2}:\d{2})$/)

  if (server) return server[2]

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ""

  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export interface ExamView {
  id: number

  code: string

  course: string

  lecturer: string

  className: string

  type: "UTS" | "UAS"

  date: string

  time: string

  students: number

  status: string

  window: string

  print_ready: boolean
}

// bank_soal (sudah denormalisasi oleh mapper) → bentuk "exam" untuk kartu

// antrian cetak.

export function toExamViews(db: Database): ExamView[] {
  return db.bank_soal.map((soal) => ({
    id: soal.id,

    code: soal.kode_mk,

    course: soal.nama_mk,

    lecturer: soal.dosen,

    className: soal.kelas,

    type: soal.jenis,

    date: formatTanggal(soal.jadwal_ujian),

    time: formatJam(soal.jadwal_ujian),

    students: soal.jumlah_mahasiswa,

    status: soal.print_ready ? "Siap dicetak" : "Terjadwal",

    window: soal.window,

    print_ready: soal.print_ready,
  }))
}

export interface LogRow {
  waktu: string

  nama: string

  aksi: string

  detail: string

  ip: string
}

// log_aktivitas (sudah termasuk nama pengguna dari server) → baris untuk

// halaman Log.

export function toLogRows(db: Database): LogRow[] {
  return db.log_aktivitas.map((log) => ({
    waktu: `${formatTanggal(log.waktu)}${
      formatJam(log.waktu) ? ` · ${formatJam(log.waktu)}` : ""
    }`,

    nama: log.pengguna,

    aksi: labelAksi(log.aksi),

    detail: log.mata_kuliah ? `${log.mata_kuliah} · ${log.detail}` : log.detail,

    ip: log.ip_address,
  }))
}

export function labelAksi(aksi: string): string {
  switch (aksi) {
    case "upload":
      return "Upload"

    case "cetak":
      return "Cetak"

    case "cetak_ditolak":
      return "Cetak Ditolak"

    case "buka_cetak":
      return "Buka Cetak"

    case "revisi":
      return "Revisi"

    case "kunci":
      return "Kunci"

    case "approval":
      return "Approval"

    case "login":
      return "Login"

    case "login_gagal":
      return "Login Gagal"

    case "logout":
      return "Logout"

    case "tambah_user":
      return "Tambah User"

    case "ubah_status_user":
      return "Ubah Status User"

    case "reset_password":
      return "Reset Password"

    default:
      return aksi
  }
}

// Label peran untuk tabel manajemen user.

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "dosen":
      return "Dosen"

    case "kaprodi":
      return "Kaprodi"

    case "panitia":
      return "Panitia / TU"

    case "admin":
      return "Admin IT"

    default:
      return role
  }
}

// Inisial nama (tanpa gelar) untuk avatar bulat.

export function initials(nama: string): string {
  const words = nama

    .replace(/[.,]/g, "")

    .split(/\s+/)

    .filter(
      (w) =>
        w.length > 1 && !/^(dr|drs|prof|ir|sp|si|se|ak|mm|st|me|m)$/i.test(w),
    )

  if (words.length === 0) return nama.slice(0, 2).toUpperCase()

  return (words[0][0] + (words[1]?.[0] ?? "")).toUpperCase()
}

// ----------------------------------------------------------------------------
// Endpoint tambahan: dashboard, rekap, revisi, log cetak, user lifecycle.
// Seluruh UI wajib memakai fungsi di bawah (data live dari MySQL), bukan
// konstanta contoh di komponen.
// ----------------------------------------------------------------------------

interface ApiRekap {
  mk_id: number
  kode_mk: string
  nama_mk: string
  kelas: string
  dosen?: string | null
  bank_soal_id?: number | null
  status: string
  jenis?: string | null
  jadwal_ujian?: string | null
}

interface ApiRevisiItem {
  id: number
  nama_mk?: string | null
  kode_mk?: string | null
  dosen?: string | null
  alasan_revisi: string
  diajukan_pada?: string | null
  bank_soal_id: number
}

interface ApiDashboardResp {
  role: string
  cards: {
    label: string
    value: string | number
  }[]
  aktivitas?: {
    aksi: string
    waktu?: string | null
  }[]
}

interface ApiLogCetak {
  id: number
  waktu?: string | null
  mata_kuliah?: string | null
  kode_mk?: string | null
  dicetak_oleh?: string | null
  disetujui_oleh?: string | null
  jumlah_cetak: number
  printer?: string | null
  status: string
  job_id: string
  ip_address: string
}

export function toUiRekap(api: ApiRekap): RekapRow {
  return {
    mk_id: api.mk_id,
    kode_mk: api.kode_mk,
    nama_mk: api.nama_mk,
    kelas: api.kelas,
    dosen: api.dosen ?? null,
    bank_soal_id: api.bank_soal_id ?? null,
    status: api.status,
    jenis: api.jenis ?? null,
    jadwal_ujian: api.jadwal_ujian ? normalizeDateTime(api.jadwal_ujian) : null,
  }
}

export function toUiRevisi(api: ApiRevisiItem): RevisiRequest {
  return {
    id: api.id,
    nama_mk: api.nama_mk ?? null,
    kode_mk: api.kode_mk ?? null,
    dosen: api.dosen ?? null,
    alasan_revisi: api.alasan_revisi,
    diajukan_pada: api.diajukan_pada ?? null,
    bank_soal_id: api.bank_soal_id,
  }
}

export function toUiDashboard(api: ApiDashboardResp): DashboardData {
  return {
    role: api.role,
    cards: (api.cards ?? []).map((c) => ({ label: c.label, value: c.value })),
    aktivitas: (api.aktivitas ?? []).map((a) => ({
      aksi: a.aksi,
      waktu: a.waktu ?? null,
    })),
  }
}

export function toUiLogCetak(api: ApiLogCetak): LogCetakRow {
  return {
    id: api.id,
    waktu: api.waktu ?? "",
    mata_kuliah: api.mata_kuliah ?? null,
    kode_mk: api.kode_mk ?? null,
    dicetak_oleh: api.dicetak_oleh ?? null,
    disetujui_oleh: api.disetujui_oleh ?? null,
    jumlah_cetak: api.jumlah_cetak,
    printer: api.printer ?? null,
    status: api.status,
    job_id: api.job_id,
    ip_address: api.ip_address,
  }
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await apiFetch<ApiDashboardResp>("/dashboard")
  return toUiDashboard(res)
}

// Dosen mengajukan revisi: PDF baru + alasan. Kembali ke status menunggu.
export async function requestRevisi(
  bankSoalId: number,
  alasan: string,
  file: File,
): Promise<string> {
  const form = new FormData()
  form.append("alasan_revisi", alasan)
  form.append("file", file)
  const res = await apiFetch<{ message: string }>(
    `/soal/${bankSoalId}/revisi`,
    {
      method: "POST",
      body: form,
    },
  )
  return res.message
}

// Kaprodi memutuskan revisi: "disetujui" | "ditolak".
export async function decideRevisi(
  revisiId: number,
  keputusan: "disetujui" | "ditolak",
  catatan?: string,
): Promise<string> {
  const res = await apiFetch<{ message: string }>(`/revisi/${revisiId}`, {
    method: "PATCH",
    body: JSON.stringify({
      keputusan,
      catatan_persetujuan: catatan ?? null,
    }),
  })
  return res.message
}

// Kaprodi membuka jendela cetak: terkunci -> siap_cetak.
export async function bukaCetak(bankSoalId: number): Promise<string> {
  const res = await apiFetch<{ message: string }>(
    `/soal/${bankSoalId}/buka-cetak`,
    { method: "POST" },
  )
  return res.message
}

// Kaprodi/Admin menonaktifkan / mengaktifkan pengguna.
export async function toggleUser(id: number): Promise<User> {
  const res = await apiFetch<{ data: ApiUser }>(`/users/${id}/toggle`, {
    method: "PATCH",
  })
  return toUiUser(res.data)
}

// Reset password pengguna; password baru digenerate dan dikembalikan sekali
// untuk ditampilkan kepada admin (tidak disimpan di state).
export async function resetUserPassword(id: number): Promise<string> {
  const password = generatePassword()
  await apiFetch(`/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  })
  return password
}

// Reset PIN Cetak pengguna (hanya akun kaprodi). Server menghasilkan PIN
// 6 digit baru (disimpan ter-hash) dan mengembalikannya sekali untuk
// ditampilkan kepada admin — sama seperti pola resetUserPassword.

export async function resetUserPin(id: number): Promise<string> {
  const res = await apiFetch<{ pin_cetak: string }>(`/users/${id}/reset-pin`, {
    method: "POST",
  })
  return res.pin_cetak
}

// Ubah data profil pengguna (Kaprodi/Admin IT). Password sengaja tidak
// disertakan — gunakan resetUserPassword untuk itu.
export async function updateUser(
  id: number,
  input: {
    nama: string
    email: string
    nidn: string
    role: UserRole
  },
): Promise<User> {
  const res = await apiFetch<{ data: ApiUser }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nama: input.nama,
      email: input.email,
      nidn: input.nidn || null,
      role: toApiRole(input.role),
    }),
  })
  return toUiUser(res.data)
}

// ============================================================================
// Mata kuliah (CRUD oleh Kaprodi & Admin IT)
// ============================================================================

export interface MataKuliahInput {
  kode_mk: string
  nama_mk: string
  kelas: string
  semester: number
  tahun_ajaran: string
}

export async function createMataKuliah(
  input: MataKuliahInput,
): Promise<MataKuliah> {
  const res = await apiFetch<{ data: ApiMataKuliah }>("/mata-kuliah", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return toUiMataKuliah(res.data)
}

export async function updateMataKuliah(
  id: number,
  input: MataKuliahInput,
): Promise<MataKuliah> {
  const res = await apiFetch<{ data: ApiMataKuliah }>(`/mata-kuliah/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
  return toUiMataKuliah(res.data)
}

export async function deleteMataKuliah(id: number): Promise<void> {
  await apiFetch(`/mata-kuliah/${id}`, {
    method: "DELETE",
  })
}

// ============================================================================
// Notifikasi (lonceng header)
// ============================================================================

export interface Notifikasi {
  id: number

  judul: string

  pesan: string

  tipe: string

  tautan: string | null

  dibaca: boolean

  waktu: string | null
}

interface ApiNotifikasi {
  id: number

  judul: string

  pesan: string

  tipe: string

  tautan?: string | null

  dibaca: boolean

  waktu?: string | null
}

interface ApiNotifikasiResp {
  data: ApiNotifikasi[]

  belum_dibaca: number
}

export function toUiNotifikasi(api: ApiNotifikasi): Notifikasi {
  return {
    id: api.id,
    judul: api.judul,
    pesan: api.pesan,
    tipe: api.tipe,
    tautan: api.tautan ?? null,
    dibaca: api.dibaca,
    waktu: api.waktu ?? null,
  }
}

export async function fetchNotifikasi(): Promise<{
  items: Notifikasi[]

  unreadCount: number
}> {
  const res = await apiFetch<ApiNotifikasiResp>("/notifikasi")
  return {
    items: (res.data ?? []).map(toUiNotifikasi),
    unreadCount: res.belum_dibaca ?? 0,
  }
}

export async function markNotifikasiRead(id: number): Promise<void> {
  await apiFetch(`/notifikasi/${id}/baca`, { method: "PATCH" })
}

export async function markAllNotifikasiRead(): Promise<void> {
  await apiFetch("/notifikasi/baca-semua", { method: "PATCH" })
}

// ============================================================================
// Pengingat revisi / unggah (Kaprodi)
// ============================================================================

// Kaprodi kirim pengingat ke dosen yang belum upload soal.
export async function sendPengingat(): Promise<string> {
  const res = await apiFetch<{ message: string }>("/pengingat/kirim", {
    method: "POST",
  })
  return res.message
}

// ============================================================================
// Ekspor Berita Acara (Kaprodi) — unduh PDF
// ============================================================================

// Mengunduh Berita Acara Ujian sebagai PDF. Karena responsnya berupa blob
// (bukan JSON), kita fetch manual dengan token lalu picu unduhan di browser.
export async function exportBeritaAcara(): Promise<void> {
  const headers = new Headers({ Accept: "application/pdf" })

  const token = getToken()

  if (token) headers.set("Authorization", `Bearer ${token}`)

  let res: Response

  try {
    res = await fetch(`${API_BASE}/laporan/berita-acara`, { headers })
  } catch {
    throw new ApiError(
      0,

      "Tidak dapat terhubung ke server E-Brankas. Pastikan layanan backend berjalan.",
    )
  }

  if (!res.ok) {
    const text = await res.text()

    let body: unknown = null

    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }

    throw new ApiError(
      res.status,

      extractErrorMessage(body) ?? `Ekspor gagal (HTTP ${res.status}).`,
    )
  }

  const blob = await res.blob()

  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")

  a.href = url
  a.download = "berita-acara-ujian.pdf"

  document.body.appendChild(a)

  a.click()

  a.remove()

  URL.revokeObjectURL(url)
}
