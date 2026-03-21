import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MatteButton } from './MatteButton'
import { ChevronLeft, ChevronRight, Sparkles, Compass, ChefHat, Zap } from 'lucide-react'
import { useCart } from '@/store/useCart'
import { useToast } from './Toast'
import { ShareButton } from './ShareButton'

interface Dish {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  is_veg?: boolean
  scheduled_date?: string
  servings_remaining?: number
}

interface ParallaxHeaderProps {
  dishes: Dish[]
  exploreMode?: boolean
}

export function ParallaxHeader({ dishes, exploreMode }: ParallaxHeaderProps) {
  const [index, setIndex] = useState(0)
  const addItem = useCart(state => state.addItem)
  const { showToast } = useToast()
  const ref = useRef(null)
  
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 80])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.4])

  useEffect(() => {
    if (dishes.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dishes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [dishes.length])

  const currentDish = dishes[index] || dishes[0]

  const handleAddToCart = () => {
    if (!currentDish) return
    addItem({
      id: currentDish.id,
      name: currentDish.name,
      price: currentDish.price,
      image_url: currentDish.image_url
    })
    showToast(`Added ${currentDish.name} to cart!`, 'success')
  }

  if (!currentDish) return null

  return (
    <div ref={ref} className="relative h-[25rem] w-full overflow-hidden shrink-0 rounded-b-[4rem] shadow-2xl z-10 bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentDish.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          style={{ y, opacity }}
          className="absolute inset-0 w-full h-full"
        >
          {currentDish.image_url ? (
            <Image
              src={currentDish.image_url}
              alt={currentDish.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Premium Glass Bottom Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
      
      {/* Content Layer */}
      <div className="absolute inset-x-0 bottom-12 px-8 z-20">
        <motion.div
          key={`content-${currentDish.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs space-y-4"
        >
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2">
                <div className="bg-[#268C7F] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                  <ChefHat size={10} strokeWidth={3} /> Verified Kitchen Protocol
                </div>
                {currentDish.servings_remaining !== undefined && (
                   <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 animate-pulse">
                     <Zap size={10} strokeWidth={3} /> {currentDish.servings_remaining} Left
                   </div>
                )}
             </div>

             {/* Simple Purpose Outline for New Users */}
             <div className="text-[10px] text-white/50 font-medium uppercase tracking-[0.1em] border-l border-white/20 pl-2">
                Savor small-batch excellence, direct from our kitchen to your door.
             </div>
          </div>

          <div>
             {currentDish.scheduled_date && (
                <p className="text-[#CE9146] text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                   Coming On: {new Date(currentDish.scheduled_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                </p>
             )}
             <h1 className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg mb-2 capitalize">
               {exploreMode ? 'Explore Flavors' : currentDish.name}
             </h1>
             {!exploreMode && (
               <p className="text-white/70 text-[11px] font-medium leading-relaxed italic line-clamp-1 max-w-[80%]">
                 {currentDish.description}
               </p>
             )}
          </div>

          <div className="flex items-center gap-6 pt-2">
            {!exploreMode ? (
              <>
                <div className="flex flex-col">
                   <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5">Launch Price</span>
                   <span className="text-2xl font-black text-white leading-none tabular-nums tracking-tighter">{'₹' + currentDish.price}</span>
                </div>
                <MatteButton size="md" variant="teal" className="rounded-2xl px-12 shadow-xl shadow-[#268C7F]/20" onClick={handleAddToCart}>
                   Claim Now
                </MatteButton>
              </>
            ) : (
              <MatteButton size="md" variant="white" className="rounded-2xl px-10 text-[#268C7F] font-black" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                 Begin Experience
              </MatteButton>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Button Integration */}
      <div className="absolute top-6 right-6 z-40">
        <ShareButton variant="minimal" />
      </div>

      {/* Controls */}
      {dishes.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-between z-30 pointer-events-none">
           <button 
            onClick={() => setIndex((index - 1 + dishes.length) % dishes.length)}
            className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white pointer-events-auto transition-all hover:bg-white/10"
           >
             <ChevronLeft size={24} />
           </button>
           <button 
            onClick={() => setIndex((index + 1) % dishes.length)}
            className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white pointer-events-auto transition-all hover:bg-white/10"
           >
             <ChevronRight size={24} />
           </button>
        </div>
      )}
    </div>
  )
}
