// ============================================================
// MindBloom — Terms of Service Page
// File: src/app/terms/page.tsx
// Public page, no auth required — linked from SignupForm.tsx
// ============================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan layanan MindBloom.',
}

const LAST_UPDATED = '13 Juli 2026'

export default function TermsPage() {
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
        <h1 className="text-2xl font-medium text-foreground">Syarat &amp; Ketentuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Terakhir diperbarui: {LAST_UPDATED}</p>
      </div>

      <div className="flex flex-col gap-7 text-sm leading-relaxed text-foreground">
        <section>
          <p className="text-muted-foreground">
            Dengan membuat akun dan menggunakan MindBloom, kamu menyetujui syarat dan ketentuan berikut.
            Mohon dibaca dengan saksama.
          </p>
        </section>

        <Section title="1. Tentang Layanan">
          <p className="text-muted-foreground">
            MindBloom adalah aplikasi jurnal refleksi harian berbasis AI yang menyediakan fitur
            penulisan jurnal, pelacakan mood dan habit, AI Reflection Coach (&ldquo;Bloom&rdquo;),
            dan analitik personal. MindBloom adalah alat bantu refleksi diri —{' '}
            <strong className="text-foreground">
              bukan pengganti konsultasi profesional kesehatan mental, terapi, atau penanganan medis.
            </strong>
          </p>
        </Section>

        <Section title="2. Bukan Layanan Darurat">
          <p className="text-muted-foreground">
            Bloom AI Coach dirancang untuk mendukung refleksi harian, bukan untuk menangani krisis
            kesehatan mental. Jika kamu atau seseorang yang kamu kenal berada dalam bahaya atau
            krisis, segera hubungi layanan darurat setempat atau hotline krisis kesehatan mental
            di negaramu — jangan mengandalkan MindBloom dalam situasi darurat.
          </p>
        </Section>

        <Section title="3. Akun Kamu">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Kamu bertanggung jawab menjaga kerahasiaan kredensial akunmu.</li>
            <li>Kamu harus berusia minimal 13 tahun untuk menggunakan MindBloom.</li>
            <li>Satu akun hanya untuk satu individu — akun tidak boleh dibagikan.</li>
            <li>Kami berhak menangguhkan akun yang melanggar ketentuan ini atau menyalahgunakan layanan (termasuk mencoba membebani sistem AI secara berlebihan).</li>
          </ul>
        </Section>

        <Section title="4. Konten Kamu">
          <p className="text-muted-foreground">
            Kamu memiliki sepenuhnya konten jurnal yang kamu tulis. Kami tidak mengklaim kepemilikan
            atas kontenmu. Dengan menggunakan fitur AI (Bloom Coach, insight, pencarian semantik),
            kamu memberi izin kepada kami untuk memproses konten tersebut melalui penyedia AI pihak
            ketiga (OpenAI) semata-mata untuk menyediakan fitur yang kamu minta — lihat{' '}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Kebijakan Privasi
            </Link>{' '}
            untuk detail lengkap.
          </p>
        </Section>

        <Section title="5. Langganan &amp; Pembayaran">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>MindBloom menyediakan paket Free, Premium, dan Pro sebagaimana dijelaskan di halaman <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">Paket Harga</Link>.</li>
            <li>Trial 7 hari berlaku untuk pelanggan baru dan dapat dibatalkan kapan saja sebelum trial berakhir tanpa biaya.</li>
            <li>Langganan diperpanjang otomatis sesuai siklus tagihan (bulanan/tahunan) kecuali dibatalkan.</li>
            <li>Pembatalan berlaku pada akhir periode tagihan yang sedang berjalan — tidak ada pengembalian dana prorata untuk periode yang belum digunakan, kecuali diwajibkan oleh hukum yang berlaku.</li>
            <li>Semua transaksi diproses oleh Midtrans sebagai payment processor pihak ketiga.</li>
          </ul>
        </Section>

        <Section title="6. Batasan Penggunaan yang Wajar">
          <p className="text-muted-foreground">
            Untuk menjaga layanan tetap dapat diandalkan bagi semua pengguna, kami menerapkan batas
            wajar pada beberapa fitur (misalnya jumlah pesan ke Bloom AI per hari, jumlah insight
            yang di-generate per periode). Batas ini dijelaskan pada halaman paket masing-masing dan
            dapat berubah dari waktu ke waktu.
          </p>
        </Section>

        <Section title="7. Penghentian Layanan">
          <p className="text-muted-foreground">
            Kamu dapat menghapus akunmu kapan saja melalui pengaturan akun. Kami berhak menangguhkan
            atau menghentikan akses ke layanan jika terjadi pelanggaran ketentuan ini, aktivitas yang
            mencurigakan, atau penyalahgunaan sistem.
          </p>
        </Section>

        <Section title="8. Batasan Tanggung Jawab">
          <p className="text-muted-foreground">
            MindBloom disediakan &ldquo;sebagaimana adanya&rdquo;. Respons dari Bloom AI Coach
            dihasilkan oleh model bahasa AI dan dapat mengandung ketidakakuratan — gunakan
            pertimbangan pribadimu dan konsultasikan dengan profesional untuk keputusan penting
            terkait kesehatan mental atau kondisi hidup lainnya.
          </p>
        </Section>

        <Section title="9. Perubahan Ketentuan">
          <p className="text-muted-foreground">
            Kami dapat memperbarui ketentuan ini dari waktu ke waktu. Penggunaan berkelanjutan atas
            layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.
          </p>
        </Section>

        <Section title="10. Hubungi Kami">
          <p className="text-muted-foreground">
            Pertanyaan tentang ketentuan ini? Email{' '}
            <a href="mailto:support@mindbloom.app" className="text-primary underline-offset-4 hover:underline">
              support@mindbloom.app
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
