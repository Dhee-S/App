'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { format, addDays, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChefHat, Users, Plus, Check, X, Search, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/store/useCart'
import { useToast } from '@/components/Toast'

export default function SchedulePage() {
  const supabase = createClient()
  const addItem = useCart(state => state.addItem)
  const { showToast } = useToast()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [kitchenSchedules, setKitchenSchedules] = useState<any[]>([])
  const [userBatches, setUserBatches] = useState<any[]>([])
  const [availableDishes, setAvailableDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestDish, setRequestDish] = useState<any>(null)
  const [requesting, setRequesting] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [requestQty, setRequestQty] = useState(1)
  const [daySummary, setDaySummary] = useState<{ [key: string]: { hasRequest: boolean, hasSchedule: boolean } }>({})

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i))

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      const [schedRes, reqRes, dishRes] = await Promise.all([
        supabase.from('schedules').select('*, dishes(*)').eq('scheduled_date', dateStr),
        supabase.from('requests').select('*, dishes(*)').eq('requested_date', dateStr).eq('status', 'accepted'),
        supabase.from('dishes').select('*').eq('is_available', true)
      ])

      setKitchenSchedules(schedRes.data || [])
      setUserBatches(reqRes.data || [])
      setAvailableDishes(dishRes.data || [])
      setLoading(false)
    }

    async function fetchSummary() {
      const { data: scheds } = await supabase.from('schedules').select('scheduled_date')
      const { data: reqs } = await supabase.from('requests').select('requested_date').eq('status', 'accepted')
      
      const summary: any = {}
      scheds?.forEach(s => {
        summary[s.scheduled_date] = { ...summary[s.scheduled_date], hasSchedule: true }
      })
      reqs?.forEach(r => {
        summary[r.requested_date] = { ...summary[r.requested_date], hasRequest: true }
      })
      setDaySummary(summary)
    }

    fetchData()
    fetchSummary()
  }, [selectedDate, supabase])

  const handleInstantBuy = (schedule: any) => {
    addItem({
      id: schedule.dishes.id,
      name: schedule.dishes.name,
      price: Number(schedule.dishes.price),
      image_url: schedule.dishes.image_url
    })
    setAddedIds(prev => new Set(prev).add(schedule.id))
    showToast(`${schedule.dishes.name} added to cart!`, 'success')
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(schedule.id)
        return next
      })
    }, 1500)
  }

  const submitRequest = async () => {
    if (!requestDish) return
    setRequesting(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          dish_id: requestDish.id,
          requested_date: format(selectedDate, 'yyyy-MM-dd'),
          quantity: requestQty,
          status: 'pending'
        })
      
      if (!error) {
        setShowRequestModal(false)
        setRequestDish(null)
        showToast('Request sent to the Chef!', 'success')
      } else {
        showToast('Operation failed. Seek frequency later.', 'error')
      }
    } else {
      showToast('Login required for protocol.', 'info')
    }
    setRequesting(false)
  }

  const hasItems = kitchenSchedules.length > 0 || userBatches.length > 0

  return (
    <div className="w-full flex flex-col p-6 pb-24 space-y-8 mesh-bg min-h-screen">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Kitchen Calendar</h1>
        <p className="text-sm font-subheading italic text-gray-400">Discover planned batches and suggest your own.</p>
      </header>
      
      {/* Date Scroller */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-2">
          {dates.map((date) => {
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`snap-center flex flex-col items-center justify-center min-w-[72px] h-24 rounded-3xl transition-all duration-500 relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-[#268C7F] text-white shadow-xl shadow-[#268C7F]/20 scale-105' 
                    : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                }`}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-date" 
                    className="absolute inset-0 bg-gradient-to-br from-[#268C7F] to-[#1E7469]" 
                  />
                )}
                <span className={`relative text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-gray-300'}`}>
                  {format(date, 'EEE')}
                </span>
                <span className="relative text-2xl font-black mt-1">
                  {format(date, 'd')}
                </span>
                
                {/* Activity Dots */}
                <div className="relative flex gap-1 mt-2 h-1.5 items-center">
                  {daySummary[format(date, 'yyyy-MM-dd')]?.hasSchedule && (
                     <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#E1803A] animate-pulse'}`} />
                  )}
                  {daySummary[format(date, 'yyyy-MM-dd')]?.hasRequest && (
                     <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-[#06B6D4]'}`} />
                  )}
                  {!daySummary[format(date, 'yyyy-MM-dd')] && isSelected && (
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             {format(selectedDate, 'EEEE, d MMMM')}
           </h2>
           <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
             <CalendarIcon size={14} className="text-[#268C7F]" />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex justify-center"
            >
               <div className="w-6 h-6 border-2 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {userBatches.map(batch => (
                <BentoCard key={batch.id} className="border-[#06B6D4]/10 bg-gradient-to-br from-[#06B6D4]/5 to-transparent p-0 overflow-hidden">
                  <div className="p-5 flex items-start gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#06B6D4] shadow-sm border border-cyan-50">
                        <Users size={24} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <p className="text-[#06B6D4] text-[10px] font-black uppercase tracking-[0.2em]">Community Batch</p>
                           <span className="w-1 h-1 rounded-full bg-cyan-200" />
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">Chef is orchestrating <b>{batch.dishes?.name}</b> for a private group. Join them?</p>
                     </div>
                  </div>
                  <div className="px-5 pb-5">
                     <MatteButton size="sm" variant="cyan" className="w-full font-black text-[10px] tracking-widest uppercase py-4 rounded-xl shadow-lg shadow-cyan-100">
                        Secure Spot in Batch
                     </MatteButton>
                  </div>
                </BentoCard>
              ))}

              {kitchenSchedules.map(schedule => (
                <BentoCard key={schedule.id} className="group p-0 border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden">
                  <div className="relative h-56 w-full">
                     {schedule.dishes?.image_url ? (
                        <Image src={schedule.dishes.image_url} alt={schedule.dishes.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                     ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 italic">No Glimpse</div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                     <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                        <div className="max-w-[70%]">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="bg-[#E1803A] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">Kitchen Slot</span>
                              <div className="flex gap-1">
                                 {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/40" />)}
                              </div>
                           </div>
                           <h3 className="text-2xl font-black tracking-tighter leading-none">{schedule.dishes?.name}</h3>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">Price</p>
                           <p className="text-2xl font-black tracking-tighter tabular-nums">${schedule.dishes?.price}</p>
                        </div>
                     </div>
                  </div>
                   <div className="p-5 flex items-center justify-between bg-white border-t border-gray-50">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                           <div className={`w-3 h-3 rounded-full ${schedule.servings_remaining > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
                           {schedule.servings_remaining > 0 && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-30" />}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {schedule.servings_remaining > 0 ? `${schedule.servings_remaining} Servings Remaining` : 'Booked Full'}
                        </p>
                     </div>
                     {schedule.servings_remaining > 0 ? (
                       <MatteButton 
                        size="sm" 
                        variant="teal" 
                        className="px-8 rounded-xl"
                        onClick={() => handleInstantBuy(schedule)}
                       >
                          {addedIds.has(schedule.id) ? (
                            <span className="flex items-center gap-2">
                               <Check size={14} className="animate-in zoom-in" /> Confirmed
                            </span>
                          ) : 'Instant Buy'}
                       </MatteButton>
                     ) : (
                       <button 
                        onClick={() => window.location.href = `https://wa.me/919876543210?text=I'd like to book ${schedule.dishes?.name} for ${schedule.scheduled_date}`}
                        className="text-[10px] font-black text-[#268C7F] uppercase tracking-widest border border-[#268C7F]/20 px-4 py-2 rounded-xl hover:bg-[#268C7F]/5 transition-colors"
                       >
                         Contact Kitchen
                       </button>
                     )}
                  </div>
                </BentoCard>
              ))}

              {!hasItems && (
                <div className="mt-8 text-center border-2 border-dashed border-gray-100 rounded-[3rem] p-16 bg-white/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                     <ChefHat size={80} />
                  </div>
                  <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto mb-8 flex items-center justify-center text-3xl shadow-xl ring-1 ring-black/[0.05]">
                    🍲
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">Chef is Listening</h3>
                  <p className="text-[11px] text-gray-400 mb-10 max-w-[200px] mx-auto font-medium leading-relaxed tracking-wide">
                    The kitchen has no scheduled batches for this date. Be the pioneer.
                  </p>
                  <MatteButton size="lg" variant="orange" className="rounded-2xl px-12 group" onClick={() => setShowRequestModal(true)}>
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> Request Flavor
                  </MatteButton>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-end justify-center p-6"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Suggest a Dish</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">For {format(selectedDate, 'MMM d')}</p>
              </div>

              <div className="relative mb-6">
                 <Search className="absolute left-4 top-3.5 text-gray-300" size={16} />
                 <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#268C7F]" placeholder="Search catalog..." />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                 {availableDishes.map(dish => {
                    const isAlreadyScheduled = kitchenSchedules.some(s => s.dishes.id === dish.id) || userBatches.some(b => b.dishes.id === dish.id)
                    return (
                      <button 
                        key={dish.id} 
                        disabled={isAlreadyScheduled}
                        onClick={() => setRequestDish(dish)}
                        className={`w-full p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                          isAlreadyScheduled ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' :
                          requestDish?.id === dish.id ? 'bg-[#268C7F]/5 border-[#268C7F] shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                         <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            {dish.image_url ? <Image src={dish.image_url} alt={dish.name} fill className="object-cover" /> : <div className="bg-gray-100 w-full h-full" />}
                         </div>
                         <div className="text-left flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{dish.name}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] text-[#268C7F] font-black uppercase tracking-tighter">
                                 {isAlreadyScheduled ? 'Already Preparing' : `$${dish.price}`}
                               </p>
                               {isAlreadyScheduled && <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />}
                            </div>
                         </div>
                         {requestDish?.id === dish.id && <Check size={16} className="text-[#268C7F]" />}
                         {isAlreadyScheduled && <ChefHat size={14} className="text-gray-300" />}
                      </button>
                    )
                 })}
              </div>

              {requestDish && (
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex items-center justify-between shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Serving Units</p>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setRequestQty(Math.max(1, requestQty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">-</button>
                    <span className="font-bold text-gray-800">{requestQty}</span>
                    <button type="button" onClick={() => setRequestQty(requestQty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">+</button>
                  </div>
                </div>
              )}

              <div className="pt-6">
                 <MatteButton 
                  size="md" 
                  variant="teal" 
                  className="w-full py-6 rounded-2xl" 
                  disabled={!requestDish || requesting}
                  onClick={submitRequest}
                 >
                    {requesting ? 'Sending...' : 'Send Request to Chef'}
                 </MatteButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
