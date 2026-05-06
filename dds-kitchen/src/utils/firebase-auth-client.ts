import { auth, googleProvider } from './firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth'
import { createClient } from './supabase/client'

export async function loginClient(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function loginWithGoogle() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)
    const user = userCredential.user
    
    // Check if profile exists, if not create one
    const supabase = createClient()
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.uid).single()
    
    if (!profile) {
      await supabase.from('profiles').insert({
        id: user.uid,
        full_name: user.displayName || 'Google User',
        role: 'CUSTOMER'
      })
    }
    
    return { success: true, user }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function signupClient(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create profile in Supabase
    const supabase = createClient()
    await supabase.from('profiles').insert({
      id: user.uid,
      full_name: fullName,
      role: 'CUSTOMER'
    })

    return { success: true, user }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function forgotPasswordClient(formData: FormData) {
  const email = formData.get('email') as string

  try {
    await sendPasswordResetEmail(auth, email)
    return { success: 'Password reset link sent! Check your email.' }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function logoutClient() {
  try {
    await auth.signOut()
  } catch (error) {
    console.error("Error signing out: ", error)
  }
}
