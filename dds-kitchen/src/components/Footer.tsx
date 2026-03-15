'use client'

import { Mail, Phone, MapPin, Instagram, Facebook, ChefHat, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { BentoCard } from './BentoCard'

export function Footer() {
  return (
    <footer className="w-full px-6 pt-12 pb-32 space-y-12 bg-gray-50/50 relative overflow-hidden">
      {/* Decorative Aurora */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      
      <div className="space-y-8">
        {/* Chef Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <ChefHat size={14} className="text-[#268C7F]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">The Soul of the Kitchen</h2>
          </div>
          
          <BentoCard className="p-6 border-none shadow-xl shadow-black/[0.02] bg-white ring-1 ring-black/[0.01]">
            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#268C7F]/10 to-[#E1803A]/10 flex items-center justify-center text-2xl shadow-inner">
                  👩‍🍳
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 tracking-tighter shiny-text">Ponnukodi S</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#268C7F] opacity-60">Executive Chef & Owner</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed font-subheading italic">
                "Cooking is my language of love. Every dish at DD's Kitchen is a recipe passed down through generations, refined with modern gourmet techniques and a whole lot of heart."
              </p>
            </div>
          </BentoCard>
        </section>

        {/* Contact Protocol */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Phone size={14} className="text-[#E1803A]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Contact Protocol</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <a href="tel:+919876543210" className="group">
              <BentoCard className="p-4 flex items-center gap-4 hover:bg-white transition-all border-none shadow-sm ring-1 ring-black/[0.01]">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#E1803A] group-hover:text-white transition-colors">
                  <Phone size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Voice Line</p>
                  <p className="text-sm font-bold text-gray-700">+91 98765 43210</p>
                </div>
              </BentoCard>
            </a>

            <BentoCard className="p-4 flex items-center gap-4 border-none shadow-sm ring-1 ring-black/[0.01]">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">HQ Location</p>
                <p className="text-sm font-bold text-gray-700">Gourmet Street, Chennai</p>
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col items-center gap-6 text-center">
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
              <Instagram size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
              <Facebook size={18} />
            </button>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">DD's Kitchen © 2026</p>
            <p className="text-[9px] font-bold text-gray-400 flex items-center justify-center gap-1">
              Handcrafted with <Heart size={10} className="text-red-400 fill-red-400" /> for Gourmet Lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
