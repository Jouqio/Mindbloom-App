// ============================================================
// MindBloom — Dashboard Group Loading State
// File: src/app/(dashboard)/loading.tsx
// Shown automatically by Next.js while any (dashboard) page's
// server component is fetching data.
// ============================================================

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <div className="flex flex-col gap-4 animate-pulse">
        <div>
          <div className="h-6 w-40 rounded-lg bg-muted mb-2" />
          <div className="h-4 w-56 rounded-lg bg-muted" />
        </div>
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-muted" />
      </div>
    </main>
  )
}
