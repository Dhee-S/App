'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // After successful login, redirect to home page or checkout based on where they came from
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Usually signup requires email confirmation depending on Supabase settings.
  // For this development phase, if auto-confirm is on:
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  // We could check if they have the 'manager' role first before sending, 
  // but Supabase auth is generic. 
  // Wait, if it's a manager, we send the magic link.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // should_create_user: false, // Optional: Only allow existing managers to login
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Magic link sent! Check your email.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
