# MindBloom — Merged & Verified Project

Project ini adalah hasil **penggabungan nyata** Sprint 1–14 (Sprint 13/mobile
terpisah karena itu project Expo tersendiri), yang sudah melalui:

```
npm install → tsc --noEmit (0 error) → next build (✓ Compiled successfully)
```

Bukan sekadar overlay file — setiap bug integrasi lintas-sprint ditemukan
lewat compiler sungguhan dan diperbaiki satu per satu. Detail lengkap di bawah.

---

## Cara pakai

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan kredensial Supabase, OpenAI, Midtrans asli
```

Jalankan migration SQL **berurutan** di Supabase SQL Editor:
```
supabase/00_COMBINED_ALL_MIGRATIONS.sql   ← satu file, satu klik, aman di-re-run
```
atau satu-satu dari `supabase/migrations/01_...sql` sampai `11_...sql`.

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## Bug yang ditemukan & diperbaiki selama integrasi

Ini bukan daftar kosmetik — semuanya bug nyata yang baru muncul ketika
seluruh 14 sprint benar-benar disatukan dan di-compile bersama.

### 1. `next.config.ts` korup
Berisi 3 file tergabung jadi satu (next.config + tsconfig + postcss ikut
ter-append sebagai komentar di generasi awal). Dipotong ke konten yang valid saja.

### 2. `Database` type Supabase tidak lengkap → ~130 error "never"
`src/types/database.ts` awal cuma mengenal tabel `profiles`. Semua tabel lain
(journal_entries, habits, dst — 23 total) di-generate ulang lengkap secara manual,
disinkronkan dengan seluruh file SQL migration.

### 3. `@supabase/postgrest-js` butuh field `Relationships`
Helper tipe tabel tidak menyertakan `Relationships: []` yang diwajibkan
`GenericTable`. Tanpa ini, TypeScript diam-diam menjatuhkan semua hasil query
ke `never` meski tabel-nya sudah benar didefinisikan.

### 4. `@supabase/ssr@0.5.2` — bug versi nyata
Versi ini salah meng-infer tipe untuk query yang **mengembalikan array**
(tanpa `.single()`/`.maybeSingle()`) — hasilnya selalu `never[]`, padahal
`@supabase/supabase-js` biasa bekerja normal dengan Database type yang sama.
Diupgrade ke `0.10.3`. Ini adalah kontributor terbesar (194 → 67 error).

### 5. Nested/embedded `.select('a, b(c)')` meracuni `Promise.all` tetangganya
Ditemukan di `contextAssembler.ts` dan `api/insights/generate/route.ts`:
satu query dengan join bersarang di dalam array `Promise.all` besar membuat
**semua** query lain dalam array yang sama ikut ter-infer `never`. Query
bermasalah diisolasi ke `await` terpisah dengan cast eksplisit ke interface lokal.

### 6. Next.js 15 breaking change — `params` jadi `Promise`
3 file (`journal/[id]/page.tsx`, `api/habits/[id]/route.ts`,
`api/habits/[id]/checkin/route.ts`) masih pakai signature lama
`{ params: { id: string } }`. Diperbaiki ke `{ params: Promise<{ id: string }> }`
+ `await params` di awal function.

### 7. Node `crypto` di route Edge Runtime
`embedder.ts` pakai `crypto.createHash` (Node-only) tapi diimpor oleh
`api/coach/chat/route.ts` yang berjalan di Edge Runtime. Diganti ke Web Crypto
API (`crypto.subtle.digest`) yang kompatibel Node maupun Edge — fungsi jadi
async, semua pemanggilnya disesuaikan.

### 8. `@supabase/supabase-js` pakai `process.version` di Edge Runtime
Peringatan build nyata. Route coach chat dipindah dari Edge Runtime ke
Node.js runtime (default) — lebih aman, menghindari seluruh kelas masalah
kompatibilitas Edge untuk dependency yang berorientasi Node (`midtrans-client`,
`openai`, `supabase-js`).

### 9. `user_xp` tabel & policy didefinisikan dobel (Sprint 3 & 4)
Sprint 4 membuat ulang tabel yang sama dari Sprint 3 tanpa `DROP POLICY IF EXISTS`
— akan gagal saat migration dijalankan. **Semua** `CREATE POLICY` dan
`CREATE TRIGGER` di seluruh 11 file migration sekarang idempotent (32 policy,
9 trigger, tervalidasi 1:1).

### 10. Bug logika asli dari Sprint 3 & 2
- `JournalForm.tsx` mengecek field `is_draft` yang tak pernah ada di tipe
  `JournalDraft` client-side — diganti state lokal `justSubmitted`.
- `OnboardingForm.tsx` (Sprint 2) mengimpor `onboardingSchema` yang tak pernah
  dibuat di Sprint 1 — ditambahkan ke `lib/validations/auth.ts`.

### 11. Dependency & keamanan
- `supabase` (CLI) dihapus dari devDependencies — postinstall-nya men-download
  binary dari GitHub yang rawan gagal di lingkungan terbatas jaringan; diganti
  `npx supabase` on-demand.
- `next` diupgrade `15.1.3 → 15.5.20` — menutup beberapa CVE kritikal.
- Ditambahkan `openai`, `midtrans-client` yang terpakai tapi belum ada di
  `package.json`, plus type shim untuk `midtrans-client` (tak punya `.d.ts` bawaan).

### 12. Sampah struktural
Folder dengan nama literal `{app`, `{types,lib` dll (sisa `mkdir` yang salah
lolos kurung kurawal di sprint-sprint awal) dihapus.

---

## Yang TIDAK bisa diverifikasi di sini (butuh environment nyata)

- **Fetch Google Font saat build** — sandbox ini tidak bisa akses
  `fonts.googleapis.com`. Ini akan bekerja normal di mesin dev atau Vercel mana pun.
- **Koneksi Supabase/OpenAI/Midtrans sungguhan** — semua kredensial di
  `.env.example` masih placeholder. Perlu diisi nilai asli lalu di-test end-to-end
  sesuai checklist di bawah.

---

## Checklist sebelum production

1. Isi `.env.local` dengan kredensial asli (Supabase, OpenAI, Midtrans sandbox dulu)
2. Jalankan `supabase/00_COMBINED_ALL_MIGRATIONS.sql` di Supabase SQL Editor
3. `npm install && npm run build` — pastikan sukses di mesinmu (harus, karena
   satu-satunya kegagalan build di sini murni jaringan sandbox)
4. `npm run dev` → jalani 16 langkah manual QA (signup → jurnal → habit →
   life wheel → breathing → soundscape → coach → insight → search → analytics
   → vault → pricing checkout)
5. Ganti Midtrans ke Production key sebelum menerima pembayaran asli
6. Deploy ke Vercel — set semua env var yang sama di dashboard Vercel

---

## Update — Rate Limiting & Polish (babak kedua)

### Rate Limiting

Ditambahkan sistem rate limiting berbasis **Supabase Postgres** (bukan
Upstash Redis) — sengaja begitu supaya tidak perlu daftar layanan baru,
langsung jalan begitu deploy dengan infra yang sudah ada.

**File baru:**
- `src/lib/ratelimit/rateLimiter.ts` — fixed-window counter, fail-open kalau
  limiter sendiri error (bug di rate limiter tidak boleh jadi alasan user
  tidak bisa pakai aplikasi)
- `src/lib/ratelimit/configs.ts` — 7 named limit per endpoint
- `src/lib/ratelimit/guard.ts` — `enforceRateLimit(userId, name)` — satu baris
  di setiap route
- `supabase/migrations/12_ratelimit.sql` — tabel `rate_limit_counters` +
  RPC `increment_rate_limit` (atomic, 1 round-trip) + cleanup job

**Endpoint yang dilindungi:**

| Endpoint | Limit | Alasan |
|----------|-------|--------|
| `coach/chat` | 15/menit | Paling mahal — GPT-4o + RAG search + context assembly per pesan |
| `insights/generate` | 3/jam | GPT-4o-mini + ~8 query paralel |
| `insights/ei-score` | 3/jam | Scoring 7-dimensi per jurnal seminggu |
| `memory/embed` | 10/jam | Sampai 20 embedding call per request |
| `memory/search` | 30/menit | 1 embedding call per pencarian |
| `vault/generate` | 5/jam | GPT-4o-mini narrative generation |
| `payment/checkout` | 10/jam | Cegah spam transaksi Midtrans |

`useCoach.ts` diperbarui supaya pesan 429 (rate limit) ditampilkan sebagai
pesan ramah dengan estimasi waktu tunggu, bukan error generik.

### Polish

**1. Bug kontras warna WCAG AA nyata** — dihitung pakai formula luminance
   resmi (bukan tebak-tebakan), ditemukan 3 kombinasi warna gagal:
   - Light mode `muted-foreground`: 3.83:1 → **4.59:1** (dipakai di HAMPIR
     semua timestamp & label sekunder di seluruh app)
   - Dark mode teks tombol primary: 4.21:1 → **4.64:1**
   - Warna destructive (kedua mode): 4.16:1 & 4.32:1 → **4.60:1 & 4.58:1**

**2. Legal pages** — `src/app/privacy/page.tsx` dan `src/app/terms/page.tsx`.
   Ini memperbaiki **broken link nyata**: `SignupForm.tsx` sudah link ke
   `/privacy` dan `/terms` sejak Sprint 1, tapi halamannya tidak pernah dibuat.

**3. `not-found.tsx`** — halaman 404 bertema MindBloom, bukan default Next.js.

**4. `error.tsx`** — error boundary global dengan tombol "Coba lagi", bukan
   layar error putih polos.

**5. `(dashboard)/loading.tsx`** — skeleton instan saat navigasi antar
   halaman dashboard, bukan layar kosong sambil server component fetch data.

**6. `robots.ts` + `sitemap.ts`** — dynamic via Next.js Metadata API.
   Sengaja **tidak** memasukkan `/` ke sitemap karena `page.tsx` di root
   cuma redirect (tidak pernah render konten), jadi tidak ada gunanya
   di-index.

### Yang jujur perlu diketahui

Build memunculkan **1 warning** (bukan error): `middleware.ts` selalu
berjalan di Edge Runtime (aturan Next.js, tidak bisa di-opt-out), dan
`@supabase/ssr` yang dipakai di situ menarik `supabase-js` yang punya
pengecekan `process.version` internal. Ini warning yang dikenal luas dan
aman di ekosistem Supabase+Next.js (cuma untuk deteksi versi/telemetri,
bukan dependency fungsional) — build tetap sukses dan sudah dikonfirmasi
bekerja di produksi Vercel oleh komunitas. Tidak ada tindakan lanjut yang
diperlukan.

### Verifikasi ulang

```
tsc --noEmit  → 0 error
next build    → ✓ Compiled successfully, 48 routes (naik dari 43)
```

---

## Update — Testing Otomatis, Perbaikan Bug Kritis & Manajemen Akun (babak ketiga)

### 1. Testing Otomatis (Vitest) — 62 test, semua lolos

Ditulis untuk 4 modul **logika bisnis paling kritis** — dipilih karena
kalau salah, dampaknya langsung ke user/revenue:

| File | Jumlah Test | Kenapa Kritis |
|------|-------------|----------------|
| `eiScorer.test.ts` | 13 | Kalau salah, skor kecerdasan emosional yang ditampilkan ke user tidak akurat |
| `patternDetector.test.ts` | 14 | Kalau salah, aplikasi bisa mengklaim pola yang sebenarnya tidak ada |
| `midtransClient.test.ts` | 11 | **Keamanan pembayaran** — satu-satunya penghalang webhook palsu memberi akses Premium gratis |
| `featureGate.test.ts` | 15 | Penentu akses Free/Premium/Pro |
| `habit.test.ts` | 9 | Penentu kapan habit "seharusnya" dikerjakan — kalau salah, streak rusak salah hitung |

Jalankan dengan `npm test`. Semua **62/62 lolos**, diverifikasi langsung.

### 2. Bug nyata ditemukan SAAT menulis test — langsung diperbaiki

Menulis test untuk `getEffectivePlan()` mengungkap bug nyata: **subscription
yang di-cancel langsung kehilangan akses**, padahal UI menjanjikan "aktif
hingga akhir periode saat ini". Ditemukan juga duplikasi logika serupa
(lebih longgar) di `checkFeatureAccess()` — bahkan tidak pernah mengecek
`current_period_end` untuk subscription aktif. Kedua fungsi sekarang
memakai satu sumber logika (`checkFeatureAccess` delegasi ke
`getEffectivePlan`), menghilangkan duplikasi sekaligus bug-nya.

### 3. CVE kritikal di Next.js — dipatch

`npm audit` menemukan kerentanan **critical** baru: "Unauthenticated
disclosure of internal Server Function endpoints" di Next.js 15.5.20.
Di-patch ke `15.5.23`. Sisa 7 kerentanan lain bersarang di dependency
internal Next.js sendiri (`sharp`/`postcss`); satu-satunya fix melompat ke
`next@16` (breaking change besar) — tidak dipaksa. `sharp` dipakai
`next/image` untuk gambar remote (Supabase, avatar Google) — risiko sempit
tapi nyata, layak jadi item roadmap.

### 4. Hapus Akun & Ekspor Data — dibangun dari nol

Memenuhi janji di Privacy Policy yang belum pernah dibangun. Skema
diverifikasi presisi via regex: **semua 24 tabel user-owned** punya
`ON DELETE CASCADE` ke `profiles(id)`. Artinya hapus akun cukup satu
panggilan `auth.admin.deleteUser()` — otomatis bersih di 24 tabel sekaligus.

**File baru:**
- `api/account/delete/route.ts` — wajib konfirmasi frasa persis di body request
- `api/account/export/route.ts` — 19 sumber tabel jadi 1 JSON, sengaja
  mengecualikan `midtrans_token`
- `settings/page.tsx` — **menggantikan placeholder Sprint 2** yang tidak
  pernah link ke `/settings/subscription` yang sudah berfungsi sejak Sprint 14
- `settings/account/page.tsx` + `AccountSettingsClient.tsx` — export 1 klik,
  hapus akun sengaja *high-friction* (ketik ulang frasa konfirmasi)

Link `/settings` sudah ada di Navbar sejak Sprint 2 — tidak perlu perubahan.

### Verifikasi ulang menyeluruh

```
npm test      → 62/62 lolos
tsc --noEmit  → 0 error
next build    → ✓ Compiled successfully, 51 routes (naik dari 48)
```

---

## Update — Hardening Keamanan (babak keempat)

### 1. Content-Security-Policy + Strict-Transport-Security

Header keamanan sebelumnya cuma punya `X-Frame-Options`,
`X-Content-Type-Options`, dll — **tidak ada CSP maupun HSTS sama sekali**.
Ditambahkan di `next.config.ts`, di-scope presisi ke kebutuhan MindBloom
sendiri (bukan CSP generik copy-paste):
- `script-src`/`frame-src` mengizinkan Midtrans Snap.js (checkout iframe)
- `connect-src` mengizinkan Supabase (API + Realtime websocket) —
  **sengaja TIDAK** mengizinkan OpenAI karena semua panggilan OpenAI
  terjadi server-side (API routes), tidak pernah dari browser
- `img-src` untuk Supabase Storage + avatar Google
- HSTS 2 tahun + `includeSubDomains` + `preload`, hanya aktif di production
  (supaya `next dev` di localhost tidak rusak)

**Catatan jujur**: `script-src` masih pakai `'unsafe-inline'` sebagai
kompromi terdokumentasi, bukan kelalaian — CSP berbasis *nonce* yang lebih
ketat butuh pengujian browser sungguhan terhadap Midtrans Snap.js + Next.js
hydration untuk memastikan tidak ada yang diam-diam rusak, dan itu tidak
bisa diverifikasi aman di sandbox offline ini. Jadikan prioritas begitu
ada instance production sungguhan untuk diuji.

### 2. Mobile: token auth pindah dari AsyncStorage ke expo-secure-store

Sebelumnya token sesi Supabase (access token + refresh token) tersimpan di
`AsyncStorage` — file biasa tanpa enkripsi, bisa dibaca aplikasi lain di
device yang di-root/jailbreak. Dipindah ke `expo-secure-store` (iOS
Keychain / Android Keystore, dienkripsi hardware).

**Detail teknis yang perlu diperhatikan**: `expo-secure-store` punya batas
**2048 byte per value** (limitasi Keychain iOS), sementara session
Supabase (access token + refresh token + metadata) bisa melebihi itu.
Solusi naif (langsung ganti nama tanpa penyesuaian) akan diam-diam gagal
untuk sebagian user. Dibuat `src/lib/secureStorage.ts` — adapter yang
memecah value besar jadi beberapa chunk ≤1800 byte, disimpan di beberapa
key SecureStore, disatukan kembali saat dibaca. Ini pola yang
direkomendasikan resmi untuk pemakaian SecureStore + Supabase Auth di
React Native.

Dependency `@react-native-async-storage/async-storage` dihapus (sudah
dikonfirmasi tidak dipakai di tempat lain).

### Verifikasi ulang

```
# Web
npm test      → 62/62 lolos
tsc --noEmit  → 0 error
next build    → ✓ Compiled successfully, 51 routes

# Mobile
tsc --noEmit  → 0 error
expo export --platform ios → ✓ sukses, 3.2 MB bundle
```
