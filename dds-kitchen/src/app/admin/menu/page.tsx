'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Edit3, Check, ChefHat, Sparkles, AlertCircle, Camera, ImageIcon } from 'lucide-react'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { useToast } from '@/components/Toast'

interface Dish {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  is_veg: boolean
  is_available: boolean
  is_featured?: boolean
}

const sampleDishes: Omit<Dish, 'id'>[] = [
  { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 18.99, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', category: 'Lunch', is_veg: false, is_available: true, is_featured: true },
  { name: 'Vegetable Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 12.99, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', category: 'Lunch', is_veg: true, is_available: true, is_featured: false },
  { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with herbs', price: 22.50, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', category: 'Dinner', is_veg: false, is_available: true, is_featured: true },
]

export default function MenuManagerPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isVeg, setIsVeg] = useState(true)
  const [isSpecial, setIsSpecial] = useState(false)
  
  const { showToast } = useToast()
  const supabase = createClient()

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Special']

  const fetchDishes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && data.length > 0) {
      setDishes(data)
    } else {
      setDishes(sampleDishes as Dish[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDishes()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveDish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    let finalImageUrl = editingDish?.image_url || null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 11)}.${fileExt}`
      const filePath = `dish-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dishes')
        .upload(filePath, imageFile)

      if (uploadError) {
        showToast(`Upload Failed: ${uploadError.message}`, 'error')
        // Continue without image or abort? User said "can't add images it is breaking"
        // Let's abort if upload was intended but failed.
        setSaving(false)
        return
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('dishes')
          .getPublicUrl(filePath)
        finalImageUrl = publicUrl
      }
    }
    
    const dishData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image_url: finalImageUrl,
      category: formData.get('category') as string,
      is_veg: isVeg,
      is_available: true,
      is_featured: isSpecial
    }

    let error;
    if (editingDish) {
      const { error: err } = await supabase
        .from('dishes')
        .update(dishData)
        .eq('id', editingDish.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('dishes')
        .insert(dishData)
      error = err
    }

    if (!error) {
      fetchDishes()
      setShowModal(false)
      setEditingDish(null)
      setImageFile(null)
      setImagePreview(null)
      showToast(editingDish ? 'Dish updated successfully!' : 'New dish created!', 'success')
    } else {
      showToast(`Save Failed: ${error.message}`, 'error')
    }
    setSaving(false)
  }

  const toggleAvailability = async (dish: Dish) => {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !dish.is_available })
      .eq('id', dish.id)

    if (!error) {
      setDishes(dishes.map(d => d.id === dish.id ? { ...d, is_available: !d.is_available } : d))
      showToast(`${dish.name} status updated.`, 'info')
    }
  }

  const toggleSpecial = async (dish: Dish) => {
    const { error } = await supabase
      .from('dishes')
      .update({ is_featured: !dish.is_featured })
      .eq('id', dish.id)

    if (!error) {
      setDishes(dishes.map(d => d.id === dish.id ? { ...d, is_featured: !d.is_featured } : d))
      showToast(dish.is_featured ? 'Removed from Specials.' : 'Promoted to Today\'s Special!', 'success')
    } else {
      showToast(`Protocol error: ${error.message}`, 'error')
    }
  }

  const deleteDish = async (id: string) => {
    const { error } = await supabase.from('dishes').delete().eq('id', id)
    if (!error) {
      setDishes(dishes.filter(d => d.id !== id))
      showToast('Dish removed from catalog.', 'success')
      setDeleteId(null)
    } else {
      showToast('Failed to remove dish.', 'error')
    }
  }

  return (
    <div className="min-h-screen pt-12 px-6 pb-24 space-y-8 mesh-bg">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Menu Editor</h1>
          <p className="text-sm font-subheading italic text-gray-400">Manage your culinary catalog.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { 
            setEditingDish(null); 
            setImageFile(null);
            setImagePreview(null);
            setIsVeg(true);
            setIsSpecial(false);
            setShowModal(true); 
          }}
          className="w-12 h-12 bg-[#268C7F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#268C7F]/20"
        >
          <Plus size={24} />
        </motion.button>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {dishes.map((dish, idx) => (
              <motion.div
                key={dish.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <BentoCard className="p-4 flex gap-4 border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                    {dish.image_url ? (
                      <Image src={dish.image_url} alt={dish.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                    )}
                    {dish.is_featured && (
                      <div className="absolute top-2 left-2 bg-amber-400 text-white p-1 rounded-lg">
                        <Sparkles size={12} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="font-bold text-gray-800 truncate">{dish.name}</h3>
                          <p className="text-[10px] font-black text-[#268C7F] uppercase tracking-widest mt-0.5">{dish.category}</p>
                       </div>
                       <p className="text-sm font-black text-gray-800">${dish.price}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">{dish.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                       <button 
                        onClick={() => { 
                          setEditingDish(dish); 
                          setImageFile(null);
                          setImagePreview(null);
                          setIsVeg(dish.is_veg);
                          setIsSpecial(!!dish.is_featured);
                          setShowModal(true); 
                        }}
                        className="text-gray-400 hover:text-[#268C7F] p-1 transition-colors"
                       >
                         <Edit3 size={16} />
                       </button>
                       <button 
                        onClick={() => setDeleteId(dish.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                       <button 
                        onClick={() => toggleSpecial(dish)}
                        className={`p-1 transition-colors ${dish.is_featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                        title="Toggle Today's Special"
                       >
                         <Sparkles size={16} fill={dish.is_featured ? 'currentColor' : 'none'} />
                       </button>
                       
                       <div className="ml-auto flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${dish.is_available ? 'text-green-500' : 'text-gray-300'}`}>
                            {dish.is_available ? 'In Stock' : 'Hidden'}
                          </span>
                          <button 
                            onClick={() => toggleAvailability(dish)}
                            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${dish.is_available ? 'bg-green-500' : 'bg-gray-200'}`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${dish.is_available ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-end justify-center p-6"
          >
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-800 tracking-tighter">
                  {editingDish ? 'Edit Dish' : 'New Dish'}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Refine your gourmet details.</p>
              </div>

              <form onSubmit={handleSaveDish} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                  <input
                    name="name"
                    defaultValue={editingDish?.name}
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#268C7F]"
                    placeholder="Signature Dish"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingDish?.price}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#268C7F]"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      name="category"
                      defaultValue={editingDish?.category || 'Lunch'}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#268C7F]"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                   <textarea
                    name="description"
                    defaultValue={editingDish?.description}
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#268C7F] resize-none"
                    placeholder="Ingredients, vibe..."
                   />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dish Visual</label>
                  <div 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="relative w-full h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden group"
                  >
                    {imagePreview || editingDish?.image_url ? (
                      <>
                        <Image 
                          src={imagePreview || editingDish?.image_url || ''} 
                          alt="Preview" 
                          fill 
                          className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl text-gray-800 shadow-sm">
                              <Camera size={20} />
                           </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-300 mb-2">
                           <ImageIcon size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Load Capture</p>
                      </>
                    )}
                    <input 
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Properties</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsVeg(!isVeg)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isVeg 
                          ? 'bg-green-50 border-green-100 text-green-700' 
                          : 'bg-red-50 border-red-100 text-red-700'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{isVeg ? 'Veg' : 'Non-Veg'}</span>
                      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px] ${isVeg ? 'shadow-green-500/50' : 'shadow-red-500/50'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSpecial(!isSpecial)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isSpecial 
                          ? 'bg-amber-50 border-amber-100 text-amber-700' 
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{isSpecial ? 'Special' : 'Standard'}</span>
                      <Sparkles size={14} className={isSpecial ? 'text-amber-500' : 'text-gray-200'} />
                    </button>
                  </div>
                </div>

                <MatteButton size="lg" variant="teal" className="w-full mt-4" disabled={saving}>
                  {saving ? 'Saving...' : editingDish ? 'Update Dish' : 'Create Dish'}
                </MatteButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Halt Dish Protocol?</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  This entity will be permanently removed from the gourmet catalog.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <MatteButton variant="danger" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => deleteDish(deleteId)}>
                  Confirm Deletion
                </MatteButton>
                <button className="w-full h-12 text-gray-400 font-black uppercase tracking-widest text-[9px]" onClick={() => setDeleteId(null)}>
                  Abort Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
