// ============================================================
// MindBloom — Root Page (redirect)
// File: src/app/page.tsx
// ============================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  redirect("/dashboard");
}
