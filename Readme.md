<div align="center">

# MindBloom

**Personal wellness companion untuk refleksi, kebiasaan sehat, dan pertumbuhan diri.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com)
[![License](https://img.shields.io/badge/License-TBD-lightgrey)](./LICENSE)

<br/>

> ⚠️ **Disclaimer:** MindBloom bukan pengganti diagnosis, terapi, atau saran dari tenaga kesehatan profesional.

</div>

---

## Daftar Isi

- [Tentang](#-tentang)
- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Environment Variables](#-environment-variables)
- [Perintah](#-perintah)
- [Struktur Project](#-struktur-project)
- [Keamanan & Deployment](#-keamanan--deployment)
- [Status Verifikasi](#-status-verifikasi)
- [Lisensi](#-lisensi)

---

## Tentang

MindBloom adalah aplikasi **personal wellness** yang membantu pengguna membangun kebiasaan sehat, memahami kondisi diri, dan melakukan refleksi secara konsisten.

Menggabungkan **jurnal reflektif**, **habit tracking gamifikasi**, **latihan pernapasan**, **AI Coach**, dan **visualisasi perkembangan** dalam satu dashboard yang terintegrasi.

---

## Fitur

| Kategori           | Deskripsi                                            |
| ------------------ | ---------------------------------------------------- |
| **Akun**           | Autentikasi, onboarding, profil, dan pengaturan akun |
| **Jurnal**         | Refleksi harian dengan pencarian dan analitik        |
| **Habit Tracking** | Streak, XP, achievement, dan garden progression      |
| **Life Wheel**     | Visualisasi keseimbangan area kehidupan              |
| **Breathing**      | Latihan pernapasan dan soundscape                    |
| **AI Coach**       | Percakapan reflektif berbasis AI                     |
| **Insight**        | Emotional intelligence scoring dari data jurnal      |
| **Memory Search**  | Semantic search untuk konteks personal               |
| **Vault**          | Penyimpanan konten privat                            |
| **Berlangganan**   | Paket premium dengan checkout Midtrans               |

---

## Teknologi

**Frontend**

- [Next.js 15](https://nextjs.org) — App Router, Server Components
- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Lucide React](https://lucide.dev), [Framer Motion](https://www.framer.com/motion/)

**Backend & Database**

- [Supabase](https://supabase.com) — Auth, PostgreSQL, Row Level Security, Storage

**AI & Payments**

- [OpenAI API](https://openai.com) — Insight, embedding, memory search, AI Coach
- [Midtrans](https://midtrans.com) — Payment gateway

**State & Testing**

- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Vitest](https://vitest.dev) — Unit testing

---

## Prasyarat

Pastikan semua dependensi berikut sudah tersedia sebelum memulai:

- **Node.js** `≥ 20`
- **npm**
- Project **Supabase** aktif
- **API Key OpenAI** untuk fitur AI
- **Akun Midtrans Sandbox** untuk fitur pembayaran

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/mindbloom.git
cd mindbloom
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Salin File Environment

```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

### 4. Isi Environment Variables

Buka `.env.local` dan isi semua nilai yang diperlukan. Lihat bagian [Environment Variables](#-environment-variables) di bawah.

### 5. Jalankan Migrasi Database

Buka **Supabase SQL Editor** dan jalankan file migrasi berikut:

- **Instalasi baru** — gunakan file gabungan:
  ```
  supabase/00_COMBINED_ALL_MIGRATIONS.sql
  ```
- **Migrasi bertahap** — tersedia di:
  ```
  supabase/migrations/
  ```

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Environment Variables

Salin dari `.env.example` dan isi nilai berikut pada `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Jangan pernah commit `.env.local` atau secret API ke repository.**

---

## Perintah

```bash
npm run dev            # Jalankan development server
npm run build          # Buat production build
npm run start          # Jalankan production build

npm run type-check     # Periksa tipe TypeScript
npm run test           # Jalankan test sekali
npm run test:watch     # Jalankan test dalam watch mode
npm run test:coverage  # Laporan coverage

npm run format         # Format file dengan Prettier
```

---

## Struktur Project

```
mindbloom/
├── src/
│   ├── app/           # Halaman, layout, route API, middleware (Next.js App Router)
│   ├── components/    # Komponen UI berdasarkan domain fitur
│   ├── lib/           # Integrasi Supabase, AI, memory, payment, utilitas
│   ├── store/         # Zustand stores
│   └── types/         # TypeScript types dan test domain
├── supabase/
│   ├── migrations/    # File migrasi database berurutan
│   └── 00_COMBINED_ALL_MIGRATIONS.sql
├── docs/              # Dokumentasi integrasi dan laporan verifikasi
├── .env.example
└── README.md
```

---

## 🛡 Keamanan & Deployment

Sebelum deploy ke production, pastikan checklist berikut terpenuhi:

- [ ] Semua environment variable sudah diisi pada platform deployment (misalnya Vercel)
- [ ] Migrasi database sudah diterapkan
- [ ] `npm run type-check` berhasil tanpa error
- [ ] `npm run test` berhasil tanpa kegagalan
- [ ] `npm run build` berhasil tanpa error
- [ ] Ubah `MIDTRANS_IS_PRODUCTION=true` **hanya** saat siap menerima pembayaran live
- [ ] Gunakan credential production Midtrans saat go-live

---

## Status Verifikasi

Project ini merupakan hasil integrasi beberapa sprint fitur MindBloom. Detail lengkap mengenai perbaikan integrasi, kompatibilitas Next.js, database typing, dan rate limiting tersedia di:

[`docs/MERGE_REPORT.md`](docs/MERGE_REPORT.md)

---

## Lisensi

Lisensi belum ditentukan. Tambahkan file `LICENSE` dan perbarui bagian ini ketika lisensi project sudah diputuskan.

---

<div align="center">

Dibuat dengan ❤️ untuk kesehatan mental yang lebih baik.

</div>
