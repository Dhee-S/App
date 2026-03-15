'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { format, addDays, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChefHat, Users, Plus, Check, X, Search, Sparkles, Clock, UtensilsCrossed, ArrowRight, ShoppingBag, Flame, PartyPopper, MessageCircleHeart } from 'lucide-react'
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
  const [dishSearch, setDishSearch] = useState('')

  const filteredDishes = availableDishes.filter(dish => 
    dish.name.toLowerCase().includes(dishSearch.toLowerCase())
  )

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
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            🍳
          </motion.div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Kitchen Calendar</h1>
        </div>
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
              {userBatches.map((batch, idx) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <BentoCard className="border-[#06B6D4]/10 bg-gradient-to-br from-[#06B6D4]/5 to-transparent p-0 overflow-hidden relative">
                    {/* Animated cyan glow */}
                    <motion.div 
                      animate={{ 
                        background: ['radial-gradient(circle at 0% 0%, rgba(6,182,212,0.1) 0%, transparent 50%)', 'radial-gradient(circle at 100% 100%, rgba(6,182,212,0.15) 0%, transparent 50%)']
                      }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      className="absolute inset-0 pointer-events-none" 
                    />
                    
                    <div className="p-5 flex items-start gap-4 relative z-10">
                       <motion.div 
                         whileHover={{ rotate: 360 }}
                         transition={{ duration: 0.8 }}
                         className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#06B6D4] shadow-sm border border-cyan-50"
                       >
                          <Users size={24} />
                       </motion.div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <motion.p 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               className="text-[#06B6D4] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1"
                             >
                               <PartyPopper size={12} className="animate-bounce" />
                               Community Batch
                             </motion.p>
                             <motion.span 
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{ delay: 0.2 }}
                               className="w-1 h-1 rounded-full bg-cyan-300" 
                             />
                          </div>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed">
                            Chef is orchestrating <b className="text-gray-900">{batch.dishes?.name || 'Gourmet Batch'}</b> for a private group. Join them?
                          </p>
                          <p className="text-[10px] text-[#06B6D4] font-bold mt-2">
                            Requested: {batch.quantity || 1} servings
                          </p>
                       </div>
                    </div>
                    <div className="px-5 pb-5 relative z-10">
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => {
                           if (!batch.dishes) {
                             showToast('Dish details missing from protocol.', 'error')
                             return
                           }
                           addItem({
                             id: batch.dishes.id,
                             name: batch.dishes.name,
                             price: Number(batch.dishes.price),
                             image_url: batch.dishes.image_url
                           })
                           showToast(`${batch.dishes.name} added to cart!`, 'success')
                         }}
                         className="w-full py-4 bg-gradient-to-r from-[#06B6D4] to-cyan-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-100 flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                      >
                          <Users size={14} /> Secure Spot in Batch
                       </motion.button>
                    </div>
                  </BentoCard>
                </motion.div>
              ))}

              {kitchenSchedules.map((schedule, idx) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <BentoCard className="group p-0 border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden relative">
                    {/* Animated kitchen badge */}
                    <motion.div 
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="absolute top-4 left-4 z-10 flex items-center gap-2"
                    >
                      <span className="bg-[#E1803A] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Flame size={12} className="animate-pulse" />
                        Kitchen Slot
                      </span>
                    </motion.div>

                    <div className="relative h-56 w-full">
                      {schedule.dishes?.image_url ? (
                         <Image src={schedule.dishes.image_url} alt={schedule.dishes.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                      ) : (
                         <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 italic">No Glimpse</div>
                      )}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" 
                      />
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white"
                      >
                         <div className="max-w-[70%]">
                            <div className="flex items-center gap-2 mb-2">
                               <div className="flex gap-1">
                                  {[1,2,3].map(i => (
                                    <motion.div 
                                      key={i}
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8, repeat: Infinity }}
                                      className="w-1 h-1 rounded-full bg-white/60" 
                                    />
                                  ))}
                               </div>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter leading-none">{schedule.dishes?.name}</h3>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">Price</p>
                            <p className="text-2xl font-black tracking-tighter tabular-nums">{'₹' + schedule.dishes?.price}</p>
                         </div>
                      </motion.div>
                    </div>
                    <div className="p-5 flex items-center justify-between bg-white border-t border-gray-50">
                      <div className="flex items-center gap-3">
                         <motion.div 
                           whileHover={{ scale: 1.1 }}
                           className="relative"
                         >
                            <div className={`w-3 h-3 rounded-full ${schedule.servings_remaining > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
                            {schedule.servings_remaining > 0 && (
                              <motion.span 
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 w-3 h-3 rounded-full bg-green-500"
                              />
                            )}
                         </motion.div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {schedule.servings_remaining > 0 ? `${schedule.servings_remaining} Servings Left` : 'Fully Booked'}
                          </p>
                      </div>
                      {schedule.servings_remaining > 0 ? (
                        <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => handleInstantBuy(schedule)}
                         className="px-6 py-3 bg-[#268C7F] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#268C7F]/20 flex items-center gap-2 hover:shadow-xl hover:shadow-[#268C7F]/30 transition-all"
                        >
                           {addedIds.has(schedule.id) ? (
                             <span className="flex items-center gap-2">
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} /></motion.span> 
                                <ShoppingBag size={14} /> Confirmed
                             </span>
                           ) : (
                             <>
                               Instant Buy <ArrowRight size={14} />
                             </>
                           )}
                        </motion.button>
                      ) : (
                        <button 
                          onClick={() => window.location.href = `https://wa.me/917904935160?text=I'd like to book ${schedule.dishes?.name} for ${schedule.scheduled_date}`}
                         className="text-[10px] font-black text-[#268C7F] uppercase tracking-widest border border-[#268C7F]/20 px-4 py-2 rounded-xl hover:bg-[#268C7F]/5 transition-colors flex items-center gap-1"
                        >
                          Contact <MessageCircleHeart size={12} />
                        </button>
                      )}
                    </div>
                  </BentoCard>
                </motion.div>
              ))}

              {!hasItems && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center border-2 border-dashed border-orange-100 rounded-[3rem] p-12 bg-gradient-to-b from-orange-50/50 to-white relative overflow-hidden"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-0 right-0 p-8 opacity-20"
                  >
                     <ChefHat size={100} className="text-orange-400" />
                  </motion.div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center text-5xl shadow-xl">
                      🍲
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3">Chef is Listening</h3>
                    <p className="text-gray-400 text-sm max-w-[280px] mx-auto mb-8 leading-relaxed">
                      The kitchen has no scheduled batches for this date. Be the pioneer and request your favorite dish!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-[#E1803A] to-orange-400 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200 flex items-center gap-2 mx-auto"
                      onClick={() => setShowRequestModal(true)}
                    >
                      <Plus size={18} /> Request Flavor
                    </motion.button>
                  </div>
                </motion.div>
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
                 <input 
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#268C7F]" 
                   placeholder="Search catalog..."
                   value={dishSearch}
                   onChange={(e) => setDishSearch(e.target.value)}
                 />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                 {filteredDishes.map(dish => {
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
                                  {isAlreadyScheduled ? 'Already Preparing' : '₹' + dish.price}
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
