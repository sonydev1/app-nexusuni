import ThemeToggle from '@/components/theme-toggle'
import ForgotPasswordForm from '@/features/auth/components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="card w-full max-w-md space-y-6 p-6 sm:p-8">
        <ForgotPasswordForm />
      </div>
    </main>
  )
}