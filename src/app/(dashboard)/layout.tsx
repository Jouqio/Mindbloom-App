// ============================================================
// MindBloom — Protected Dashboard Layout (Sprint 2)
// File: src/app/(dashboard)/layout.tsx
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded_at, display_name, plan")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarded_at) {
      const { redirect } = await import("next/navigation");
      redirect("/onboarding");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

