import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (tokenHash && type === 'recovery') {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash,
    })

    if (!error && data.user) {
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