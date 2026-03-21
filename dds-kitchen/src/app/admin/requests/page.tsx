'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { MatteButton } from '@/components/MatteButton'
import { CalendarGrid } from '@/components/CalendarGrid'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, User, ChefHat, Check, X, Sparkles, Clock, MapPin, ChevronRight, Utensils, Send, PartyPopper } from 'lucide-react'
import { useToast } from '@/components/Toast'
import Image from 'next/image'

export default function RequestHub({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = createClient()
  const params = use(searchParams)
  const { showToast } = useToast()
  const today = new Date()
  
  const [selectedDate, setSelectedDate] = useState(
    params.date ? parseISO(params.date) : today
  )
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requestSummary, setRequestSummary] = useState<any>({})

  const fetchRequests = async () => {
    setLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('requests')
      .select('*, profiles(*), dishes(*)')
      .eq('requested_date', dateStr)
      .order('created_at', { ascending: true })
    
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [selectedDate, supabase])

  useEffect(() => {
    async function fetchSummary() {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const { data } = await supabase
        .from('requests')
        .select('requested_date, status')
        .gte('requested_date', todayStr)
      
      const summary: any = {}
      data?.forEach((r: any) => {
        if (!summary[r.requested_date]) summary[r.requested_date] = {}
        if (r.status === 'pending') summary[r.requested_date].hasRequests = true
        if (r.status === 'accepted') summary[r.requested_date].hasSchedule = true
      })
      setRequestSummary(summary)
    }
    fetchSummary()
  }, [supabase])

  const handleDecision = async (id: string, status: 'accepted' | 'declined') => {
    const request = requests.find(r => r.id === id)
    
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
    
    if (!error && status === 'accepted' && request) {
      await supabase.from('schedules').insert({
        dish_id: request.dish_id,
        scheduled_date: request.requested_date,
        is_kitchen_scheduled: true,
        servings_remaining: request.quantity || 10
      })
      showToast('Request incorporated into batch. Schedule created.', 'success')
    } else if (!error) {
      showToast('Request declined.', 'info')
    } else {
      showToast(`Coordination error: ${error.message}`, 'error')
    }
    
    fetchRequests()
  }

  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')

  return (
    <div className="min-h-screen pt-12 px-6 pb-32 mesh-bg flex flex-col space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#CE9146] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CE9146]/60">Batch Intelligence</span>
        </div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter shiny-text">Request Hub</h1>
      </header>

      <div className="flex justify-center w-full relative z-10 -mt-2 mb-2">
        <CalendarGrid 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          indicators={requestSummary} 
        />
      </div>

      <div className="flex-1 space-y-8">
        {/* Pending Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
               Pending Decisions <span className="w-4 h-4 rounded bg-amber-100 text-[#CE9146] flex items-center justify-center text-[8px]">{pending.length}</span>
             </h2>
             <Clock size={12} className="text-gray-300" />
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pending.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <BentoCard className="p-5 flex flex-col gap-4 border-gray-100 shadow-lg shadow-black/[0.02] overflow-hidden relative">
                    {/* Animated glow for pending */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-400" 
                    />
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="flex gap-4"
                    >
                       <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 shadow-inner">
                          {req.dishes?.image_url ? (
                            <Image src={req.dishes.image_url} alt={req.dishes.name} fill className="object-cover" />
                          ) : (
                            <ChefHat className="w-full h-full p-4 text-gray-200" />
                          )}
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + idx * 0.05, type: "spring" }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Utensils size={12} className="text-white" />
                          </motion.div>
                       </div>
                       <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start">
                             <motion.p 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.15 + idx * 0.05 }}
                               className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1"
                             >
                               <Sparkles size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                               New Request
                             </motion.p>
                             {req.quantity > 1 && (
                               <motion.span 
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 transition={{ delay: 0.2 + idx * 0.05 }}
                                 className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-lg"
                               >
                                 {req.quantity} UNITS
                               </motion.span>
                             )}
                           </div>
                           <h3 className="text-lg font-black text-gray-800 leading-tight truncate">{req.dishes?.name}</h3>
                           <div className="flex items-center gap-2 mt-2">
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.25 + idx * 0.05 }}
                                className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"
                              >
                                <User size={10} />
                              </motion.div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{req.profiles?.full_name || 'Guest Explorer'}</p>
                           </div>
                       </div>
                    </motion.div>

                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex gap-3 pt-2"
                    >
                       <button 
                         onClick={() => handleDecision(req.id, 'declined')}
                         className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest group"
                        >
                          <X size={16} className="group-hover:rotate-90 transition-transform" /> Decline
                        </button>
                        <button 
                         onClick={() => handleDecision(req.id, 'accepted')}
                         className="flex-[2] h-12 rounded-xl bg-[#268C7F] text-white shadow-lg shadow-[#268C7F]/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95 hover:shadow-xl hover:shadow-[#268C7F]/30"
                        >
                          <Check size={16} /> 
                          <span className="flex items-center gap-1">
                            Orchestrate 
                            <ChefHat size={12} />
                          </span>
                        </button>
                    </motion.div>
                  </BentoCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {pending.length === 0 && !loading && (
              <div className="py-12 text-center bg-white/40 border border-dashed border-gray-100 rounded-[2rem]">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-gray-200">
                    <Sparkles size={20} />
                 </div>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sky is Clear</p>
              </div>
            )}
          </div>
        </section>

        {/* Accepted Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            Active Batch Commitments
            {accepted.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              >
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              </motion.span>
            )}
          </h2>
          <div className="space-y-3">
             {accepted.map((req, idx) => (
               <motion.div 
                 key={req.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="group relative p-4 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between hover:border-[#268C7F]/30 transition-all hover:shadow-md"
               >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#268C7F] to-green-400 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="flex items-center gap-4">
                     <motion.div 
                       whileHover={{ rotate: 360 }}
                       transition={{ duration: 0.6 }}
                       className="w-10 h-10 rounded-xl bg-[#268C7F]/10 text-[#268C7F] flex items-center justify-center"
                     >
                        <ChefHat size={18} />
                     </motion.div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{req.dishes?.name}</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <User size={10} /> Initiated by {req.profiles?.full_name}
                        </p>
                     </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#268C7F] group-hover:text-white transition-colors"
                  >
                     <ChevronRight size={14} />
                  </motion.div>
               </motion.div>
             ))}
             {accepted.length === 0 && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="py-8 text-center"
               >
                 <p className="text-center py-4 text-[10px] font-black text-gray-200 uppercase tracking-widest italic">No accepted trajectories yet.</p>
               </motion.div>
             )}
          </div>
        </section>
      </div>
    </div>
  )
}
