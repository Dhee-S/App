'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Leaf, Waves, Zap, Save, Edit2, Sparkles } from 'lucide-react'
import { MatteButton } from '@/components/MatteButton'
import { BentoCard } from '@/components/BentoCard'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [preference, setPreference] = useState<'veg' | 'non-veg' | 'both'>('veg')

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
          setPhone(data.phone || '')
          setAddress(data.address || '')
          setPreference(data.dietary_preference || (data.preference_veg ? 'veg' : 'both'))
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    getProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    showToast('Securely terminated session.', 'info')
    router.push('/login')
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          address: address,
          dietary_preference: preference,
          preference_veg: preference === 'veg' // Backward compatibility
        })
        .eq('id', user.id)
      
      if (!error) {
        setProfile({ ...profile, full_name: fullName, phone, address, dietary_preference: preference })
        setIsEditing(false)
        showToast('Coordinates synchronized.', 'success')
      } else {
        showToast(`Synchronization failed: ${error.message}`, 'error')
      }
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="w-8 h-8 border-4 border-[#268C7F] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-12 px-6 pb-32 mesh-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#268C7F] to-[#6984A9] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-black/[0.05]">
                 <User size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tighter shiny-text">
                {profile?.full_name || 'Gourmet Guest'}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#268C7F] opacity-60">
                {profile?.role === 'MANAGER' ? 'Head Chef' : 'Discovery Tier'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isEditing ? 'bg-[#268C7F] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isEditing ? <Save size={20} /> : <Edit2 size={20} />}
          </button>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
            Flavor Protocol
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'veg', label: 'Veg', icon: Leaf, color: 'bg-green-500' },
              { id: 'non-veg', label: 'Non-Veg', icon: Zap, color: 'bg-red-500' },
              { id: 'both', label: 'Both', icon: Sparkles, color: 'bg-[#268C7F]' }
            ].map((item) => {
              const Icon = item.icon
              const isSelected = preference === item.id
              return (
                <button
                  key={item.id}
                  disabled={!isEditing}
                  onClick={() => setPreference(item.id as any)}
                  className={`relative p-5 rounded-[1.5rem] border transition-all duration-500 flex flex-col items-center gap-3 overflow-hidden ${
                    isSelected ? 'border-transparent shadow-xl scale-105 active:scale-95' : 'border-gray-100 bg-white text-gray-300 hover:border-gray-200'
                  } ${!isEditing && !isSelected ? 'opacity-40 grayscale' : ''}`}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        layoutId="pref-bg"
                        className={`absolute inset-0 ${item.color} -z-10`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>
                  <Icon size={20} className={isSelected ? 'text-white' : ''} />
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Coordinates</h2>
          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                  <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-800" />
                </div>
                <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                  <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-800" placeholder="+91..." />
                </div>
                <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                  <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Delivery Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-800 resize-none h-20" placeholder="Floor, Building, Area..." />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <BentoCard className="flex items-center gap-4 p-4 border-gray-100 ring-1 ring-black/[0.01]">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#268C7F]"><Mail size={18} /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-gray-700">{profile?.email || 'Registered Guest'}</p>
                  </div>
                </BentoCard>

                <BentoCard className="flex items-center gap-4 p-4 border-gray-100 ring-1 ring-black/[0.01]">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#268C7F]"><Phone size={18} /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-bold text-gray-700">{profile?.phone || 'Not provided'}</p>
                  </div>
                </BentoCard>

                <BentoCard className="flex items-center gap-4 p-4 border-gray-100 ring-1 ring-black/[0.01]">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#268C7F]"><MapPin size={18} /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Address</p>
                    <p className="text-sm font-bold text-gray-700 line-clamp-1">{profile?.address || 'Set delivery location'}</p>
                  </div>
                </BentoCard>
              </div>
            )}
          </div>
        </div>

        {/* Action Zone */}
        <div className="pt-4 space-y-4">
          {profile?.role === 'MANAGER' && (
            <MatteButton 
              variant="teal" 
              className="w-full flex items-center justify-between group rounded-[1.5rem] py-8 px-10"
              onClick={() => router.push('/admin/dash')}
            >
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Authorization Verified</span>
                <span className="text-lg font-black">Open Command Center</span>
              </div>
              <ChevronRight className="group-hover:translate-x-2 transition-transform h-8 w-8 text-white/20" strokeWidth={3} />
            </MatteButton>
          )}

          <button 
            onClick={handleLogout}
            className="w-full py-4 text-red-400 font-black text-[11px] tracking-[0.3em] flex items-center justify-center gap-2 border-2 border-dashed border-red-50 rounded-[2rem] hover:bg-red-50/50 transition-colors uppercase"
          >
            <LogOut size={16} /> Secure Terminate
          </button>
        </div>
      </motion.div>
    </div>
  )
}
