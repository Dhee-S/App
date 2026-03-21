'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { MatteButton } from '@/components/MatteButton'
import { CalendarGrid } from '@/components/CalendarGrid'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, User, ChefHat, Check, X, Sparkles, Clock, MapPin, ChevronRight, Utensils, Send, PartyPopper, Plus, Search } from 'lucide-react'
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
  const [mounted, setMounted] = useState(false)
  const [kitchenSchedules, setKitchenSchedules] = useState<any[]>([])
  const fetchKitchenSchedules = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data } = await supabase.from('schedules').select('*, dishes(*)').eq('scheduled_date', dateStr)
    setKitchenSchedules(data || [])
  }
  const [requestSummary, setRequestSummary] = useState<Record<string, { status: 'admin_scheduled' | 'accepted_request' | 'pending_request' | 'none' }>>({})
  
  // Direct Scheduling State
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDish, setScheduleDish] = useState<any>(null)
  const [scheduleQty, setScheduleQty] = useState(10)
  const [availableDishes, setAvailableDishes] = useState<any[]>([])
  const [isScheduling, setIsScheduling] = useState(false)
  const [dishSearch, setDishSearch] = useState('')

  const filteredDishes = availableDishes.filter(dish => 
    dish.name.toLowerCase().includes(dishSearch.toLowerCase())
  )

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
    fetchKitchenSchedules()
  }, [selectedDate, supabase])

  useEffect(() => {
    async function fetchSummaryAndDishes() {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const [reqsRes, schedsRes, dishesRes] = await Promise.all([
        supabase.from('requests').select('requested_date, status').gte('requested_date', todayStr),
        supabase.from('schedules').select('scheduled_date').gte('scheduled_date', todayStr),
        supabase.from('dishes').select('*').eq('is_available', true)
      ])
      
      const summary: Record<string, { status: 'admin_scheduled' | 'accepted_request' | 'pending_request' | 'none' }> = {}
      
      reqsRes.data?.forEach((r: any) => {
        const currentStatus = summary[r.requested_date]?.status
        if (currentStatus !== 'admin_scheduled') {
           if (r.status === 'accepted') summary[r.requested_date] = { status: 'accepted_request' }
           else if (r.status === 'pending' && currentStatus !== 'accepted_request') summary[r.requested_date] = { status: 'pending_request' }
        }
      })

      schedsRes.data?.forEach((s: any) => {
        summary[s.scheduled_date] = { status: 'admin_scheduled' }
      })

      setRequestSummary(summary)
      setAvailableDishes(dishesRes.data || [])
      setMounted(true)
    }
    fetchSummaryAndDishes()
  }, [supabase])

  const handleDecision = async (id: string, status: 'accepted' | 'declined') => {
    const request = requests.find(r => r.id === id)
    
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
    
    if (!error && status === 'accepted' && request) {
      // Check for existing schedule to avoid unique constraint crash
      const { data: existing } = await supabase
        .from('schedules')
        .select('*')
        .eq('scheduled_date', request.requested_date)
        .eq('dish_id', request.dish_id)
        .single()
        
      if (existing) {
         await supabase.from('schedules').update({
            servings_remaining: existing.servings_remaining + (request.quantity || 1)
         }).eq('id', existing.id)
      } else {
         await supabase.from('schedules').insert({
           dish_id: request.dish_id,
           scheduled_date: request.requested_date,
           is_kitchen_scheduled: true,
           servings_remaining: request.quantity || 10
         })
      }
      showToast('Request incorporated into batch. Schedule updated.', 'success')
    } else if (!error) {
      showToast('Request declined.', 'info')
    } else {
      showToast(`Coordination error: ${error.message}`, 'error')
    }
    
    fetchRequests()
    fetchKitchenSchedules() // Refresh admin view of schedules
  }

  
  const finalizeSchedule = async (id: string, name: string) => {
    const { error } = await supabase
      .from('schedules')
      .update({ status: 'completed' })
      .eq('id', id)
    
    if (!error) {
       showToast(`Batch Finalized: ${name}`, 'success')
       fetchKitchenSchedules()
    } else {
       showToast(`Error: ${error.message}`, 'error')
    }
  }

  const handleCreateSchedule = async () => {
    if (!scheduleDish) return
    setIsScheduling(true)
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data: existing } = await supabase
      .from('schedules')
      .select('*')
      .eq('scheduled_date', dateStr)
      .eq('dish_id', scheduleDish.id)
      .single()
      
    let error;
    if (existing) {
       const res = await supabase.from('schedules').update({
         servings_remaining: existing.servings_remaining + scheduleQty
       }).eq('id', existing.id)
       error = res.error
    } else {
       const res = await supabase.from('schedules').insert({
         dish_id: scheduleDish.id,
         scheduled_date: dateStr,
         is_kitchen_scheduled: true,
         servings_remaining: scheduleQty
       })
       error = res.error
    }
    
    if (!error) {
      showToast('Scheduled successfully!', 'success')
      setShowScheduleModal(false)
      setScheduleDish(null)
      fetchRequests() 
      fetchKitchenSchedules()
      
      const { data } = await supabase.from('schedules').select('scheduled_date').gte('scheduled_date', format(new Date(), 'yyyy-MM-dd'))
      const current = { ...requestSummary }
      data?.forEach(s => current[s.scheduled_date] = { status: 'admin_scheduled' })
      setRequestSummary(current)
    } else {
      showToast('Failed to schedule: ' + error.message, 'error')
    }
    setIsScheduling(false)
  }

  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')

  if (!mounted) return null

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

      <div className="flex justify-center -mt-6 z-20 relative">
        <MatteButton size="md" variant="teal" className="rounded-2xl" onClick={() => setShowScheduleModal(true)}>
           <span className="flex items-center gap-2"><Plus size={16} /> Direct Schedule</span>
        </MatteButton>
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

        
        {/* Kitchen Batches Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            Dishes Added to Kitchen
          </h2>
          <div className="space-y-3">
             {kitchenSchedules.map((sched, idx) => (
               <motion.div 
                 key={sched.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="group relative p-4 bg-orange-50/50 border border-orange-100 rounded-3xl shadow-sm flex items-center justify-between"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#E1803A] flex items-center justify-center">
                        <ChefHat size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{sched.dishes?.name}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          {sched.servings_remaining} Servings Remaining
                        </p>
                     </div>
                  </div>
               </motion.div>
             ))}
             {kitchenSchedules.length === 0 && (
               <div className="py-8 text-center text-[10px] font-black text-gray-200 uppercase tracking-widest italic">
                 No dishes scheduled.
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

      {/* Direct Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-end justify-center p-6"
            onClick={() => setShowScheduleModal(false)}
          >
             <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
             >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#268C7F] to-teal-400" />
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-[#268C7F]" />
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Plan a Batch</h2>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">For {format(selectedDate, 'EEEE, MMMM d')}</p>
                </div>

                <div className="relative mb-6">
                   <Search className="absolute left-4 top-3.5 text-gray-300" size={16} />
                   <input 
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#268C7F]" 
                     placeholder="Search catalog..."
                     value={dishSearch}
                     onChange={(e) => setDishSearch(e.target.value)}
                   />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                   {filteredDishes.map(dish => {
                      const isSelected = scheduleDish?.id === dish.id
                      return (
                        <button 
                          key={dish.id} 
                          onClick={() => setScheduleDish(dish)}
                          className={`w-full p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                            isSelected ? 'bg-[#268C7F]/5 border-[#268C7F] shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                           <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                              {dish.image_url ? <Image src={dish.image_url} alt={dish.name} fill className="object-cover" /> : <div className="bg-gray-100 w-full h-full flex items-center justify-center"><ChefHat size={16} className="text-gray-300" /></div>}
                           </div>
                           <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{dish.name}</p>
                              <p className="text-[10px] text-[#268C7F] font-black uppercase tracking-tighter">₹{dish.price}</p>
                           </div>
                           {isSelected && <Check size={16} className="text-[#268C7F]" />}
                        </button>
                      )
                   })}
                </div>

                {scheduleDish && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preparation Units</p>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setScheduleQty(Math.max(1, scheduleQty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">-</button>
                      <span className="font-bold text-gray-800">{scheduleQty}</span>
                      <button type="button" onClick={() => setScheduleQty(scheduleQty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">+</button>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                   <MatteButton 
                    size="md" 
                    variant="teal" 
                    className="w-full py-6 rounded-2xl" 
                    disabled={!scheduleDish || isScheduling}
                    onClick={handleCreateSchedule}
                   >
                      {isScheduling ? 'Orchestrating...' : 'Confirm Schedule'}
                   </MatteButton>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
