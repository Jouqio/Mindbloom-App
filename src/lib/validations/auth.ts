import { z } from 'zod'
export const signupSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72)
    .regex(/[A-Z]/, 'Harus ada 1 huruf kapital').regex(/[0-9]/, 'Harus ada 1 angka'),
  confirm_password: z.string().min(1, 'Wajib diisi'),
}).refine(d => d.password === d.confirm_password, { message: 'Password tidak cocok', path: ['confirm_password'] })
export type SignupSchema = z.infer<typeof signupSchema>
export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi').max(72),
})
export type LoginSchema = z.infer<typeof loginSchema>
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
})
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter').max(72)
    .regex(/[A-Z]/, 'Harus ada 1 huruf kapital').regex(/[0-9]/, 'Harus ada 1 angka'),
  confirm_password: z.string().min(1, 'Wajib diisi'),
}).refine(d => d.password === d.confirm_password, { message: 'Password tidak cocok', path: ['confirm_password'] })
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const onboardingSchema = z.object({
  display_name:   z.string().min(1, 'Nama panggilan wajib diisi').max(50),
  journaling_goal: z.enum([
    'reduce_stress', 'self_awareness', 'build_habits', 'mental_health', 'productivity',
  ]).optional(),
  reminder_time:  z.string().optional(),
})
export type OnboardingSchema = z.infer<typeof onboardingSchema>
