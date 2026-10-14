import { useMemo, useState, type ReactNode } from "react"

type IconName = "archive" | "bell" | "book" | "calendar" | "check" | "chevron" | "clock" | "dashboard" | "document" | "download" | "file" | "history" | "lock" | "menu" | "printer" | "search" | "settings" | "shield" | "upload" | "users" | "x"

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

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
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

const roleConfig: Record<UserRole, {
  label: string
  name: string
  initials: string
  nav: { label: string icon: IconName badge?: string }[]
}> = {
  dosen: {
    label: "Dosen",
    name: "Dr. Rina Kurniawati",
    initials: "RK",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Upload Soal", icon: "upload" },
      { label: "Soal Saya", icon: "book", badge: "4" },
      { label: "Log Aktivitas", icon: "history" },
    ],
  },
  kaprodi: {
    label: "Kaprodi",
    name: "Dr. Dian Puspitasari",
    initials: "DP",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Rekap Soal", icon: "book" },
      { label: "Approval Revisi", icon: "history", badge: "3" },
      { label: "Log & Berita Acara", icon: "document" },
    ],
  },
  panitia: {
    label: "Panitia Ujian / TU",
    name: "Siti Handayani",
    initials: "SH",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Antrian Cetak", icon: "printer", badge: "6" },
      { label: "Log Cetak", icon: "history" },
    ],
  },
  admin: {
    label: "Admin IT",
    name: "Rizky Ananda",
    initials: "RA",
    nav: [
      { label: "Dashboard", icon: "dashboard" },
      { label: "Status Server", icon: "settings" },
      { label: "Manajemen User", icon: "users" },
      { label: "Log Sistem", icon: "history" },
    ],
  },
}

function normalizeRole(value: unknown): UserRole {
  return typeof value === "string" && value in roleConfig
    ? value as UserRole
    : "panitia"
}

const exams = [
  {
    id: 1,
    code: "EKO-301",
    course: "Ekonomi Pertanian",
    lecturer: "Dr. Rina Kurniawati, S.P., M.Si.",
    className: "A",
    type: "UTS",
    date: "13 Okt 2026",
    time: "08:00",
    students: 40,
    status: "Siap dicetak",
    window: "Buka hari ini, 07:00",
  },
  {
    id: 2,
    code: "AKT-212",
    course: "Akuntansi Biaya",
    lecturer: "Budi Santoso, S.E., M.Ak.",
    className: "B",
    type: "UTS",
    date: "13 Okt 2026",
    time: "10:30",
    students: 36,
    status: "Siap dicetak",
    window: "Buka hari ini, 07:00",
  },
  {
    id: 3,
    code: "MJN-104",
    course: "Pengantar Manajemen",
    lecturer: "Nadia Permata, S.E., M.M.",
    className: "C",
    type: "UTS",
    date: "14 Okt 2026",
    time: "08:00",
    students: 42,
    status: "Terjadwal",
    window: "Buka besok, 07:00",
  },
  {
    id: 4,
    code: "EKO-205",
    course: "Ekonomi Mikro II",
    lecturer: "Dr. Ahmad Fauzi, M.E.",
    className: "A",
    type: "UTS",
    date: "14 Okt 2026",
    time: "13:00",
    students: 38,
    status: "Terjadwal",
    window: "Buka besok, 07:00",
  },
]

