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
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 relative font-jakarta overflow-hidden mesh-bg">
      {/* Premium Aurora Background Layers */}
      <div className="aurora overflow-hidden pointer-events-none opacity-40">
        <div className="aurora-blob bg-[#268C7F]/20" />
        <div className="aurora-blob-2 bg-[#CE9146]/20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm z-10"
      >
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.8, rotate: -5 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: 'spring', damping: 15 }}
            className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl shadow-[#268C7F]/10 border border-[#268C7F]/5 flex items-center justify-center mx-auto mb-6 relative overflow-hidden group"
          >
            <Image 
              src="/App/logo.jpg" 
              alt="DD's Kitchen Logo" 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#268C7F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter mb-1 font-trirong drop-shadow-sm">DD's Kitchen</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#268C7F] opacity-70">The Soul of Discovery</p>
          </motion.div>
        </header>

        <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(38,140,127,0.06)] border border-white relative overflow-hidden">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className={`mb-8 p-5 rounded-3xl text-[10px] font-black uppercase tracking-widest border text-center ${
                  message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/10 text-[#268C7F]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-6 relative z-10">
            {(!isLogin && !showForgot) && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                  <User size={16} />
                </div>
                <input
                  name="fullName"
                  type="text"
                  placeholder="FULL NAME"
                  required
                  className="w-full bg-gray-50/50 border border-gray-100/50 pl-14 pr-6 py-5 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#268C7F]/20 focus:bg-white transition-all tracking-widest uppercase"
                />
              </motion.div>
            )}

            {!showForgot && (
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                  <Mail size={16} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  required
                  className="w-full bg-gray-50/50 border border-gray-100/50 pl-14 pr-6 py-5 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#268C7F]/20 focus:bg-white transition-all tracking-widest uppercase"
                />
              </div>
            )}

            {isLogin && !showForgot && (
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                  <Key size={16} />
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  className="w-full bg-gray-50/50 border border-gray-100/50 pl-14 pr-6 py-5 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#268C7F]/20 focus:bg-white transition-all tracking-widest uppercase"
                />
              </div>
            )}

            {showForgot && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300">
                  <Mail size={16} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="REGISTERED EMAIL"
                  required
                  className="w-full bg-gray-50/50 border border-gray-100/50 pl-14 pr-6 py-5 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#268C7F]/20 focus:bg-white transition-all tracking-widest uppercase"
                />
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-[#268C7F] text-white py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#268C7F]/20 hover:bg-[#1f7066] disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showForgot ? 'Reset Protocol' : isLogin ? 'Access Kitchen' : 'Continue discovery'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <div className="flex flex-col gap-4 pt-8 border-t border-gray-50 text-center">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setShowForgot(false); setMessage(null); }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[#268C7F] hover:opacity-80 transition-opacity"
              >
                {isLogin ? "Join the Kitchen" : "Back to Protocol"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgot(!showForgot)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-gray-400 transition-colors"
              >
                {showForgot ? "Cancel" : "Forgot Credentials?"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
