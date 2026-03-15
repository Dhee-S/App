'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'special'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs space-y-3 pointer-events-none px-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                glass shadow-2xl rounded-2xl p-4 flex items-center gap-4 border ring-1 ring-black/[0.05]
                ${toast.type === 'success' ? 'border-green-100 bg-white/90' : 
                  toast.type === 'error' ? 'border-red-100 bg-white/90' :
                  toast.type === 'special' ? 'border-amber-100 bg-white/90' :
                  'border-gray-100 bg-white/90'}
              `}>
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${toast.type === 'success' ? 'bg-green-500 text-white' : 
                    toast.type === 'error' ? 'bg-red-500 text-white' :
                    toast.type === 'special' ? 'bg-[#E1803A] text-white' :
                    'bg-[#268C7F] text-white'}
                `}>
                  {toast.type === 'success' && <CheckCircle2 size={20} />}
                  {toast.type === 'error' && <AlertCircle size={20} />}
                  {toast.type === 'special' && <Sparkles size={20} />}
                  {toast.type === 'info' && <Info size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                   <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                      {toast.type.toUpperCase()}
                   </p>
                   <p className="text-sm font-bold text-gray-700 leading-tight">
                      {toast.message}
                   </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
