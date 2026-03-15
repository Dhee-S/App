# Web Application Test Report - https://dhee-s.github.io/App/
**Target Site:** https://dhee-s.github.io/App/  
**User:** dheepakofficial@gmail.com  
**Test Date:** 2026-03-15  

## Executive Summary
The application is partially functional but suffers from critical navigation and state persistence issues. While the UI is visually appealing and correctly themed, the core user flow (Add to Cart -> Checkout) is currently broken on the hosted version.

## Page-by-Page Status

### 1. Login Page
- **Status:** ✅ PASS
- **Findings:** Correctly redirects to the main app after authentication. 

### 2. Home (Discovery) Page
- **Status:** ⚠️ PARTIAL PASS
- **Findings:**
    - All dish categories and items load correctly. Images are visible.
    - **BUG:** "Add to Cart" shows a success toast, but the item does not persist when navigating to the Cart page.

### 3. Schedule Page
- **Status:** ⚠️ PARTIAL PASS
- **Findings:**
    - Calendar and future batches (e.g., Mutton Biriyani on March 16) load correctly.
    - **BUG:** The "Secure Spot in Batch" button is unresponsive. Clicking it provides no feedback and does not add the item to the cart.

### 4. Cart Page
- **Status:** ❌ FAIL
- **Findings:**
    - **BUG:** Shows "Your bag is empty" despite adding items on the Home page.
    - Checkout functionality could not be tested due to the empty cart.

### 5. Orders Page
- **Status:** ✅ PASS
- **Findings:** Correctly displays "No live batches currently" for a user with no history.

### 6. Profile Page
- **Status:** ⚠️ PARTIAL PASS
- **Findings:**
    - **BUG:** Displays "Registered Guest" instead of the authenticated email address.

## Critical Bugs & Technical Issues

### 1. Navigation Failure (Critical)
- **Description:** The bottom navigation bar icons for **Calendar**, **Cart**, and **Orders** are non-functional (unresponsive to clicks). Only Home and Profile links currently work.
- **Impact:** Users cannot navigate the app without manual URL manipulation.

### 2. State Persistence (High)
- **Description:** Cart items added on the Home page are lost upon navigation. 
- **Possible Cause:** Potential mismatch between the `basePath` and state management/localStorage keys.

### 3. Dynamic Data Fetching (Console Errors)
- **Description:** Numerous 404 errors for `__next.profile.__PAGE__.txt` prefetch requests. 
- **Cause:** Next.js RSC data prefetching is failing on the static export.

### 4. Supabase Connection (406 Error)
- **Description:** A "406 Not Acceptable" error occurs when querying the `profiles` table.
- **Impact:** This prevents the app from displaying the user's correct email and role.
