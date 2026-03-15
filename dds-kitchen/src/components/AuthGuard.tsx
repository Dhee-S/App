'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')
      
      if (!user && !isPublicRoute) {
        router.replace('/login')
        return
      }

      if (user) {
        // Fetch profile for role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = profile?.role

        // Redirect from login if already auth'd
        if (pathname.startsWith('/login')) {
          router.replace(role === 'MANAGER' ? '/admin/dash' : '/')
          return
        }

        // Manager protection
        if (pathname.startsWith('/admin') && role !== 'MANAGER') {
          router.replace('/')
          return
        }

        // Redirect Manager from root
        if (pathname === '/' && role === 'MANAGER') {
          router.replace('/admin/dash')
          return
        }
      }

      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
