# Implementation Plan - Independent Admin/Customer Auth Sessions & Smooth Modal Animations

## Problem Diagnosis & Root Cause
1. **Shared Single Firebase Auth Instance**: The application currently instantiates only one default `FirebaseApp` and one `Auth` instance in `src/services/firebase.ts`. Both `adminAuthService.ts` and `customerAuthService.ts` share this identical instance.
2. **Coupled Auth Listener**: `src/App.tsx` attaches a single `onAuthStateChanged(auth, ...)` listener. When an account logs in, the handler simultaneously executes `verifyAndEnsureAdmin()` and `getOrCreateCustomerProfile()`. Consequently:
   - Logging in as Admin automatically manifests the same user in the customer storefront.
   - Logging in as a customer signs out or overrides the admin credentials.
   - Signing out from the customer portal calls `signOut(auth)`, disconnecting the admin.
3. **Modal Transitions**: Modals currently lack a unified, smooth entrance transition (`slide-in-from-bottom-4` + `fade-in`).

---

## User Preferences Incorporated
- **Session Persistence**: Independent persistence—both admin and customer sessions remain active simultaneously across browser tabs and reloads.
- **Modal Transitions**: Smooth fade-in with subtle slide-up animation (`slide-in-from-bottom-4 duration-300 ease-out`).

---

## Proposed Changes

### 1. Dual Firebase App Architecture (`src/services/firebase.ts`)
- **Customer App (`customerApp`)**: Initialized with default settings (`[DEFAULT]` app). Exports `customerAuth` and `customerDb`.
- **Admin App (`adminApp`)**: Initialized as a dedicated named app (`khanAdminApp`). Exports `adminAuth` and `adminDb`.
- **Session Isolation**: Firebase automatically partitions browser IndexedDB storage:
  - Customer session: `firebase:authUser:<apiKey>:[DEFAULT]`
  - Admin session: `firebase:authUser:<apiKey>:khanAdminApp`
- **Firestore Authorization**:
  - Customer operations send tokens from `customerAuth` via `customerDb`.
  - Admin operations (orders, product modifications, status updates) send tokens from `adminAuth` via `adminDb`, matching `firestore.rules` rules for `isAdmin()`.

### 2. Admin Authentication Service Update (`src/services/adminAuthService.ts`)
- Migrate all methods (`loginAdminWithEmailPassword`, `loginAdminWithGoogle`, `logoutAdmin`, `verifyAndEnsureAdmin`) to use `adminAuth` and `adminDb`.
- Ensure `nkae.rjb@gmail.com` bootstrap check and document updates run against `adminDb`.

### 3. Customer Authentication Service Update (`src/services/customerAuthService.ts`)
- Explicitly bind all customer operations (`registerCustomer`, `loginCustomer`, `loginWithGoogle`, `logoutCustomer`, `fetchCustomerProfile`, etc.) to `customerAuth` and `customerDb`.
- Customer sign-out strictly invokes `signOut(customerAuth)`, keeping `adminAuth` untouched.

### 4. Decoupled Authentication State Listeners (`src/App.tsx`)
- Replace the monolithic listener with two independent `useEffect` listeners:
  1. `onAuthStateChanged(adminAuth, async (adminUser) => { ... })`: manages `adminAuth` state.
  2. `onAuthStateChanged(customerAuth, async (custUser) => { ... })`: manages `customerAuth` state.
- Ensure that logging in to the admin panel does not populate customer state, and logging in as customer does not affect admin state.

### 5. Admin Order & Product Operations (`src/services/orderService.ts`, `src/services/productService.ts`)
- Direct admin update methods (`updateOrderStatusByAdmin`, `updateOrderPaymentStatusByAdmin`, `updateOrderDeliveryByAdmin`, `subscribeToOrders`, `fetchAllOrdersForAdmin`) to `adminDb`.
- Customer-facing functions (`createOrderInFirestore`, `fetchCustomerOrderWithVerification`, storefront reads) continue using `customerDb`.

### 6. Modal Entrance Animations (Tailwind CSS)
- Apply standard animation utility classes:
  - Backdrop: `animate-in fade-in duration-200`
  - Dialog body: `animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out`
- Apply across:
  - `ProductDetailModal.tsx`
  - `CheckoutModal.tsx`
  - `OrderTrackingModal.tsx`
  - `CustomerDashboardModal.tsx`
  - `AdminPortalModal.tsx`
  - `AdminOrderDetailModal.tsx`
  - `SamsungExchangeModal.tsx`
  - `ServiceBookingModal.tsx`
  - `ZeroFinanceModal.tsx`
  - `AskKhanAiPlaceholder.tsx`

---

## Verification Plan
1. **Compilation & Type Check**:
   - Run `compile_applet` and `lint_applet` to ensure clean TypeScript typing.
2. **Session Independence Test**:
   - Sign in as admin (`nkae.rjb@gmail.com`) in the Admin Portal. Verify admin dashboard loads.
   - Open customer portal; verify user is NOT logged in as customer.
   - Sign in as a different customer (or register a customer test account).
   - Verify customer dashboard shows customer profile.
   - Switch to Admin Portal; verify admin session remains active and authorized.
   - Sign out from customer profile; verify admin session remains logged in.
   - Sign out from admin portal; verify customer session remains logged in.
3. **Modal Animation Test**:
   - Open Product Detail, Checkout, and Order Tracking modals; verify smooth fade-in and slide-up motion without layout shifts or overflow flickers.