function Sidebar({
  open,
  active,
  role,
  onClose,
  onNavigate,
  onLogout,
}: {
  open: boolean
  active: string
  role: UserRole
  onClose: () => void
  onNavigate: (label: string) => void
  onLogout: () => void
}) {
  const profile = roleConfig[normalizeRole(role)]
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
            <Icon name="lock" size={23} />
          </div>
          <div className="lg:hidden">
            <div className="font-display text-[17px] font-bold tracking-wide">
              E-BRANKAS SOAL
            </div>
            <div className="mt-0.5 text-[11px] font-semibold tracking-[0.2em] text-slate-400">
              FEB UNIVERSITAS
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
                {item.badge && (
                  <span className="ml-auto rounded-full bg-[#f5cf25] px-2 py-0.5 text-[10px] font-bold text-[#202126] lg:absolute lg:-right-1 lg:-top-1 lg:px-1.5">
                    {item.badge}
                  </span>
                )}
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
              {profile.initials}
            </div>
            <div className="min-w-0 lg:hidden">
              <div className="truncate text-sm font-semibold">
                {profile.name}
              </div>
              <div className="text-[11px] text-slate-400">{profile.label}</div>
            </div>
            <span className="lg:hidden">
              <Icon name="chevron" size={16} />
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

function PrintModal({
  exam,
  onClose,
}: {
  exam: typeof exams[number] | null
  onClose: () => void
}) {
  const [copies, setCopies] = useState(exam?.students ?? 1)
  const [pin, setPin] = useState("")
  const [sent, setSent] = useState(false)

  if (!exam) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#15161a]/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {sent ? (
          <div className="p-9 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Icon name="check" size={30} />
            </div>
            <div className="font-display mt-5 text-2xl font-bold text-slate-900">
              Dokumen terkirim ke printer
            </div>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {copies} lembar soal {exam.course} telah masuk ke antrian Printer
              Ruang Kaprodi.
            </p>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-500">
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
            <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
              <div>
                <div className="font-display text-xl font-bold text-slate-900">
                  Konfirmasi Cetak Aman
                </div>
                <p className="mt-1 text-xs text-slate-500">
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
            <div className="p-7">
              <div className="flex gap-4 rounded-2xl bg-[#f4f1ea] p-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#202126] shadow-sm">
                  <Icon name="file" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {exam.course}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {exam.code} · Kelas {exam.className} · {exam.type}
                  </div>
                </div>
              </div>

              <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Jumlah cetak
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button
                  className="grid size-10 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100"
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
                  className="grid size-10 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => setCopies(copies + 1)}
                >
                  +
                </button>
              </div>

              <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                PIN persetujuan Kaprodi
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" size={18} />
                </span>
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm tracking-[0.35em] text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100"
                  maxLength={6}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="••••••"
                  type="password"
                  value={pin}
                />
              </div>
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-800">
                <Icon name="shield" size={17} />
                Watermark identitas Siti Handayani dan waktu cetak akan
                ditambahkan otomatis pada setiap halaman.
              </div>
              <button
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202126] py-3.5 text-sm font-bold text-white transition hover:bg-[#111216] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pin.length < 6}
                onClick={() => setSent(true)}
              >
                <Icon name="printer" size={18} />
                Kirim ke Printer Kaprodi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LoginPage({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("panitia")
  const emails: Record<UserRole, string> = {
    dosen: "rina.kurniawati@feb.ac.id",
    kaprodi: "dian.puspitasari@feb.ac.id",
    panitia: "siti.handayani@feb.ac.id",
    admin: "rizky.it@feb.ac.id",
  }
  return (
    <div className="grid min-h-screen bg-[#f4f1ea] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#202126] p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-[#f5cf25] text-[#202126]">
            <Icon name="lock" size={25} />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-wide">
              E-BRANKAS SOAL
            </div>
            <div className="text-[10px] font-semibold tracking-[0.22em] text-emerald-200/60">
              FEB UNIVERSITAS
            </div>
          </div>
        </div>
        <div className="my-auto max-w-xl">
          <div className="mb-6 grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#f5cf25]">
            <Icon name="shield" size={32} />
          </div>
          <div className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            Soal aman dari upload hingga tercetak.
          </div>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-emerald-50/60">
            Sistem pengelolaan soal ujian terpusat dengan enkripsi, akses
            berbasis peran, dan rekam jejak lengkap.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["Terenkripsi", "File server"],
              ["Tercatat", "Setiap aktivitas"],
              ["Terbatas", "Akses cetak"],
            ].map(([value, label]) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                key={value}
              >
                <div className="text-sm font-bold">{value}</div>
                <div className="mt-1 text-[11px] text-emerald-100/45">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-emerald-50/35">
          © 2026 Fakultas Ekonomi dan Bisnis
        </p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <form
          className="w-full max-w-md"
          onSubmit={(event) => {
            event.preventDefault()
            onLogin(selectedRole)
          }}
        >
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="grid size-11 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
              <Icon name="lock" size={22} />
            </div>
            <div className="font-display font-bold text-slate-900">
              E-BRANKAS SOAL FEB
            </div>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Portal internal
          </div>
          <div className="font-display mt-3 text-3xl font-bold text-slate-900">
            Selamat datang kembali
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Pilih peran Anda agar menu yang ditampilkan sesuai kewenangan.
          </p>
          <div className="mt-7 text-xs font-bold text-slate-600">
            Masuk sebagai
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => (
              <button
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  selectedRole === role
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
                key={role}
                onClick={() => setSelectedRole(role)}
                type="button"
              >
                <span className="block text-xs font-bold">
                  {roleConfig[role].label}
                </span>
                <span className="mt-1 block truncate text-[10px] opacity-70">
                  {roleConfig[role].name}
                </span>
              </button>
            ))}
          </div>
          <label className="mt-6 block text-xs font-bold text-slate-600">
            NIDN / Email
          </label>
          <input
            key={selectedRole}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-amber-100"
            defaultValue={emails[selectedRole]}
            required
            type="text"
          />
          <label className="mt-5 block text-xs font-bold text-slate-600">
            Kata sandi
          </label>
          <div className="relative mt-2">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-amber-100"
              defaultValue="password"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? "Sembunyi" : "Lihat"}
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" /> Ingat perangkat ini
            </label>
            <button className="font-bold text-emerald-700" type="button">
              Lupa kata sandi?
            </button>
          </div>
          <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202126] py-3.5 text-sm font-bold text-white hover:bg-[#111216]">
            Masuk ke sistem <Icon name="chevron" size={17} />
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Icon name="shield" size={14} /> Koneksi aman dan aktivitas tercatat
          </div>
        </form>
      </section>
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
  const dashboards: Record<UserRole, {
    greeting: string
    summary: string
    action: string
    target: string
    actionIcon: IconName
    stats: {
      label: string
      value: string
      detail: string
      icon: IconName
      tone: "green" | "gold" | "blue"
    }[]
  }> = {
    dosen: {
      greeting: "Selamat pagi, Dr. Rina.",
      summary: "Dua soal sudah terkunci dan satu mata kuliah belum diunggah.",
      action: "Upload soal baru",
      target: "Upload Soal",
      actionIcon: "upload",
      stats: [
        {
          label: "Mata Kuliah",
          value: "4",
          detail: "Semester aktif",
          icon: "book",
          tone: "blue",
        },
        {
          label: "Sudah Upload",
          value: "3",
          detail: "2 terkunci permanen",
          icon: "check",
          tone: "green",
        },
        {
          label: "Belum Upload",
          value: "1",
          detail: "Batas 12 Okt, 17:00",
          icon: "clock",
          tone: "gold",
        },
        {
          label: "Revisi",
          value: "1",
          detail: "Menunggu persetujuan",
          icon: "history",
          tone: "gold",
        },
      ],
    },
    kaprodi: {
      greeting: "Selamat pagi, Dr. Dian.",
      summary:
        "Progres pengumpulan prodi mencapai 81% dan ada tiga revisi menunggu.",
      action: "Buka rekap soal",
      target: "Rekap Soal",
      actionIcon: "book",
      stats: [
        {
          label: "Sudah Upload",
          value: "26",
          detail: "Dari 32 mata kuliah",
          icon: "check",
          tone: "green",
        },
        {
          label: "Belum Upload",
          value: "6",
          detail: "Perlu ditindaklanjuti",
          icon: "clock",
          tone: "gold",
        },
        {
          label: "Revisi Menunggu",
          value: "3",
          detail: "Perlu persetujuan",
          icon: "history",
          tone: "blue",
        },
        {
          label: "Cetak Hari Ini",
          value: "4",
          detail: "Semua tervalidasi",
          icon: "printer",
          tone: "green",
        },
      ],
    },
    panitia: {
      greeting: "Selamat pagi, Siti.",
      summary: "Ada dua soal ujian yang sudah dapat dicetak hari ini.",
      action: "Buka antrian cetak",
      target: "Antrian Cetak",
      actionIcon: "printer",
      stats: [
        {
          label: "Total Antrian",
          value: "6",
          detail: "2 siap sekarang",
          icon: "file",
          tone: "green",
        },
        {
          label: "Dicetak Hari Ini",
          value: "4",
          detail: "Hingga pukul 15:00",
          icon: "printer",
          tone: "blue",
        },
        {
          label: "Terjadwal",
          value: "4",
          detail: "Menunggu akses",
          icon: "clock",
          tone: "gold",
        },
        {
          label: "Status Printer",
          value: "Online",
          detail: "Ruang Kaprodi",
          icon: "settings",
          tone: "green",
        },
      ],
    },
    admin: {
      greeting: "Selamat pagi, Rizky.",
      summary:
        "Seluruh layanan aktif. Tidak ada akses terhadap isi dokumen soal.",
      action: "Periksa status server",
      target: "Status Server",
      actionIcon: "settings",
      stats: [
        {
          label: "Server",
          value: "Aktif",
          detail: "Uptime 99,98%",
          icon: "settings",
          tone: "green",
        },
        {
          label: "Penyimpanan",
          value: "42%",
          detail: "168 GB dari 400 GB",
          icon: "archive",
          tone: "blue",
        },
        {
          label: "Pengguna Aktif",
          value: "42",
          detail: "4 role terkelola",
          icon: "users",
          tone: "green",
        },
        {
          label: "Peringatan",
          value: "0",
          detail: "Tidak ada anomali",
          icon: "shield",
          tone: "green",
        },
      ],
    },
  }
  const dashboard = dashboards[normalizeRole(role)]
  const overviews: Record<UserRole, {
    title: string
    subtitle: string
    percent: string
    width: string
    rows: string[][]
    activities: string[][]
  }> = {
    dosen: {
      title: "Kesiapan Soal Anda",
      subtitle: "4 mata kuliah pada semester aktif",
      percent: "75%",
      width: "w-3/4",
      rows: [
        ["Ekonomi Pertanian", "Sudah dikunci", "100%", "w-full"],
        ["Ekonomi Makro I", "Sudah dikunci", "100%", "w-full"],
        ["Statistika Ekonomi", "Revisi diproses", "75%", "w-3/4"],
      ],
      activities: [
        ["Anda", "mengunci soal Ekonomi Pertanian", "8 menit lalu"],
        ["Kaprodi", "menyetujui revisi Statistika Ekonomi", "kemarin"],
        ["Sistem", "mengingatkan batas upload", "2 hari lalu"],
      ],
    },
    kaprodi: {
      title: "Progres Pengumpulan",
      subtitle: "UTS Semester Ganjil 2026/2027",
      percent: "81%",
      width: "w-[81%]",
      rows: [
        ["Manajemen", "12 dari 14 mata kuliah", "86%", "w-[86%]"],
        ["Akuntansi", "8 dari 10 mata kuliah", "80%", "w-4/5"],
        ["Ekonomi Pembangunan", "6 dari 8 mata kuliah", "75%", "w-3/4"],
      ],
      activities: [
        ["Dr. Rina", "mengunggah Ekonomi Pertanian", "8 menit lalu"],
        ["Siti Handayani", "mencetak 36 eksemplar", "32 menit lalu"],
        ["Dr. Ahmad", "mengajukan revisi soal", "1 jam lalu"],
      ],
    },
    panitia: {
      title: "Kesiapan Cetak Hari Ini",
      subtitle: "Berdasarkan urutan jadwal ujian",
      percent: "67%",
      width: "w-2/3",
      rows: [
        ["Ekonomi Pertanian", "Siap · 08:00 WIB", "40 eks", "w-full"],
        ["Akuntansi Biaya", "Siap · 10:30 WIB", "36 eks", "w-full"],
        ["Ekonomi Mikro II", "Terkunci sampai besok", "38 eks", "w-1/3"],
      ],
      activities: [
        ["Anda", "mencetak Akuntansi Biaya · 36 eks", "32 menit lalu"],
        ["Sistem", "membuka akses Ekonomi Pertanian", "1 jam lalu"],
        ["Printer Kaprodi", "kembali online", "2 jam lalu"],
      ],
    },
    admin: {
      title: "Kesehatan Infrastruktur",
      subtitle: "Pemantauan tanpa akses isi dokumen",
      percent: "98%",
      width: "w-[98%]",
      rows: [
        ["Application Server", "Normal · 12 ms", "100%", "w-full"],
        ["Database MySQL", "Normal · 4 ms", "100%", "w-full"],
        ["Encrypted Storage", "168 GB terpakai", "42%", "w-[42%]"],
      ],
      activities: [
        ["Sistem", "menyelesaikan backup harian", "02:00"],
        ["Printer Gateway", "koneksi kembali normal", "kemarin"],
        ["Admin IT", "menambah satu akun dosen", "2 hari lalu"],
      ],
    },
  }
  const overview = overviews[normalizeRole(role)]
  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-7 text-slate-900 shadow-[0_18px_50px_rgba(32,33,38,0.05)] sm:p-9">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex rounded-full bg-[#f5cf25] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#202126]">
              SENIN, 12 OKTOBER 2026
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
  const [file, setFile] = useState("")
  const [locked, setLocked] = useState(false)
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
            <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900">
              <option>Ekonomi Pertanian · EKO-301</option>
              <option>Ekonomi Mikro II · EKO-205</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jenis ujian
            <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900">
              <option>UTS</option>
              <option>UAS</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jadwal ujian
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              defaultValue="2026-10-13T08:00"
              type="datetime-local"
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Jumlah mahasiswa
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-slate-900"
              defaultValue="40"
              min="1"
              type="number"
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
            onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")}
            type="file"
          />
          <div className="grid size-12 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <Icon name={file ? "check" : "upload"} size={23} />
          </div>
          <div className="mt-4 text-sm font-bold text-slate-700">
            {file || "Klik untuk pilih berkas PDF"}
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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202126] py-3.5 text-sm font-bold text-white"
          onClick={() => {
            setLocked(true)
            showToast("Soal berhasil dienkripsi dan dikunci.")
          }}
        >
          <Icon name="lock" size={18} /> Enkripsi & Kunci Soal
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
            {[
              ["Ekonomi Makro I", "Terkunci · 8 Okt 2026"],
              ["Statistika Ekonomi", "Revisi disetujui"],
              ...(locked ? [["Ekonomi Pertanian", "Baru saja dikunci"]] : []),
            ].map(([name, state]) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5"
                key={name}
              >
                <Icon name="document" size={18} />
                <div>
                  <div className="text-xs font-bold text-slate-700">{name}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {state}
                  </div>
                </div>
                <Icon name="lock" size={14} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function RecapPage({ showToast }: { showToast: (message: string) => void }) {
  const rows = [
    [
      "Dr. Rina Kurniawati",
      "Ekonomi Pertanian",
      "13 Okt, 08:00",
      "Sudah upload",
    ],
    [
      "Budi Santoso, S.E., M.Ak.",
      "Akuntansi Biaya",
      "13 Okt, 10:30",
      "Sudah upload",
    ],
    [
      "Nadia Permata, S.E., M.M.",
      "Pengantar Manajemen",
      "14 Okt, 08:00",
      "Sudah upload",
    ],
    [
      "Dr. Yusuf Hamdani",
      "Manajemen Keuangan",
      "15 Okt, 08:00",
      "Belum upload",
    ],
    [
      "Indah Lestari, M.M.",
      "Perilaku Organisasi",
      "15 Okt, 13:00",
      "Belum upload",
    ],
  ]
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          detail="81% dari total mata kuliah"
          icon="check"
          label="Sudah Upload"
          tone="green"
          value="26"
        />
        <StatCard
          detail="Batas akhir 12 Okt, 17:00"
          icon="clock"
          label="Belum Upload"
          tone="gold"
          value="6"
        />
        <StatCard
          detail="Perlu persetujuan Anda"
          icon="history"
          label="Revisi Menunggu"
          tone="blue"
          value="3"
        />
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
              onClick={() => showToast("Rekap berhasil diekspor.")}
            >
              <Icon name="download" size={16} /> Ekspor Rekap
            </button>
            <button
              className="rounded-xl bg-[#202126] px-4 py-2.5 text-xs font-bold text-white"
              onClick={() => showToast("Pengingat terkirim ke 6 dosen.")}
            >
              Kirim Pengingat
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
                const done = row[3] === "Sudah upload"
                return (
                  <tr className="border-t border-slate-100" key={row[1]}>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {row[0]}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row[1]}</td>
                    <td className="px-4 py-4 text-slate-500">{row[2]}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          done
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {row[3]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="font-bold text-emerald-700"
                        onClick={() =>
                          showToast(
                            done
                              ? "Detail soal dibuka."
                              : `Pengingat dikirim ke ${row[0]}.`,
                          )
                        }
                      >
                        {done ? "Lihat detail" : "Ingatkan"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6">
        <div className="font-display text-lg font-bold text-slate-900">
          Permintaan Revisi
        </div>
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:flex-row sm:items-center">
          <div className="grid size-10 place-items-center rounded-xl bg-white text-amber-700">
            <Icon name="history" size={19} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-800">
              Ekonomi Mikro II · Dr. Ahmad Fauzi
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Alasan: perbaikan typo pada nomor 12 dan 17
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
              onClick={() => showToast("Permintaan revisi ditolak.")}
            >
              Tolak
            </button>
            <button
              className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
              onClick={() => showToast("Revisi disetujui dan tercatat di log.")}
            >
              Setujui
            </button>
          </div>
        </div>
      </section>
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
  const allLogs = [
    [
      "13 Okt 2026 · 07:15",
      "Siti Handayani",
      "Cetak",
      "Ekonomi Pertanian · 40 eks",
      "192.168.1.24",
    ],
    [
      "12 Okt 2026 · 16:42",
      "Dr. Rina Kurniawati",
      "Upload",
      "Ekonomi Pertanian",
      "192.168.1.18",
    ],
    [
      "12 Okt 2026 · 15:10",
      "Dr. Ahmad Fauzi",
      "Revisi",
      "Ekonomi Mikro II",
      "192.168.1.31",
    ],
    [
      "12 Okt 2026 · 14:28",
      "Nadia Permata",
      "Kunci",
      "Pengantar Manajemen",
      "192.168.1.20",
    ],
    [
      "12 Okt 2026 · 09:04",
      "Kaprodi Manajemen",
      "Approval",
      "Akuntansi Biaya",
      "192.168.1.11",
    ],
  ]
  const logs =
    role === "dosen"
      ? allLogs.filter((log) => log[1].includes("Rina"))
      : role === "panitia"
        ? allLogs.filter((log) => log[2] === "Cetak")
        : allLogs
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          detail="Selama periode UTS"
          icon="history"
          label="Total Aktivitas"
          tone="green"
          value="148"
        />
        <StatCard
          detail="Seluruhnya terverifikasi"
          icon="printer"
          label="Aktivitas Cetak"
          tone="blue"
          value="24"
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
                className="flex items-center gap-2 rounded-xl bg-[#202126] px-4 py-2.5 text-xs font-bold text-white"
                onClick={() => showToast("Berita acara PDF berhasil dibuat.")}
              >
                <Icon name="download" size={15} /> Buat Berita Acara
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
              {logs.map((log) => (
                <tr className="border-t border-slate-100" key={log.join()}>
                  <td className="px-6 py-4 text-slate-500">{log[0]}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {log[1]}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {log[2]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{log[3]}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {log[4]}
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

function UsersPage({ showToast }: { showToast: (message: string) => void }) {
  const [adding, setAdding] = useState(false)
  const users = [
    ["RK", "Dr. Rina Kurniawati", "rina.k@feb.ac.id", "Dosen", "Aktif"],
    ["AH", "Dr. Ahmad Fauzi", "ahmad.f@feb.ac.id", "Dosen", "Aktif"],
    ["DP", "Dr. Dian Puspitasari", "dian.p@feb.ac.id", "Kaprodi", "Aktif"],
    ["SH", "Siti Handayani", "siti.h@feb.ac.id", "Panitia / TU", "Aktif"],
    ["RA", "Rizky Ananda", "rizky.it@feb.ac.id", "Admin IT", "Aktif"],
  ]
  return (
    <>
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <div className="font-display text-xl font-bold text-slate-900">
            Pengguna Sistem
          </div>
          <p className="mt-1 text-sm text-slate-400">
            42 pengguna aktif dengan akses berbasis peran
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
              placeholder="Nama lengkap"
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              placeholder="Email institusi"
            />
            <input
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none"
              placeholder="NIDN / NIP"
            />
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs">
              <option>Dosen</option>
              <option>Kaprodi</option>
              <option>Panitia / TU</option>
              <option>Admin IT</option>
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
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white"
              onClick={() => {
                setAdding(false)
                showToast("Pengguna baru berhasil ditambahkan.")
              }}
            >
              Simpan Pengguna
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
          <table className="w-full min-w-[760px] text-left text-xs">
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
                <tr className="border-t border-slate-100" key={user[2]}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                        {user[0]}
                      </span>
                      <span className="font-bold text-slate-700">
                        {user[1]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{user[2]}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                      {user[3]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {user[4]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="font-bold text-emerald-700"
                      onClick={() => showToast(`Membuka data ${user[1]}.`)}
                    >
                      Kelola
                    </button>
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

function MyQuestionsPage({
  showToast,
}: {
  showToast: (message: string) => void
}) {
  const questions = [
    [
      "Ekonomi Pertanian",
      "EKO-301 · Kelas A",
      "UTS",
      "Terkunci",
      "13 Okt 2026",
    ],
    ["Ekonomi Makro I", "EKO-201 · Kelas B", "UTS", "Terkunci", "15 Okt 2026"],
    [
      "Statistika Ekonomi",
      "STA-204 · Kelas A",
      "UTS",
      "Revisi disetujui",
      "17 Okt 2026",
    ],
    [
      "Ekonomi Regional",
      "EKO-315 · Kelas C",
      "UTS",
      "Belum upload",
      "20 Okt 2026",
    ],
  ]
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          detail="Semester aktif"
          icon="book"
          label="Mata Kuliah"
          tone="blue"
          value="4"
        />
        <StatCard
          detail="File terenkripsi"
          icon="lock"
          label="Terkunci"
          tone="green"
          value="2"
        />
        <StatCard
          detail="Menunggu file final"
          icon="clock"
          label="Belum Upload"
          tone="gold"
          value="1"
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
          {questions.map(([name, meta, type, state, date]) => (
            <div className="rounded-2xl border border-slate-200 p-5" key={name}>
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon name="document" size={19} />
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {type}
                </span>
              </div>
              <div className="mt-4 text-sm font-bold text-slate-800">
                {name}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {meta} · {date}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    state === "Belum upload"
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  <Icon
                    name={state === "Belum upload" ? "clock" : "lock"}
                    size={14}
                  />
                  {state}
                </span>
                <button
                  className="text-xs font-bold text-emerald-700"
                  onClick={() =>
                    showToast(
                      state === "Terkunci"
                        ? "Permintaan revisi dikirim ke Kaprodi."
                        : "Detail mata kuliah dibuka.",
                    )
                  }
                >
                  {state === "Terkunci" ? "Ajukan revisi" : "Lihat detail"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function RevisionPage({ showToast }: { showToast: (message: string) => void }) {
  const requests = [
    [
      "Dr. Ahmad Fauzi",
      "Ekonomi Mikro II",
      "Perbaikan typo nomor 12 dan 17",
      "12 Okt · 15:10",
    ],
    [
      "Nadia Permata, S.E., M.M.",
      "Pengantar Manajemen",
      "Mengganti studi kasus nomor 5",
      "12 Okt · 13:44",
    ],
    [
      "Budi Santoso, S.E., M.Ak.",
      "Akuntansi Biaya",
      "Koreksi tabel pada halaman 3",
      "11 Okt · 16:20",
    ],
  ]
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
        {requests.map(([lecturer, course, reason, time]) => (
          <div
            className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-5 lg:flex-row lg:items-center"
            key={course}
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
              <Icon name="history" size={20} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">{course}</div>
              <div className="mt-1 text-xs text-slate-500">
                {lecturer} · {time}
              </div>
              <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-600">
                <strong>Alasan:</strong> {reason}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600"
                onClick={() => showToast(`Revisi ${course} ditolak.`)}
              >
                Tolak
              </button>
              <button
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white"
                onClick={() => showToast(`Revisi ${course} disetujui.`)}
              >
                Setujui Revisi
              </button>
            </div>
          </div>
        ))}
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

function HelpPanel({ role, onClose }: { role: UserRole onClose: () => void }) {
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
        "Masukkan PIN Kaprodi lalu kirim ke printer tujuan.",
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

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState<UserRole>("panitia")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [active, setActive] = useState("Dashboard")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("Semua status")
  const [selectedExam, setSelectedExam] = useState<typeof exams[number] | null>(
    null,
  )
  const [toast, setToast] = useState("")
  const [helpOpen, setHelpOpen] = useState(false)
  const safeRole = normalizeRole(role)

  const filteredExams = useMemo(
    () =>
      exams.filter(
        (exam) =>
          (status === "Semua status" || exam.status === status) &&
          `${exam.course} ${exam.code} ${exam.lecturer}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [search, status],
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
    "Status Server": [
      "Status Server",
      "Pantau layanan tanpa mengakses isi soal",
    ],
    "Log Aktivitas": ["Log Aktivitas Saya", "Riwayat aktivitas akun dosen"],
    "Log Cetak": ["Log Cetak", "Riwayat pencetakan soal oleh Panitia/TU"],
    "Log Sistem": ["Log Sistem", "Audit keamanan dan kesehatan layanan"],
  }
  const currentPage = pageInfo[active] ?? pageInfo.Dashboard

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  if (!loggedIn)
    return (
      <LoginPage
        onLogin={(selectedRole) => {
          setRole(selectedRole)
          setActive("Dashboard")
          setLoggedIn(true)
        }}
      />
    )

  return (
    <div className="min-h-screen bg-[#e8e9e9] text-slate-800">
      <Sidebar
        active={active}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setLoggedIn(false)}
        onNavigate={setActive}
        open={sidebarOpen}
        role={safeRole}
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
          <div className="ml-auto flex items-center gap-3">
            <button
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 sm:flex"
              onClick={() => setHelpOpen(true)}
            >
              <Icon name="book" size={15} />
              Panduan
            </button>
            <div className="hidden rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm md:block">
              Mode {roleConfig[safeRole].label}
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-[#202126] px-4 py-2.5 text-xs font-semibold text-white sm:flex">
              <Icon name="shield" size={15} />
              Koneksi terenkripsi
            </div>
            <button
              aria-label="Buka notifikasi"
              className="relative grid size-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              onClick={() => showToast("Tidak ada notifikasi keamanan baru.")}
            >
              <Icon name="bell" size={19} />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-amber-500" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:pt-5">
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
                      Selamat pagi, Siti.
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                      Ada{" "}
                      <strong className="font-semibold text-slate-900">
                        2 soal ujian
                      </strong>{" "}
                      yang sudah dapat dicetak hari ini. Pastikan jumlah cetak
                      sesuai dengan peserta terdaftar.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#f4f1ea] p-4">
                    <div className="grid size-11 place-items-center rounded-xl bg-[#202126] text-[#f5cf25]">
                      <Icon name="printer" size={22} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">
                        Printer tujuan
                      </div>
                      <div className="mt-0.5 text-sm font-bold">
                        HP LaserJet · Kaprodi
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-400" />{" "}
                        Online & siap
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="mb-6 grid gap-3 md:grid-cols-3">
                {[
                  ["1", "Pilih soal", "Hanya yang berstatus siap dicetak"],
                  ["2", "Cek jumlah", "Samakan dengan jumlah peserta"],
                  ["3", "Masukkan PIN", "Dokumen langsung menuju printer"],
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
                  detail="2 siap dicetak sekarang"
                  icon="file"
                  label="Total Antrian"
                  tone="green"
                  value="6"
                />
                <StatCard
                  detail="Hingga pukul 15:00"
                  icon="printer"
                  label="Dicetak Hari Ini"
                  tone="blue"
                  value="4"
                />
                <StatCard
                  detail="Menunggu waktu akses"
                  icon="clock"
                  label="Terjadwal"
                  tone="gold"
                  value="4"
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
                  <span>Menampilkan {filteredExams.length} dari 6 antrian</span>
                  <span>Diperbarui 2 menit lalu</span>
                </div>
              </section>
            </>
          )}

          <footer className="flex flex-col gap-2 px-1 py-7 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © 2026 Fakultas Ekonomi dan Bisnis · Sistem E-Brankas Soal
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="lock" size={13} /> Dilindungi enkripsi end-to-end
            </span>
          </footer>
        </div>
      </main>

      <PrintModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
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
    </div>
  )
}
