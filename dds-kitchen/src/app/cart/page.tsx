'use client'

import { useState } from 'react'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { useCart } from '@/store/useCart'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, Camera, ShieldCheck, X, Check } from 'lucide-react'
import { useToast } from '@/components/Toast'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, addItem, totalPrice, clearCart } = useCart()
  const { showToast } = useToast()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [step, setStep] = useState(1) // 1: QR, 2: Upload, 3: Success
  const [pastedImage, setPastedImage] = useState<string | null>(null)

  const subtotal = totalPrice()
  const fees = items.length > 0 ? 5.00 : 0
  const total = subtotal + fees

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setStep(1)
  }

  const handleUpload = () => {
    // Simulate upload
    setStep(3)
    setTimeout(() => {
      setIsCheckingOut(false)
      clearCart()
      showToast('Transaction received. Verification in progress.', 'success')
      window.location.href = '/orders'
    }, 2000)
  }

  if (items.length === 0 && !isCheckingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">
           🛒
        </div>
        <h1 className="text-2xl font-black text-gray-800">Your bag is empty</h1>
        <p className="text-gray-400 text-sm max-w-[240px]">Seems like you haven't discovered your flavor yet.</p>
        <MatteButton variant="teal" onClick={() => window.location.href = '/'}>
           Discover Dishes
        </MatteButton>
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
                  <p className="text-sm font-black text-[#268C7F] mt-1">${item.price}</p>
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
              <span className="text-gray-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-medium">
              <span>Kitchen Fees</span>
              <span className="text-gray-800">$5.00</span>
          </div>
          <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-gray-800">Total</span>
              <span className="text-2xl font-black text-[#268C7F] tracking-tighter">${total.toFixed(2)}</span>
          </div>
        </div>

        <MatteButton size="lg" variant="orange" className="w-full text-xl py-6 rounded-3xl" onClick={handleCheckout}>
           Place Order • ${total.toFixed(2)}
        </MatteButton>
      </div>

      {/* Payment Loop Modal Overlay */}
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
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>

                {step === 1 && (
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Settlement</h2>
                      <p className="text-sm text-gray-400 font-medium mt-1">Scan Chef's Private GPay</p>
                    </div>
                    
                    <div className="w-48 h-48 bg-gray-50 rounded-3xl mx-auto border-4 border-dashed border-gray-100 p-6 relative group overflow-hidden">
                       <div className="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#268C7F]/10 to-transparent" />
                          <span className="text-4xl">📱</span>
                       </div>
                       <div className="absolute inset-0 bg-[#268C7F]/5 animate-pulse rounded-3xl" />
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 text-left">
                       <ShieldCheck className="text-[#268C7F] shrink-0" size={24} />
                       <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          Your order remains <span className="text-gray-800 font-bold uppercase">Pending</span> until the Chef verifies your transaction proof.
                       </p>
                    </div>

                    <MatteButton size="md" variant="teal" className="w-full" onClick={() => setStep(2)}>
                       I've Paid ${total.toFixed(2)}
                    </MatteButton>
                  </div>
                )}

                {step === 2 && (
                   <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Confirm Batch</h2>
                        <p className="text-sm text-gray-400 font-medium mt-1">Upload your payment capture</p>
                      </div>

                      <div 
                        onClick={handleUpload}
                        className="border-2 border-dashed border-[#E1803A]/30 rounded-[2rem] p-10 text-center bg-[#E1803A]/5 hover:bg-[#E1803A]/10 transition-all cursor-pointer group"
                      >
                         <div className="w-16 h-16 bg-white rounded-2xl mx-auto shadow-md flex items-center justify-center text-[#E1803A] mb-4 group-hover:scale-110 transition-transform">
                            <Camera size={28} />
                         </div>
                         <span className="text-sm font-black text-gray-700">Drop Proof Here</span>
                         <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Screenshot / Photo</p>
                      </div>

                      <p className="text-[10px] text-gray-400 italic">
                         By uploading, you agree to the gourmet terms of service.
                      </p>
                   </div>
                )}

                {step === 3 && (
                   <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white shadow-xl shadow-green-200">
                         <Check size={40} strokeWidth={3} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Verification Sent</h2>
                        <p className="text-sm text-gray-400 font-medium mt-2">Checking with the Command Center...</p>
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
