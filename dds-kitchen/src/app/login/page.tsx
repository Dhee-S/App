'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { loginClient, signupClient, forgotPasswordClient } from '@/utils/supabase/auth-client'
import { BentoCard } from '@/components/BentoCard'
import { Sparkles, ArrowRight, User, Key, Mail, ChevronLeft, LayoutDashboard, Utensils } from 'lucide-react'

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
       // Check if user is logged in (Signup might not auto-login if confirmation is required)
       const { data: { session } } = await supabase.auth.getSession()
       if (session) {
          await checkRoleAndRedirect()
       } else {
          setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox for access.' })
          setLoading(false)
       }
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 mesh-bg overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#268C7F]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E1803A]/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm z-10"
      >
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-gray-100"
          >
            <Utensils className="text-[#268C7F]" size={28} />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text mb-1">DD's Kitchen</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Gourmet Protocol V2</p>
        </header>

        <BentoCard className="p-8 relative overflow-hidden backdrop-blur-xl bg-white/70 border-gray-100 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#268C7F] via-[#E1803A] to-[#268C7F]" />

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border ${
                  message.type === 'error' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/20 text-[#268C7F]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              {showForgot ? 'Reset Access' : isLogin ? 'Welcome Back' : 'Create Account'}
              <Sparkles size={16} className="text-[#268C7F]" />
            </h2>

            {!isLogin && !showForgot && (
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Identity</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input name="fullName" type="text" required placeholder="Chef Name" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:ring-4 focus:ring-[#268C7F]/5 transition-all text-gray-800 font-bold" />
                </div>
              </div>
            )}

            <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Terminal</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input name="email" type="email" required placeholder="you@kitchen.com" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:ring-4 focus:ring-[#268C7F]/5 transition-all text-gray-800 font-bold" />
              </div>
            </div>

            {!showForgot && (
              <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Secure Pass</label>
                <div className="relative">
                  <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input name="password" type="password" required placeholder="••••••••" className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-10 py-3.5 text-sm focus:outline-none focus:border-[#268C7F] focus:ring-4 focus:ring-[#268C7F]/5 transition-all text-gray-800 font-bold" />
                </div>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              disabled={loading}
              className="w-full bg-gray-800 text-white font-black uppercase tracking-[0.2em] text-[11px] py-4 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-2 group mt-4 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showForgot ? 'Initialize Reset' : isLogin ? 'Access Portal' : 'Register Member'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setShowForgot(false); setMessage(null); }}
                className="text-[10px] font-black uppercase tracking-widest text-[#268C7F] hover:text-[#1E7469] flex items-center justify-center gap-2"
              >
                {isLogin ? "Join the Kitchen League" : "Already a Member? Enter"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgot(!showForgot)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500"
              >
                {showForgot ? "Back to Login" : "Lost access key?"}
              </button>
            </div>
          </form>
        </BentoCard>

        {/* Unified "Manager/Admin" info - subtle */}
        <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-40">
           Admin Access verified by Profile Identity
        </p>
      </motion.div>
    </div>
  )
}
