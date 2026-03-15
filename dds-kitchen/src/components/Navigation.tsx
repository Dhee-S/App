'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, ShoppingBag, Receipt, User } from 'lucide-react'
import { useCart } from '@/store/useCart'
import { motion } from 'framer-motion'

export function Navigation() {
  const pathname = usePathname()
  const totalItems = useCart((state) => state.items.reduce((acc, item) => acc + item.quantity, 0))

  if (pathname.startsWith('/admin') || pathname === '/login') return null;

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Calendar', icon: Calendar, href: '/schedule' },
    { label: 'Cart', icon: ShoppingBag, href: '/cart', badge: totalItems },
    { label: 'Orders', icon: Receipt, href: '/orders' },
    { label: 'Profile', icon: User, href: '/profile' },
  ]

  return (
    <nav className="fixed bottom-0 w-full max-w-md glass border-t border-gray-100 z-40 pb-[env(safe-area-inset-bottom)] px-2">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors duration-500 ${
                isActive ? 'text-[#268C7F]' : 'text-gray-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 inset-y-2 bg-[#268C7F]/5 rounded-2xl z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#E1803A] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </div>
              
              <span className="text-[9px] font-black uppercase tracking-tighter relative z-10">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 bg-[#268C7F] rounded-full z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
