'use client'

import { Phone, MapPin, MessageSquare, ChefHat, Heart, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { BentoCard } from './BentoCard'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="w-full px-4 pt-10 pb-20 space-y-10 bg-gradient-to-b from-gray-50/30 to-gray-100/50 relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#268C7F]/30 to-transparent" />
      
      <div className="max-w-md mx-auto space-y-10">
        {/* Chef Profile Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ChefHat size={14} className="text-[#268C7F]" />
            </motion.div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">The Soul of the Kitchen</h2>
          </div>
          
          <BentoCard className="p-5 border-none shadow-lg shadow-black/[0.03] bg-white/80 backdrop-blur-sm ring-1 ring-black/[0.02]">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-inner relative overflow-hidden p-1"
                >
                  <Image 
                    src="/logo.jpg" 
                    alt="DD's Kitchen" 
                    fill 
                    className="object-contain" 
                  />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Ponnukodi S</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#268C7F] opacity-70">Executive Chef & Owner</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed font-subheading italic border-l-2 border-[#268C7F]/20 pl-3">
                "Crafted with heart, refined by hand. Today's special is more than a meal—it's a piece of our family table, prepared with the same care I'd give my own kin. Slow-cooked, small-batch, and purely for the joy of sharing."
              </p>
            </div>
          </BentoCard>
        </section>

        {/* Contact Protocol */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Phone size={14} className="text-[#E1803A]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Contact Protocol</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5">
            <motion.div whileHover={{ scale: 1.01 }}>
              <a href={`tel:+${process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''}`} className="block">
                <BentoCard className="p-4 flex items-center gap-3 hover:bg-white transition-all border-none shadow-md ring-1 ring-black/[0.02] group">
                  <div className="w-9 h-9 rounded-xl bg-[#E1803A]/10 flex items-center justify-center text-[#E1803A] group-hover:bg-[#E1803A] group-hover:text-white transition-colors">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Contact Kitchen</p>
                    <p className="text-sm font-bold text-gray-700">{process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY || 'Phone Support'}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#E1803A] transition-colors" />
                </BentoCard>
              </a>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <a 
                href="https://maps.google.com/?q=whitefield+grand+chitlapakkam+chennai" 
                target="_blank" 
                rel="noreferrer"
                className="block"
              >
                <BentoCard className="p-4 flex items-center gap-3 hover:bg-white transition-all border-none shadow-md ring-1 ring-black/[0.02] group">
                  <div className="w-9 h-9 rounded-xl bg-[#268C7F]/10 flex items-center justify-center text-[#268C7F] group-hover:bg-[#268C7F] group-hover:text-white transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Location</p>
                    <p className="text-sm font-bold text-gray-700">Whitefield Grand, Chitlapakkam, Chennai</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-[#268C7F] transition-colors" />
                </BentoCard>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''}`}
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white"
            >
              <MessageSquare size={20} fill="currentColor" />
            </motion.a>
          </div>
          <p className="text-center text-[10px] font-medium text-gray-400">Click to chat with the kitchen</p>
        </section>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-gray-200/50">
          <div className="text-center space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">DD's Kitchen © 2026</p>
            <p className="text-[9px] font-medium text-gray-400 flex items-center justify-center gap-1">
              Handcrafted with <Heart size={10} className="text-red-400 fill-red-400 animate-pulse" /> for Gourmet Lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
