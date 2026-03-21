const fs = require('fs');
let code = fs.readFileSync('src/app/admin/pipeline/page.tsx', 'utf8');

// 1. Add the approvePayment function
const toggleFunc = `
  const approvePayment = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_paid: true, status: 'pending' })
      .eq('id', orderId)
    
    if (!error) {
       fetchOrders()
       showToast('Payment Verified! Code generated and sent to customer.', 'success')
    } else {
       showToast(\`Error: \${error.message}\`, 'error')
    }
  }

  const pendingPayments = orders.filter(o => !o.is_paid && o.status === 'pending_verification')
`;

code = code.replace("const updateStatus = async (orderId: string, status: string) => {", toggleFunc + "\n  const updateStatus = async (orderId: string, status: string) => {");

// 2. Fetch the 'pending_verification' status as well
code = code.replace(`.in('status', ['pending', 'confirmed', 'preparing', 'ready'])`, `.in('status', ['pending_verification', 'pending', 'confirmed', 'preparing', 'ready'])`);

// 3. Inject the Pending Payments Bento Grid into the UI above the lanes
const pendingUI = `
      {/* High-Trust Verification Grid */}
      {pendingPayments.length > 0 && (
        <div className="shrink-0 mb-8 space-y-4">
           <h2 className="text-xs font-display font-black text-[#268C7F] uppercase tracking-[0.2em] flex items-center gap-2">
             <ShieldCheck size={14} /> Pending Settlements
           </h2>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
             {pendingPayments.map(order => (
               <BentoCard key={'pay-'+order.id} className="min-w-[280px] snap-start p-5 bg-gradient-to-br from-teal-50 to-white border-teal-100 shadow-sm flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-teal-100/50 flex items-center justify-center text-teal-600">
                          <CheckCircle2 size={14} />
                       </div>
                       <div>
                          <p className="text-xs font-black text-gray-800 leading-none">{order.profiles?.full_name}</p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-[#268C7F] mt-1 flex items-center gap-1">
                             <Hash size={10} strokeWidth={3} /> {order.id.split('-')[0]}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Total</p>
                       <p className="text-lg font-black text-teal-700 tracking-tighter">{'₹' + order.total_amount}</p>
                    </div>
                 </div>
                 
                 <div className="bg-white/50 rounded-xl p-3 border border-teal-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requested Items</p>
                    <div className="flex flex-wrap gap-1.5">
                       {order.order_items?.map((item: any) => (
                         <span key={item.id} className="text-[9px] font-black text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                            {item.quantity}x {item.dishes?.name}
                         </span>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={() => approvePayment(order.id)}
                   className="w-full py-3 bg-[#268C7F] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#268C7F]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   Verify Settlement
                 </button>
               </BentoCard>
             ))}
           </div>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
`;

code = code.replace('<div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">', pendingUI);

// 4. Update the "Awaiting Payment" legacy code (the ExternalLink button) that was looking for screenshots, since that flow is gone.
const oldActionBtnBlock = `                           <div className="pt-2 border-t border-gray-50 flex gap-2">
                              {order.status === 'pending' || order.status === 'confirmed' ? (
                                <>
                                  <a href={order.payment_screenshot_url || '#'} target="_blank" rel="noreferrer" className="flex-1">
                                     <button className="w-full h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#06B6D4] hover:bg-cyan-50 transition-colors">
                                        <ExternalLink size={16} />
                                     </button>
                                  </a>
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateStatus(order.id, 'preparing')}
                                    className="flex-[3] h-11 bg-[#E1803A] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#E1803A]/20"
                                  >
                                    Accept & Cook
                                  </motion.button>
                                </>
                              ) : order.status === 'preparing' ? (`;

const newActionBtnBlock = `                           <div className="pt-2 border-t border-gray-50 flex gap-2">
                              {order.status === 'pending' || order.status === 'confirmed' ? (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateStatus(order.id, 'preparing')}
                                  className="w-full h-11 bg-[#E1803A] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#E1803A]/20"
                                >
                                  Accept & Cook
                                </motion.button>
                              ) : order.status === 'preparing' ? (`;

code = code.replace(oldActionBtnBlock, newActionBtnBlock);

fs.writeFileSync('src/app/admin/pipeline/page.tsx', code);
