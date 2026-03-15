import { createClient } from './client'

export async function loginClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function signupClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function sendMagicLinkClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/App/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { success: 'Magic link sent! Check your email.' }
}

export async function forgotPasswordClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/App/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: 'Password reset link sent! Check your email.' }
}

export async function updatePasswordClient(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function logoutClient() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
