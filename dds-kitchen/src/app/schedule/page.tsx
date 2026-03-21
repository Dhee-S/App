'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { CalendarGrid } from '@/components/CalendarGrid'
import { format, addDays, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChefHat, Plus, Check, X, Search, Sparkles, Clock, UtensilsCrossed, ArrowRight, ShoppingBag, Flame, MessageCircleHeart } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/store/useCart'
import { useToast } from '@/components/Toast'

export default function SchedulePage() {
  const supabase = createClient()
  const addItem = useCart(state => state.addItem)
  const { showToast } = useToast()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [kitchenSchedules, setKitchenSchedules] = useState<any[]>([])
  const [availableDishes, setAvailableDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestDish, setRequestDish] = useState<any>(null)
  const [requesting, setRequesting] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [requestQty, setRequestQty] = useState(1)
  const [daySummary, setDaySummary] = useState<Record<string, { status: 'admin_scheduled' | 'accepted_request' | 'pending_request' | 'none' }>>({})
  const [dishSearch, setDishSearch] = useState('')

  const filteredDishes = availableDishes.filter(dish => 
    dish.name.toLowerCase().includes(dishSearch.toLowerCase())
  )

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      const [schedRes, dishRes] = await Promise.all([
        supabase.from('schedules').select('*, dishes(*)').eq('scheduled_date', dateStr),
        supabase.from('dishes').select('*').eq('is_available', true)
      ])

      setKitchenSchedules(schedRes.data || [])
      setAvailableDishes(dishRes.data || [])
      setLoading(false)
    }

    async function fetchSummary() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: scheds } = await supabase.from('schedules').select('scheduled_date')
      
      let userRequests: any[] = []
      if (user) {
        const { data: reqs } = await supabase.from('requests').select('requested_date, status').eq('user_id', user.id)
        userRequests = reqs || []
      }

      const summary: Record<string, { status: 'admin_scheduled' | 'accepted_request' | 'pending_request' | 'none' }> = {}
      
      userRequests.forEach(r => {
        const currentStatus = summary[r.requested_date]?.status
        if (currentStatus !== 'admin_scheduled') {
           if (r.status === 'accepted') summary[r.requested_date] = { status: 'accepted_request' }
           else if (r.status === 'pending' && currentStatus !== 'accepted_request') summary[r.requested_date] = { status: 'pending_request' }
        }
      })

      scheds?.forEach(s => {
        summary[s.scheduled_date] = { status: 'admin_scheduled' }
      })
      
      setDaySummary(summary)
    }

    fetchData()
    fetchSummary()
    setMounted(true)
  }, [selectedDate, supabase])

  const handleInstantBuy = (schedule: any) => {
    addItem({
      id: schedule.dishes.id,
      name: schedule.dishes.name,
      price: Number(schedule.dishes.price),
      image_url: schedule.dishes.image_url,
      schedule_id: schedule.id
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

  const hasItems = kitchenSchedules.length > 0

  if (!mounted) return null

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
      
      <div className="flex justify-center w-full relative z-10 -mt-2 mb-2">
        <CalendarGrid 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          indicators={daySummary} 
        />
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
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#268C7F] to-teal-400" />
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[#268C7F]" />
                  <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Suggest a Dish</h2>
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
                    const isAlreadyScheduled = kitchenSchedules.some(s => s.dishes.id === dish.id)
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
