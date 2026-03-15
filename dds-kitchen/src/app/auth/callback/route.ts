import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check user profile, if manager, redirect to /admin/dash
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
         if (profile && profile.role === 'MANAGER') {
            return NextResponse.redirect(`${origin}/admin/dash`)
         }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=Invalid_link`)
}
