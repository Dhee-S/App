'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

interface MatteButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'teal' | 'cyan' | 'orange' | 'amber' | 'danger' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

export function MatteButton({
  className,
  variant = 'teal',
  size = 'md',
  children,
  ...props
}: MatteButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    teal: 'bg-[#268C7F] hover:bg-[#1E7469] text-white',
    cyan: 'bg-[#06B6D4] hover:bg-[#0891B2] text-white',
    orange: 'bg-[#E1803A] hover:bg-[#C86A28] text-white',
    amber: 'bg-[#CE9146] hover:bg-[#B47C38] text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    white: 'bg-white hover:bg-gray-50 text-[#268C7F]',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-8 text-base',
    lg: 'h-14 px-10 text-lg w-full',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}
