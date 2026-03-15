'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { loginClient, signupClient, sendMagicLinkClient, forgotPasswordClient } from '@/utils/supabase/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'customer' | 'manager' | 'forgot'>('customer')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleCustomerAuth(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const action = isLogin ? loginClient : signupClient
    const res = await action(formData)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  async function handleForgotPassword(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const res = await forgotPasswordClient(formData)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else if (res?.success) {
      setMessage({ type: 'success', text: res.success })
    }
    setLoading(false)
  }

  async function handleManagerAuth(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const res = await sendMagicLinkClient(formData)
    if (res?.error) {
      setMessage({ type: 'error', text: res.error })
    } else if (res?.success) {
      setMessage({ type: 'success', text: res.success })
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
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <div className="mb-10 text-center">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-display font-black tracking-tighter text-gray-800 mb-2 shiny-text"
          >
            DD's Kitchen
          </motion.h1>
          <p className="font-subheading text-[#268C7F] text-lg italic tracking-wide">
            A Gourmet Marketplace
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />

          <div className="flex relative z-10 bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => { setMode('customer'); setMessage(null) }}
              className={`flex-1 py-2.5 text-sm font-display font-bold rounded-xl transition-all duration-300 ${
                mode === 'customer' 
                  ? 'bg-[#268C7F] text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => { setMode('manager'); setMessage(null) }}
              className={`flex-1 py-2.5 text-sm font-display font-bold rounded-xl transition-all duration-300 ${
                mode === 'manager' 
                  ? 'bg-[#E1803A] text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manager
            </button>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`p-4 rounded-xl text-sm font-display font-medium border ${
                  message.type === 'error' 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-green-50 border-green-200 text-green-600'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode + (isLogin ? 'login' : 'signup')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {mode === 'customer' ? (
                <form action={handleCustomerAuth} className="space-y-5">
                  <div className="text-center mb-6">
                    <h2 className="font-heading text-2xl text-gray-800 font-bold">
                      {isLogin ? 'Welcome Back' : 'Join the Kitchen'}
                    </h2>
                    <p className="font-body text-xs text-gray-500 mt-1">
                      {isLogin ? 'Access your exclusive menu.' : 'Discover curated gourmet dishes.'}
                    </p>
                  </div>

                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">Full Name</label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#268C7F] focus:ring-1 focus:ring-[#268C7F]/50 transition-all placeholder:text-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#268C7F] focus:ring-1 focus:ring-[#268C7F]/50 transition-all placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#268C7F] focus:ring-1 focus:ring-[#268C7F]/50 transition-all placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full bg-[#268C7F] hover:bg-[#1E7469] text-white font-display font-bold text-lg py-4 rounded-xl shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                  </motion.button>

                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
                      className="text-sm font-subheading text-gray-500 hover:text-gray-700 transition-colors underline decoration-gray-300 underline-offset-4"
                    >
                      {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                    
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setMessage(null); }}
                        className="text-xs font-subheading text-[#268C7F] hover:text-[#1E7469] transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                </form>
              ) : mode === 'forgot' ? (
                <form action={handleForgotPassword} className="space-y-5">
                   <div className="text-center mb-6">
                    <h2 className="font-heading text-2xl text-gray-800 font-bold">
                      Reset Password
                    </h2>
                    <p className="font-body text-xs text-gray-500 mt-1">
                      Enter your email to receive a reset link.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#268C7F] focus:ring-1 focus:ring-[#268C7F]/50 transition-all placeholder:text-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full bg-[#268C7F] hover:bg-[#1E7469] text-white font-display font-bold text-lg py-4 rounded-xl shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </motion.button>
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => { setMode('customer'); setMessage(null); }}
                      className="text-sm font-subheading text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              ) : (
                <form action={handleManagerAuth} className="space-y-5">
                   <div className="text-center mb-6">
                    <h2 className="font-heading text-2xl text-gray-800 font-bold">
                      Command Center Access
                    </h2>
                    <p className="font-body text-xs text-gray-500 mt-1">
                      Magic link authentication for staff.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-display font-bold text-gray-600 uppercase tracking-wider ml-1">Manager Email</label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="admin@ddskitchen.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-gray-800 font-body focus:outline-none focus:border-[#E1803A] focus:ring-1 focus:ring-[#E1803A]/50 transition-all placeholder:text-gray-400"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E1803A] shadow-lg animate-pulse" />
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full bg-[#E1803A] hover:bg-[#C86A28] text-white font-display font-bold text-lg py-4 rounded-xl shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {loading ? 'Sending link...' : 'Send Magic Link'}
                  </motion.button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        setLoading(true);
                        const formData = new FormData();
                        formData.append('email', 'sdheepak62@gmail.com');
                        formData.append('password', 'ddskitchen123');
                        const res = await loginClient(formData);
                        if (res?.error) setMessage({ type: 'error', text: res.error });
                        else router.push('/admin/dash');
                        setLoading(false);
                      }}
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-display font-bold text-sm py-3 rounded-xl border border-amber-200 mt-4 transition-colors"
                    >
                      [DEV] 1-Click Login (sdheepak)
                    </motion.button>
                  )}
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
