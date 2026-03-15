'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { updatePasswordClient } from '@/utils/supabase/auth-client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await updatePasswordClient(formData)
    if (res?.error) {
      setError(res.error)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-center items-center p-6 mesh-bg relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-72 h-72 bg-[#268C7F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-[#E1803A]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
          <form action={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl text-gray-800 font-bold">New Password</h2>
              <p className="font-body text-xs text-gray-500 mt-1">Set your new access credentials</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">New Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#268C7F] focus:ring-1 focus:ring-[#268C7F]/50 transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-[#268C7F] hover:bg-[#1E7469] text-white font-display font-bold text-lg py-4 rounded-xl shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
