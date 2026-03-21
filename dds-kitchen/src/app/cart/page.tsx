'use client'

import { useState, useEffect } from 'react'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { useCart } from '@/store/useCart'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShieldCheck, X, Check, Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/Toast'
import Image from 'next/image'
import Link from 'next/link'
import QRCode from 'react-qr-code'

export default function CartPage() {
  const { items, removeItem, addItem, totalPrice, clearCart } = useCart()
  const { showToast } = useToast() || { showToast: (msg: string) => console.log(msg) }
  const supabase = createClient()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const subtotal = totalPrice()
  const fees = items.length > 0 ? 5.00 : 0
  const total = subtotal + fees
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || ''
  // Hardened UPI Intent with standard parameters for better app compatibility
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("DD's Kitchen")}&am=${total.toFixed(2)}&cu=INR&mode=02&purpose=00`

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setStep(1)
  }

  const handleCheckoutSubmit = async () => {
    setUploading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('Please login to place order', 'error')
        setUploading(false)
        window.location.href = '/App/login'
        return
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending_verification', // High-Trust zero-step skip directly to pending_verification
          is_paid: false
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(orderError.message)
      }

      for (const item of items) {
        const { error: itemError } = await supabase.from('order_items').insert({
          order_id: order.id,
          dish_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })

        if (!itemError && item.schedule_id) {
           const { data: schedule } = await supabase.from('schedules')
             .select('servings_remaining')
             .eq('id', item.schedule_id)
             .single()
             
           if (schedule) {
             await supabase.from('schedules').update({
               servings_remaining: Math.max(0, schedule.servings_remaining - item.quantity)
             }).eq('id', item.schedule_id)
           }
        }
      }

      setStep(3)
      setTimeout(() => {
        setIsCheckingOut(false)
        clearCart()
        showToast('Order Placed! Awaiting Verification.', 'success')
        window.location.href = '/App/orders'
      }, 2000)

    } catch (error: any) {
      console.error('Error:', error)
      showToast('An error occurred: ' + (error?.message || 'Unknown'), 'error')
    }
    
    setUploading(false)
  }

  if (items.length === 0 && !isCheckingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">
           🛒
        </div>
        <h1 className="text-2xl font-black text-gray-800">Your bag is empty</h1>
        <p className="text-gray-400 text-sm max-w-[240px]">Seems like you haven't discovered your flavor yet.</p>
        <Link href="/">
          <MatteButton variant="teal">
            Discover Dishes
          </MatteButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col pt-12 px-6 pb-24">
      <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tighter shiny-text">Your Bag</h1>
      
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <BentoCard className="p-3 flex items-center gap-4 border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.image_url ? (
                     <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-sm font-black text-[#268C7F] mt-1">{'₹' + item.price}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm"
                      >
                         <Minus size={14} />
                      </button>
                      <span className="text-sm font-black w-4 text-center text-gray-700">{item.quantity}</span>
                      <button 
                        onClick={() => addItem(item)}
                        className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm"
                      >
                         <Plus size={14} />
                      </button>
                   </div>
                </div>
              </BentoCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-auto space-y-6">
        <div className="border-t border-gray-100 pt-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="text-gray-800">{'₹' + subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Kitchen Fees</span>
              <span className="text-gray-800">₹5.00</span>
          </div>
          <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-gray-800">Total</span>
              <span className="text-2xl font-black text-[#268C7F] tracking-tighter">{'₹' + total.toFixed(2)}</span>
          </div>
        </div>

        <MatteButton size="lg" variant="orange" className="w-full text-xl py-6 rounded-3xl" onClick={handleCheckout}>
           Place Order • {'₹' + total.toFixed(2)}
        </MatteButton>
      </div>

      {/* Trust-Based Payment Loop Modal */}
      <AnimatePresence>
        {isCheckingOut && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 p-6 flex items-end justify-center sm:items-center"
          >
             <motion.div
               initial={{ y: 100 }}
               animate={{ y: 0 }}
               exit={{ y: 100 }}
               className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
             >
                <button 
                  onClick={() => setIsCheckingOut(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                {step === 1 && (
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Settlement</h2>
                      <p className="text-sm text-gray-400 font-medium mt-1">Zero-Friction Gateway</p>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-6 mx-auto border-4 border-dashed border-gray-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[14rem]">
                       <div className="absolute inset-0 bg-gradient-to-br from-[#268C7F]/5 to-transparent" />
                       
                       {isMobile ? (
                         <div className="text-center z-10 w-full space-y-6">
                            <span className="text-5xl block animate-bounce" style={{animationDuration: '3s'}}>📱</span>
                            
                            <div className="grid grid-cols-1 gap-3 w-full">
                               <a 
                                 href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent("DD's Kitchen")}&am=${total.toFixed(2)}&cu=INR&mode=02&purpose=00`} 
                                 className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-[#268C7F] active:scale-95 transition-all text-left group"
                               >
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">GPay</div>
                                  <div className="flex-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-[#268C7F]">Intent Protocol 01</p>
                                     <p className="text-sm font-bold text-gray-700">Google Pay / Generic UPI</p>
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#268C7F]" />
                               </a>

                               <a 
                                 href={`phonepe://pay?pa=${upiId}&pn=${encodeURIComponent("DD's Kitchen")}&am=${total.toFixed(2)}&cu=INR&mode=02&purpose=00`} 
                                 className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-purple-600 active:scale-95 transition-all text-left group"
                               >
                                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-xs">PH</div>
                                  <div className="flex-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Intent Protocol 02</p>
                                     <p className="text-sm font-bold text-gray-700">PhonePe App</p>
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-600" />
                               </a>

                               <a 
                                 href={`paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent("DD's Kitchen")}&am=${total.toFixed(2)}&cu=INR&mode=02&purpose=00`} 
                                 className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 active:scale-95 transition-all text-left group"
                               >
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 font-black text-xs">PY</div>
                                  <div className="flex-1">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Intent Protocol 03</p>
                                     <p className="text-sm font-bold text-gray-700">Paytm Digital Wallet</p>
                                  </div>
                                  <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                               </a>
                            </div>

                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Tap to launch respective app</p>
                         </div>
                       ) : (
                         <div className="z-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <QRCode value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent("DD's Kitchen")}&am=${total.toFixed(2)}&cu=INR&mode=02&purpose=00`} size={150} fgColor="#268C7F" />
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-4">Scan using any UPI App</p>
                         </div>
                       )}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 text-left">
                       <ShieldCheck className="text-[#268C7F] shrink-0" size={24} />
                       <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          We operate on a <span className="text-[#268C7F] font-black uppercase tracking-widest text-[10px]">High-Trust Protocol</span>. Once paid, simply confirm below.
                       </p>
                    </div>

                    <MatteButton size="md" variant="teal" className="w-full flex justify-center items-center gap-2" onClick={handleCheckoutSubmit} disabled={uploading}>
                       {uploading ? <Loader2 size={16} className="animate-spin" /> : "I've Paid " + '₹' + total.toFixed(2)}
                    </MatteButton>
                  </div>
                )}

                {step === 3 && (
                   <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-[#268C7F] rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-[#268C7F]/30">
                         <Check size={40} strokeWidth={3} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Verification Pending</h2>
                        <p className="text-sm text-gray-400 font-medium mt-2">Connecting to Command Center...</p>
                      </div>
                   </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
