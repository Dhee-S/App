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

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `https://ddskitchen.netlify.app/auth/callback/`,
    }
  })

  if (error) return { error: error.message }
  
  // Create profile
  if (signUpData.user) {
    await supabase.from('profiles').insert({
      id: signUpData.user.id,
      full_name: fullName,
      role: 'CUSTOMER'
    })
  }

  return { success: true, user: signUpData.user }
}

export async function sendMagicLinkClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `https://ddskitchen.netlify.app/auth/callback/`,
    },
  })

  if (error) return { error: error.message }
  return { success: 'Magic link sent! Check your email.' }
}

export async function forgotPasswordClient(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `https://ddskitchen.netlify.app/auth/callback/?next=/auth/reset-password/`,
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
