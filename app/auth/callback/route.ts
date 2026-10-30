import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Obliga a crear una contraseña nueva antes de usar el sistema
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', data.user.id)

      return NextResponse.redirect(new URL('/change-password?recovery=1', request.url))
    }
  }

  return NextResponse.redirect(new URL('/forgot-password?error=invalid', request.url))
}