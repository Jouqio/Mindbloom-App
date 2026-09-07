// ============================================================
// MindBloom — Forgot Password Page
// File: src/app/(auth)/forgot-password/page.tsx
// ============================================================

import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, AuthFooter } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Reset password akun MindBloom kamu.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthCard
        title="Lupa password?"
        subtitle="Masukkan emailmu dan kami akan kirimkan link untuk reset password"
      >
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 animate-pulse rounded-xl bg-muted" />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </AuthCard>

      <AuthFooter
        question="Sudah ingat password?"
        linkText="Kembali masuk"
        href="/login"
      />
    </>
  );
}
