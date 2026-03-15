'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BentoCard } from '@/components/BentoCard'
import { MatteButton } from '@/components/MatteButton'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, User, ChefHat, Check, X, Sparkles, Clock, MapPin, ChevronRight } from 'lucide-react'
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
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(today, i))
  
  const [selectedDate, setSelectedDate] = useState(
    params.date ? parseISO(params.date) : today
  )
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDecision = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      fetchRequests()
      showToast(`Request ${status === 'accepted' ? 'incorporated into batch' : 'declined'}.`, status === 'accepted' ? 'success' : 'info')
    } else {
      showToast(`Coordination error: ${error.message}`, 'error')
    }
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

      {/* Date Scroller */}
      <div className="relative shrink-0">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
          {dates.map((date) => {
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`snap-center flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all duration-500 relative overflow-hidden ${
                  isSelected 
                    ? 'bg-[#268C7F] text-white shadow-xl shadow-[#268C7F]/20 scale-105' 
                    : 'bg-white text-gray-400 border border-gray-100 shadow-sm'
                }`}
              >
                <span className={`relative text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-gray-300'}`}>
                  {format(date, 'MMM')}
                </span>
                <span className="relative text-xl font-black mt-1">
                  {format(date, 'd')}
                </span>
                {isSelected && (
                  <motion.div layoutId="selection-dot" className="absolute bottom-2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BentoCard className="p-5 flex flex-col gap-4 border-gray-100 shadow-lg shadow-black/[0.02]">
                    <div className="flex gap-4">
                       <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                          {req.dishes?.image_url ? (
                            <Image src={req.dishes.image_url} alt={req.dishes.name} fill className="object-cover" />
                          ) : (
                            <ChefHat className="w-full h-full p-4 text-gray-200" />
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#268C7F] mb-1">New Suggestion</p>
                            {req.quantity > 1 && (
                              <span className="bg-[#268C7F]/5 text-[#268C7F] text-[9px] font-black px-2 py-0.5 rounded-lg border border-[#268C7F]/10">
                                {req.quantity} UNITS
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-black text-gray-800 leading-tight truncate">{req.dishes?.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><User size={10} /></div>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{req.profiles?.full_name || 'Guest Explorer'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                       <button 
                        onClick={() => handleDecision(req.id, 'declined')}
                        className="flex-1 h-12 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                       >
                         <X size={16} /> Decline
                       </button>
                       <button 
                        onClick={() => handleDecision(req.id, 'accepted')}
                        className="flex-[2] h-12 rounded-xl bg-[#268C7F] text-white shadow-lg shadow-[#268C7F]/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-transform active:scale-95"
                       >
                         <Check size={16} /> Orchestrate Batch
                       </button>
                    </div>
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
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Active Batch Commitments</h2>
          <div className="space-y-3">
             {accepted.map(req => (
               <div key={req.id} className="group relative p-4 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-center justify-between hover:border-[#268C7F]/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-[#268C7F]/5 text-[#268C7F] flex items-center justify-center">
                        <Check size={18} strokeWidth={3} />
                     </div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{req.dishes?.name}</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Initiated by {req.profiles?.full_name}</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#268C7F] group-hover:text-white transition-colors">
                     <ChevronRight size={14} />
                  </div>
               </div>
             ))}
             {accepted.length === 0 && (
               <p className="text-center py-4 text-[10px] font-black text-gray-200 uppercase tracking-widest italic">No accepted trajectories yet.</p>
             )}
          </div>
        </section>
      </div>
    </div>
  )
}
