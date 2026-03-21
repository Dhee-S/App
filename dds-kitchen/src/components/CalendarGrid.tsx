'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  format, addMonths, subMonths, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay 
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  indicators?: Record<string, { hasSchedule?: boolean, hasRequests?: boolean }>;
}

export function CalendarGrid({ selectedDate, onSelectDate, indicators = {} }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))
  const [direction, setDirection] = useState(0)

  const handlePrevious = () => {
    setDirection(-1)
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Calculate days to display
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  // Fixed height for 6 rows of dates vs 5 rows
  const gridHeight = daysInMonth.length > 35 ? 'h-[280px]' : 'h-[240px]'

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 30 : -30,
      opacity: 0
    })
  }

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button 
          onClick={handlePrevious}
          className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-sm text-gray-500 transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-[13px] font-black uppercase tracking-widest text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button 
          onClick={handleNext}
          className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white hover:shadow-sm text-gray-500 transition-all active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="flex items-center justify-center text-[9px] font-black text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={`relative ${gridHeight} transition-all duration-300 overflow-hidden`}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentMonth.toISOString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute inset-0 grid grid-cols-7 gap-1 ${daysInMonth.length > 35 ? 'grid-rows-6' : 'grid-rows-5'}`}
          >
            {daysInMonth.map((date, idx) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const isSelected = isSameDay(date, selectedDate)
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isToday = isSameDay(date, new Date())
              const indicator = indicators[dateStr]

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isCurrentMonth) {
                      onSelectDate(date)
                    }
                  }}
                  disabled={!isCurrentMonth}
                  className={`relative flex flex-col items-center justify-center rounded-[1.2rem] transition-all duration-300 ${
                    !isCurrentMonth ? 'text-gray-200 opacity-50 cursor-not-allowed' : 
                    isSelected ? 'bg-gradient-to-b from-[#268C7F] to-[#1E7469] text-white shadow-xl shadow-[#268C7F]/25 scale-105 z-10' : 
                    'text-gray-700 hover:bg-white hover:shadow-sm active:scale-95'
                  }`}
                >
                  <span className={`text-[15px] font-bold ${isToday && !isSelected ? 'text-[#268C7F]' : ''}`}>
                    {format(date, 'd')}
                  </span>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-1.5 flex gap-1">
                    {indicator?.hasSchedule && (
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#E1803A]'}`} />
                    )}
                    {indicator?.hasRequests && (
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-[#268C7F]'}`} />
                    )}
                  </div>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
