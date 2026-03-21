'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { MatteButton } from '@/components/MatteButton'
import { 
  ExternalLink, 
  CheckCircle2, 
  ChefHat, 
  Truck, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  User,
  Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/Toast'
import Image from 'next/image'

export default function OrderPipeline() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(*), order_items(*, dishes(*))')
      .in('status', ['pending_verification', 'pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: true })
    
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    // Subscribe to changes
    const channel = supabase
      .channel('pipeline-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  
  const approvePayment = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_paid: true, status: 'pending' })
      .eq('id', orderId)
    
    if (!error) {
       fetchOrders()
       showToast('Payment Verified! Code generated and sent to customer.', 'success')
    } else {
       showToast(`Error: ${error.message}`, 'error')
    }
  }

  const pendingPayments = orders.filter(o => !o.is_paid && o.status === 'pending_verification')

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    
    if (!error) {
      fetchOrders()
      showToast(`Order status synchronized to ${status.toUpperCase()}.`, 'success')
    } else {
      showToast(`Protocol error: ${error.message}`, 'error')
    }
  }

  const lanes = [
    { title: 'Incoming', status: ['pending'], icon: ShieldCheck, color: 'text-[#CE9146]', bg: 'bg-[#CE9146]/5', border: 'border-[#CE9146]/20' },
    { title: 'Cooking', status: ['confirmed', 'preparing'], icon: ChefHat, color: 'text-[#E1803A]', bg: 'bg-[#E1803A]/5', border: 'border-[#E1803A]/20' },
    { title: 'Deployment', status: ['ready'], icon: Truck, color: 'text-[#268C7F]', bg: 'bg-[#268C7F]/5', border: 'border-[#268C7F]/20' }
  ]

  return (
    <div className="min-h-screen pt-12 px-6 pb-24 mesh-bg flex flex-col h-screen overflow-hidden">
      <header className="mb-8 shrink-0 flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60">Active Operations</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text">Kitchen Pipeline</h1>
        </div>
        <div className="text-[10px] font-black text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm uppercase tracking-widest">
           {orders.length} Active Missions
        </div>
      </header>

      
      {/* High-Trust Verification Grid */}
      {pendingPayments.length > 0 && (
        <div className="shrink-0 mb-8 space-y-4">
           <h2 className="text-xs font-display font-black text-[#268C7F] uppercase tracking-[0.2em] flex items-center gap-2">
             <ShieldCheck size={14} /> Pending Settlements
           </h2>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
             {pendingPayments.map(order => (
               <BentoCard key={'pay-'+order.id} className="min-w-[280px] snap-start p-5 bg-gradient-to-br from-teal-50 to-white border-teal-100 shadow-sm flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-teal-100/50 flex items-center justify-center text-teal-600">
                          <CheckCircle2 size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-gray-800 leading-none">{order.profiles?.full_name}</p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-[#268C7F] mt-1 flex items-center gap-1">
                             <Hash size={10} strokeWidth={3} /> {order.id.split('-')[0]}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Total</p>
                       <p className="text-lg font-black text-teal-700 tracking-tighter">{'₹' + order.total_amount}</p>
                    </div>
                 </div>
                 
                 <div className="bg-white/50 rounded-xl p-3 border border-teal-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requested Items</p>
                    <div className="flex flex-wrap gap-1.5">
                       {order.order_items?.map((item: any) => (
                         <span key={item.id} className="text-[9px] font-black text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                            {item.quantity}x {item.dishes?.name}
                         </span>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={() => approvePayment(order.id)}
                   className="w-full py-3 bg-[#268C7F] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#268C7F]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   Verify Settlement
                 </button>
               </BentoCard>
             ))}
           </div>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">

        {lanes.map((lane, laneIdx) => {
          const laneOrders = orders.filter(o => lane.status.includes(o.status))
          return (
            <motion.div
              key={lane.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: laneIdx * 0.1 }}
              className="min-w-[85vw] md:min-w-[340px] flex flex-col snap-center h-full"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${lane.bg} ${lane.color} rounded-lg flex items-center justify-center`}>
                       <lane.icon size={16} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">{lane.title}</h2>
                 </div>
                 <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">
                    {laneOrders.length} {laneOrders.length === 1 ? 'Unit' : 'Units'}
                 </span>
              </div>

              <div className={`flex-1 overflow-y-auto space-y-4 p-4 rounded-[2.5rem] bg-white/40 border border-gray-100/50 backdrop-blur-sm shadow-inner overflow-x-hidden scrollbar-hide`}>
                <AnimatePresence mode="popLayout">
                  {laneOrders.map((order, orderIdx) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className="relative"
                    >
                      <BentoCard className={`p-5 flex flex-col gap-4 border-gray-100 group shadow-lg shadow-black/[0.02] ring-1 ring-black/[0.01]`}>
                        {/* Order Handle */}
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                 <User size={14} />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-gray-800 leading-none">{order.profiles?.full_name}</p>
                                 <p className="text-[9px] font-black uppercase tracking-tighter text-[#268C7F] mt-1 flex items-center gap-1">
                                    <Hash size={10} strokeWidth={3} /> {order.id.split('-')[0]}
                                 </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocol</p>
                              <p className="text-xs font-black text-gray-800">{order.status === 'pending' ? 'Verification' : 'Priority'}</p>
                           </div>
                        </div>

                        {/* Items */}
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                           <ul className="space-y-2">
                              {order.order_items?.map((item: any) => (
                                <li key={item.id} className="flex justify-between items-center">
                                   <span className="text-[11px] font-bold text-gray-600 truncate max-w-[140px]">{item.dishes?.name}</span>
                                   <span className="text-[10px] font-black text-[#268C7F] px-2 py-0.5 bg-white rounded-lg border border-gray-100 flex items-center gap-1">
                                      {item.quantity} <span className="text-[8px] opacity-40 uppercase">Qty</span>
                                   </span>
                                </li>
                              ))}
                           </ul>
                        </div>

                        {/* Order Status Action */}
                        <div className="space-y-3 pt-2">
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Quantum Total</p>
                                 <p className="text-lg font-black text-gray-800 tracking-tighter tabular-nums">{'₹' + order.total_amount}</p>
                              </div>
                              {order.delivery_code && (
                                <div className="bg-[#268C7F] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#268C7F]/20">
                                   {order.delivery_code}
                                </div>
                              )}
                           </div>

                           <div className="pt-2 border-t border-gray-50 flex gap-2">
                              {order.status === 'pending' || order.status === 'confirmed' ? (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateStatus(order.id, 'preparing')}
                                  className="w-full h-11 bg-[#E1803A] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#E1803A]/20"
                                >
                                  Accept & Cook
                                </motion.button>
                              ) : order.status === 'preparing' ? (
                                <MatteButton 
                                  variant="teal" 
                                  className="w-full rounded-xl py-3"
                                  onClick={() => updateStatus(order.id, 'ready')}
                                >
                                  Deploy & Track
                                </MatteButton>
                              ) : (
                                <button 
                                  onClick={() => updateStatus(order.id, 'completed')}
                                  className="w-full py-3 bg-[#268C7F] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#268C7F]/20 flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={16} /> Ready for Collection
                                </button>
                              )}
                           </div>
                        </div>

                        {/* Relative Time */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="flex items-center gap-1 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                              <Clock size={10} /> Active
                           </div>
                        </div>
                      </BentoCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {laneOrders.length === 0 && (
                   <div className="h-40 flex flex-col items-center justify-center text-center opacity-20 filter grayscale">
                      <ZapIcon />
                      <p className="text-[10px] font-black uppercase tracking-widest mt-4">Zero Friction</p>
                   </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ZapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <path d="m13 2-2 10h10l-9 10 2-10H3l10-10z" />
    </svg>
  )
}
