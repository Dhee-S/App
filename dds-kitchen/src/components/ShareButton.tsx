'use client'

import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from './Toast'

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  variant?: 'minimal' | 'full'
}

export function ShareButton({ 
  title = "DD's Kitchen", 
  text = "Check out these amazing gourmet dishes from DD's Kitchen!", 
  url = "https://ddskitchen.netlify.app/",
  variant = 'minimal'
}: ShareButtonProps) {
  const [shared, setShared] = useState(false)
  const { showToast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        showToast('Shared successfully!', 'success')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback for desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setShared(true)
        showToast('Link copied to clipboard!', 'success')
        setTimeout(() => setShared(false), 2000)
      } catch (err) {
        showToast('Failed to copy link', 'error')
      }
    }
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#268C7F] shadow-sm hover:shadow-md transition-shadow"
      >
        <AnimatePresence mode="wait">
          {shared ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={18} />
            </motion.div>
          ) : (
            <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Share2 size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleShare}
      className="w-full bg-[#268C7F]/5 border-2 border-[#268C7F]/10 px-6 py-4 rounded-[2rem] flex items-center justify-between group overflow-hidden relative"
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-[#268C7F] text-white flex items-center justify-center shadow-lg shadow-[#268C7F]/20">
          <Share2 size={18} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#268C7F]">Share the Flavor</p>
          <p className="text-sm font-bold text-gray-700">Invite friends to checkout DD's</p>
        </div>
      </div>
      <Copy size={16} className="text-gray-300 group-hover:text-[#268C7F] transition-colors relative z-10" />
      <div className="absolute inset-x-0 h-full w-4 bg-white/20 blur-xl -translate-x-full group-hover:translate-x-[400px] transition-transform duration-1000" />
    </motion.button>
  )
}
