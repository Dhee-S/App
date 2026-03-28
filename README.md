# 👨‍🍳 DD's Kitchen — V2: High-Trust Protocol
> A premium, **zero-friction** gourmet delivery platform architected for the high-trust economy.

[![Live Demo](https://img.shields.io/badge/Live-Demo-268C7F?style=for-the-badge&logo=vercel)](https://ddskitchen.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Built with AI](https://img.shields.io/badge/Orchestrated%20by-Antigravity-orange?style=for-the-badge&logo=openai)](https://github.com/google-deepmind)

---

## 💎 The V2 Vision: Sober Luxury & High-Trust
DD's Kitchen is not just an ordering app; it's a **High-Trust Protocol**. We've removed the traditional friction of payment screenshots and manual verifications by implementing native mobile workflows and autonomous backend orchestration.

### 🍱 Project Preview: The "Sober Luxury" Aesthetic
Built using a custom **Stitch Bento** design system, the UI features:
*   **Matte Deep Slate Surfaces**: High-radius cards with subtle grain overlays.
*   **Glassmorphism**: Translucent headers and navigation bars that feel native to iOS and Android.
*   **Micro-Animations**: High-frequency layout transitions powered by **Framer Motion** that mimic haptic feedback.

---

## ⚡ Key Specializations

### 🚀 Zero-Cost UPI Intents
Instead of clunky payment gateways, we use **Direct UPI Intent Deep-linking**. One tap opens GPay, PhonePe, or Paytm instantly.

### 🔐 Server-Side Delivery Codes
Unique 4-digit pickup codes are generated autonomously via **PostgreSQL Triggers** in Supabase ONLY after payment is verified by the admin. 

### 🛰️ Realtime Kitchen Pipeline
The kitchen staff uses a zero-latency dashboard where orders move across lanes (**Incoming → Cooking → Ready**) via active `Supabase.channel` listeners.

---

## 🤖 Orchestrated by AI
This entire codebase was built, debugged, and optimized using **Antigravity**, a powerful agentic AI coding platform.
*   **Architecture**: Optimized for Next.js App Router and Supabase SSR.
*   **Speed**: Built from prototype to production build in record time.
*   **Hardened Logic**: All database triggers, Row Level Security (RLS) policies, and middleware were AI-audited.

---

## 🛠️ The Tech Stack
*   **Frontend**: Next.js 16 (React 19), Framer Motion, Lucide Icons.
*   **Backend**: Supabase (PostgreSQL, Realtime, Auth).
*   **Styling**: Modern Tailwind CSS 4.0 + Custom Utility Tokens.
*   **Mobile**: Capacitor 8.2 (Full Mobile-Native Compatibility).
*   **Hosting**: Vercel (Production) & GitHub Pages (Build CI/CD).

---

## 🚦 Getting Started
1.  **Visit the Live Site**: [ddskitchen.vercel.app](https://ddskitchen.vercel.app/)
2.  **Explore the Menu**: Discover daily curated chef specials.
3.  **Order**: Experience the zero-friction UPI flow.
4.  **Track**: Watch your order move through the kitchen in real-time.

---

*Created with ❤️ by **DD's Kitchen** & Orchestrated by **Antigravity AI***
