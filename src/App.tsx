import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  APP_NAMA,
  APP_SINGKATAN,
  APP_TAGLINE,
  BARIS_HAK_CIPTA,
  INSTANSI_KOP,
  JUDUL_DOKUMEN,
} from "./brand"
import {
  addUser,
  authenticate,
  bukaCetak,
  createBankSoal,
  createMataKuliah,
  decideRevisi,
  deleteMataKuliah,
  emptyDatabase,
  exportBeritaAcara,
  fetchNotifikasi,
  fetchPrinterStatus,
  findUser,
  formatJam,
  formatTanggal,
  hasToken,
  initials,
  logout as dbLogout,
  loadDatabase,
  markAllNotifikasiRead,
  markNotifikasiRead,
  recordPrint,
  requestRevisi,
  resetUserPassword,
  resetUserPin,
  roleLabel,
  sendPengingat,
  toExamViews,
  toLogRows,
  toggleUser,
  updateMataKuliah,
  updateUser,
  type BankSoal,
  type Database,
  type ExamView,
  type LogRow,
  type MataKuliah,
  type MataKuliahInput,
  type Notifikasi,
  type PrinterStatus,
  type PrintResult,
  type RekapRow,
  type UploadSoalInput,
  type User,
} from "./db"

type IconName = "archive" | "bell" | "book" | "calendar" | "check" | "chevron" | "chevronKiri" | "clock" | "dashboard" | "document" | "download" | "eye" | "eyeOff" | "file" | "history" | "lock" | "logout" | "menu" | "printer" | "search" | "settings" | "shield" | "upload" | "users" | "x"

type UserRole = "dosen" | "kaprodi" | "panitia" | "admin"

const iconPaths: Record<IconName, ReactNode> = {
  archive: (
    <>
      <path d="M4 7h16M5 7l1 13h12l1-13M8 4h8l1 3H7l1-3Z" />
      <path d="M9 11h6" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3V5Z" />
      <path d="M4 18a3 3 0 0 1 3-3h13" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  chevronKiri: <path d="m15 18-6-6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h8l4 4v16H6V2Z" />
      <path d="M14 2v5h5M9 13h6M9 17h6M9 9h2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a17.9 17.9 0 0 1-2.16 3.19M6.61 6.61A17.8 17.8 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 4.39-1.11" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M3 3l18 18" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l4 4v16H6V2Z" />
      <path d="M14 2v5h5" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  printer: (
    <>
      <path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M16 11a4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.7" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
}

type IconProps = {
  name: IconName
  size?: number
}

function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {iconPaths[name]}
    </svg>
  )
}

type NavItem = {
  label: string
  icon: IconName
}

const roleMeta: Record<UserRole, {
  label: string
  hint: string
  nav: NavItem[]
}> = {
  dosen: {
    label: "Dosen",
    hint: "Upload & kelola soal",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Upload Soal", icon: "upload" },
      { label: "Soal Saya", icon: "book" },
      { label: "Log Aktivitas", icon: "history" },
    ],
  },
  kaprodi: {
    label: "Kaprodi",
    hint: "Rekap & approval",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Rekap Soal", icon: "book" },
      { label: "Approval Revisi", icon: "history" },
      { label: "Master Mata Kuliah", icon: "document" },
      { label: "Log & Berita Acara", icon: "document" },
    ],
  },
  panitia: {
    label: "Panitia",
    hint: "Cetak aman",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Antrian Cetak", icon: "printer" },
      { label: "Log Cetak", icon: "history" },
    ],
  },
  admin: {
    label: "Admin IT",
    hint: "User & server",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Status Server", icon: "settings" },
      { label: "Manajemen User", icon: "users" },
      { label: "Master Mata Kuliah", icon: "book" },
      { label: "Log Sistem", icon: "history" },
    ],
  },
}

function normalizeRole(value: unknown): UserRole {
  return typeof value === "string" && value in roleMeta
    ? value as UserRole
    : "panitia"
}

// ----------------------------------------------------------------------------
// Context database — membuat seluruh komponen bisa membaca/menulis "database"
// secara reaktif. Semua operasi bersifat async karena berbicara dengan API
// Laravel (Bearer token); state database dimuat ulang setelah tiap mutasi.
// ----------------------------------------------------------------------------
interface DbContextValue {
  db: Database
  currentUser: User | null
  loading: boolean
  exams: ExamView[]
  logs: LogRow[]
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  upload: (input: UploadSoalInput) => Promise<BankSoal>
  print: (
    bankSoalId: number,
    jumlahCetak: number,
    pinKaprodi: string,
    printerId?: number | null,
  ) => Promise<PrintResult>
  createUser: (input: {
    nama: string
    email: string
    role: UserRole
    nidn: string
  }) => Promise<{
    user: User
    password: string
    pinCetak: string | null
  }>
  decideRevisi: (
    revisiId: number,
    keputusan: "disetujui" | "ditolak",
  ) => Promise<void>
  ajukanRevisi: (
    bankSoalId: number,
    alasan: string,
    file: File,
  ) => Promise<string>
  refresh: () => Promise<void>
}

const DbContext = createContext<DbContextValue | null>(null)

function useDb(): DbContextValue {
  const ctx = useContext(DbContext)
  if (!ctx) throw new Error("useDb harus dipakai di dalam DbProvider")
  return ctx
}

// Provider: memegang state "database" (hasil mapper API), menyediakan operasi
// baca/tulis async, dan memuat ulang data setelah tiap mutasi (commit).
function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(emptyDatabase)
  const [loading, setLoading] = useState(true)
  const currentUser = findUser(db, db.session.userId)

  // Pulihkan sesi dari token tersimpan (jika ada) saat aplikasi dibuka.
  // Splash ditahan minimal MIN_SPLASH_MS hanya saat belum ada sesi (tanpa
  // token), agar animasi loading sempat tampil di halaman login. Saat refresh
  // dengan sesi aktif, delay dilewati agar masuk aplikasi terasa cepat.
  useEffect(() => {
    let active = true
    const mulai = Date.now()
    const MIN_SPLASH_MS = hasToken() ? 0 : 2400
    let selesaiSplash: number | undefined

    loadDatabase()
      .then((loaded) => {
        if (active) setDb(loaded)
      })
      .catch(() => {
        if (active) setDb(emptyDatabase())
      })
      .finally(() => {
        const sisa = Math.max(0, MIN_SPLASH_MS - (Date.now() - mulai))
        selesaiSplash = window.setTimeout(() => {
          if (active) setLoading(false)
        }, sisa)
      })

    return () => {
      active = false
      if (selesaiSplash !== undefined) window.clearTimeout(selesaiSplash)
    }
  }, [])

  const value = useMemo<DbContextValue>(
    () => ({
      db,
      currentUser,
      loading,
      exams: toExamViews(db),
      logs: toLogRows(db),
      login: async (email, password) => {
        const user = await authenticate(email, password)
        setDb(await loadDatabase())
        return user
      },
      logout: async () => {
        await dbLogout()
        setDb(emptyDatabase())
      },
      upload: async (input) => {
        const soal = await createBankSoal(input)
        setDb(await loadDatabase())
        return soal
      },
      print: async (bankSoalId, jumlahCetak, pinKaprodi, printerId) => {
        const result = await recordPrint(
          bankSoalId,
          jumlahCetak,
          pinKaprodi,
          printerId,
        )
        setDb(await loadDatabase())
        return result
      },
      createUser: async (input) => {
        const created = await addUser(input)
        setDb(await loadDatabase())
        return created
      },
      decideRevisi: async (revisiId, keputusan) => {
        await decideRevisi(revisiId, keputusan)
        setDb(await loadDatabase())
      },
      ajukanRevisi: async (bankSoalId, alasan, file) => {
        const message = await requestRevisi(bankSoalId, alasan, file)
        setDb(await loadDatabase())
        return message
      },
      refresh: async () => {
        setDb(await loadDatabase())
      },
    }),
    [db, currentUser, loading],
  )

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>
}

