'use client'

import { useState, useEffect } from 'react'
import { BentoCard } from '@/components/BentoCard'
import { ParallaxHeader } from '@/components/ParallaxHeader'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Check, Sparkles } from 'lucide-react'
import { useCart } from '@/store/useCart'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'
import { Footer } from '@/components/Footer'

const sampleDishes = [
  { id: 'sample-1', name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 16, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', is_veg: false, is_available: true, category: 'Lunch', is_featured: true },
  { id: 'sample-2', name: 'Vegetable Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 12, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', is_veg: true, is_available: true, category: 'Lunch', is_featured: false },
  { id: 'sample-3', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with herbs', price: 22, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800', is_veg: false, is_available: true, category: 'Dinner', is_featured: true },
  { id: 'sample-4', name: 'Paneer Tikka', description: 'Spiced cottage cheese with peppers', price: 14, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', is_veg: true, is_available: true, category: 'Snacks', is_featured: false },
  { id: 'sample-5', name: 'Masala Dosa', description: 'Crispy rice pancake with potato filling', price: 8, image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800', is_veg: true, is_available: true, category: 'Breakfast', is_featured: true },
]

export default function DiscoveryHome() {
  const supabase = createClient()
  const [dishes, setDishes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [vegOnly, setVegOnly] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const { showToast } = useToast()
  
  const addItem = useCart(state => state.addItem)
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Special']

  useEffect(() => {
    async function fetchDishes() {
      const { data } = await supabase
        .from('dishes')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
      
      if (data && data.length > 0) {
        setDishes(data)
      } else {
        setDishes(sampleDishes)
      }
    }
    fetchDishes()
  }, [supabase])

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase()) || 
                          dish.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory
    const matchesVeg = !vegOnly || dish.is_veg === true
    return matchesSearch && matchesCategory && matchesVeg
  })

  // Dishes for slideshow: marked as is_featured or in category 'Special'
  const explicitFeatured = dishes.filter(d => d.is_featured === true)
  const isExploreMode = explicitFeatured.length === 0
  const displayFeatured = isExploreMode ? dishes.slice(0, 5) : explicitFeatured

  const handleAddToCart = (dish: any) => {
    addItem({
      id: dish.id,
      name: dish.name,
      price: Number(dish.price),
      image_url: dish.image_url
    })
    setAddedIds(prev => new Set(prev).add(dish.id))
    showToast(`${dish.name} added to cart!`, 'success')
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(dish.id)
        return next
      })
    }, 1500)
  }

  return (
    <div className="w-full flex flex-col pb-24">
      {/* Slideshow Parallax Header */}
      <ParallaxHeader 
        exploreMode={isExploreMode}
        dishes={displayFeatured.map(d => ({
          ...d,
          price: Number(d.price)
        }))} 
      />

      <div className="p-6 space-y-8">
        {/* Modern Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#268C7F]/10 to-[#E1803A]/10 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all" />
          <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm group-focus-within:border-[#268C7F]/30 transition-all">
            <Search className="text-gray-400 mr-4" size={20} />
            <input 
              type="text" 
              placeholder="Search flavors, dishes..."
              className="bg-transparent border-none outline-none w-full text-gray-800 font-body placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Bento Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-display font-black text-gray-400 uppercase tracking-[0.2em]">Curated Categories</h2>
            <Sparkles size={14} className="text-[#CE9146] animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x items-center">
            <button
               onClick={() => setVegOnly(!vegOnly)}
               className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                 vegOnly ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 border border-gray-100'
               }`}
            >
               <div className={`w-2.5 h-2.5 rounded-full border-2 border-current ${vegOnly ? 'bg-white' : 'bg-transparent'}`} />
            </button>
            <div className="w-px h-8 bg-gray-100 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-[#268C7F] text-white shadow-lg shadow-[#268C7F]/20 scale-105' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* The Dish Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
             <h2 className="text-xs font-display font-black text-gray-400 uppercase tracking-[0.2em]">{selectedCategory} Selection</h2>
             <span className="text-[10px] font-bold text-[#268C7F]">{filteredDishes.length} items found</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDishes.map((dish, idx) => (
                <motion.div
                  key={dish.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <BentoCard className="p-4 flex flex-col gap-3 group relative overflow-hidden h-full">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 ring-1 ring-black/[0.02]">
                      {dish.image_url ? (
                        <Image 
                          src={dish.image_url} 
                          alt={dish.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs italic">No Glimpse</div>
                      )}
                      
                      {/* Veg Badge */}
                      <div className="absolute top-3 right-3">
                         <div className={`backdrop-blur-sm p-1.5 rounded-lg border shadow-sm ${dish.is_veg ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className={`w-2 h-2 rounded-full ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                         </div>
                      </div>
                    </div>

                    <div className="flex-1 min-h-[4rem]">
                      <h3 className="font-display font-bold text-[15px] leading-tight text-gray-800 line-clamp-1">{dish.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{dish.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-[#268C7F] font-black text-lg tracking-tighter tabular-nums">${dish.price}</p>
                      
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleAddToCart(dish)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          addedIds.has(dish.id) 
                            ? 'bg-green-500 text-white rotate-[360deg]' 
                            : 'bg-gray-50 text-gray-400 hover:bg-[#268C7F] hover:text-white shadow-inner'
                        }`}
                      >
                        {addedIds.has(dish.id) ? <Check size={20} /> : <Plus size={20} />}
                      </motion.button>
                    </div>
                  </BentoCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredDishes.length === 0 && (
             <div className="py-20 text-center">
                <div className="text-4xl mb-4 grayscale opacity-20">🍽️</div>
                <p className="text-gray-400 italic">No matches found for your current craving.</p>
             </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
