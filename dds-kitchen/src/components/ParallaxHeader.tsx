import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MatteButton } from './MatteButton'
import { ChevronLeft, ChevronRight, Sparkles, Compass } from 'lucide-react'
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
    <div ref={ref} className="relative h-[24rem] w-full overflow-hidden shrink-0 rounded-b-[3.5rem] shadow-2xl z-10 bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentDish.id}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
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

      {/* Premium Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-10 px-8 z-20">
        <motion.div
          key={`content-${currentDish.id}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-xs"
        >
          <div className="flex items-center gap-3 mb-4">
             {exploreMode ? (
               <div className="bg-[#268C7F] text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                 <Compass size={12} strokeWidth={3} className="animate-spin-slow" /> Discover Flavors
               </div>
             ) : (
               <div className="bg-[#E1803A] text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                 <Sparkles size={12} strokeWidth={3} /> Today's Special
               </div>
             )}
             {currentDish.is_veg !== undefined && (
               <div className={`w-2.5 h-2.5 rounded-full border border-white/40 ${currentDish.is_veg ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px] ${currentDish.is_veg ? 'shadow-green-500/40' : 'shadow-red-500/40'}`} />
             )}
             {dishes.length > 1 && (
               <div className="flex gap-1.5 ml-1">
                 {dishes.map((_, i) => (
                   <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === index ? 'w-5 bg-white' : 'w-1 bg-white/30'}`} />
                 ))}
               </div>
             )}
          </div>

          <h1 className="text-4xl font-black text-white leading-[0.9] tracking-tighter mb-3 drop-shadow-2xl">
            {exploreMode ? 'Explore the Menu' : currentDish.name}
          </h1>
          {!exploreMode && (
            <p className="text-white/70 text-xs font-subheading italic line-clamp-2 max-w-[90%] mb-8 leading-relaxed">
              {currentDish.description}
            </p>
          )}
          {exploreMode && (
            <p className="text-white/70 text-xs font-subheading italic mb-8 leading-relaxed">
              Handpicked culinary trajectories just for you.
            </p>
          )}

          <div className="flex items-center gap-6">
            {!exploreMode ? (
              <>
                <div className="flex flex-col">
                   <span className="text-[10px] text-white/50 font-black uppercase tracking-widest mb-1.5">Price</span>
                   <span className="text-2xl font-black text-white leading-none tabular-nums tracking-tighter shadow-sm">{'₹' + currentDish.price}</span>
                </div>
                <MatteButton size="md" variant="teal" className="rounded-2xl px-10 shadow-xl" onClick={handleAddToCart}>
                   Experience
                </MatteButton>
              </>
            ) : (
              <MatteButton size="md" variant="white" className="rounded-2xl px-12 text-[#268C7F] font-black shadow-xl" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                 Start Order
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
