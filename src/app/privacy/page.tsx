// ============================================================
// MindBloom — Privacy Policy Page
// File: src/app/privacy/page.tsx
// Public page, no auth required — linked from SignupForm.tsx
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Bagaimana MindBloom mengumpulkan, menggunakan, dan melindungi data pribadimu.',
}

const LAST_UPDATED = '13 Juli 2026'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Kebijakan Privasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Terakhir diperbarui: {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-7 text-sm leading-relaxed text-foreground">
        <section>
          <p className="text-muted-foreground">
            MindBloom (&ldquo;kami&rdquo;) menghargai kepercayaanmu. Jurnal yang kamu tulis di sini
            seringkali berisi hal-hal paling personal dalam hidupmu — kami menganggap serius
            tanggung jawab untuk melindunginya. Kebijakan ini menjelaskan data apa yang kami
            kumpulkan, bagaimana kami menggunakannya, dan hak-hak yang kamu miliki atasnya.
          </p>
        </section>

        <Section title="1. Data yang Kami Kumpulkan">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li><strong className="text-foreground">Data akun:</strong> email, nama, foto profil (jika login via Google).</li>
            <li><strong className="text-foreground">Konten jurnal:</strong> teks yang kamu tulis, skor mood, emosi yang dipilih, foto (jika ada).</li>
            <li><strong className="text-foreground">Data penggunaan:</strong> habit yang kamu buat, hasil Life Wheel, sesi breathing/soundscape, riwayat chat dengan Bloom AI.</li>
            <li><strong className="text-foreground">Data pembayaran:</strong> status langganan dan riwayat transaksi (nomor kartu/rekening tidak pernah kami simpan — itu ditangani langsung oleh Midtrans).</li>
            <li><strong className="text-foreground">Data teknis:</strong> alamat IP, jenis perangkat, dan log akses untuk keamanan dan mencegah penyalahgunaan.</li>
          </ul>
        </Section>

        <Section title="2. Bagaimana Data Digunakan">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Menyediakan fitur inti: jurnal, dashboard, Emotional Garden, achievement.</li>
            <li>
              <strong className="text-foreground">Diproses oleh AI</strong> (OpenAI) untuk fitur AI Coach (Bloom),
              perhitungan skor Emotional Intelligence, generate insight personal, dan pencarian jurnal
              semantik. Kami mengirim cuplikan jurnal dan konteks yang relevan ke OpenAI untuk fitur-fitur
              ini — OpenAI memproses data ini sesuai kebijakan API mereka dan tidak menggunakan data API
              untuk melatih model mereka.
            </li>
            <li>Mengirim pengingat menulis jurnal (jika diaktifkan).</li>
            <li>Memproses pembayaran langganan melalui Midtrans.</li>
            <li>Menganalisis pola penggunaan agregat untuk memperbaiki produk — data ini dianonimkan.</li>
          </ul>
        </Section>

        <Section title="3. Dengan Siapa Data Dibagikan">
          <p className="text-muted-foreground mb-2">
            Kami <strong className="text-foreground">tidak pernah menjual</strong> data pribadimu.
            Data hanya dibagikan dengan penyedia layanan yang membantu kami menjalankan MindBloom:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li><strong className="text-foreground">Supabase</strong> — penyimpanan database dan autentikasi.</li>
            <li><strong className="text-foreground">OpenAI</strong> — pemrosesan AI Coach, insight, dan pencarian semantik.</li>
            <li><strong className="text-foreground">Midtrans</strong> — pemrosesan pembayaran (kami tidak menyimpan detail kartu/rekeningmu).</li>
          </ul>
        </Section>

        <Section title="4. Keamanan Data">
          <p className="text-muted-foreground">
            Semua data disimpan dengan Row Level Security (RLS) di database kami — artinya secara teknis,
            hanya kamu yang bisa mengakses jurnal dan datamu sendiri, bahkan tim kami tidak melihat
            konten jurnalmu dalam operasional sehari-hari. Koneksi ke aplikasi dienkripsi (HTTPS/TLS).
          </p>
        </Section>

        <Section title="5. Hak-Hak Kamu">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Mengakses dan mengunduh seluruh data jurnalmu kapan saja.</li>
            <li>Meminta koreksi data yang tidak akurat.</li>
            <li>Menghapus akun dan seluruh data terkait secara permanen.</li>
            <li>Menonaktifkan fitur AI tertentu (misalnya, tidak menggunakan AI Coach) tanpa kehilangan akses ke fitur lain.</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Untuk menggunakan hak-hak ini, hubungi kami di{' '}
            <a href="mailto:privacy@mindbloom.app" className="text-primary underline-offset-4 hover:underline">
              privacy@mindbloom.app
            </a>.
          </p>
        </Section>

        <Section title="6. Penyimpanan Data">
          <p className="text-muted-foreground">
            Data disimpan selama akunmu aktif. Jika kamu menghapus akun, data jurnal dan pribadimu
            dihapus dari sistem produksi kami dalam waktu 30 hari, kecuali ada kewajiban hukum yang
            mengharuskan kami menyimpan data tertentu (misalnya catatan transaksi untuk keperluan pajak).
          </p>
        </Section>

        <Section title="7. Anak di Bawah Umur">
          <p className="text-muted-foreground">
            MindBloom ditujukan untuk pengguna berusia 13 tahun ke atas. Kami tidak dengan sengaja
            mengumpulkan data dari anak di bawah usia tersebut.
          </p>
        </Section>

        <Section title="8. Perubahan Kebijakan">
          <p className="text-muted-foreground">
            Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan signifikan akan
            diberitahukan melalui email atau notifikasi dalam aplikasi.
          </p>
        </Section>

        <Section title="9. Hubungi Kami">
          <p className="text-muted-foreground">
            Pertanyaan tentang privasi? Email{' '}
            <a href="mailto:privacy@mindbloom.app" className="text-primary underline-offset-4 hover:underline">
              privacy@mindbloom.app
            </a>
          </p>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-medium text-foreground">{title}</h2>
      {children}
    </section>
  )
}
