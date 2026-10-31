import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/theme-provider'
import './globals.css'
import { Toaster } from '@/components/ui/sonner';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NexusUni',
  description: 'Gestión académica',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
    <body
      className={`${inter.className} bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}
    >
      <ThemeProvider>
        {children}
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </body>
  </html>
  )
}