function Sidebar({
  open,
  active,
  role,
  userName,
  onClose,
  onNavigate,
  onLogout,
}: {
  open: boolean
  active: string
  role: UserRole
  userName: string
  onClose: () => void
  onNavigate: (label: string) => void
  onLogout: () => void
}) {
  const profile = roleMeta[normalizeRole(role)]
  return (
    <>
      {open && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-black/5 bg-[#f4f1ea] text-slate-800 transition-transform duration-300 lg:w-24 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center gap-3 border-b border-black/5 px-6 lg:justify-center lg:px-0">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#202126] text-[#f5cf25] shadow-lg shadow-black/10">
            <span
              className="font-display text-[11px] font-extrabold tracking-tight lg:hidden"
              aria-hidden="true"
            >
              <Icon name="lock" size={23} />
            </span>
            <span
              className="font-display hidden text-[13px] font-extrabold tracking-tight lg:block"
              title={APP_TAGLINE}
            >
              {APP_SINGKATAN.slice(0, 3)}
            </span>
          </div>
          <div className="lg:hidden">
            <div className="font-display text-[17px] font-bold tracking-wide">
              {APP_NAMA}
            </div>
            <div
              className="mt-0.5 text-[11px] font-semibold tracking-[0.2em] text-slate-400"
              title={APP_TAGLINE}
            >
              {INSTANSI_KOP}
            </div>
          </div>
          <button
            className="ml-auto rounded-lg p-2 text-slate-500 lg:hidden"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        <div className="px-4 pt-7 lg:px-3">
          <div className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 lg:hidden">
            MENU UTAMA
          </div>
          <nav className="space-y-2">
            {profile.nav.map((item) => (
              <button
                aria-label={item.label}
                title={item.label}
                key={item.label}
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition lg:aspect-square lg:justify-center lg:p-0 ${
                  active === item.label
                    ? "bg-[#202126] text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
                onClick={() => {
                  onNavigate(item.label)
                  onClose()
                }}
              >
                <span
                  className={
                    active === item.label ? "text-[#f5cf25]" : "text-slate-500"
                  }
                >
                  <Icon name={item.icon} size={19} />
                </span>
                <span className="lg:hidden">{item.label}</span>
                <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] z-50 hidden whitespace-nowrap rounded-lg bg-[#202126] px-3 py-2 text-[11px] font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 lg:px-3">
          <div className="rounded-2xl border border-black/5 bg-white p-4 lg:hidden">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Server Aman & Aktif
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Enkripsi aktif · Printer Kaprodi terhubung
            </p>
          </div>
          <button
            className="mt-5 flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-white lg:justify-center lg:p-2"
            onClick={onLogout}
          >
            <div className="grid size-10 place-items-center rounded-full bg-[#202126] text-sm font-bold text-[#f5cf25]">
              {initials(userName)}
            </div>
            <div className="min-w-0 lg:hidden">
              <div className="truncate text-sm font-semibold">{userName}</div>
              <div className="text-[11px] text-slate-400">{profile.label}</div>
            </div>
            <span className="lg:hidden">
              <Icon name="chevron" size={16} />
            </span>
          </button>
          <button
            aria-label="Keluar"
            title="Keluar"
            className="group relative mt-2 flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 lg:justify-center lg:px-0 lg:py-2.5"
            onClick={onLogout}
          >
            <Icon name="logout" size={19} />
            <span className="lg:hidden">Keluar</span>
            <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#202126] px-3 py-2 text-[11px] font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: IconName
  label: string
  value: string
  detail: string
  tone: "green" | "gold" | "blue"
}) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,45,43,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </p>
        </div>
        <div
          className={`grid size-11 place-items-center rounded-xl ${colors[tone]}`}
        >
          <Icon name={icon} size={21} />
        </div>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {detail}
      </p>
    </div>
  )
}

// Kartu "Printer tujuan" Panitia — membaca status printer ASLI dari backend
// (DB + deteksi Windows), bukan teks hardcode. Hijau = online, kuning =
// memeriksa, merah = offline/tidak terdaftar di Windows.
function PrinterTujuanCard() {
  const [info, setInfo] = useState<{
    utama: PrinterStatus | null
    printCommandAktif: boolean
  } | null>(null)
  const [gagal, setGagal] = useState(false)

  useEffect(() => {
    let aktif = true
    fetchPrinterStatus()
      .then((res) => {
        if (aktif) {
          if (res)
            setInfo({
              utama: res.utama,
              printCommandAktif: res.printCommandAktif,
            })
          else setGagal(true)
        }
      })
      .catch(() => {
        if (aktif) setGagal(true)
      })
    return () => {
      aktif = false
    }
  }, [])

  const utama = info?.utama ?? null
  const online = utama?.online ?? false
  const dot =
    !info && !gagal ? "bg-amber-400" : online ? "bg-emerald-400" : "bg-rose-400"
  const statusText =
    !info && !gagal
      ? "Memeriksa..."
      : gagal || !utama
        ? "Tidak terjangkau"
        : online
          ? "Online & siap"
          : utama.ada_di_windows
            ? "Terdaftar, sedang offline"
            : "Tidak terdaftar di server"

  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#f4f1ea] p-4">
      <div className="grid size-11 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
        <Icon name="printer" size={22} />
      </div>
      <div>
        <div className="text-xs text-slate-400">Printer tujuan</div>
        <div className="mt-0.5 text-sm font-bold">
          {utama?.nama_printer ?? "Belum dikonfigurasi"}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-300">
          <span className={`size-1.5 rounded-full ${dot}`} /> {statusText}
        </div>
        {utama && !online && (
          <div className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-amber-700">
            {utama.status_db !== "aktif"
              ? "Printer nonaktif di database. Minta Admin IT mengaktifkan."
              : !utama.ada_di_windows
                ? "Nama tidak cocok dengan printer Windows server. Minta Admin IT menyamakan nama."
                : "Printer offline di Windows. Nyalakan printer / cek kabel & jaringan."}
          </div>
        )}
        {utama && online && !info?.printCommandAktif && (
          <div className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-amber-700">
            Mode spool: PDF tersimpan di server, belum diteruskan otomatis ke
            printer fisik.
          </div>
        )}
      </div>
    </div>
  )
}

function PrintModal({
  exam,
  onClose,
  onPrint,
}: {
  exam: ExamView | null
  onClose: () => void
  onPrint: (
    jumlahCetak: number,
    pin: string,
    printerId?: number | null,
  ) => Promise<PrintResult | void>
}) {
  const [copies, setCopies] = useState(exam?.students ?? 1)
  const [pin, setPin] = useState("")
  const [sent, setSent] = useState(false)
  const [result, setResult] = useState<PrintResult | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  // Daftar printer ala Word — dimuat dari /printer-status (DB + deteksi OS).
  const [printers, setPrinters] = useState<PrinterStatus[]>([])
  const [printerId, setPrinterId] = useState<number | null>(null)

  useEffect(() => {
    let aktif = true
    fetchPrinterStatus()
      .then((res) => {
        if (!aktif || !res) return
        setPrinters(res.semua)
        // Pilih otomatis printer utama (online) atau printer pertama.
        const awal = res.utama ?? res.semua[0] ?? null
        setPrinterId((cur) => cur ?? awal?.id ?? null)
      })
      .catch(() => {})
    return () => {
      aktif = false
    }
  }, [])

  const printerTerpilih = printers.find((p) => p.id === printerId) ?? null

  if (!exam) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#15161a]/70 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-2rem)]">
        {sent ? (
          <div className="overflow-y-auto p-6 text-center sm:p-7">
            <div
              className={`mx-auto grid size-16 place-items-center rounded-full ${
                result?.status === "menunggu"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Icon name="check" size={30} />
            </div>
            <div className="font-display mt-5 text-2xl font-bold text-slate-900">
              {result?.status === "menunggu"
                ? "Dokumen masuk antrian cetak"
                : "Dokumen terkirim ke printer"}
            </div>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {copies} lembar soal {exam.course} untuk printer{" "}
              {result?.printer ?? printerTerpilih?.nama_printer ?? "tujuan"}.
              {result?.status === "menunggu" &&
                " Akan tercetak otomatis begitu printer terhubung."}
            </p>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-500">
              {result?.status === "menunggu"
                ? "Printer belum terhubung saat ini, jadi job tersimpan di antrian server. Admin IT tinggal menghubungkan printer, lalu job tercetak otomatis."
                : "PIN hari ini berlaku untuk semua cetakan sampai pergantian hari."}{" "}
              Aktivitas ini sudah direkam pada log cetak dengan identitas,
              waktu, IP perangkat, dan jumlah salinan.
            </div>
            <button
              className="mt-7 w-full rounded-xl bg-[#202126] py-3.5 text-sm font-bold text-white hover:bg-[#111216]"
              onClick={onClose}
            >
              Kembali ke antrian
            </button>
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
              <div>
                <div className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                  Konfirmasi Cetak Aman
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dokumen tidak akan disimpan di perangkat ini
                </p>
              </div>
              <button
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={onClose}
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="flex gap-3 rounded-2xl bg-[#f4f1ea] p-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#202126] shadow-sm">
                  <Icon name="file" size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {exam.course}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {exam.code} · Kelas {exam.className} · {exam.type}
                  </div>
                </div>
              </div>

              <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Jumlah cetak
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button
                  className="grid size-9 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                >
                  −
                </button>
                <input
                  className="w-full border-0 bg-transparent text-center text-sm font-bold text-slate-800 outline-none"
                  min="1"
                  onChange={(event) => setCopies(Number(event.target.value))}
                  type="number"
                  value={copies}
                />
                <button
                  className="grid size-9 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => setCopies(copies + 1)}
                >
                  +
                </button>
              </div>

              <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Printer tujuan
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="printer" size={17} />
                </span>
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-9 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100"
                  onChange={(event) =>
                    setPrinterId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  value={printerId ?? ""}
                >
                  {printers.length === 0 && (
                    <option value="">Belum ada printer terdaftar</option>
                  )}
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_printer}
                      {p.online
                        ? " · Online"
                        : p.ada_di_windows
                          ? " · Belum terhubung (masuk antrian)"
                          : " · Tidak terdaftar di server"}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ▾
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                {printerTerpilih?.online
                  ? "Printer siap — dokumen dikirim langsung."
                  : "Boleh dipilih meski printer belum terhubung: dokumen tetap masuk antrian dan tercetak otomatis saat printer menyala."}
              </p>

              <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PIN Cetak Kaprodi (6 digit, berlaku hari ini)
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" size={17} />
                </span>
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-center text-base font-bold tracking-[0.45em] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => {
                    // Hanya 6 digit angka — sesuai format PIN Cetak backend.
                    setPin(
                      event.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                    )
                    setError("")
                  }}
                  placeholder="••••••"
                  type="password"
                  value={pin}
                />
              </div>
              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  <Icon name="shield" size={16} />
                  {error}
                </div>
              )}
              <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-800">
                <Icon name="shield" size={16} />
                PIN berlaku hari ini untuk semua cetakan. Watermark identitas
                petugas dan waktu cetak ditambahkan otomatis pada setiap
                halaman.
              </div>
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202126] py-3 text-sm font-bold text-white transition hover:bg-[#111216] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pin.trim().length < 6 || sending}
                onClick={async () => {
                  setSending(true)
                  setError("")
                  try {
                    const res = await onPrint(copies, pin.trim(), printerId)
                    setResult(
                      res && "job_id" in res ? res as PrintResult : null,
                    )
                    setSent(true)
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Percetakan gagal. Coba lagi.",
                    )
                  } finally {
                    setSending(false)
                  }
                }}
              >
                <Icon name="printer" size={18} />
                {sending ? "Mengirim..." : "Kirim ke Printer Kaprodi"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface DemoCredential {
  email: string
  password: string
}

// Sapaan singkat pada heading form (mis. "Hai, Kaprodi").
const roleSapaan: Record<UserRole, string> = {
  dosen: "Dosen",
  kaprodi: "Kaprodi",
  panitia: "Panitia",
  admin: "Admin",
}

// Tiga "karya" pada galeri panel kiri — diganti lewat panah kiri/kanan.
// Tiap slide punya warna aksen + gradasi latar sendiri yang senada nilainya.
const loginSlides: {
  tag: string
  judul: string
  detail: string
  ikon: IconName
  aksen: string
  gradasi: string
}[] = [
  {
    tag: "Nilai 01",
    judul: "Aman & Terenkripsi",
    detail:
      "Naskah soal tersimpan terenkripsi di server pusat dan tidak pernah tersimpan di laptop pribadi.",
    ikon: "shield",
    aksen: "#f5cf25",
    gradasi:
      "radial-gradient(120% 85% at 50% 118%, rgba(245,207,37,0.22) 0%, rgba(245,207,37,0.07) 45%, rgba(32,33,38,0) 74%), radial-gradient(60% 50% at 82% 8%, rgba(245,207,37,0.16), rgba(32,33,38,0) 62%), linear-gradient(180deg, #202126 0%, #26272d 48%, #1a1b1e 100%)",
  },
  {
    tag: "Nilai 02",
    judul: "Jejak Audit Lengkap",
    detail:
      "Setiap unggah, revisi, persetujuan, dan cetak tercatat beserta pelaku dan waktunya.",
    ikon: "history",
    aksen: "#37d6b3",
    gradasi:
      "radial-gradient(120% 85% at 50% 118%, rgba(55,214,179,0.22) 0%, rgba(55,214,179,0.07) 45%, rgba(32,33,38,0) 74%), radial-gradient(60% 50% at 82% 8%, rgba(55,214,179,0.16), rgba(32,33,38,0) 62%), linear-gradient(180deg, #161c1b 0%, #12211f 48%, #101615 100%)",
  },
  {
    tag: "Nilai 03",
    judul: "Cetak Terkontrol",
    detail:
      "Naskah baru tercetak setelah PIN Cetak Kaprodi dikonfirmasi, lengkap dengan watermark keamanan.",
    ikon: "printer",
    aksen: "#6aa8ff",
    gradasi:
      "radial-gradient(120% 85% at 50% 118%, rgba(106,168,255,0.22) 0%, rgba(106,168,255,0.07) 45%, rgba(32,33,38,0) 74%), radial-gradient(60% 50% at 82% 8%, rgba(106,168,255,0.16), rgba(32,33,38,0) 62%), linear-gradient(180deg, #14171f 0%, #141a26 48%, #101319 100%)",
  },
]

// Posisi bintang (persen) pada langit kartu galeri.
const bintangLogin = [
  [8, 12, 1.2],
  [22, 6, 0.9],
  [34, 18, 1.5],
  [48, 8, 1],
  [63, 15, 1.3],
  [76, 5, 0.8],
  [88, 20, 1.1],
  [14, 32, 1],
  [92, 38, 1.4],
  [58, 30, 0.9],
] as const

function LoginPage({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<string | null>
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("panitia")
  const [email, setEmail] = useState("siti.h@feb.ac.id")
  const [password, setPassword] = useState("panitia123")
  const [error, setError] = useState("")
  const [catatan, setCatatan] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [slide, setSlide] = useState(0)
  const [info, setInfo] = useState<null | "alur" | "bantuan">(null)
  // Kredensial demo per peran — di produksi diganti autentikasi server.
  const demoCredentials: Record<UserRole, DemoCredential> = {
    dosen: { email: "rina.kurniawati@feb.ac.id", password: "dosen123" },
    kaprodi: { email: "dian.puspitasari@feb.ac.id", password: "kaprodi123" },
    panitia: { email: "siti.h@feb.ac.id", password: "panitia123" },
    admin: { email: "rizky.it@feb.ac.id", password: "admin123" },
  }
  const geser = (arah: number) =>
    setSlide((n) => (n + arah + loginSlides.length) % loginSlides.length)
  // Ganti slide otomatis setiap 5 detik.
  useEffect(() => {
    const timer = setInterval(() => geser(1), 5000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const karya = loginSlides[slide]
  // Ilustrasi berbeda untuk tiap slide — bukan cuma ganti warna.
  const renderIlustrasi = () => {
    if (karya.ikon === "history")
      return (
        <svg
          aria-hidden="true"
          className="h-full w-full"
          fill="none"
          viewBox="0 0 200 180"
        >
          <circle
            cx="86"
            cy="92"
            r="76"
            stroke={karya.aksen}
            strokeLinecap="round"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <path
            d="M52 20 V164"
            stroke={karya.aksen}
            strokeLinecap="round"
            strokeOpacity="0.8"
            strokeWidth="2"
          />
          {[40, 80, 120, 158].map((y, i) => (
            <g key={y}>
              <circle
                cx="52"
                cy={y}
                r="6"
                fill={karya.aksen}
                stroke={karya.aksen}
                strokeOpacity="0.4"
                strokeWidth="6"
              />
              <circle
                cx="52"
                cy={y}
                r="13"
                strokeOpacity="0.35"
                strokeWidth="1.5"
              />
              <path
                d={`M72 ${y} H${138 - i * 12}`}
                stroke={karya.aksen}
                strokeLinecap="round"
                strokeOpacity={0.65 - i * 0.12}
                strokeWidth="6"
              />
            </g>
          ))}
        </svg>
      )
    if (karya.ikon === "printer")
      return (
        <svg
          aria-hidden="true"
          className="h-full w-full"
          fill="none"
          viewBox="0 0 200 180"
        >
          <circle
            cx="100"
            cy="92"
            r="76"
            stroke={karya.aksen}
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <rect
            fill={karya.aksen}
            fillOpacity="0.12"
            height="98"
            rx="8"
            transform="rotate(-7 95 83)"
            width="74"
            x="58"
            y="34"
          />
          <rect
            fill="#202126"
            fillOpacity="0.55"
            height="100"
            rx="8"
            stroke={karya.aksen}
            strokeOpacity="0.9"
            strokeWidth="2"
            width="76"
            x="64"
            y="44"
          />
          <path
            d="M78 66 H126 M78 82 H126 M78 98 H110"
            stroke={karya.aksen}
            strokeLinecap="round"
            strokeOpacity="0.7"
            strokeWidth="4"
          />
          <circle
            cx="134"
            cy="122"
            fill={karya.aksen}
            fillOpacity="0.9"
            r="22"
          />
          <path
            d="M124 122 l7 8 l13 -16"
            stroke="#202126"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />
        </svg>
      )
    // shield — Aman & Terenkripsi
    return (
      <svg
        aria-hidden="true"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 200 180"
      >
        <circle
          cx="100"
          cy="92"
          r="74"
          stroke={karya.aksen}
          strokeDasharray="4 9"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
        <path
          d="M100 22 L162 44 V96 C162 128 100 160 100 160 C100 160 38 128 38 96 V44 Z"
          stroke={karya.aksen}
          strokeOpacity="0.9"
          strokeWidth="2"
        />
        <path
          d="M100 34 L150 51 V96 C150 121 100 148 100 148 C100 148 50 121 50 96 V51 Z"
          fill={karya.aksen}
          fillOpacity="0.1"
        />
        <rect
          fill={karya.aksen}
          fillOpacity="0.85"
          height="22"
          rx="5"
          width="28"
          x="86"
          y="92"
        />
        <path
          d="M91 92 V86 a9 9 0 0 1 18 0 V92"
          stroke={karya.aksen}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <circle cx="100" cy="103" fill="#202126" r="3" />
        <circle cx="170" cy="58" fill={karya.aksen} r="3" />
        <circle cx="177" cy="84" fill={karya.aksen} fillOpacity="0.7" r="2" />
        <circle
          cx="168"
          cy="108"
          fill={karya.aksen}
          fillOpacity="0.5"
          r="2.5"
        />
      </svg>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e9e9] p-4 sm:p-6 lg:h-screen lg:overflow-hidden">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[34px] bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] lg:h-[calc(100vh-3rem)]">
        <div className="grid flex-1 lg:grid-cols-[0.92fr_1.08fr]">
          {/* ---------------------------------------------------------- */}
          {/* Panel kiri: kartu galeri bertema gelap-emas + carousel     */}
          {/* ---------------------------------------------------------- */}
          <section className="p-3 sm:p-4 lg:p-5">
            <div
              className="relative flex h-[300px] flex-col overflow-hidden rounded-[26px] p-7 text-white transition-[background-image] duration-700 sm:h-[360px] lg:h-full"
              style={{ backgroundImage: karya.gradasi }}
            >
              {/* Ilustrasi utama — beda bentuk tiap slide */}
              <div
                className="animate-login-right pointer-events-none absolute right-4 top-1/2 h-[170px] w-[170px] sm:right-8 sm:h-[210px] sm:w-[210px]"
                key={`ilustrasi-${slide}`}
              >
                {renderIlustrasi()}
              </div>
              {bintangLogin.map(([x, y, skala]) => (
                <div
                  aria-hidden="true"
                  className="absolute size-1 rounded-full bg-white/80"
                  key={`${x}-${y}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `scale(${skala})`,
                  }}
                />
              ))}
              {/* Gelap bertahap di bawah agar teks terbaca */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#111214] via-[#111214]/75 to-transparent"
              />
              <div className="relative flex items-start justify-end gap-4">
                <button
                  className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-[#202126]"
                  onClick={() => setInfo("bantuan")}
                  type="button"
                >
                  Bantuan
                </button>
              </div>
              <div className="relative mt-auto" key={`teks-${slide}`}>
                <div className="animate-login-up">
                  <div
                    className="grid size-14 place-items-center rounded-2xl text-[#202126] transition-colors duration-700"
                    style={{
                      backgroundColor: karya.aksen,
                      boxShadow: `0 12px 30px -8px ${karya.aksen}bf`,
                    }}
                  >
                    <Icon name={karya.ikon} size={26} />
                  </div>
                  <div
                    className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-700"
                    style={{ color: karya.aksen }}
                  >
                    {karya.tag}
                  </div>
                  <div className="font-display mt-2 text-2xl font-bold leading-snug sm:text-[28px]">
                    {karya.judul}
                  </div>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
                    {karya.detail}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex gap-1.5">
                    {loginSlides.map((item, index) => (
                      <div
                        className={`h-1 rounded-full transition-all ${
                          index === slide ? "w-7" : "w-2.5 bg-white/25"
                        }`}
                        key={item.judul}
                        style={
                          index === slide
                            ? { backgroundColor: karya.aksen }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      aria-label="Karya sebelumnya"
                      className="grid size-10 place-items-center rounded-full border border-white/25 transition hover:bg-white/15"
                      onClick={() => geser(-1)}
                      type="button"
                    >
                      <Icon name="chevronKiri" size={18} />
                    </button>
                    <button
                      aria-label="Karya berikutnya"
                      className="grid size-10 place-items-center rounded-full border border-white/25 transition hover:bg-white/15"
                      onClick={() => geser(1)}
                      type="button"
                    >
                      <Icon name="chevron" size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {info && (
                <div className="absolute inset-0 z-10 flex flex-col justify-end rounded-[26px] bg-[#202126]/94 p-7 backdrop-blur-sm">
                  <div className="font-display text-lg font-bold">
                    {info === "alur" ? "Alur kerja sistem" : "Butuh bantuan?"}
                  </div>
                  {info === "alur" ? (
                    <ol className="mt-3 space-y-2 text-xs leading-relaxed text-white/70">
                      {loginSlides.map((item) => (
                        <li className="flex gap-2" key={item.judul}>
                          <span className="text-[#f5cf25]">•</span>
                          <span>
                            <b className="text-white">{item.tag}</b> —{" "}
                            {item.judul}
                          </span>
                        </li>
                      ))}
                      <li className="flex gap-2">
                        <span className="text-[#f5cf25]">•</span>
                        <span>
                          Setiap langkah tercatat di log aktivitas & berita
                          acara.
                        </span>
                      </li>
                    </ol>
                  ) : (
                    <p className="mt-3 text-xs leading-relaxed text-white/70">
                      Lupa kata sandi atau PIN Cetak? Setelah masuk, Admin IT
                      dapat mereset lewat menu{" "}
                      <b className="text-white">Manajemen User</b> — atau
                      hubungi tim infrastruktur FEB.
                    </p>
                  )}
                  <button
                    className="mt-5 self-start rounded-full border border-white/30 px-4 py-1.5 text-xs font-bold transition hover:bg-white hover:text-[#202126]"
                    onClick={() => setInfo(null)}
                    type="button"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </section>
          {/* ---------------------------------------------------------- */}
          {/* Panel kanan: form login ala kartu modern                   */}
          {/* ---------------------------------------------------------- */}
          <section className="flex items-center justify-center px-6 py-6 sm:px-10 lg:py-8">
            <form
              className="w-full max-w-md"
              onSubmit={async (event) => {
                event.preventDefault()
                setSubmitting(true)
                setError("")
                setCatatan("")
                const message = await onLogin(email, password)
                if (message) setError(message)
                setSubmitting(false)
              }}
            >
              <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
                    <Icon name="lock" size={18} />
                  </div>
                  <div className="font-display text-[15px] font-extrabold tracking-tight text-slate-900">
                    {APP_NAMA}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {APP_TAGLINE}
                  </div>
                </div>
              </div>
              <div className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
                Hai, {roleSapaan[selectedRole]}
              </div>
              <p className="mt-1.5 text-[13px] text-slate-500">
                Kelola naskah soal dari upload sampai tercetak.
              </p>
              <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Masuk sebagai
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(roleMeta) as UserRole[]).map((role) => (
                  <button
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedRole === role
                        ? "border-[#202126] bg-[#202126] text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800"
                    }`}
                    key={role}
                    onClick={() => {
                      setSelectedRole(role)
                      setEmail(demoCredentials[role].email)
                      setPassword(demoCredentials[role].password)
                      setError("")
                      setCatatan("")
                    }}
                    type="button"
                  >
                    {roleMeta[role].label}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-600">
                Email
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-[#202126]"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@feb.ac.id"
                required
                type="email"
                value={email}
              />
              <label className="mt-3 block text-xs font-semibold text-slate-600">
                Kata sandi
              </label>
              <div className="relative mt-1.5">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#202126]"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={
                    showPassword ? "Sembunyi kata sandi" : "Lihat kata sandi"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-800"
                  onClick={() => setShowPassword((value) => !value)}
                  type="button"
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
              {catatan && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                  {catatan}
                </div>
              )}
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  <Icon name="shield" size={16} />
                  {error}
                </div>
              )}
              {/* Pemisah "atau" seperti referensi */}
              <div className="my-4 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                <span className="h-px flex-1 bg-slate-200" />
                atau
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={() =>
                  setCatatan(
                    "Masuk SSO Google belum aktif di server ini. Gunakan email institusi FEB sesuai peran Anda.",
                  )
                }
                type="button"
              >
                <svg aria-hidden="true" className="size-4" viewBox="0 0 48 48">
                  <path
                    d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9Z"
                    fill="#FFC107"
                  />
                  <path
                    d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C36.9 39.8 44 34 44 24c0-1.3-.1-2.6-.4-3.9Z"
                    fill="#1976D2"
                  />
                </svg>
                Lanjutkan dengan Google
              </button>
              <button
                className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#202126] py-3 text-sm font-bold text-[#f5cf25] shadow-[0_10px_25px_-10px_rgba(32,33,38,0.9)] transition hover:bg-[#111216] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                <Icon name="lock" size={16} />
                {submitting ? "Memverifikasi..." : "Masuk"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                Belum punya akun?{" "}
                <button
                  className="font-bold text-slate-700 hover:underline"
                  onClick={() => setInfo("bantuan")}
                  type="button"
                >
                  Hubungi Admin IT
                </button>
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function DashboardPage({
  navigate,
  role,
}: {
  navigate: (page: string) => void
  role: UserRole
}) {
  const { db, currentUser } = useDb()
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const BULAN_SINGKAT = [
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
  const today = new Date()
  const todayLabel = `${HARI[today.getDay()]}, ${today.getDate()} ${BULAN_SINGKAT[today.getMonth()]} ${today.getFullYear()}`

  // Kartu statistik diambil langsung dari endpoint /dashboard (per peran).
  const statStyles = [
    { icon: "book", tone: "blue", detail: "Ringkasan sistem" },
    { icon: "check", tone: "green", detail: "Status terkini" },
    { icon: "clock", tone: "gold", detail: "Perlu tindakan" },
    { icon: "printer", tone: "blue", detail: "Aktivitas tercatat" },
  ] as const
  const stats = (db.dashboard?.cards ?? []).map((card, index) => {
    const style = statStyles[index % statStyles.length]
    return {
      label: card.label,
      value: String(card.value),
      detail: style.detail,
      icon: style.icon as IconName,
      tone: style.tone as "green" | "gold" | "blue",
    }
  })

  const namaDepan = (currentUser?.nama ?? "").split(/[,.]/)[0].trim()
  const greeting = `Selamat datang, ${namaDepan || roleLabel(role)}.`

  const statusWidth = (s: string) =>
    s === "siap_cetak" || s === "terkunci" ? "w-full" : "w-1/3"
  const statusSingkat = (s: string) =>
    s === "siap_cetak" ? "Siap" : s === "arsip" ? "Arsip" : "Kunci"

  // Ringkasan + panel progres dibangun dari data nyata milik peran terkait.
  let summary = "Semua layanan berjalan normal."
  let title = "Ringkasan Aktivitas"
  let subtitle = "Berdasarkan data terbaru dari server"
  let percent = "0%"
  let width = "w-0"
  let rows: string[][] = []

  if (role === "dosen") {
    const total = db.bank_soal.length
    const terkunci = db.bank_soal.filter(
      (s) => s.status === "terkunci" || s.status === "siap_cetak",
    ).length
    summary = `${total} soal Anda; ${terkunci} sudah terkunci.`
    title = "Kesiapan Soal Anda"
    subtitle = `${total} soal pada semester aktif`
    percent = total ? `${Math.round((terkunci / total) * 100)}%` : "0%"
    width = total ? (terkunci === total ? "w-full" : "w-3/4") : "w-0"
    rows = db.bank_soal
      .slice(0, 6)
      .map((s) => [
        s.nama_mk,
        s.judul,
        statusSingkat(s.status),
        statusWidth(s.status),
      ])
  } else if (role === "kaprodi") {
    const total = db.rekap.length
    const sudah = db.rekap.filter((r) => r.status !== "belum_upload").length
    summary = `${sudah} dari ${total} mata kuliah sudah upload; ${db.revisi.length} revisi menunggu.`
    title = "Progres Pengumpulan"
    subtitle = `${sudah} dari ${total} mata kuliah sudah mengunggah`
    percent = total ? `${Math.round((sudah / total) * 100)}%` : "0%"
    width = total
      ? sudah === total
        ? "w-full"
        : sudah
          ? "w-3/4"
          : "w-0"
      : "w-0"
    rows = db.rekap
      .slice(0, 6)
      .map((r) => [
        r.nama_mk,
        r.dosen ?? "-",
        r.status !== "belum_upload" ? "Sudah" : "Belum",
        r.status !== "belum_upload" ? "w-full" : "w-1/3",
      ])
  } else if (role === "panitia") {
    const total = db.bank_soal.length
    const ready = db.bank_soal.filter((s) => s.print_ready).length
    summary = `${ready} soal siap dicetak dari ${total} antrian.`
    title = "Kesiapan Cetak Hari Ini"
    subtitle = `${ready} dari ${total} antrian siap dicetak`
    percent = total ? `${Math.round((ready / total) * 100)}%` : "0%"
    width = total
      ? ready === total
        ? "w-full"
        : ready
          ? "w-2/3"
          : "w-0"
      : "w-0"
    rows = db.bank_soal
      .slice(0, 6)
      .map((s) => [
        s.nama_mk,
        s.window,
        s.jenis,
        s.print_ready ? "w-full" : "w-1/3",
      ])
  } else {
    const total = db.users.length
    const aktif = db.users.filter((u) => u.aktif).length
    summary = `${total} pengguna terkelola; ${aktif} aktif.`
    title = "Pengguna Sistem"
    subtitle = `${aktif} aktif dari ${total} pengguna`
    percent = total ? `${Math.round((aktif / total) * 100)}%` : "0%"
    width = total
      ? aktif === total
        ? "w-full"
        : aktif
          ? "w-3/4"
          : "w-0"
      : "w-0"
    rows = db.users
      .slice(0, 6)
      .map((u) => [
        u.nama,
        roleLabel(u.role),
        u.aktif ? "Aktif" : "Nonaktif",
        u.aktif ? "w-full" : "w-1/3",
      ])
  }

  const dashboard = {
    greeting,
    summary,
    target:
      role === "dosen"
        ? "Upload Soal"
        : role === "kaprodi"
          ? "Rekap Soal"
          : role === "panitia"
            ? "Antrian Cetak"
            : "Status Server",
    action:
      role === "dosen"
        ? "Upload soal baru"
        : role === "kaprodi"
          ? "Buka rekap soal"
          : role === "panitia"
            ? "Buka antrian cetak"
            : "Periksa status server",
    actionIcon: (role === "dosen"
      ? "upload"
      : role === "kaprodi"
        ? "book"
        : role === "panitia"
          ? "printer"
          : "settings") as IconName,
    stats,
  }
  const verbAksi: Record<string, string> = {
    login: "melakukan login",
    upload: "mengunggah soal",
    cetak: "mencetak soal",
    revisi: "mengajukan revisi",
    approval_revisi: "memutuskan revisi",
    kunci: "mengunci soal",
    buka_cetak: "membuka akses cetak",
  }
  const overview = {
    title,
    subtitle,
    percent,
    width,
    rows,
    // Aktivitas terbaru dari log_aktivitas nyata (maks 4 baris).
    activities: db.log_aktivitas.slice(0, 4).map((l) => {
      const aksi = verbAksi[l.aksi] ?? l.aksi
      const waktu = l.waktu
        ? `${formatTanggal(l.waktu)} ${formatJam(l.waktu)}`.trim()
        : "-"
      return [
        l.pengguna,
        l.mata_kuliah ? `${aksi} · ${l.mata_kuliah}` : aksi,
        waktu,
      ]
    }),
  }
  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-7 text-slate-900 shadow-[0_18px_50px_rgba(32,33,38,0.05)] sm:p-9">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex rounded-full bg-[#f5cf25] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#202126]">
              {todayLabel}
            </div>
            <div className="font-display mt-3 text-3xl font-bold">
              {dashboard.greeting}
            </div>
            <p className="mt-3 text-sm text-slate-400">{dashboard.summary}</p>
          </div>
          <button
            className="flex items-center justify-center gap-2 rounded-full bg-[#202126] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-black"
            onClick={() => navigate(dashboard.target)}
          >
            <Icon name={dashboard.actionIcon} size={18} /> {dashboard.action}
          </button>
        </div>
      </section>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-bold text-slate-900">
                {overview.title}
              </div>
              <p className="mt-1 text-xs text-slate-400">{overview.subtitle}</p>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {overview.percent}
            </span>
          </div>
          <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full bg-[#202126] ${overview.width}`}
            />
          </div>
          <div className="mt-7 space-y-5">
            {overview.rows.map(([name, detail, value, width]) => (
              <div className="grid grid-cols-[1fr_auto] gap-3" key={name}>
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="text-slate-400">{detail}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-[#202126] ${width}`}
                    />
                  </div>
                </div>
                <span className="w-9 text-right text-xs font-bold text-slate-600">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="font-display text-lg font-bold text-slate-900">
            Aktivitas Terbaru
          </div>
          <div className="mt-5 space-y-5">
            {overview.activities.map(([name, action, time], index) => (
              <div className="flex gap-3" key={name + action}>
                <div
                  className={`mt-1 grid size-8 shrink-0 place-items-center rounded-lg ${
                    index === 1
                      ? "bg-sky-50 text-sky-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Icon name={index === 1 ? "printer" : "document"} size={15} />
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    <strong className="text-slate-800">{name}</strong> {action}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function UploadPage({ showToast }: { showToast: (message: string) => void }) {
  const { db, upload } = useDb()
  const [file, setFile] = useState<File | null>(null)
  const [judul, setJudul] = useState("")
  const [busy, setBusy] = useState(false)
  const [mkId, setMkId] = useState<number | null>(null)
  const [jenis, setJenis] = useState<"UTS" | "UAS">("UTS")
  const [jadwal, setJadwal] = useState("2026-10-13T08:00")
  const [jumlah, setJumlah] = useState(40)
  const effectiveMkId = mkId ?? db.mata_kuliah[0]?.id ?? 0
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.65fr]">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
        <div className="font-display text-xl font-bold text-slate-900">
          Upload Soal Baru
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Pastikan berkas sudah final sebelum dikunci.
        </p>
        <div className="mt-6 grid gap-2 rounded-2xl bg-[#f4f1ea] p-3 sm:grid-cols-3">
          {[
            ["1", "Lengkapi data"],
            ["2", "Unggah PDF"],
            ["3", "Periksa & kunci"],
          ].map(([number, label]) => (
            <div
              className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[11px] font-bold text-slate-600"
              key={number}
            >
              <span className="grid size-6 place-items-center rounded-full bg-[#202126] text-[10px] text-[#f5cf25]">
                {number}
              </span>
              {label}
            </div>
          ))}
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-600">
            Mata kuliah
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              onChange={(event) => setMkId(Number(event.target.value))}
              value={effectiveMkId}
            >
              {db.mata_kuliah.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.nama_mk} · {mk.kode_mk}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Judul soal
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              onChange={(event) => setJudul(event.target.value)}
              placeholder="cth: Soal UTS Ganjil 2026"
              type="text"
              value={judul}
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jenis ujian
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              onChange={(event) =>
                setJenis(event.target.value as "UTS" | "UAS")
              }
              value={jenis}
            >
              <option>UTS</option>
              <option>UAS</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jadwal ujian
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              onChange={(event) => setJadwal(event.target.value)}
              type="datetime-local"
              value={jadwal}
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jumlah mahasiswa
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              min="1"
              onChange={(event) => setJumlah(Number(event.target.value))}
              type="number"
              value={jumlah}
            />
          </label>
        </div>
        <label className="mt-6 block text-xs font-bold text-slate-600">
          Berkas soal PDF
        </label>
        <label className="mt-2 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center transition hover:border-emerald-400">
          <input
            accept=".pdf"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <div className="grid size-12 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <Icon name={file ? "check" : "upload"} size={23} />
          </div>
          <div className="mt-4 text-sm font-bold text-slate-700">
            {file?.name || "Klik untuk pilih berkas PDF"}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Maksimal 10 MB · Hanya format PDF
          </div>
        </label>
        <label className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <input className="mt-0.5" type="checkbox" />
          Saya memastikan soal sudah final dan memahami bahwa revisi setelah
          dikunci memerlukan persetujuan Kaprodi.
        </label>
        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202126] py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
          onClick={async () => {
            if (!file) return showToast("Pilih berkas PDF terlebih dahulu.")
            if (!judul.trim()) return showToast("Judul soal wajib diisi.")
            setBusy(true)
            try {
              const soal = await upload({
                mkId: effectiveMkId,
                jenis,
                judul: judul.trim(),
                jadwalUjian: jadwal,
                jumlahMahasiswa: jumlah,
                file,
              })
              setFile(null)
              setJudul("")
              showToast(`Soal dienkripsi & dikunci (${soal.file_path}).`)
            } catch (error) {
              showToast(
                error instanceof Error
                  ? error.message
                  : "Upload gagal. Coba lagi.",
              )
            } finally {
              setBusy(false)
            }
          }}
        >
          <Icon name="lock" size={18} />{" "}
          {busy ? "Mengenkripsi..." : "Enkripsi & Kunci Soal"}
        </button>
      </section>
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name="shield" />
            </div>
            <div>
              <div className="font-bold text-slate-800">
                Pengamanan otomatis
              </div>
              <p className="text-xs text-slate-400">Saat berkas dikunci</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {[
              "Nama file diacak oleh sistem",
              "PDF dienkripsi di server lokal",
              "Akses langsung ke file diblokir",
              "Aktivitas upload dicatat lengkap",
            ].map((item) => (
              <div
                className="flex items-center gap-3 text-xs text-slate-600"
                key={item}
              >
                <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon name="check" size={12} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="font-display text-lg font-bold text-slate-900">
            Soal Saya
          </div>
          <div className="mt-4 space-y-3">
            {db.bank_soal.map((soal) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5"
                key={soal.id}
              >
                <Icon name="document" size={18} />
                <div>
                  <div className="text-xs font-bold text-slate-700">
                    {soal.nama_mk}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {soal.status === "siap_cetak"
                      ? "Siap dicetak"
                      : soal.status === "arsip"
                        ? "Diarsipkan"
                        : "Terkunci"}{" "}
                    · {formatTanggal(soal.jadwal_ujian)}
                  </div>
                </div>
                <Icon name="lock" size={14} />
              </div>
            ))}
            {db.bank_soal.length === 0 && (
              <p className="text-xs text-slate-400">
                Belum ada soal terkunci. Soal yang baru dikunci akan muncul di
                sini.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Modal detail sebuah naskah soal untuk Kaprodi. Dibangun dari baris rekap
// (yang selalu tersedia untuk peran Kaprodi — db.bank_soal memang tidak
// dimuat untuk peran ini). Bersifat read-only.
function DetailSoalModal({
  row,
  onClose,
}: {
  row: RekapRow
  onClose: () => void
}) {
  const statusMeta: Record<string, { label: string; tone: string }> = {
    belum_upload: { label: "Belum Upload", tone: "bg-amber-50 text-amber-700" },
    terkunci: { label: "Terkunci", tone: "bg-amber-50 text-amber-700" },
    siap_cetak: {
      label: "Siap Dicetak",
      tone: "bg-emerald-50 text-emerald-700",
    },
    arsip: { label: "Diarsipkan", tone: "bg-slate-100 text-slate-500" },
  }
  const meta = statusMeta[row.status] ?? {
    label: row.status,
    tone: "bg-slate-100 text-slate-600",
  }

  // Baris info label + nilai agar tampilan rapi dan konsisten.
  const baris: { label: string; nilai: React.ReactNode }[] = [
    { label: "Kode Mata Kuliah", nilai: row.kode_mk },
    { label: "Mata Kuliah", nilai: row.nama_mk },
    { label: "Kelas", nilai: row.kelas },
    { label: "Dosen Pengampu", nilai: row.dosen ?? "-" },
    { label: "Jenis Ujian", nilai: row.jenis ?? "-" },
    {
      label: "Jadwal Ujian",
      nilai: row.jadwal_ujian ? formatTanggal(row.jadwal_ujian) : "-",
    },
  ]

  return (
    <div
      className="animate-page fixed inset-0 z-50 flex items-center justify-center bg-[#15161a]/70 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header modal */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#202126] text-[#f5cf25] sm:size-11">
              <Icon name="document" size={20} />
            </div>
            <div>
              <div className="font-display text-base font-bold text-slate-900 sm:text-lg">
                {row.nama_mk}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {row.kode_mk} · Kelas {row.kelas}
              </div>
            </div>
          </div>
          <button
            aria-label="Tutup"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>

        {/* Isi detail */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}
          >
            {meta.label}
          </span>

          <dl className="mt-4 divide-y divide-slate-100">
            {baris.map((item) => (
              <div
                className="flex items-start justify-between gap-4 py-2.5"
                key={item.label}
              >
                <dt className="pt-0.5 text-xs font-semibold text-slate-500">
                  {item.label}
                </dt>
                <dd className="text-right text-sm font-semibold text-slate-800">
                  {item.nilai}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-800">
            <Icon name="shield" size={17} />
            Berkas soal tersimpan terenkripsi di server pusat dan tidak disimpan
            di perangkat ini. Setiap tindakan terhadap naskah ini tercatat pada
            audit trail.
          </div>
        </div>

        {/* Footer aksi */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            className="rounded-xl bg-[#202126] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#111216]"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

function RecapPage({ showToast }: { showToast: (message: string) => void }) {
  const { db, currentUser, decideRevisi, refresh } = useDb()
  const [deciding, setDeciding] = useState<number | null>(null)
  const [mengirim, setMengirim] = useState(false)
  const [membuka, setMembuka] = useState<number | null>(null)
  const [pinBaru, setPinBaru] = useState<string | null>(null)
  const [showPin, setShowPin] = useState(false)
  const [resettingPin, setResettingPin] = useState(false)
  const [detail, setDetail] = useState<RekapRow | null>(null)
  const rekap = db.rekap
  const sudahUpload = rekap.filter((r) => r.status !== "belum_upload").length
  const belumUpload = rekap.length - sudahUpload
  const revisiMenunggu = db.revisi.length

  // Ekspor CSV dari data rekap yang sudah dimuat (tanpa endpoint backend).
  const handleEksporRekap = () => {
    const header = ["Dosen", "Mata Kuliah", "Jadwal", "Status"]
    const escape = (value: string) =>
      `"${value.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`
    const lines = [
      header.map(escape).join(","),
      ...rows.map((r) =>
        [r.dosen, r.nama_mk, r.jadwal, r.status].map(escape).join(","),
      ),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rekap-pengumpulan-soal.csv"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast("Rekap berhasil diekspor (CSV).")
  }

  // Baris tabel rekap dipetakan langsung dari tabel rekap server.
  const rows = rekap.map((r) => ({
    dosen: r.dosen ?? "-",
    nama_mk: r.nama_mk,
    jadwal: r.jadwal_ujian ? formatTanggal(r.jadwal_ujian) : "-",
    status: r.status !== "belum_upload" ? "Sudah upload" : "Belum upload",
    done: r.status !== "belum_upload",

    // Aksi Buka Cetak hanya untuk soal yang sudah diunggah & masih terkunci.
    bankSoalId: r.bank_soal_id,
    terkunci: r.status === "terkunci",

    // Simpan baris rekap asli agar modal detail bisa dibangun dari sini
    // (db.bank_soal kosong untuk Kaprodi, jadi jangan bergantung padanya).
    src: r,
  }))
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          detail={`Dari ${rekap.length} mata kuliah`}
          icon="check"
          label="Sudah Upload"
          tone="green"
          value={String(sudahUpload)}
        />
        <StatCard
          detail="Perlu ditindaklanjuti"
          icon="clock"
          label="Belum Upload"
          tone="gold"
          value={String(belumUpload)}
        />
        <StatCard
          detail="Perlu persetujuan Anda"
          icon="history"
          label="Revisi Menunggu"
          tone="blue"
          value={String(revisiMenunggu)}
        />
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
              <Icon name="lock" size={20} />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-slate-900">
                PIN Cetak Saya
              </div>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
                6 digit otorisasi harian untuk Panitia/TU — berlaku penuh hari
                ini untuk semua cetakan, kedaluwarsa otomatis besok. PIN hanya
                ditampilkan sekali setiap reset — catat & teruskan ke Panitia
                melalui jalur aman.
              </p>
              {pinBaru && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3">
                  <span className="font-mono text-2xl font-bold tracking-[0.3em] text-slate-900">
                    {showPin ? pinBaru : "••••••"}
                  </span>
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600"
                    onClick={() => setShowPin((value) => !value)}
                    type="button"
                  >
                    {showPin ? "Sembunyikan" : "Tampilkan"}
                  </button>
                  <button
                    className="rounded-lg bg-[#202126] px-3 py-1.5 text-[11px] font-bold text-white"
                    onClick={() => {
                      void navigator.clipboard?.writeText(pinBaru).then(
                        () => showToast("PIN Cetak disalin."),
                        () => showToast("Gagal menyalin PIN."),
                      )
                    }}
                    type="button"
                  >
                    Salin
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            className="shrink-0 rounded-xl bg-[#202126] px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
            disabled={resettingPin || !currentUser}
            onClick={() => {
              if (!currentUser) return
              if (
                !window.confirm(
                  "Reset PIN Cetak? PIN lama tidak berlaku lagi dan PIN baru hanya tampil sekali.",
                )
              )
                return
              void (async () => {
                setResettingPin(true)
                try {
                  const pin = await resetUserPin(currentUser.id)
                  setPinBaru(pin)
                  setShowPin(true)
                  showToast(`PIN Cetak baru: ${pin} — catat sekarang.`)
                } catch (error) {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : "Gagal mereset PIN Cetak.",
                  )
                } finally {
                  setResettingPin(false)
                }
              })()
            }}
            type="button"
          >
            {resettingPin
              ? "Mereset..."
              : pinBaru
                ? "Reset Ulang PIN"
                : "Reset & Lihat PIN"}
          </button>
        </div>
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-lg font-bold text-slate-900">
              Rekap Pengumpulan Soal
            </div>
            <p className="mt-1 text-xs text-slate-400">
              UTS Semester Ganjil 2026/2027
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
              onClick={handleEksporRekap}
            >
              <Icon name="download" size={16} /> Ekspor Rekap
            </button>
            <button
              className="rounded-xl bg-[#202126] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
              disabled={mengirim}
              onClick={async () => {
                setMengirim(true)
                try {
                  const message = await sendPengingat()
                  showToast(message)
                } catch (error) {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : "Gagal mengirim pengingat.",
                  )
                } finally {
                  setMengirim(false)
                }
              }}
            >
              {mengirim ? "Mengirim..." : "Kirim Pengingat"}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Dosen</th>
                <th className="px-4 py-4">Mata kuliah</th>
                <th className="px-4 py-4">Jadwal</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const done = row.done
                return (
                  <tr className="border-t border-slate-100" key={row.nama_mk}>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {row.dosen}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.nama_mk}</td>
                    <td className="px-4 py-4 text-slate-500">{row.jadwal}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          done
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {row.terkunci && row.bankSoalId != null && (
                          <button
                            className="rounded-lg bg-[#202126] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
                            disabled={membuka === row.bankSoalId}
                            onClick={() => {
                              const soalId = row.bankSoalId
                              if (soalId == null) return
                              void (async () => {
                                setMembuka(soalId)
                                try {
                                  const message = await bukaCetak(soalId)
                                  await refresh()
                                  // Lonceng notifikasi di AppShell ikut disegarkan
                                  // seketika — tanpa menunggu polling 30 detik.
                                  window.dispatchEvent(
                                    new CustomEvent("ebrankas:notif-updated"),
                                  )
                                  showToast(message)
                                } catch (error) {
                                  showToast(
                                    error instanceof Error
                                      ? error.message
                                      : "Gagal membuka cetak.",
                                  )
                                } finally {
                                  setMembuka(null)
                                }
                              })()
                            }}
                          >
                            {membuka === row.bankSoalId
                              ? "Membuka..."
                              : "Buka Cetak"}
                          </button>
                        )}
                        <button
                          className="font-bold text-emerald-700 hover:underline"
                          onClick={() => {
                            if (done && row.src) {
                              setDetail(row.src)
                            } else {
                              showToast(`Pengingat dikirim ke ${row.dosen}.`)
                            }
                          }}
                        >
                          {done ? "Lihat detail" : "Ingatkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td
                    className="px-6 py-10 text-center text-slate-400"
                    colSpan={5}
                  >
                    Belum ada data rekap mata kuliah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6">
        <div className="font-display text-lg font-bold text-slate-900">
          Permintaan Revisi
        </div>
        <div className="mt-4 space-y-4">
          {db.revisi.map((r) => (
            <div
              className="flex flex-col gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:flex-row sm:items-center"
              key={r.id}
            >
              <div className="grid size-10 place-items-center rounded-xl bg-white text-amber-700">
                <Icon name="history" size={19} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">
                  {r.nama_mk ?? r.kode_mk ?? "Mata kuliah"} · {r.dosen ?? "-"}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Alasan: {r.alasan_revisi}
                </p>
                {r.diajukan_pada && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Diajukan {r.diajukan_pada}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50"
                  disabled={deciding === r.id}
                  onClick={async () => {
                    setDeciding(r.id)
                    try {
                      await decideRevisi(r.id, "ditolak")
                      showToast("Permintaan revisi ditolak.")
                    } catch (error) {
                      showToast(
                        error instanceof Error
                          ? error.message
                          : "Gagal menolak revisi.",
                      )
                    } finally {
                      setDeciding(null)
                    }
                  }}
                >
                  Tolak
                </button>
                <button
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  disabled={deciding === r.id}
                  onClick={async () => {
                    setDeciding(r.id)
                    try {
                      await decideRevisi(r.id, "disetujui")
                      showToast("Revisi disetujui dan tercatat di log.")
                    } catch (error) {
                      showToast(
                        error instanceof Error
                          ? error.message
                          : "Gagal menyetujui revisi.",
                      )
                    } finally {
                      setDeciding(null)
                    }
                  }}
                >
                  Setujui
                </button>
              </div>
            </div>
          ))}
          {db.revisi.length === 0 && (
            <p className="text-xs text-slate-400">
              Tidak ada permintaan revisi yang menunggu persetujuan.
            </p>
          )}
        </div>
      </section>
      {detail && (
        <DetailSoalModal onClose={() => setDetail(null)} row={detail} />
      )}
    </>
  )
}

function LogsPage({
  showToast,
  role,
}: {
  showToast: (message: string) => void
  role: UserRole
}) {
  const { logs, currentUser } = useDb()
  const [mengEkspor, setMengEkspor] = useState(false)
  // Dosen hanya melihat log miliknya; panitia hanya aktivitas cetak.
  const filtered =
    role === "dosen"
      ? logs.filter((log) => log.nama === currentUser?.nama)
      : role === "panitia"
        ? logs.filter((log) => log.aksi === "Cetak")
        : logs
  const totalCetak = filtered.filter((log) => log.aksi === "Cetak").length
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Tercatat pada audit trail"
          icon="history"
          label="Total Aktivitas"
          tone="green"
          value={String(filtered.length)}
        />
        <StatCard
          detail="Seluruhnya terverifikasi"
          icon="printer"
          label="Aktivitas Cetak"
          tone="blue"
          value={String(totalCetak)}
        />
        <StatCard
          detail="Tidak ada anomali"
          icon="shield"
          label="Insiden Keamanan"
          tone="green"
          value="0"
        />
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-lg font-bold text-slate-900">
              Jejak Aktivitas Sistem
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Audit trail tidak dapat diubah atau dihapus
            </p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs">
              <option>Semua aktivitas</option>
              <option>Cetak</option>
              <option>Upload</option>
              <option>Revisi</option>
            </select>
            {role === "kaprodi" && (
              <button
                className="flex items-center gap-2 rounded-xl bg-[#202126] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                disabled={mengEkspor}
                onClick={async () => {
                  setMengEkspor(true)
                  try {
                    await exportBeritaAcara()
                    showToast("Berita acara PDF berhasil diunduh.")
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "Gagal membuat berita acara.",
                    )
                  } finally {
                    setMengEkspor(false)
                  }
                }}
              >
                <Icon name="download" size={15} />{" "}
                {mengEkspor ? "Membuat..." : "Buat Berita Acara"}
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-4 py-4">Pengguna</th>
                <th className="px-4 py-4">Aktivitas</th>
                <th className="px-4 py-4">Detail</th>
                <th className="px-6 py-4">IP Perangkat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr
                  className="border-t border-slate-100"
                  key={`${log.waktu}-${log.nama}-${log.aksi}`}
                >
                  <td className="px-6 py-4 text-slate-500">{log.waktu}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {log.nama}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {log.aksi}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{log.detail}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {log.ip}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td
                    className="px-6 py-10 text-center text-slate-400"
                    colSpan={5}
                  >
                    Belum ada aktivitas yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function UsersPage({ showToast }: { showToast: (message: string) => void }) {
  const { db, createUser, refresh } = useDb()
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [nidn, setNidn] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("dosen")
  const [busyId, setBusyId] = useState<number | null>(null)
  const users = db.users

  // Form edit profil (diisi saat user menekan tombol Edit).
  const [editing, setEditing] = useState<User | null>(null)
  const [editNama, setEditNama] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editNidn, setEditNidn] = useState("")
  const [editRole, setEditRole] = useState<UserRole>("dosen")

  const startEdit = (user: User) => {
    setEditing(user)
    setEditNama(user.nama)
    setEditEmail(user.email)
    setEditNidn(user.nidn)
    setEditRole(user.role)
  }

  const cancelEdit = () => setEditing(null)

  const handleSaveEdit = async () => {
    if (!editing) return
    if (!editNama.trim() || !editEmail.trim())
      return showToast("Nama dan email wajib diisi.")
    setBusyId(editing.id)
    try {
      await updateUser(editing.id, {
        nama: editNama.trim(),
        email: editEmail.trim(),
        nidn: editNidn.trim(),
        role: editRole,
      })
      await refresh()
      setEditing(null)
      showToast(`Data ${editNama.trim()} diperbarui.`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal memperbarui pengguna.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleToggle = async (user: User) => {
    setBusyId(user.id)
    try {
      const updated = await toggleUser(user.id)
      await refresh()
      showToast(
        updated.aktif
          ? `${user.nama} diaktifkan.`
          : `${user.nama} dinonaktifkan.`,
      )
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal mengubah status.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleReset = async (user: User) => {
    setBusyId(user.id)
    try {
      const password = await resetUserPassword(user.id)
      await refresh()
      showToast(`Password ${user.nama} direset menjadi: ${password}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal reset password.",
      )
    } finally {
      setBusyId(null)
    }
  }

  // Reset PIN Cetak — hanya untuk akun Kaprodi; PIN baru ditampilkan sekali.
  const handleResetPin = async (user: User) => {
    setBusyId(user.id)
    try {
      const pin = await resetUserPin(user.id)
      showToast(`PIN Cetak ${user.nama} yang baru: ${pin}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal reset PIN Cetak.",
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-xl font-bold text-slate-900">
            Pengguna Sistem
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {users.length} pengguna aktif dengan akses berbasis peran
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-[#202126] px-5 py-3 text-xs font-bold text-white"
          onClick={() => setAdding((value) => !value)}
        >
          <Icon name="users" size={17} /> Tambah Pengguna
        </button>
      </section>
      {adding && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <div className="font-bold text-slate-800">Pengguna Baru</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setNama(event.target.value)}
              placeholder="Nama lengkap"
              value={nama}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email institusi"
              value={email}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setNidn(event.target.value)}
              placeholder="NIDN / NIP"
              value={nidn}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs"
              onChange={(event) => setNewRole(event.target.value as UserRole)}
              value={newRole}
            >
              <option value="dosen">Dosen</option>
              <option value="kaprodi">Kaprodi</option>
              <option value="panitia">Panitia / TU</option>
              <option value="admin">Admin IT</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-4 py-2 text-xs font-bold text-slate-500"
              onClick={() => setAdding(false)}
            >
              Batal
            </button>
            <button
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              disabled={saving}
              onClick={async () => {
                if (!nama.trim() || !email.trim())
                  return showToast("Nama dan email wajib diisi.")
                setSaving(true)
                try {
                  const created = await createUser({
                    nama: nama.trim(),
                    email: email.trim(),
                    nidn,
                    role: newRole,
                  })
                  setNama("")
                  setEmail("")
                  setNidn("")
                  setAdding(false)
                  showToast(
                    created.pinCetak
                      ? `Pengguna ${created.user.nama} ditambahkan. Kata sandi awal: ${created.password} · PIN Cetak: ${created.pinCetak}`
                      : `Pengguna ${created.user.nama} ditambahkan. Kata sandi awal: ${created.password}`,
                  )
                } catch (error) {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : "Gagal menambahkan pengguna.",
                  )
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Pengguna"}
            </button>
          </div>
        </section>
      )}
      {editing && (
        <section className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/40 p-6">
          <div className="font-bold text-slate-800">
            Edit Pengguna — {editing.nama}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setEditNama(event.target.value)}
              placeholder="Nama lengkap"
              value={editNama}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setEditEmail(event.target.value)}
              placeholder="Email institusi"
              value={editEmail}
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              onChange={(event) => setEditNidn(event.target.value)}
              placeholder="NIDN / NIP"
              value={editNidn}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs"
              onChange={(event) => setEditRole(event.target.value as UserRole)}
              value={editRole}
            >
              <option value="dosen">Dosen</option>
              <option value="kaprodi">Kaprodi</option>
              <option value="panitia">Panitia / TU</option>
              <option value="admin">Admin IT</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-4 py-2 text-xs font-bold text-slate-500"
              onClick={cancelEdit}
            >
              Batal
            </button>
            <button
              className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              disabled={busyId === editing.id}
              onClick={() => void handleSaveEdit()}
            >
              {busyId === editing.id ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </section>
      )}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex gap-3 border-b border-slate-100 p-5">
          <div className="relative max-w-sm flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={16} />
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none"
              placeholder="Cari nama atau email..."
            />
          </div>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs">
            <option>Semua role</option>
            <option>Dosen</option>
            <option>Kaprodi</option>
            <option>Panitia / TU</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-t border-slate-100" key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                        {initials(user.nama)}
                      </span>
                      <span className="font-bold text-slate-700">
                        {user.nama}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {user.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="font-bold text-sky-700 disabled:opacity-50"
                        disabled={busyId === user.id}
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="font-bold text-emerald-700 disabled:opacity-50"
                        disabled={busyId === user.id}
                        onClick={() => void handleToggle(user)}
                      >
                        {user.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        className="font-bold text-slate-500 disabled:opacity-50"
                        disabled={busyId === user.id}
                        onClick={() => void handleReset(user)}
                      >
                        Reset Password
                      </button>
                      {user.role === "kaprodi" && (
                        <button
                          className="font-bold text-amber-700 disabled:opacity-50"
                          disabled={busyId === user.id}
                          onClick={() => void handleResetPin(user)}
                        >
                          Reset PIN Cetak
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function MataKuliahPage({
  showToast,
}: {
  showToast: (message: string) => void
}) {
  const { db, refresh } = useDb()
  const list = db.mata_kuliah
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const emptyForm: MataKuliahInput = {
    kode_mk: "",
    nama_mk: "",
    kelas: "",
    semester: 1,
    tahun_ajaran: "2026/2027",
  }
  const [form, setForm] = useState<MataKuliahInput>(emptyForm)

  const setField = (patch: Partial<MataKuliahInput>) =>
    setForm((value) => ({ ...value, ...patch }))

  const startEdit = (mk: MataKuliah) => {
    setAdding(false)
    setEditingId(mk.id)
    setForm({
      kode_mk: mk.kode_mk,
      nama_mk: mk.nama_mk,
      kelas: mk.kelas,
      semester: mk.semester,
      tahun_ajaran: mk.tahun_ajaran,
    })
  }

  const resetForm = () => {
    setForm(emptyForm)
    setAdding(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (
      !form.kode_mk.trim() ||
      !form.nama_mk.trim() ||
      !form.kelas.trim() ||
      !form.tahun_ajaran.trim() ||
      !Number.isFinite(form.semester) ||
      form.semester < 1 ||
      form.semester > 14
    )
      return showToast("Semester harus diisi 1–14.")
    setBusyId(editingId ?? 0)
    try {
      const payload: MataKuliahInput = {
        kode_mk: form.kode_mk.trim(),
        nama_mk: form.nama_mk.trim(),
        kelas: form.kelas.trim(),
        semester: Math.round(form.semester),
        tahun_ajaran: form.tahun_ajaran.trim(),
      }
      if (editingId !== null) {
        await updateMataKuliah(editingId, payload)
        showToast(`Mata kuliah ${payload.nama_mk} diperbarui.`)
      } else {
        await createMataKuliah(payload)
        showToast(`Mata kuliah ${payload.nama_mk} ditambahkan.`)
      }
      await refresh()
      resetForm()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal menyimpan mata kuliah.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (mk: MataKuliah) => {
    setBusyId(mk.id)
    try {
      await deleteMataKuliah(mk.id)
      await refresh()
      showToast(`Mata kuliah ${mk.nama_mk} dihapus.`)
      if (editingId === mk.id) resetForm()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal menghapus mata kuliah.",
      )
    } finally {
      setBusyId(null)
    }
  }

  // JSX menyusul di blok render.
  return (
    <>
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-xl font-bold text-slate-900">
            Master Mata Kuliah
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {list.length} mata kuliah terdaftar sebagai referensi sistem
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-[#202126] px-5 py-3 text-xs font-bold text-white"
          onClick={() => {
            resetForm()
            setAdding((value) => !value)
          }}
        >
          <Icon name="book" size={17} /> Tambah Mata Kuliah
        </button>
      </section>

      {(adding || editingId !== null) && (
        <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <div className="font-bold text-slate-800">
            {editingId !== null ? "Edit Mata Kuliah" : "Mata Kuliah Baru"}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Kode MK
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
                onChange={(event) => setField({ kode_mk: event.target.value })}
                placeholder="cth. EKO-301"
                value={form.kode_mk}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nama Mata Kuliah
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
                onChange={(event) => setField({ nama_mk: event.target.value })}
                placeholder="cth. Ekonomi Mikro"
                value={form.nama_mk}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Kelas
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
                onChange={(event) => setField({ kelas: event.target.value })}
                placeholder="cth. A"
                value={form.kelas}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Semester (1–14)
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
                max={14}
                min={1}
                onChange={(event) =>
                  setField({ semester: Number(event.target.value) })
                }
                placeholder="cth. 3"
                type="number"
                value={form.semester}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tahun Ajaran
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
                onChange={(event) =>
                  setField({ tahun_ajaran: event.target.value })
                }
                placeholder="cth. 2026/2027"
                value={form.tahun_ajaran}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-4 py-2 text-xs font-bold text-slate-500"
              onClick={resetForm}
            >
              Batal
            </button>
            <button
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              disabled={busyId !== null}
              onClick={() => void handleSave()}
            >
              {busyId !== null
                ? "Menyimpan..."
                : editingId !== null
                  ? "Simpan Perubahan"
                  : "Simpan Mata Kuliah"}
            </button>
          </div>
        </section>
      )}
      <section className="mt-4 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_50px_rgba(32,33,38,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Kode</th>
                <th className="px-4 py-4">Mata Kuliah</th>
                <th className="px-4 py-4">Kelas</th>
                <th className="px-4 py-4">Semester</th>
                <th className="px-4 py-4">Tahun Ajaran</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((mk) => (
                <tr className="border-t border-slate-100" key={mk.id}>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {mk.kode_mk}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{mk.nama_mk}</td>
                  <td className="px-4 py-4 text-slate-500">{mk.kelas}</td>
                  <td className="px-4 py-4 text-slate-500">{mk.semester}</td>
                  <td className="px-4 py-4 text-slate-500">
                    {mk.tahun_ajaran}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="font-bold text-sky-700 disabled:opacity-50"
                        disabled={busyId === mk.id}
                        onClick={() => startEdit(mk)}
                      >
                        Edit
                      </button>
                      <button
                        className="font-bold text-rose-600 disabled:opacity-50"
                        disabled={busyId === mk.id}
                        onClick={() => void handleDelete(mk)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className="border-t border-slate-100">
                  <td
                    className="px-6 py-8 text-center text-slate-400"
                    colSpan={6}
                  >
                    Belum ada mata kuliah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function MyQuestionsPage({
  showToast,
}: {
  showToast: (message: string) => void
}) {
  const { db, ajukanRevisi } = useDb()
  const soal = db.bank_soal
  const [revisiFor, setRevisiFor] = useState<BankSoal | null>(null)
  const [alasanRevisi, setAlasanRevisi] = useState("")
  const [fileRevisi, setFileRevisi] = useState<File | null>(null)
  const [kirimRevisi, setKirimRevisi] = useState(false)
  const terkunci = soal.filter(
    (s) => s.status === "terkunci" || s.status === "siap_cetak",
  ).length
  // Daftar soal dosen dipetakan langsung dari bank_soal miliknya.
  const questions = soal.map((s) => ({
    name: s.nama_mk,
    meta: `${s.kode_mk} · Kelas ${s.kelas}`,
    type: s.jenis,
    state:
      s.status === "siap_cetak"
        ? "Siap cetak"
        : s.status === "arsip"
          ? "Diarsipkan"
          : "Terkunci",
    isTerkunci: s.status === "terkunci" || s.status === "siap_cetak",
    date: formatTanggal(s.jadwal_ujian),
    id: s.id,
  }))
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          detail="Soal yang Anda unggah"
          icon="book"
          label="Total Soal"
          tone="blue"
          value={String(soal.length)}
        />
        <StatCard
          detail="File terenkripsi"
          icon="lock"
          label="Terkunci"
          tone="green"
          value={String(terkunci)}
        />
        <StatCard
          detail="Siap dicetak panitia"
          icon="printer"
          label="Siap Cetak"
          tone="gold"
          value={String(soal.filter((s) => s.status === "siap_cetak").length)}
        />
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <div className="font-display text-lg font-bold text-slate-900">
              Daftar Soal Saya
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Hanya Anda yang dapat melihat metadata soal ini
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
            AKSES DOSEN
          </span>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          {questions.map((q) => (
            <div className="rounded-2xl border border-slate-200 p-5" key={q.id}>
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon name="document" size={19} />
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {q.type}
                </span>
              </div>
              <div className="mt-4 text-sm font-bold text-slate-800">
                {q.name}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {q.meta} · {q.date}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    q.isTerkunci ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  <Icon name={q.isTerkunci ? "lock" : "clock"} size={14} />
                  {q.state}
                </span>
                <button
                  className="text-xs font-bold text-emerald-700"
                  onClick={() => {
                    const target = soal.find((s) => s.id === q.id)
                    if (!target) return
                    if (q.isTerkunci) {
                      setRevisiFor(target)
                      setAlasanRevisi("")
                      setFileRevisi(null)
                    } else {
                      showToast("Detail mata kuliah dibuka.")
                    }
                  }}
                >
                  {q.isTerkunci ? "Ajukan revisi" : "Lihat detail"}
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="col-span-full py-6 text-center text-xs text-slate-400">
              Anda belum mengunggah soal apa pun.
            </p>
          )}
        </div>
      </section>
      {revisiFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-lg font-bold text-slate-900">
                  Ajukan Revisi Soal
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {revisiFor.nama_mk} · {revisiFor.kode_mk}
                </p>
              </div>
              <button
                aria-label="Tutup"
                className="text-slate-400 transition hover:text-slate-700"
                onClick={() => setRevisiFor(null)}
                type="button"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              Soal yang sudah dikunci hanya bisa diubah lewat revisi. Unggah
              berkas PDF versi terbaru beserta alasan, lalu tunggu persetujuan
              Kaprodi.
            </p>
            <label className="mt-5 block text-xs font-bold text-slate-600">
              Alasan revisi
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
                onChange={(event) => setAlasanRevisi(event.target.value)}
                placeholder="cth: Perbaikan typo nomor 12 dan 17"
                rows={3}
                value={alasanRevisi}
              />
            </label>
            <label className="mt-4 block text-xs font-bold text-slate-600">
              Berkas PDF revisi
            </label>
            <label className="mt-2 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center transition hover:border-emerald-400">
              <input
                accept=".pdf"
                className="hidden"
                onChange={(event) =>
                  setFileRevisi(event.target.files?.[0] ?? null)
                }
                type="file"
              />
              <div className="grid size-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <Icon name={fileRevisi ? "check" : "upload"} size={20} />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-700">
                {fileRevisi?.name || "Klik untuk pilih berkas PDF"}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Maksimal 10 MB · Hanya format PDF
              </div>
            </label>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 disabled:opacity-50"
                disabled={kirimRevisi}
                onClick={() => setRevisiFor(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white disabled:opacity-50"
                disabled={kirimRevisi}
                onClick={async () => {
                  if (!alasanRevisi.trim())
                    return showToast("Alasan revisi wajib diisi.")
                  if (!fileRevisi)
                    return showToast("Pilih berkas PDF revisi terlebih dahulu.")
                  setKirimRevisi(true)
                  try {
                    const message = await ajukanRevisi(
                      revisiFor.id,
                      alasanRevisi.trim(),
                      fileRevisi,
                    )
                    showToast(message)
                    setRevisiFor(null)
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "Gagal mengajukan revisi.",
                    )
                  } finally {
                    setKirimRevisi(false)
                  }
                }}
                type="button"
              >
                {kirimRevisi ? "Mengirim..." : "Kirim ke Kaprodi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RevisionPage({ showToast }: { showToast: (message: string) => void }) {
  const { db, decideRevisi } = useDb()
  const [deciding, setDeciding] = useState<number | null>(null)
  // Daftar permintaan revisi yang menunggu (dari endpoint /revisi).
  const requests = db.revisi.map((r) => ({
    id: r.id,
    lecturer: r.dosen ?? "-",
    course: r.nama_mk ?? r.kode_mk ?? "Mata kuliah",
    reason: r.alasan_revisi,
    time: r.diajukan_pada ?? "-",
  }))
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white">
      <div className="border-b border-slate-100 p-6">
        <div className="font-display text-xl font-bold text-slate-900">
          Approval Revisi Soal
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Setiap keputusan otomatis direkam dalam audit log.
        </p>
      </div>
      <div className="space-y-4 p-6">
        {requests.map((req) => (
          <div
            className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-5 lg:flex-row lg:items-center"
            key={req.id}
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
              <Icon name="history" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">
                {req.course}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {req.lecturer} · {req.time}
              </div>
              <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-600">
                <strong>Alasan:</strong> {req.reason}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50"
                disabled={deciding === req.id}
                onClick={async () => {
                  setDeciding(req.id)
                  try {
                    await decideRevisi(req.id, "ditolak")
                    showToast(`Revisi ${req.course} ditolak.`)
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "Gagal menolak revisi.",
                    )
                  } finally {
                    setDeciding(null)
                  }
                }}
              >
                Tolak
              </button>
              <button
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                disabled={deciding === req.id}
                onClick={async () => {
                  setDeciding(req.id)
                  try {
                    await decideRevisi(req.id, "disetujui")
                    showToast(`Revisi ${req.course} disetujui.`)
                  } catch (error) {
                    showToast(
                      error instanceof Error
                        ? error.message
                        : "Gagal menyetujui revisi.",
                    )
                  } finally {
                    setDeciding(null)
                  }
                }}
              >
                Setujui Revisi
              </button>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Tidak ada permintaan revisi yang menunggu persetujuan.
          </p>
        )}
      </div>
    </section>
  )
}

function ServerPage({ showToast }: { showToast: (message: string) => void }) {
  const services = [
    ["Application Server", "192.168.1.10", "Aktif", "12 ms"],
    ["Database MySQL", "localhost:3306", "Aktif", "4 ms"],
    ["Encrypted Storage", "/secure/exams", "Aktif", "42% terpakai"],
    ["Printer Gateway", "192.168.1.50", "Aktif", "Siap menerima"],
  ]
  return (
    <>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-900">
        <div className="flex items-start gap-3">
          <Icon name="shield" size={21} />
          <div>
            <strong>Batas akses Admin IT aktif</strong>
            <p className="mt-1 text-xs text-emerald-700">
              Anda dapat memelihara infrastruktur, tetapi tidak dapat membuka
              atau melihat isi file soal.
            </p>
          </div>
        </div>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          detail="Berjalan normal"
          icon="settings"
          label="CPU Server"
          tone="green"
          value="18%"
        />
        <StatCard
          detail="3,1 GB dari 8 GB"
          icon="archive"
          label="Memori"
          tone="blue"
          value="39%"
        />
        <StatCard
          detail="Backup 02:00 hari ini"
          icon="shield"
          label="Backup"
          tone="green"
          value="Sukses"
        />
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <div className="font-display text-lg font-bold text-slate-900">
              Layanan Infrastruktur
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Pemeriksaan terakhir 1 menit lalu
            </p>
          </div>
          <button
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
            onClick={() => showToast("Status seluruh layanan diperbarui.")}
          >
            Periksa Ulang
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {services.map(([name, address, state, detail]) => (
            <div
              className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              key={name}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon name="settings" size={17} />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-700">{name}</div>
                  <div className="text-[10px] text-slate-400">{address}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">{detail}</div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                {state}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

type HelpPanelProps = {
  role: UserRole
  onClose: () => void
}

function HelpPanel({ role, onClose }: HelpPanelProps) {
  const guides: Record<UserRole, {
    title: string
    description: string
    steps: string[]
    limit: string
  }> = {
    dosen: {
      title: "Panduan untuk Dosen",
      description:
        "Siapkan dan kirim soal final dengan tiga langkah sederhana.",
      steps: [
        "Pilih mata kuliah dan lengkapi jadwal ujian.",
        "Unggah satu file PDF final, maksimal 10 MB.",
        "Periksa kembali lalu pilih Enkripsi & Kunci Soal.",
      ],
      limit:
        "Anda hanya dapat melihat soal milik sendiri. Revisi setelah dikunci harus disetujui Kaprodi.",
    },
    kaprodi: {
      title: "Panduan untuk Kaprodi",
      description: "Pantau kelengkapan soal dan tangani pengecualian.",
      steps: [
        "Periksa dosen yang belum mengunggah pada Rekap Soal.",
        "Kirim pengingat sebelum batas waktu pengumpulan.",
        "Tinjau alasan sebelum menyetujui permintaan revisi.",
      ],
      limit:
        "Setiap persetujuan, penolakan, dan penerbitan berita acara dicatat otomatis.",
    },
    panitia: {
      title: "Panduan untuk Panitia / TU",
      description: "Cetak soal tanpa menyimpan file di perangkat.",
      steps: [
        "Pilih soal berstatus Siap dicetak sesuai jadwal.",
        "Pastikan jumlah salinan sama dengan jumlah peserta.",
        "Masukkan PIN Cetak 6 digit dari Kaprodi lalu kirim ke printer tujuan.",
      ],
      limit:
        "File tidak dapat diunduh. Nama petugas dan waktu cetak menjadi watermark otomatis.",
    },
    admin: {
      title: "Panduan untuk Admin IT",
      description: "Jaga layanan tetap aktif tanpa mengakses isi soal.",
      steps: [
        "Pantau server, database, penyimpanan, dan printer gateway.",
        "Kelola akun serta role berdasarkan permintaan resmi.",
        "Periksa log sistem jika muncul peringatan layanan.",
      ],
      limit:
        "Admin IT hanya melihat metadata teknis dan tidak memiliki izin membuka dokumen soal.",
    },
  }
  const guide = guides[role]
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-7 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#f5cf25] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#202126]">
              Panduan singkat
            </span>
            <div className="font-display mt-4 text-2xl font-bold text-slate-900">
              {guide.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {guide.description}
            </p>
          </div>
          <button
            aria-label="Tutup panduan"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            onClick={onClose}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="mt-7 space-y-3">
          {guide.steps.map((step, index) => (
            <div
              className="flex items-start gap-4 rounded-2xl bg-[#f4f1ea] p-4"
              key={step}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#202126] text-xs font-bold text-[#f5cf25]">
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-slate-700">
                {step}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <Icon name="shield" size={18} />
          {guide.limit}
        </div>
        <button
          className="mt-6 w-full rounded-full bg-[#202126] py-3.5 text-sm font-bold text-white"
          onClick={onClose}
        >
          Saya mengerti
        </button>
      </div>
    </div>
  )
}

// Layar tunggu: tiga bentuk geometris yang memantul secara acak — adaptasi
// dari "Geometric shapes loading animation" karya Samuel Medvedowsky
// (dribbble.com/shots/4037784). Logika randomisasi porting dari demo aslinya.
const GEO_TYPES = [
  "circle",
  "semi-circle",
  "square",
  "triangle",
  "triangle-2",
  "rectangle",
] as const

const GEO_COLORS = [
  "#836ee5",
  "#fe94b4",
  "#49d2f5",
  "#ff5354",
  "#00b1b4",
  "#ffe465",
  "#0071ff",
  "#03274b",
] as const

function GeometricLoading({ fading = false }: { fading?: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)

  // Acak ulang tiap bentuk tiap 740ms: ganti jenis, warna, ukuran, posisi
  // horizontal, lalu pantulkan naik (400ms) dan jatuh kembali (300ms).
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const shapes = Array.from(stage.querySelectorAll<HTMLElement>(".shape"))

    const timeouts: number[] = []

    const randomize = (shape: HTMLElement) => {
      const type = GEO_TYPES[~~(Math.random() * GEO_TYPES.length)]
      // Pertahankan class dasar "shape"; class animasi dibuang agar siklus
      // bounce dimulai ulang persis seperti demo aslinya.
      shape.className = `shape ${type}`

      const offset = Math.random() * 4 - 2
      shape.style.setProperty(
        "left",
        `calc(50% ${offset >= 0 ? "+" : "-"} ${Math.abs(offset)}vw)`,
      )
      shape.style.setProperty("--bounce-variance", `${Math.random() * 20 - 10}vh`)
      shape.style.setProperty("--base_scale", `${Math.random() * 6 + 4}vh`)
      shape.style.setProperty("--rotation", `${Math.random() * 180 - 90}deg`)
      shape.style.setProperty("--color", GEO_COLORS[~~(Math.random() * GEO_COLORS.length)])

      shape.classList.add("bounce-up")
      timeouts.push(
        window.setTimeout(() => {
          shape.classList.replace("bounce-up", "bounce-down")
        }, 400),
      )
    }

    shapes.forEach(randomize)
    const timer = window.setInterval(() => shapes.forEach(randomize), 740)

    return () => {
      window.clearInterval(timer)
      timeouts.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return (
    <div
      ref={stageRef}
      className={fading ? "geo-loading geo-loading-out" : "geo-loading"}
      role="status"
      aria-label="Memuat sesi"
    >
      <span className="shape" aria-hidden="true" />
      <span className="shape" aria-hidden="true" />
      <span className="shape" aria-hidden="true" />
    </div>
  )
}

function AppShell() {
  const { db, currentUser, exams, loading, login, logout, print } = useDb()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [active, setActive] = useState("Dashboard")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("Semua status")
  const [selectedExam, setSelectedExam] = useState<ExamView | null>(null)
  const [toast, setToast] = useState("")
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notifikasi[]>([])
  const [unread, setUnread] = useState(0)
  const loggedIn = currentUser != null
  const role = currentUser?.role ?? "panitia"
  const safeRole = normalizeRole(role)

  // Muat notifikasi milik pengguna login; polling ringan tiap 30 detik agar
  // lonceng ikut diperbarui tanpa reload.
  useEffect(() => {
    if (!loggedIn) {
      setNotifs([])
      setUnread(0)
      return
    }
    let active = true
    const load = () => {
      fetchNotifikasi()
        .then((result) => {
          if (!active) return
          setNotifs(result.items)
          setUnread(result.unreadCount)
        })
        .catch(() => {
          /* diabaikan: badge tetap 0 bila gagal */
        })
    }
    load()
    const timer = window.setInterval(load, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [loggedIn])

  const refreshNotifs = () => {
    fetchNotifikasi()
      .then((result) => {
        setNotifs(result.items)
        setUnread(result.unreadCount)
      })
      .catch(() => {})
  }

  // Aksi halaman dalam aplikasi (mis. Buka Cetak di Rekap) memaksa lonceng
  // disegarkan seketika tanpa menunggu polling 30 detik.
  useEffect(() => {
    if (!loggedIn) return
    const onUpdate = () => refreshNotifs()
    window.addEventListener("ebrankas:notif-updated", onUpdate)
    return () => window.removeEventListener("ebrankas:notif-updated", onUpdate)
  }, [loggedIn])

  const openNotif = async () => {
    const willOpen = !notifOpen
    setNotifOpen(willOpen)
    if (willOpen) refreshNotifs()
  }

  const markOne = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)),
    )
    setUnread((prev) => Math.max(0, prev - 1))
    markNotifikasiRead(id).catch(() => refreshNotifs())
  }

  // Tentukan halaman tujuan saat notifikasi diklik. Backend mengirim `tautan`
  // berupa label halaman (mis. "Rekap Soal", "Antrian Cetak", "Soal Saya").
  // Navigasi hanya dilakukan bila halaman itu benar-benar ada di menu peran
  // pengguna; jika tidak persis cocok, pakai pemetaan cadangan (mis. Kaprodi
  // tidak punya menu "Log Cetak" -> diarahkan ke "Log & Berita Acara").
  const notifTarget = (tautan: string | null): string | null => {
    if (!tautan) return null
    const allowed = new Set(roleMeta[safeRole].nav.map((m) => m.label))
    if (allowed.has(tautan)) return tautan
    const fallback: Record<string, string> = {
      "Log Cetak": "Log & Berita Acara",
      "Antrian Cetak": "Log & Berita Acara",
      "Rekap Soal": "Log & Berita Acara",
      "Approval Revisi": "Log & Berita Acara",
    }
    const alt = fallback[tautan]
    return alt && allowed.has(alt) ? alt : null
  }

  // Klik notifikasi: tandai dibaca, lalu arahkan ke halaman detail terkait.
  const handleNotifClick = (n: Notifikasi) => {
    if (!n.dibaca) markOne(n.id)
    const target = notifTarget(n.tautan)
    setNotifOpen(false)
    if (target) setActive(target)
  }

  const markAll = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })))
    setUnread(0)
    markAllNotifikasiRead().catch(() => refreshNotifs())
  }

  const filteredExams = useMemo(
    () =>
      exams.filter(
        (exam) =>
          (status === "Semua status" || exam.status === status) &&
          `${exam.course} ${exam.code} ${exam.lecturer}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [search, status, exams],
  )

  const pageInfo: Record<string, [string, string]> = {
    Dashboard: ["Dashboard", "Ringkasan pengelolaan soal ujian FEB"],
    "Upload Soal": ["Upload Soal", "Unggah dan kunci soal ujian final"],
    "Soal Saya": ["Soal Saya", "Kelola dokumen ujian yang Anda unggah"],
    "Rekap Soal": ["Rekap Soal", "Pantau pengumpulan dan persetujuan revisi"],
    "Approval Revisi": [
      "Approval Revisi",
      "Tinjau permintaan pembukaan kunci dari dosen",
    ],
    "Antrian Cetak": [
      "Antrian Cetak Soal",
      "Kelola dokumen ujian yang siap dicetak dengan aman",
    ],
    "Log & Berita Acara": [
      "Log & Berita Acara",
      "Audit aktivitas dan dokumen pertanggungjawaban",
    ],
    "Manajemen User": ["Manajemen User", "Kelola akun dan hak akses pengguna"],
    "Master Mata Kuliah": [
      "Master Mata Kuliah",
      "Kelola referensi mata kuliah (tambah, ubah, hapus)",
    ],
    "Status Server": [
      "Status Server",
      "Pantau layanan tanpa mengakses isi soal",
    ],
    "Log Aktivitas": ["Log Aktivitas Saya", "Riwayat aktivitas akun dosen"],
    "Log Cetak": ["Log Cetak", "Riwayat pencetakan soal oleh Panitia/TU"],
    "Log Sistem": ["Log Sistem", "Audit keamanan dan kesehatan layanan"],
  }
  const currentPage = pageInfo[active] ?? pageInfo.Dashboard

  // Transisi halus splash -> halaman (crossfade, bukan potongan mendadak):
  // saat sesi selesai dipulihkan, konten halaman dirender lebih dulu di balik
  // splash (overlay fixed yang menutupi penuh layar), lalu splash di-fade-kan
  // dan dilepas dari DOM setelah transisinya selesai. Unmount ditahan 620ms —
  // sedikit lebih panjang dari transisi CSS .geo-loading-out (560ms) agar
  // tidak terpotong.
  const [splashFading, setSplashFading] = useState(false)
  const [splashSelesai, setSplashSelesai] = useState(false)
  useEffect(() => {
    if (loading || splashSelesai) return
    setSplashFading(true)
    const t = window.setTimeout(() => setSplashSelesai(true), 620)
    return () => window.clearTimeout(t)
  }, [loading, splashSelesai])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  // Selagi sesi dipulihkan dari token (cek /me + muat data peran), tampilkan
  // layar tunggu animasi bentuk geometris alih-alih halaman login berkedip.
  // Setelah sesi siap, splash tidak langsung dibuang: ia tetap dirender sebagai
  // overlay lalu di-fade-kan sehingga halaman di bawahnya muncul halus.
  const splash = splashSelesai ? null : <GeometricLoading fading={splashFading} />

  if (loading) return splash

  if (!loggedIn)
    return (
      <>
        <LoginPage
          onLogin={async (email, password) => {
            try {
              await login(email, password)
              setActive("Dashboard")
              return null
            } catch (error) {
              return error instanceof Error
                ? error.message
                : "Email atau kata sandi tidak sesuai data pengguna."
            }
          }}
        />
        {splash}
      </>
    )

  return (
    <div className="min-h-screen bg-[#e8e9e9] text-slate-800">
      <Sidebar
        active={active}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          void logout()
        }}
        onNavigate={setActive}
        open={sidebarOpen}
        role={safeRole}
        userName={currentUser?.nama ?? "Pengguna"}
      />

      <main className="min-h-screen bg-[#f4f1ea] lg:ml-24">
        <header className="sticky top-0 z-20 flex h-24 items-center border-b border-black/5 bg-[#f4f1ea]/90 px-5 backdrop-blur-md sm:px-8">
          <button
            className="mr-3 rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div>
            <div className="font-display text-lg font-bold text-slate-900 sm:text-xl">
              {currentPage[0]}
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              {currentPage[1]}
            </p>
          </div>
          <div className="ml-3 hidden items-center gap-2 lg:flex">
            <div className="grid size-9 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
              <Icon name="lock" size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[13px] font-extrabold tracking-tight text-slate-900">
                {APP_NAMA}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {INSTANSI_KOP}
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 sm:flex"
              onClick={() => setHelpOpen(true)}
            >
              <Icon name="book" size={15} />
              Panduan
            </button>
            <div className="hidden rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm md:block">
              {roleMeta[safeRole].label}
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-[#202126] px-4 py-2.5 text-xs font-semibold text-white sm:flex">
              <Icon name="shield" size={15} />
              Koneksi terenkripsi
            </div>
            <div className="relative">
              <button
                aria-label="Buka notifikasi"
                aria-expanded={notifOpen}
                className="relative grid size-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                onClick={() => void openNotif()}
              >
                <Icon name="bell" size={19} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full border-2 border-white bg-amber-500 px-1 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-xs font-bold text-slate-700">
                      Notifikasi
                    </span>
                    {unread > 0 && (
                      <button
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                        onClick={markAll}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        Belum ada notifikasi.
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <button
                          key={n.id}
                          className={`block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${
                            n.dibaca ? "" : "bg-amber-50/40"
                          }`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="flex items-start gap-2">
                            {!n.dibaca && (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" />
                            )}
                            <div className={n.dibaca ? "pl-4" : ""}>
                              <div className="text-xs font-bold text-slate-700">
                                {n.judul}
                              </div>
                              <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                                {n.pesan}
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                {n.waktu && (
                                  <span className="text-[10px] text-slate-400">
                                    {n.waktu}
                                  </span>
                                )}
                                {notifTarget(n.tautan) && (
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    Buka →
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div
          className="animate-page mx-auto max-w-[1500px] p-5 sm:p-8 lg:pt-5"
          key={active}
        >
          {active === "Dashboard" && (
            <DashboardPage navigate={setActive} role={safeRole} />
          )}
          {active === "Upload Soal" && <UploadPage showToast={showToast} />}
          {active === "Soal Saya" && <MyQuestionsPage showToast={showToast} />}
          {active === "Rekap Soal" && <RecapPage showToast={showToast} />}
          {active === "Approval Revisi" && (
            <RevisionPage showToast={showToast} />
          )}
          {active === "Log & Berita Acara" && (
            <LogsPage role={safeRole} showToast={showToast} />
          )}
          {["Log Aktivitas", "Log Cetak", "Log Sistem"].includes(active) && (
            <LogsPage role={safeRole} showToast={showToast} />
          )}
          {active === "Status Server" && <ServerPage showToast={showToast} />}
          {active === "Manajemen User" && <UsersPage showToast={showToast} />}
          {active === "Master Mata Kuliah" && (
            <MataKuliahPage showToast={showToast} />
          )}

          {active === "Antrian Cetak" && (
            <>
              <section className="mb-7 overflow-hidden rounded-[2rem] border border-black/5 bg-white px-6 py-7 text-slate-900 shadow-[0_18px_50px_rgba(32,33,38,0.05)] sm:px-8">
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5cf25] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#202126]">
                      <Icon name="lock" size={14} />
                      MODE CETAK AMAN
                    </div>
                    <div className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                      Selamat bertugas,{" "}
                      {(currentUser?.nama ?? "").split(/[,.]/)[0].trim() ||
                        "Panitia"}
                      .
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                      Ada{" "}
                      <strong className="font-semibold text-slate-900">
                        {filteredExams.filter((e) => e.print_ready).length} soal
                        ujian
                      </strong>{" "}
                      yang sudah dapat dicetak hari ini. Pastikan jumlah cetak
                      sesuai dengan peserta terdaftar.
                    </p>
                  </div>
                  <PrinterTujuanCard />
                </div>
              </section>
              <section className="mb-6 grid gap-3 md:grid-cols-3">
                {[
                  ["1", "Pilih soal", "Hanya yang berstatus siap dicetak"],
                  ["2", "Cek jumlah", "Samakan dengan jumlah peserta"],
                  ["3", "Masukkan PIN Cetak", "6 digit harian dari Kaprodi"],
                ].map(([number, title, detail]) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl bg-white p-4"
                    key={number}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#202126] text-xs font-bold text-[#f5cf25]">
                      {number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {title}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {detail}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  detail={`${exams.filter((e) => e.print_ready).length} siap dicetak sekarang`}
                  icon="file"
                  label="Total Antrian"
                  tone="green"
                  value={String(exams.length)}
                />
                <StatCard
                  detail={`${db.log_cetak.length} sesi percetakan`}
                  icon="printer"
                  label="Total Percetakan"
                  tone="blue"
                  value={String(
                    db.log_cetak.reduce((sum, l) => sum + l.jumlah_cetak, 0),
                  )}
                />
                <StatCard
                  detail="Menunggu waktu akses"
                  icon="clock"
                  label="Terjadwal"
                  tone="gold"
                  value={String(exams.filter((e) => !e.print_ready).length)}
                />
                <StatCard
                  detail="Semua aktivitas tercatat"
                  icon="shield"
                  label="Status Keamanan"
                  tone="green"
                  value="Aman"
                />
              </section>

              <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,45,43,0.035)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <div className="font-display text-lg font-bold text-slate-900">
                      Daftar Soal Ujian
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Soal hanya dapat dicetak sesuai jadwal akses yang
                      ditentukan
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon name="search" size={17} />
                      </span>
                      <input
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none transition focus:border-slate-900 focus:bg-white sm:w-64"
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari mata kuliah..."
                        value={search}
                      />
                    </div>
                    <select
                      className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none focus:border-slate-900"
                      onChange={(event) => setStatus(event.target.value)}
                      value={status}
                    >
                      <option>Semua status</option>
                      <option>Siap dicetak</option>
                      <option>Terjadwal</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3.5">Mata kuliah</th>
                        <th className="px-4 py-3.5">Jenis</th>
                        <th className="px-4 py-3.5">Jadwal ujian</th>
                        <th className="px-4 py-3.5">Peserta</th>
                        <th className="px-4 py-3.5">Status akses</th>
                        <th className="px-6 py-3.5 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map((exam) => {
                        const ready = exam.status === "Siap dicetak"
                        return (
                          <tr
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                            key={exam.id}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                                  <Icon name="document" size={19} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-800">
                                    {exam.course}
                                  </div>
                                  <div className="mt-1 text-[11px] text-slate-400">
                                    {exam.code} · {exam.lecturer}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                {exam.type}
                              </span>
                              <span className="ml-1.5 text-xs text-slate-500">
                                Kelas {exam.className}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <Icon name="calendar" size={15} />
                                {exam.date}
                              </div>
                              <div className="mt-1.5 flex items-center gap-2 pl-0.5 text-[11px] text-slate-400">
                                <Icon name="clock" size={14} />
                                {exam.time} WIB
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-bold text-slate-700">
                                {exam.students}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                mahasiswa
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  ready
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    ready ? "bg-emerald-500" : "bg-amber-500"
                                  }`}
                                />
                                {exam.status}
                              </div>
                              <div className="mt-1.5 text-[10px] text-slate-400">
                                {exam.window}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                  ready
                                    ? "bg-[#202126] text-white shadow-sm hover:bg-[#111216]"
                                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                                }`}
                                disabled={!ready}
                                onClick={() => setSelectedExam(exam)}
                              >
                                <Icon
                                  name={ready ? "printer" : "lock"}
                                  size={15}
                                />
                                {ready ? "Cetak Soal" : "Terkunci"}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredExams.length === 0 && (
                    <div className="p-12 text-center text-sm text-slate-400">
                      Tidak ada soal yang sesuai pencarian.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400">
                  <span>
                    Menampilkan {filteredExams.length} dari {exams.length}{" "}
                    antrian
                  </span>
                  <span>Data langsung dari server</span>
                </div>
              </section>
            </>
          )}

          <footer className="flex flex-col gap-2 px-1 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {BARIS_HAK_CIPTA}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="lock" size={13} /> Dilindungi enkripsi end-to-end
            </span>
          </footer>
        </div>
      </main>

      <PrintModal
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
        onPrint={async (jumlahCetak, pin, printerId) => {
          if (selectedExam) {
            return print(selectedExam.id, jumlahCetak, pin, printerId)
          }
        }}
      />
      {helpOpen && (
        <HelpPanel role={safeRole} onClose={() => setHelpOpen(false)} />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl">
          <span className="grid size-6 place-items-center rounded-full bg-emerald-500">
            <Icon name="check" size={14} />
          </span>
          {toast}
        </div>
      )}

      {/* Overlay splash terakhir: tetap di atas halaman yang sudah dirender,
          lalu di-fade-kan agar transisi loading -> halaman terasa mulus. */}
      {splash}
    </div>
  )
}

export default function App() {
  // Judul tab browser mengikuti satu sumber branding (src/brand.ts).
  useEffect(() => {
    document.title = JUDUL_DOKUMEN
  }, [])

  return (
    <DbProvider>
      <AppShell />
    </DbProvider>
  )
}
