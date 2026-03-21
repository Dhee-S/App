const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// replace switch
code = code.replace(/case 'ready': return 4;/, "case 'ready': return 4;\n        case 'completed': return 5;");

// replace mapped objects
let newArr = `{ label: 'Market Verification', icon: ScrollText, target: 1 },
                     { label: 'Chef Confirmed', icon: CheckCircle2, target: 2 },
                     { label: 'Kitchen Orchestration', icon: ChefHat, target: 3 },
                     { label: 'Live Tracking...', icon: Truck, target: 4 },
                     { label: 'Ready for Collection', icon: PackageCheck, target: 5 }`;
code = code.replace(/\{\s*label:\s*'Market Verification'[\s\S]*?target:\s*4\s*\}/, newArr);

// replace tracking text
code = code.replace(/>Live Tracking\.\.\.</g, ">Present State<");

// fix the bar height math: (step - 1) / 3 => (step - 1) / 4
code = code.replace(/height: `\$\{([^`]+) \/ 3\) \* 100\}%`/g, 'height: `${$1 / 4) * 100}%`');

fs.writeFileSync('src/app/orders/page.tsx', code);
