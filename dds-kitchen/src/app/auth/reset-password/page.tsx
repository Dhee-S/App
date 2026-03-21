'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { updatePasswordClient } from '@/utils/supabase/auth-client'
import { BentoCard } from '@/components/BentoCard'
import { Key, ArrowRight, ShieldCheck, Utensils } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const res = await updatePasswordClient(formData)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      setMessage({ type: 'success', text: 'Protocol Updated. Launching Dashboard...' })
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 mesh-bg overflow-hidden relative font-jakarta">
      {/* Aurora Background Effects - Consistent with Login */}
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
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100"
          >
            <Utensils className="text-[#268C7F]" size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text mb-1 font-trirong">New Access Phrase</h1>
        </header>

        <BentoCard className="p-10 relative overflow-hidden backdrop-blur-3xl bg-white/80 border-[#268C7F]/10 shadow-2xl rounded-[3rem]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#268C7F]" />

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className={`mb-8 p-5 rounded-3xl text-[11px] font-black uppercase tracking-widest border-2 ${
                  message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-[#268C7F]/5 border-[#268C7F]/20 text-[#268C7F]'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 transition-colors group-focus-within:text-[#268C7F]">Secure Credentials</label>
              <div className="relative">
                <Key size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#268C7F]" />
                <input name="password" type="password" required minLength={6} placeholder="New Passphrase" className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-[#268C7F] focus:bg-white transition-all text-gray-800 font-bold" />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              disabled={loading}
              className="w-full bg-[#268C7F] text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[1.5rem] shadow-xl shadow-[#268C7F]/20 flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Update Access
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </BentoCard>
      </motion.div>
    </div>
  )
}
