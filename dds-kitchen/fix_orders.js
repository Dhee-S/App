const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const effectBlock = `  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, dishes(*))')
        .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
         fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])`;

// Replace the original useEffect
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?fetchOrders\(\)\n  \}, \[supabase\]\)/, effectBlock);

// Replace the header block of the BentoCard
const oldHeaderBlock = `                <div className="p-6 bg-white flex justify-between items-center border-b border-gray-50 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#268C7F] to-teal-400" />
                   <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Settlement Total</p>
                       <p className="text-3xl font-black text-[#268C7F] tracking-tighter">
                         {'₹' + order.total_amount}
                       </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Passcode</p>
                       <div className={\`px-4 py-2 flex items-center justify-center rounded-xl transition-all duration-700 \${order.delivery_code ? 'bg-[#268C7F]/10 text-[#268C7F]' : 'bg-gray-50 border border-gray-100 text-gray-300'}\`}>
                         <span className="font-mono font-black tracking-widest text-sm">
                            {order.delivery_code || 'PENDING'}
                         </span>
                      </div>
                   </div>
                </div>`;

const newHeaderBlock = `                {order.is_paid && order.delivery_code ? (
                  <div className="p-8 bg-[#268C7F] text-white flex flex-col items-center justify-center text-center relative overflow-hidden z-20">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                     <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 shadow-xl backdrop-blur-md">
                        <CheckCircle2 size={32} strokeWidth={3} className="text-white drop-shadow-md" />
                     </motion.div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Auth Code Generated</p>
                     <h2 className="text-5xl font-serif text-white mb-4 drop-shadow-xl tracking-wider">{order.delivery_code}</h2>
                     <p className="text-sm font-subheading italic text-white/90 mb-6 max-w-[250px] leading-relaxed">
                       Payment Confirmed! Show this code to the Chef at pickup—made with heart.
                     </p>
                     <button onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'DD Kitchen Pickup', text: \`My Order Code is \${order.delivery_code}\` })
                        } else {
                          navigator.clipboard.writeText(order.delivery_code);
                          alert('Code copied to clipboard!');
                        }
                     }} className="bg-white text-[#268C7F] px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Share Pickup Details
                     </button>
                  </div>
                ) : (
                  <div className="p-6 bg-white flex justify-between items-center border-b border-gray-50 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-amber-300" />
                     <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Settlement Total</p>
                         <p className="text-3xl font-black text-gray-800 tracking-tighter">
                           {'₹' + order.total_amount}
                         </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Verification</p>
                         <div className="px-4 py-2 flex items-center justify-center rounded-xl transition-all duration-700 bg-orange-50 border border-orange-100 text-orange-500 shadow-inner">
                           <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Pending
                           </span>
                        </div>
                     </div>
                  </div>
                )}`;

// Needs framer-motion import
if (!code.includes("import { motion")) {
    code = code.replace("import { format", "import { motion } from 'framer-motion'\nimport { format");
}

code = code.replace(oldHeaderBlock, newHeaderBlock);
fs.writeFileSync('src/app/orders/page.tsx', code);
