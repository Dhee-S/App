const fs = require('fs');

// 1. Fix admin/requests/page.tsx
let adminPath = 'src/app/admin/requests/page.tsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');

if (!adminCode.includes('const fetchKitchenSchedules =')) {
  // Add fetchKitchenSchedules state and function
  adminCode = adminCode.replace(
    'const [mounted, setMounted] = useState(false)',
    "const [mounted, setMounted] = useState(false)\n  const [kitchenSchedules, setKitchenSchedules] = useState<any[]>([])\n  const fetchKitchenSchedules = async () => {\n    const dateStr = format(selectedDate, 'yyyy-MM-dd')\n    const { data } = await supabase.from('schedules').select('*, dishes(*)').eq('scheduled_date', dateStr)\n    setKitchenSchedules(data || [])\n  }"
  );

  // Call it in useEffect
  adminCode = adminCode.replace(
    'fetchRequests()',
    'fetchRequests()\n    fetchKitchenSchedules()'
  );

  // Add the UI section
  const sectionHtml = `
        {/* Kitchen Batches Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            Dishes Added to Kitchen
          </h2>
          <div className="space-y-3">
             {kitchenSchedules.map((sched, idx) => (
               <motion.div 
                 key={sched.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="group relative p-4 bg-orange-50/50 border border-orange-100 rounded-3xl shadow-sm flex items-center justify-between"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#E1803A] flex items-center justify-center">
                        <ChefHat size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{sched.dishes?.name}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          {sched.servings_remaining} Servings Remaining
                        </p>
                     </div>
                  </div>
               </motion.div>
             ))}
             {kitchenSchedules.length === 0 && (
               <div className="py-8 text-center text-[10px] font-black text-gray-200 uppercase tracking-widest italic">
                 No dishes scheduled.
               </div>
             )}
          </div>
        </section>

        {/* Accepted Section */}
`;
  adminCode = adminCode.replace('{/* Accepted Section */}', sectionHtml);
  fs.writeFileSync(adminPath, adminCode);
}

// 2. Fix schedule/page.tsx for users
let userPath = 'src/app/schedule/page.tsx';
let userCode = fs.readFileSync(userPath, 'utf8');

// replace the "+" button logic
const oldPlusBtn = /onClick\{\(\) => setRequestQty\(requestQty \+ 1\)\}/g;
const newPlusBtn = "onClick={() => {\n                      if (requestQty >= 1) {\n                         showToast('For multiple item requests, please contact kitchen directly: +91 79049 35160', 'info');\n                         return;\n                      }\n                      setRequestQty(requestQty + 1);\n                    }}";

userCode = userCode.replace(oldPlusBtn, newPlusBtn);

fs.writeFileSync(userPath, userCode);
