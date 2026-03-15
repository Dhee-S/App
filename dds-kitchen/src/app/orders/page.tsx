'use client'

import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { CheckCircle2, Clock, ChefHat, PackageCheck, ScrollText, History, Star } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, dishes(*))')
        .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

  const activeOrders = orders?.filter(o => !['completed', 'cancelled'].includes(o.status)) || []
  const pastOrders = orders?.filter(o => ['completed', 'cancelled'].includes(o.status)) || []

  const getStatusStep = (status: string) => {
     switch(status) {
        case 'pending': return 1;
        case 'confirmed': return 2;
        case 'preparing': return 3;
        case 'ready': return 4;
        default: return 0;
     }
  }

  return (
    <div className="w-full flex flex-col p-6 pb-24 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter">My Orders</h1>
        <p className="text-sm font-subheading italic text-gray-400">Track your culinary journey.</p>
      </header>
      
      {/* Active Tracking */}
      <section className="space-y-6">
        <h2 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
           <ScrollText size={14} className="text-[#268C7F]" /> Active Pursuit
        </h2>
        
        {activeOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
             <div className="text-4xl mb-4 grayscale opacity-30">🥡</div>
             <p className="text-gray-400 font-medium">No live batches currently.</p>
          </div>
        ) : (
          activeOrders.map(order => {
            const step = getStatusStep(order.status)
            return (
              <BentoCard key={order.id} className="p-0 border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-white to-gray-50 flex justify-between items-center border-b border-gray-100">
                   <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Settlement Total</p>
                      <p className="text-2xl font-black text-[#268C7F] tracking-tighter">
                        ${order.total_amount}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Passcode</p>
                      <div className={`px-4 py-2 rounded-xl transition-all duration-700 ${order.delivery_code ? 'bg-[#268C7F] text-white shadow-lg shadow-[#268C7F]/20' : 'bg-gray-100 text-gray-300'}`}>
                         <span className="font-mono font-black tracking-widest text-sm">
                            {order.delivery_code || 'PENDING'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="p-6 relative space-y-8 bg-white/50 backdrop-blur-sm">
                   <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-100 z-0"></div>
                   <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-[#268C7F] z-0 transition-all duration-1000 origin-top shadow-[0_0_8px_rgba(38,140,127,0.3)]" style={{ height: `${((step - 1) / 3) * 100}%` }}></div>
                   
                   {[
                     { label: 'Market Verification', icon: Clock, target: 1 },
                     { label: 'Chef Confirmed', icon: CheckCircle2, target: 2 },
                     { label: 'Kitchen Orchestration', icon: ChefHat, target: 3 },
                     { label: 'Ready for Collection', icon: PackageCheck, target: 4 }
                   ].map((item, i) => {
                     const Icon = item.icon
                     const isDone = step >= item.target
                     const isCurrent = step === item.target
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
                        <div key={i} className={`relative z-10 flex items-center gap-6 transition-all duration-500 ${isDone ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                             isCurrent ? 'bg-[#268C7F] text-white shadow-lg ring-4 ring-[#268C7F]/10 scale-110' : 
                             isDone ? 'bg-[#268C7F]/10 text-[#268C7F]' : 'bg-gray-50 text-gray-300'
                           }`}>
                              <Icon size={20} strokeWidth={2.5} />
                           </div>
                           <div>
                              <span className={`text-sm font-bold tracking-tight block ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                                {item.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-black uppercase text-[#268C7F] tracking-widest animate-pulse">Live Tracking...</span>
                              )}
                           </div>
                        </div>
                     )
                   })}
                </div>
              </BentoCard>
            )
          })
        )}
      </section>

      {/* Culinary History */}
      {pastOrders.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <History size={14} className="text-[#E1803A]" /> Culinary History
          </h2>
          <div className="space-y-3">
            {pastOrders.map(order => (
              <BentoCard key={order.id} className="p-4 flex items-center gap-4 bg-white/40 border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#E1803A]/5 flex items-center justify-center text-[#E1803A]">
                   <Star size={20} fill={order.status === 'completed' ? '#E1803A' : 'none'} />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-gray-800">{format(new Date(order.created_at), 'MMMM d, h:mm a')}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                     {order.order_items?.length || 0} Gourmet Items • {order.status}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-gray-800 tracking-tighter">${order.total_amount}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
