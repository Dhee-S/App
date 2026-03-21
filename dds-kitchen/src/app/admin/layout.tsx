'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { LayoutDashboard, Utensils, CalendarDays, KanbanSquare, LogOut, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const supabase = createClient()

  const navItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/admin/dash' },
    { label: 'Menu', icon: Utensils, href: '/admin/menu' },
    { label: 'Requests', icon: CalendarDays, href: '/admin/requests' },
    { label: 'Pipeline', icon: KanbanSquare, href: '/admin/pipeline' },
  ]

  return (
    <div className="bg-bg-light min-h-screen relative overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora pointer-events-none">
        <div className="aurora-blob" />
        <div className="aurora-blob-2" />
      </div>
      
      {children}
      
      {/* Admin Navigation */}
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="fixed bottom-0 w-full max-w-md glass border-t border-gray-100 z-40 pb-[env(safe-area-inset-bottom)] px-2"
      >
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors duration-500 ${
                  isActive ? 'text-[#E1803A]' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-pill"
                    className="absolute inset-x-1 inset-y-2 bg-[#E1803A]/5 rounded-2xl z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 text-center">
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}
                  />
                </div>
                
                <span className="text-[9px] font-black uppercase tracking-tighter relative z-10">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="admin-nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 bg-[#E1803A] rounded-full z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}

          {/* Exit Button - Distinctive Style */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 relative text-gray-400 hover:text-red-500 transition-colors group"
          >
             <div className="relative z-10 p-2 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
                <LogOut size={18} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-tighter">Exit</span>
          </button>
        </div>
      </motion.nav>

      {/* Floating System Indicator */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
         <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E1803A] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Command Center</span>
         </div>
      </div>
    </div>
  )
}

