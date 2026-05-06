'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { loginClient, signupClient, forgotPasswordClient, loginWithGoogle } from '@/utils/firebase-auth-client'
import Image from 'next/image'
import { Sparkles, ArrowRight, User, Key, Mail, ChefHat } from 'lucide-react'
import { BentoCard } from '@/components/BentoCard'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showForgot, setShowForgot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const checkRoleAndRedirect = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
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
    } else if (res?.user) {
       await checkRoleAndRedirect(res.user.uid)
    } else {
       setMessage({ type: 'success', text: 'Success! Redirecting...' })
       setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 relative font-jakarta overflow-hidden mesh-bg">
      {/* High-Fidelity Aurora Background */}
      <div className="aurora overflow-hidden pointer-events-none opacity-50">
        <div className="aurora-blob bg-[#268C7F]/30" />
        <div className="aurora-blob-2 bg-[#CE9146]/20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-sm z-10"
      >
        <header className="mb-12 text-center relative">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -15 }} 
            animate={{ scale: 1, opacity: 1, rotate: 0 }} 
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            className="w-36 h-36 bg-white rounded-[3rem] shadow-2xl shadow-[#268C7F]/20 border-4 border-white flex items-center justify-center mx-auto mb-6 relative overflow-hidden group"
          >
            <Image 
              src="/logo.jpg" 
              alt="DD's Kitchen Logo" 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#268C7F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-1"
          >
            <h1 className="text-5xl font-black text-gray-800 tracking-tighter font-trirong flex items-center justify-center gap-2">
              DD's Kitchen
              <Sparkles size={24} className="text-[#CE9146] animate-pulse" />
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#268C7F] opacity-60">The Masterpiece Marketplace</p>
          </motion.div>
        </header>

        <BentoCard className="p-10 relative overflow-hidden bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_40px_120px_rgba(38,140,127,0.08)] border border-white">
          {/* Noise/Grain Overlay */}
          <div className="absolute inset-0 noise-overlay opacity-[0.04] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-8 p-5 rounded-3xl text-[10px] font-black uppercase tracking-widest border text-center leading-relaxed ${
                  message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/10 text-[#268C7F]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-6 relative z-10">
            {(!isLogin && !showForgot) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#268C7F] transition-colors">
                  <User size={18} />
                </div>
                <input
                  name="fullName"
                  type="text"
                  placeholder="FULL NAME"
                  required
                  className="w-full bg-gray-50/40 border border-gray-100/50 pl-16 pr-6 py-6 rounded-[1.8rem] text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-[#268C7F]/5 focus:bg-white transition-all tracking-widest uppercase placeholder:text-gray-300"
                />
              </motion.div>
            )}

            {!showForgot && (
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#268C7F] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  required
                  className="w-full bg-gray-50/40 border border-gray-100/50 pl-16 pr-6 py-6 rounded-[1.8rem] text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-[#268C7F]/5 focus:bg-white transition-all tracking-widest uppercase placeholder:text-gray-300"
                />
              </div>
            )}

            {isLogin && !showForgot && (
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#268C7F] transition-colors">
                  <Key size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  className="w-full bg-gray-50/40 border border-gray-100/50 pl-16 pr-6 py-6 rounded-[1.8rem] text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-[#268C7F]/5 focus:bg-white transition-all tracking-widest uppercase placeholder:text-gray-300"
                />
              </div>
            )}

            {showForgot && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative group">
                 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#268C7F] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="REGISTERED EMAIL"
                  required
                  className="w-full bg-gray-50/40 border border-gray-100/50 pl-16 pr-6 py-6 rounded-[1.8rem] text-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-[#268C7F]/5 focus:bg-white transition-all tracking-widest uppercase placeholder:text-gray-300"
                />
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#268C7F] to-[#1f7066] text-white py-6 rounded-[1.8rem] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-[#268C7F]/30 hover:shadow-[#268C7F]/40 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">{showForgot ? 'Reset Password' : isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform relative z-10" />
                </>
              )}
            </motion.button>

            {isLogin && !showForgot && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100/50"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-black tracking-widest uppercase">Or</span>
                  <div className="flex-grow border-t border-gray-100/50"></div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    const res = await loginWithGoogle();
                    if (res?.error) {
                      setMessage({ type: 'error', text: res.error });
                      setLoading(false);
                    } else if (res?.user) {
                      await checkRoleAndRedirect(res.user.uid);
                    }
                  }}
                  className="w-full bg-white text-gray-800 py-6 rounded-[1.8rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:bg-gray-50 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  <span className="relative z-10">Sign in with Google</span>
                </motion.button>
              </>
            )}

            <div className="flex flex-col gap-5 pt-8 border-t border-gray-50 text-center">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setShowForgot(false); setMessage(null); }}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-[#268C7F] hover:opacity-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLogin ? "Sign Up" : "Back to Sign In"}
                <ChefHat size={14} className="opacity-40" />
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgot(!showForgot)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-gray-400 transition-colors"
              >
                {showForgot ? "Cancel" : "Forgot Password?"}
              </button>
            </div>
          </form>
        </BentoCard>

        {/* Branding Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-[11px] font-black uppercase tracking-[0.6em] text-gray-200 select-none"
        >
          Authentic • Secure • Realtime
        </motion.p>
      </motion.div>
    </div>
  )
}
