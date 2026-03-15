'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface GlassSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function GlassSheet({ isOpen, onClose, children, className }: GlassSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-gray-200 shadow-2xl bg-white p-6 max-h-[90vh] overflow-y-auto',
              className
            )}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
