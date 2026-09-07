<h1 align="center">MindBloom</h1>

<p align="center">Aplikasi personal wellness jurnal, habit tracking, breathing exercises, dan AI Coach dalam satu platform.</p>

<p align="center"><sub>Bukan pengganti diagnosis atau saran dari tenaga kesehatan profesional.</sub></p>

## Memulai

```bash
git clone https://github.com/username/mindbloom.git
cd mindbloom
npm install
cp .env.example .env.local   # Windows: Copy-Item .env.example .env.local
```

Isi `.env.local`, jalankan migrasi di Supabase SQL Editor, lalu:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Environment

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

## Database

Untuk instalasi baru, jalankan `supabase/00_COMBINED_ALL_MIGRATIONS.sql` di Supabase SQL Editor. Migrasi individual tersedia di `supabase/migrations/`.

## Stack

| | |
|---|---|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js%2015-000?logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React%2019-20232A?logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white) ![Framer](https://img.shields.io/badge/Framer-0055FF?logo=framer&logoColor=white) |
| **Backend** | ![Next.js Server Actions](https://img.shields.io/badge/Next.js%20(Server%20Actions)-000?logo=nextdotjs&logoColor=white) |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) |
| **AI** | ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) |
| **Payment** | ![Midtrans](https://img.shields.io/badge/Midtrans-009FE3?logoColor=white) |
| **State** | ![Zustand](https://img.shields.io/badge/Zustand-000?logo=zustand&logoColor=white) |
| **Testing** | ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white) |

## Scripts

```bash
npm run dev             # development server
npm run build           # production build
npm run type-check      # TypeScript check
npm run test            # run tests
npm run test:coverage   # coverage report
npm run format          # Prettier
```

## Struktur

```
src/app/          # routes, API handlers, middleware
src/components/   # UI components per domain
src/lib/          # Supabase, OpenAI, Midtrans, utilities
src/store/        # Zustand stores
src/types/        # TypeScript types
supabase/         # migrations dan RLS policies
docs/             # integration docs
```

## Deployment

Salin semua environment variable ke platform deployment. Ubah `MIDTRANS_IS_PRODUCTION` ke `true` hanya saat menggunakan credential production Midtrans. Pastikan `type-check`, `test`, dan `build` lolos sebelum deploy.

Detail perbaikan integrasi tersedia di [`docs/MERGE_REPORT.md`](docs/MERGE_REPORT.md).

## Lisensi

MindBloom menggunakan **PolyForm Noncommercial License 1.0.0**.

Penggunaan, modifikasi, dan distribusi diperbolehkan untuk tujuan
nonkomersial sesuai dengan ketentuan lisensi. Penggunaan komersial
memerlukan izin atau lisensi komersial terpisah.

SPDX-License-Identifier: `PolyForm-Noncommercial-1.0.0`

Lihat [LICENSE](LICENSE) untuk ketentuan lengkap.
