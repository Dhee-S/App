# DD's Kitchen - Build Plan

This plan details the architecture and step-by-step implementation for the "DD's Kitchen" platform, divided into the **Customer (Gourmet Marketplace)** and the **Manager (Command Center)** interfaces. 

## 🌐 Hosting & URLs
- **Live Production URL**: [https://dhee-s.github.io/App/](https://dhee-s.github.io/App/)
- **Local Development**: `http://localhost:3000/App/` (Note: `basePath` is active even locally)
- **Supabase Project**: `obrzfvcaaidyzhbzsdqa`

## 🛠️ Deployment Workflow
The project is hosted on **GitHub Pages** using a **Static Export** strategy.
1. **Build Process**: Handled by GitHub Actions ([nextjs.yml](file:///d:/Code/App/.github/workflows/nextjs.yml)).
2. **Subfolder Handling**: The app is located in the `dds-kitchen/` directory. 
3. **Routing**: `basePath: '/App'` and `trailingSlash: true` are configured in `next.config.ts`.
4. **Auth Recovery**: Uses a client-side `AuthGuard.tsx` and `auth-client.ts` for all Supabase interactions to support static hosting.

## Technology Stack
- **Frontend Framework**: Next.js (App Router) with React
- **Styling**: Tailwind CSS with custom theme extensions for the DD's Kitchen design system
- **Animations**: Framer Motion for micro-interactions (scale-down haptics, item fly-in cart, smooth page transitions)
- **Backend & Database**: Supabase (PostgreSQL for structured data, Supabase Storage for GPay proof screenshots, Realtime for pulse alerts and live order tracking)

## Design System (Extracted from Stitch Designs)

### Color Palette
- **Primary**: `#9dd585` (Soft Green)
- **Secondary**: `#6984A9` (Muted Blue), `#263B6A` (Dark Blue)
- **Accent Light**: `#EEFABD` (Light Yellow)
- **Accent Dark**: `#263B6A` (Dark Navy)
- **Background Light**: `#f7f8f6` (Off-white)
- **Background Dark**: `#171e14` (Dark Green-Black)

### Typography
- **Display Font**: Plus Jakarta Sans
- **Heading Font**: Arima Madurai
- **Subheading Font**: Trirong
- **Body Font**: Merriweather

### UI Components (Design System)
- **Glassmorphism Cards**: `backdrop-blur`, semi-transparent backgrounds
- **Gradient Backgrounds**: Radial gradients using primary colors
- **Bottom Navigation**: Fixed bottom nav bar with icons and labels
- **Metric Tiles**: Dashboard cards with icons and numbers
- **Revenue Charts**: Visual data representation for manager dashboard
- **Order Tables**: Tabular layout for order management
- **Menu Grid**: 2-column grid of dish cards with images
- **Order Tracking**: Status stepper with progress indicators
- **Checkout Flow**: Multi-step process with delivery details and payment selection
- **Profile Page**: Settings list with icons
- **Staff Calendar**: Calendar view for scheduling

## Database Schema (Supabase)
We are using the expanded schema provided by the user:
1. `profiles` (id, full_name, role: CUSTOMER/MANAGER, preference_veg, gpay_details)
2. `dishes` (id, name, description, price, image_url, category, is_veg, is_available)
3. `schedules` (id, dish_id, scheduled_date, is_kitchen_scheduled, servings_remaining)
4. `requests` (id, user_id, dish_id, requested_date, status: pending/accepted/denied/cancelled)
5. `orders` (id, user_id, total_amount, status: pending/confirmed/preparing/ready/completed/cancelled, is_paid, payment_screenshot_url, delivery_code)
6. `order_items` (id, order_id, dish_id, quantity, unit_price)

*Automation*: Orders have a trigger (`handle_order_verification`) that generates the `DD-XXXX` delivery code when `is_paid` transitions from `false` to `true`.

## User Review Required
None for now. We are proceeding with the provided Supabase project (`obrzfvcaaidyzhbzsdqa`) and the setup.

## Authentication & Redirection
- **Role-Based Redirection**: Handled via `AuthGuard.tsx` (Client-side).
  - **Unauthenticated**: Redirected to `/App/login/`.
  - **Managers**: Redirected to `/App/admin/dash/` after login or when visiting `/App/`.
  - **Customers**: Redirected to `/App/` (Gourmet Marketplace).
- **Manager Access**: Uses Magic Link (Email) for staff or Dev 1-Click login.
- **Customer Access**: Standard Email/Password registration and login.

## Proposed Changes

### 1. Project Initialization
- Instantiate a new Next.js project in `d:/Code/App` with Tailwind CSS setup.
- Configure `tailwind.config.js` with the specific aesthetic color palettes and custom fonts (Inter/Manrope).
- Set up Supabase Client and fetch `.env.local` keys.

### 2. General UI Components (Design System)
Develop reusable components based on the Stitch designs using the extracted design system:
- `GlassCard`: Reusable card with backdrop-blur and gradient backgrounds
- `MetricTile`: Dashboard card with icon, number, and label
- `BottomNav`: Fixed bottom navigation with icons and labels
- `DishCard`: Menu item card with image, name, price, and veg indicator
- `StatusStepper`: Order tracking progress indicator
- `DateScroller`: Horizontal scrolling date selector
- `CartSheet`: Slide-up frosted glass cart modal
- `PaymentModal`: GPay QR display and screenshot upload
- `VerificationModal`: Order verification with delivery code generation
- `SettingsList`: Profile settings with icons
- `CalendarView`: Staff scheduling calendar component

### 3. Customer Interface (`/`)
#### `/app/page.tsx`
- **Discovery Home**: Parallax header for "Featured Dish", horizontal bento categories, and the 2-column "Dish Grid". Includes cart animation logic.
#### `/app/schedule/page.tsx`
- **Kitchen Calendar**: Horizontal date scroller. Evaluates if date has a schedule ("Instant Buy") or allows "Request a Dish". Checks for existing accepted requests to show the Matte Cyan "Join the batch" banner.
#### `/app/cart/page.tsx`
- **The Matte Cart**: Frosted glass slide-up showing item lists, totals, and the Burnt Orange checkout trigger. Handles the "Payment Loop" modal for GPay QR and Proof of Payment dropzone.
#### `/app/orders/page.tsx`
- **Order Status**: Vertical live stepper. Fetches real-time updates from Supabase. Handles the reveal of the "DD-Code" when status switches to Paid/Cooking.

### 4. Manager Interface (`/admin`)
#### `/app/admin/dash/page.tsx`
- **Operations Dashboard**: Metric tiles for pending payments, batches, and revenue. Listens to Supabase Realtime to pulse the Amber alert for new requests.
#### `/app/admin/menu/page.tsx`
- **Menu & Stock Editor**: Dish lists with quick toggles for sold out/hidden. Context menu to promote an item to "Today's Special".
#### `/app/admin/requests/page.tsx`
- **Request Hub**: Split screen calendar and list. Accept (Teal) or Decline (Red) requests. Syncs with the `schedules` table automatically.
#### `/app/admin/pipeline/page.tsx`
- **Order Pipeline**: Kanban board with lanes (`Awaiting Payment`, `Confirmed`, `Ready`). Includes the Verification modal to view GPay screenshots and generate the `delivery_code`.

## Verification Plan

### Automated Tests
- End-to-end testing of the "Cart to Verification" flow.
- Deployment verification: Ensuring `_next` assets load correctly via `basePath`.

### Manual Verification Workflow
1. **Local Dev**: Run `npm run dev` in `dds-kitchen`.
2. **Path Check**: Ensure URLs look like `localhost:3000/App/...`.
3. **Deployment**: Push to `main`.
4. **Actions**: Monitor GitHub Actions "Deploy Next.js site to Pages".
5. **Live Test**: Verify role-based redirection on the live site.
