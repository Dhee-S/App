# PROJECT: DD’s Home Kitchen (V2 - High-Trust Edition)
# ROLE: Lead Full-Stack Mobile Engineer & UI/UX Architect
# STACK: Google Stitch, Supabase (PostgreSQL), Next.js (Static Export)

## 1. IDENTITY & VISUAL DNA
- **BACKGROUND**: Existing light theme (`#f7f8f6`), retaining the vibrant and friendly Glassmorphism components.
- **PALETTE**: 
  - Soft Green (`#9dd585`) for Primary Actions
  - Warm Amber (`#CE9146`) for Alerts/Highlights
  - Deep Teal (`#268C7F`) for Success
- **SURFACES**: Retaining the current Bento-style grid design, backdrop-blur, and shadow-lg overlays.
- **TYPOGRAPHY**: 
  - Standard UI fonts (Plus Jakarta Sans, Arima Madurai).
  - High-Contrast Serif for the Delivery Code display.
- **HAPTICS**: Implement visual feedback/haptic emulations via Framer Motion for all primary checkout and verification interactions.

## 2. BACKEND & DATABASE (Supabase)
- **TABLE `profiles`**: `{ id (UUID), full_name (Text), role (Text: 'CUSTOMER' | 'MANAGER') }`
- **TABLE `dishes`**: `{ id (UUID), name (Text), price (Decimal), image_url (Text), is_veg (Bool) }`
- **TABLE `orders`**: `{ id (UUID), user_id (UUID), total_amount (Decimal), is_paid (Bool, default: false), delivery_code (Text, unique, default: null) }`
- **TRIGGER (Delivery Code Generation)**: 
  - PostgreSQL function `generate_delivery_code()` runs `AFTER UPDATE` on `orders`.
  - **CONDITION**: If `NEW.is_paid` changes from `FALSE` to `TRUE`.
  - **ACTION**: Generate a unique 4-digit string (e.g., "DD-1024") and update the row automatically.

## 3. PAYMENT INTEGRATION (Zero-Cost UPI Intent)
- **FUNCTION `generateUPIIntent(amount, orderId)`**: Returns a standard UPI URI.
  - **FORMAT**: `upi://pay?pa=7904935160@ybl&pn=DD_KITCHEN&am=${amount}&cu=INR&tn=DD_Order_${orderId}`
- **ACTION**: 
  - **Mobile**: On "Pay via UPI" click, use an `href` deep-link to instantly launch the user's default UPI app (GPay/PhonePe).
  - **Desktop**: Fallback to generating and displaying a static QR Code.
- **FLOW**: User completes native transaction -> clicks "I Have Paid" -> `order.status` updates to `'pending_verification'`.
- *Screenshot removal:* Trust-based, high-speed UX. The manual screenshot dropzone is abolished.

## 4. SUCCESS SCREEN & REVEAL UI (`/orders`)
- **REALTIME**: Implement `supabase.channel` to watch `is_paid` changes on the active order.
- **SUCCESS TRANSITION**: Upon `is_paid = TRUE`:
  1. Trigger dynamic UI change: Draw a Teal (`#268C7F`) checkmark.
  2. Reveal the generated `delivery_code` in a large, elevated Matte Card using high-contrast Serif font.
  3. **MESSAGE**: "Payment Confirmed! Show this code to the Chef at pickup—made with heart."
- **ACTION**: Incorporate a native "Share Pickup Details" button utilizing the Web Share API.

## 5. MANAGER INTERFACE (`/admin/pipeline` or Dashboard)
- **DASHBOARD**: A Bento-style grid section representing 'Pending Payments' (i.e. orders marked 'pending_verification' with `is_paid` = FALSE).
- **ACTION**: A prominent toggle/button for `Approve Payment` (`is_paid`). Once approved, it triggers the server-side code generation transparently to the awaiting customer screen.
