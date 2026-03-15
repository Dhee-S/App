'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellRing, 
  TrendingUp, 
  Users, 
  Package, 
  ChefHat, 
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  XCircle,
  Clock
} from 'lucide-react'
import { MatteButton } from '@/components/MatteButton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const { showToast } = useToast()
  const [metrics, setMetrics] = useState({
    pendingPayments: 0,
    totalRevenue: 0,
    activeBatches: 0,
    newRequests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const { data: orders } = await supabase.from('orders').select('status, total_amount')
      const { data: requests } = await supabase.from('requests').select('status')
      const { data: schedules } = await supabase.from('schedules').select('id').eq('scheduled_date', new Date().toISOString().split('T')[0])

      setMetrics({
        pendingPayments: orders?.filter(o => o.status === 'pending').length || 0,
        totalRevenue: orders?.filter(o => ['completed', 'ready', 'preparing', 'confirmed'].includes(o.status))
          .reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0,
        activeBatches: schedules?.length || 0,
        newRequests: requests?.filter(r => r.status === 'pending').length || 0
      })
      setLoading(false)
    }
    fetchMetrics()
  }, [supabase])

  const stats = [
    { label: 'Revenue', value: `$${metrics.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-[#268C7F]', bg: 'bg-[#268C7F]/5' },
    { label: 'Verify', value: metrics.pendingPayments, icon: Package, color: 'text-[#E1803A]', bg: 'bg-[#E1803A]/5', alert: metrics.pendingPayments > 0 },
    { label: 'Requests', value: metrics.newRequests, icon: BellRing, color: 'text-[#CE9146]', bg: 'bg-[#CE9146]/5', alert: metrics.newRequests > 0 },
    { label: 'Batches', value: metrics.activeBatches, icon: ChefHat, color: 'text-[#6984A9]', bg: 'bg-[#6984A9]/5' }
  ]

  return (
    <div className="min-h-screen pt-12 px-6 pb-32 mesh-bg space-y-8">
      {/* Header Zone */}
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#E1803A] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E1803A]">Live Intelligence</span>
          </motion.div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text">Command Center</h1>
        </div>
        
        <div className="relative group">
           <div className="absolute inset-0 bg-[#CE9146]/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
           <button className="relative w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-[#CE9146] shadow-sm">
              <Sparkles size={20} strokeWidth={2.5} />
           </button>
        </div>
      </header>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <BentoCard className={`p-6 flex flex-col gap-4 border-gray-100 group hover:scale-[1.02] transition-transform`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center relative`}>
                 <stat.icon size={20} strokeWidth={2.5} />
                 {stat.alert && (
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-bounce" />
                 )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                <h3 className={`text-2xl font-black tracking-tighter ${stat.color}`}>{loading ? '...' : stat.value}</h3>
              </div>
            </BentoCard>
          </motion.div>
        ))}
      </div>

      {/* Primary Action Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <BentoCard className="p-0 overflow-hidden border-[#268C7F]/10 shadow-xl shadow-[#268C7F]/5 ring-1 ring-[#268C7F]/5">
           <div className="bg-gradient-to-r from-[#268C7F] to-[#1E7469] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                 <ChefHat size={120} />
              </div>
              <div className="relative z-10">
                 <h2 className="text-2xl font-black tracking-tighter mb-2">Operational Pipeline</h2>
                 <p className="text-white/70 text-[11px] font-medium tracking-wide uppercase mb-6">Manage 4 active orders in queue</p>
                 <MatteButton 
                  variant="white" 
                  size="lg" 
                  className="rounded-2xl px-10 text-[#268C7F] group/btn"
                  onClick={() => router.push('/admin/pipeline')}
                 >
                    Enter Flow <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                 </MatteButton>
              </div>
           </div>
        </BentoCard>
      </motion.div>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          Gourmet Controls <div className="h-px flex-1 bg-gray-100" />
        </h2>
        <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/admin/menu')}
              className="bg-white border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
               <div className="w-12 h-12 bg-[#CE9146]/10 text-[#CE9146] rounded-2xl flex items-center justify-center">
                  <UtensilsCrossed size={24} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-tighter text-gray-600">Update Menu</span>
            </button>
            <button 
              className="bg-white border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-red-50 transition-colors group shadow-sm"
              onClick={() => showToast('Halting intake protocol...', 'info')}
            >
               <div className="w-12 h-12 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                  <XCircle size={24} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-tighter text-gray-600">Halt Intake</span>
            </button>
        </div>
      </div>

      {/* Real-time Log (Mock) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Live Protocol</h2>
          <span className="text-[9px] font-black text-[#268C7F] underline underline-offset-4 decoration-2">VIEW ALL LOGS</span>
        </div>
        <div className="space-y-3">
          {[
            { msg: 'New Request: Mutton Biryani', time: '2m ago', icon: Clock, color: 'text-amber-500' },
            { msg: 'Payment Verified: Order #9822', time: '15m ago', icon: Sparkles, color: 'text-green-500' }
          ].map((log, i) => (
            <BentoCard key={i} className="p-4 flex items-center gap-4 border-gray-50 bg-white/40 ring-1 ring-black/[0.01]">
               <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${log.color}`}>
                  <log.icon size={14} />
               </div>
               <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">{log.msg}</p>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">{log.time}</p>
               </div>
            </BentoCard>
          ))}
        </div>
      </div>
    </div>
  )
}
