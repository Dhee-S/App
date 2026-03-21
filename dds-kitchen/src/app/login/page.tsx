'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { loginClient, signupClient, forgotPasswordClient } from '@/utils/supabase/auth-client'
import Image from 'next/image'
import { Sparkles, ArrowRight, User, Key, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showForgot, setShowForgot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const checkRoleAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'MANAGER') {
      router.push('/admin/dash')
    } else {
      router.push('/')
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    if (showForgot) {
      const res = await forgotPasswordClient(formData)
      if (res?.error) setMessage({ type: 'error', text: res.error })
      else if (res?.success) setMessage({ type: 'success', text: res.success })
      setLoading(false)
      return
    }

    const action = isLogin ? loginClient : signupClient
    const res = await action(formData)

    if (res?.error) {
       setMessage({ type: 'error', text: res.error })
       setLoading(false)
    } else {
       const { data: { session } } = await supabase.auth.getSession()
       if (session) {
          await checkRoleAndRedirect()
       } else {
          setMessage({ type: 'success', text: 'Verification link sent to your inbox.' })
          setLoading(false)
       }
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 bg-[#F8F9FA] relative font-jakarta">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm z-10"
      >
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            className="w-32 h-32 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
          >
            <Image 
              src="/logo.jpg" 
              alt="DD's Kitchen Logo" 
              fill 
              className="object-contain p-2"
              priority
            />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-1 font-trirong">DD's Kitchen</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#268C7F]">Gourmet Marketplace</p>
        </header>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border ${
                  message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/10 text-[#268C7F]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              {showForgot ? 'Reset Access' : isLogin ? 'Sign In' : 'Sign Up'}
              <Sparkles size={16} className="text-[#268C7F]" />
            </h2>

            {!isLogin && !showForgot && (
              <div className="space-y-1.5 group">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Identity</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input name="fullName" type="text" required placeholder="Full Name" className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold" />
                </div>
              </div>
            )}

            <div className="space-y-1.5 group">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input name="email" type="email" required placeholder="you@example.com" className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold" />
              </div>
            </div>

            {!showForgot && (
              <div className="space-y-1.5 group">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                <div className="relative">
                  <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input name="password" type="password" required placeholder="••••••••" className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold" />
                </div>
              </div>
            )}

            <motion.button 
              whileTap={{ scale: 0.98 }} 
              disabled={loading}
              className="w-full bg-[#268C7F] text-white font-black uppercase tracking-[0.2em] text-[11px] py-4.5 rounded-2xl shadow-lg shadow-[#268C7F]/20 hover:bg-[#1E7469] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showForgot ? 'Reset' : isLogin ? 'Access' : 'Continue'}
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>

            <div className="flex flex-col gap-3 pt-6 border-t border-gray-50 text-center">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setShowForgot(false); setMessage(null); }}
                className="text-[10px] font-black uppercase tracking-widest text-[#268C7F]"
              >
                {isLogin ? "Create an account" : "Back to Sign In"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgot(!showForgot)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300"
              >
                {showForgot ? "Cancel" : "Forgot Password?"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
