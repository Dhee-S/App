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

  const defaultSlide = {
    id: 'brand-welcome',
    name: "DD's Kitchen",
    description: "Authentic, Small-Batch Homemade Meals.",
    price: 0,
    image_url: "/logo.jpg",
    category: "Gourmet",
    scheduled_date: new Date().toISOString(),
    servings_remaining: 0
  }

  const activeDishes = dishes.length > 0 ? dishes : [defaultSlide]
  const currentDish = activeDishes[index] || activeDishes[0]

  useEffect(() => {
    if (activeDishes.length <= 1) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeDishes.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [activeDishes.length])

  const handleAddToCart = () => {
    if (currentDish.id === 'brand-welcome') {
       window.scrollTo({ top: 600, behavior: 'smooth' })
       return
    }
    addItem({
      id: currentDish.id,
      name: currentDish.name,
      price: currentDish.price,
      image_url: currentDish.image_url
    })
    showToast(`Added ${currentDish.name} to cart!`, 'success')
  }

  return (
    <div ref={ref} className="relative h-[25rem] w-full overflow-hidden shrink-0 rounded-b-[4rem] shadow-2xl z-10 bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentDish.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
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
            <div className="w-full h-full bg-gray-100" />
          )}
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      
      <div className="absolute inset-x-0 bottom-12 px-8 z-20">
        <motion.div
          key={`content-${currentDish.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs space-y-4"
        >
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                {currentDish.id === 'brand-welcome' ? (
                  <div className="bg-[#268C7F] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em]">
                    Authentic Homemade
                  </div>
                ) : (
                  <>
                    <div className="bg-[#CE9146] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                      <Sparkles size={10} /> Just Special
                    </div>
                    {currentDish.servings_remaining !== undefined && (
                      <span className="text-white text-[10px] font-black tracking-widest">{currentDish.servings_remaining} Servings Left</span>
                    )}
                  </>
                )}
             </div>
          </div>

          <div>
             <h1 className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg mb-2">
               {currentDish.name}
             </h1>
             <p className="text-white/70 text-[11px] font-medium leading-relaxed italic line-clamp-2 max-w-[90%]">
               {currentDish.id === 'brand-welcome' 
                 ? "Our Protocol: Fresh ingredients, Small-batch, High-Trust Delivery."
                 : currentDish.description}
             </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {currentDish.id !== 'brand-welcome' ? (
              <>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-[#CE9146] font-black uppercase tracking-widest">Available On</span>
                   <span className="text-sm font-black text-white">{new Date(currentDish.scheduled_date!).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                </div>
                <MatteButton size="md" variant="teal" className="rounded-2xl px-12 shadow-xl shadow-[#268C7F]/20" onClick={handleAddToCart}>
                   Claim Now
                </MatteButton>
              </>
            ) : (
               <MatteButton size="md" variant="white" className="rounded-2xl px-12 text-[#268C7F] font-black shadow-xl" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                  See Menu
               </MatteButton>
            )}
          </div>
        </motion.div>
      </div>

      <div className="absolute top-6 right-6 z-40">
        <ShareButton variant="minimal" />
      </div>

      {activeDishes.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-between z-30 pointer-events-none">
           <button 
            onClick={() => setIndex((index - 1 + activeDishes.length) % activeDishes.length)}
            className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white pointer-events-auto transition-all"
           >
             <ChevronLeft size={24} />
           </button>
           <button 
            onClick={() => setIndex((index + 1) % activeDishes.length)}
            className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white pointer-events-auto transition-all"
           >
             <ChevronRight size={24} />
           </button>
        </div>
      )}
    </div>
  )
}
