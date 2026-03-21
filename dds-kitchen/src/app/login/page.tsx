'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { loginClient, signupClient, forgotPasswordClient } from '@/utils/supabase/auth-client'
import { BentoCard } from '@/components/BentoCard'
import { Sparkles, ArrowRight, User, Key, Mail, Utensils, Zap } from 'lucide-react'

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
          setMessage({ type: 'success', text: 'Identity Verification Protocol initiated. Check your inbox.' })
          setLoading(false)
       }
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 mesh-bg overflow-hidden relative font-jakarta">
      {/* Aurora Background Effects - Based on project Visual DNA */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#268C7F]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#CE9146]/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm z-10"
      >
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }} 
            animate={{ scale: 1, rotate: 0 }} 
            className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100 relative group"
          >
            <div className="absolute inset-0 bg-[#268C7F]/5 rounded-[2rem] group-hover:bg-[#268C7F]/10 transition-colors" />
            <Utensils className="text-[#268C7F] relative z-10" size={32} />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-[#CE9146] rounded-xl flex items-center justify-center shadow-lg border-2 border-white z-20"
            >
               <Zap className="text-white fill-white" size={10} />
            </motion.div>
          </motion.div>
          
          <h1 className="text-5xl font-black text-gray-800 tracking-tighter shiny-text mb-2 font-trirong">DD's Kitchen</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#268C7F] opacity-80 font-jakarta">The High-Trust Marketplace</p>
        </header>

        <BentoCard className="p-10 relative overflow-hidden backdrop-blur-3xl bg-white/80 border-[#268C7F]/10 shadow-[0_40px_80px_rgba(38,140,127,0.12)] rounded-[3rem]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#268C7F] via-[#CE9146] to-[#268C7F]" />

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-8 p-5 rounded-3xl text-[11px] font-black uppercase tracking-widest border-2 ${
                  message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/20 text-[#268C7F]'
                } shadow-sm`}
              >
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-[#268C7F]'} animate-pulse`} />
                   {message.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              {showForgot ? 'Reset Protocol' : isLogin ? 'Access Portal' : 'Register Member'}
              <Sparkles size={20} className="text-[#CE9146]" />
            </h2>

            {!isLogin && !showForgot && (
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#268C7F]">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#268C7F]" />
                  <input name="fullName" type="text" required placeholder="Gourmet Explorer" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold placeholder:text-gray-300" />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#268C7F]">Email Key</label>
              <div className="relative">
                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#268C7F]" />
                <input name="email" type="email" required placeholder="you@kitchen.com" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold placeholder:text-gray-300" />
              </div>
            </div>

            {!showForgot && (
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#268C7F]">Secure Phrase</label>
                <div className="relative">
                  <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#268C7F]" />
                  <input name="password" type="password" required placeholder="••••••••" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold placeholder:text-gray-300" />
                </div>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              disabled={loading}
              className={`w-full ${isLogin ? 'bg-[#268C7F]' : 'bg-[#CE9146]'} text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[1.5rem] shadow-2xl shadow-black/10 transition-all flex items-center justify-center gap-3 group mt-8 relative overflow-hidden`}
            >
              <div className="absolute inset-x-0 h-full w-4 bg-white/20 blur-xl -translate-x-full group-hover:translate-x-[400px] transition-transform duration-1000" />
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showForgot ? 'Initialize Reset' : isLogin ? 'Launch Dashboard' : 'Create Account'}
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </motion.button>

            <div className="flex flex-col gap-4 pt-8 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setShowForgot(false); setMessage(null); }}
                className="text-[11px] font-black uppercase tracking-widest text-[#268C7F] hover:text-[#CE9146] flex items-center justify-center gap-2 transition-colors"
              >
                {isLogin ? "Join the Kitchen" : "Already a Member?"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgot(!showForgot)}
                className="text-[11px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-800 transition-colors"
              >
                {showForgot ? "Back to Login" : "Lost access credentials?"}
              </button>
            </div>
          </form>
        </BentoCard>

        {/* Branding Footer */}
        <p className="mt-12 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.6em] opacity-30 select-none">
           Authentic • Secure • Realtime
        </p>
      </motion.div>
    </div>
  )
}
