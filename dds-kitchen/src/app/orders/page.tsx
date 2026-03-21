'use client'

import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { CheckCircle2, Clock, ChefHat, PackageCheck, ScrollText, History, Star, MapPin, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
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

    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
         fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const activeOrders = orders?.filter(o => !['completed', 'cancelled'].includes(o.status)) || []
  const pastOrders = orders?.filter(o => ['completed', 'cancelled'].includes(o.status)) || []

  const getStatusStep = (status: string) => {
     switch(status) {
        case 'pending': return 1;
        case 'confirmed': return 2;
        case 'preparing': return 3;
        case 'ready': return 4;
        case 'completed': return 5;
        default: return 0;
     }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="w-8 h-8 border-4 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col p-6 pb-24 space-y-8 mesh-bg min-h-screen">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E1803A] animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E1803A]/60">Dispatch Log</span>
        </div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text">My Orders</h1>
        <p className="text-sm font-subheading italic text-gray-400">Track your culinary journey.</p>
      </header>
      
      {/* Active Tracking */}
      <section className="space-y-6">
        <h2 className="text-xs font-display font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
           <ScrollText size={14} className="text-[#268C7F]" /> Active Pursuit
        </h2>
        
        {activeOrders.length === 0 ? (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-100 shadow-sm">
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-inner">
               <PackageCheck size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No live batches currently.</p>
             <button 
               onClick={() => window.location.href = '/App/'}
               className="mt-6 border border-[#268C7F]/20 text-[#268C7F] px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#268C7F]/5 transition-colors"
             >
               Discover Menu
             </button>
          </div>
        ) : (
          activeOrders.map(order => {
            const step = getStatusStep(order.status)
            return (
              <BentoCard key={order.id} className="p-0 border-gray-100 shadow-xl shadow-black/[0.04] overflow-hidden">
                {order.is_paid && order.delivery_code ? (
                  <div className="p-8 bg-[#268C7F] text-white flex flex-col items-center justify-center text-center relative overflow-hidden z-20">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                     <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-xl backdrop-blur-md">
                        <CheckCircle2 size={32} strokeWidth={3} className="text-white drop-shadow-md" />
                     </motion.div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Auth Code Generated</p>
                     <h2 className="text-5xl font-serif text-white mb-4 drop-shadow-xl tracking-wider">{order.delivery_code}</h2>
                     <p className="text-sm font-subheading italic text-white/90 mb-6 max-w-[250px] leading-relaxed">
                       Payment Confirmed! Show this code to the Chef at pickup—made with heart.
                     </p>
                     <button onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'DD Kitchen Pickup', text: `My Order Code is ${order.delivery_code}` })
                        } else {
                          navigator.clipboard.writeText(order.delivery_code);
                          alert('Code copied to clipboard!');
                        }
                     }} className="bg-white text-[#268C7F] px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Share Pickup Details
                     </button>
                  </div>
                ) : (
                  <div className="p-6 bg-white flex justify-between items-center border-b border-gray-50 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-amber-300" />
                     <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Settlement Total</p>
                         <p className="text-3xl font-black text-gray-800 tracking-tighter">
                           {'₹' + order.total_amount}
                         </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Verification</p>
                         <div className="px-4 py-2 flex items-center justify-center rounded-xl transition-all duration-700 bg-orange-50 border border-orange-100 text-orange-500 shadow-inner">
                           <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Pending
                           </span>
                        </div>
                     </div>
                  </div>
                )}

                <div className="p-8 relative bg-white/50 backdrop-blur-sm flex flex-col gap-8">
                   {/* Vertical tracking line positioned correctly to center of 40px icons (left-8 padding + 20px center = left-10 usually, but relative to this container it's left-[20px] -> left-5) */}
                   <div className="absolute left-[3.25rem] top-12 bottom-12 w-0.5 bg-gray-100 z-0 rounded-full" />
                   
                   {/* Animated Progress Line */}
                   <div 
                     className="absolute left-[3.25rem] top-12 w-0.5 bg-gradient-to-b from-[#268C7F] to-green-400 z-0 transition-all duration-1000 origin-top shadow-[0_0_12px_rgba(38,140,127,0.5)] rounded-full" 
                     style={{ height: `calc(${((step - 1) / 4) * 100}% - 1.5rem)` }} 
                   />
                   
                   {[
                     { label: 'Market Verification', icon: ScrollText, target: 1 },
                     { label: 'Chef Confirmed', icon: CheckCircle2, target: 2 },
                     { label: 'Kitchen Orchestration', icon: ChefHat, target: 3 },
                     { label: 'Live Tracking...', icon: Truck, target: 4 },
                     { label: 'Ready for Collection', icon: PackageCheck, target: 5 }
                   ].map((item, i) => {
                     const Icon = item.icon
                     const isDone = step >= item.target
                     const isCurrent = step === item.target

                     return (
                        <div key={i} className={`relative z-10 flex items-center gap-6 transition-all duration-700 ${isDone ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700 shrink-0 ${
                             isCurrent ? 'bg-[#268C7F] text-white shadow-lg ring-4 ring-[#268C7F]/10 scale-110' : 
                             isDone ? 'bg-[#268C7F]/10 text-[#268C7F]' : 'bg-gray-50 border border-gray-100 text-gray-300'
                           }`}>
                              <Icon size={18} strokeWidth={isCurrent ? 3 : 2} className={isCurrent ? 'animate-bounce' : ''} style={isCurrent ? {animationDuration: '2s'} : {}} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <span className={`text-sm tracking-tight block transition-colors duration-500 ${isDone ? 'font-black text-gray-800' : 'font-bold text-gray-400'}`}>
                                {item.label}
                              </span>
                              <div className={`overflow-hidden transition-all duration-500 ${isCurrent ? 'h-4 opacity-100 mt-0.5' : 'h-0 opacity-0'}`}>
                                <span className="text-[9px] font-black uppercase text-[#268C7F] tracking-[0.2em] inline-flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#268C7F] animate-ping" />
                                  Present State
                                </span>
                              </div>
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
              <BentoCard key={order.id} className="p-4 flex items-center gap-4 bg-white/40 border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#E1803A]/5 flex items-center justify-center text-[#E1803A] shrink-0 border border-[#E1803A]/10">
                   <Star size={20} fill={order.status === 'completed' ? '#E1803A' : 'none'} />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-gray-800 truncate">{format(new Date(order.created_at), 'MMMM d, h:mm a')}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                     {order.order_items?.length || 0} Gourmet Items • <span className={order.status === 'completed' ? 'text-green-500' : 'text-red-400'}>{order.status}</span>
                   </p>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-lg font-black text-gray-800 tracking-tighter">{'₹' + order.total_amount}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
