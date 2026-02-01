# 🎨 Embedded Custom Checkout Guide

## Overview

This guide shows you how to implement a custom embedded checkout that keeps users on your site instead of redirecting to Stripe's hosted checkout page.

## 🆚 Comparison: Hosted vs Embedded

### Hosted Checkout (Current)
- ✅ **Pros**: Easy to implement, PCI compliant out of the box, Stripe handles everything
- ❌ **Cons**: User leaves your site, less control over UX, redirect flow can feel clunky

### Embedded Checkout (New)
- ✅ **Pros**: User stays on your site, full control over UX, seamless experience, branded
- ❌ **Cons**: Slightly more complex, need to handle Stripe Elements

---

## 📦 What I've Created for You

### 1. **EmbeddedCheckout Component** (`/src/components/checkout/EmbeddedCheckout.tsx`)

A reusable React component that:
- Opens a beautiful modal with payment form
- Uses Stripe Elements for secure card input
- Handles payment processing
- Shows loading states and error messages
- Fully styled for dark/light mode

**Usage:**
```tsx
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";

<EmbeddedCheckout
  priceId="price_1SvDj0FFZDZ2nlnZAkYVfofJ"
  planName="Monthly Access"
  planPrice="$99"
  onSuccess={() => router.push('/success')}
  onCancel={() => console.log('User cancelled')}
/>
```

### 2. **Payment Intent API** (`/src/app/api/create-payment-intent/route.ts`)

Backend endpoint that:
- Creates/retrieves Stripe customer
- Creates a subscription with payment intent
- Returns client secret for frontend
- Handles 14-day trial automatically

### 3. **Example Implementation** (`/src/app/examples/embedded-checkout-example.tsx`)

A complete subscription page showing how to integrate the component with your pricing tiers.

---

## 🚀 How to Use

### Option 1: Replace Your Current Subscription Page

Update `/src/app/onboarding/subscription/page.tsx`:

```tsx
"use client";

import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
import { PRICING_TIERS } from "@/lib/constants/pricing";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => (
                <div key={tier.id} className="pricing-card">
                    {/* Your existing card UI */}
                    <h3>{tier.name}</h3>
                    <p>{tier.price}</p>
                    
                    {/* Replace your old button with this: */}
                    <EmbeddedCheckout
                        priceId={tier.priceId}
                        planName={tier.name}
                        planPrice={tier.price}
                        onSuccess={() => router.push('/app/dashboard')}
                        onCancel={() => console.log('Cancelled')}
                    />
                </div>
            ))}
        </div>
    );
}
```

### Option 2: Use Alongside Existing Checkout

Keep both options and let users choose:

```tsx
<div className="flex gap-3">
    {/* Embedded Checkout */}
    <EmbeddedCheckout
        priceId={tier.priceId}
        planName={tier.name}
        planPrice={tier.price}
        onSuccess={handleSuccess}
    />
    
    {/* OR Hosted Checkout */}
    <button onClick={() => redirectToStripe(tier.priceId)}>
        Checkout with Stripe
    </button>
</div>
```

---

## 🎨 Customization

### Change Modal Appearance

Edit `/src/components/checkout/EmbeddedCheckout.tsx`:

```tsx
// Change modal size
<div className="max-w-2xl"> {/* Change to max-w-lg for smaller */}

// Change colors
<button className="bg-blue-600"> {/* Change to your brand color */}

// Change Stripe Elements theme
appearance: {
    theme: "stripe", // Options: "stripe", "night", "flat"
    variables: {
        colorPrimary: "#2563eb", // Your brand color
        borderRadius: "8px",
    },
}
```

### Add Dark Mode Support to Stripe Elements

```tsx
const isDark = document.documentElement.classList.contains('dark');

<Elements
    stripe={stripePromise}
    options={{
        clientSecret,
        appearance: {
            theme: isDark ? "night" : "stripe",
            variables: {
                colorPrimary: "#2563eb",
                colorBackground: isDark ? "#18181b" : "#ffffff",
                colorText: isDark ? "#fafafa" : "#18181b",
            },
        },
    }}
>
```

### Add Coupon/Promo Code Support

Update the API route:

```tsx
// In /src/app/api/create-payment-intent/route.ts
const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: priceId }],
    coupon: "SUMMER2024", // Add coupon code
    // ... rest of config
});
```

---

## 🔄 How It Works

### Flow Diagram

```
1. User clicks "Subscribe" button
   ↓
2. EmbeddedCheckout component calls /api/create-payment-intent
   ↓
3. API creates Stripe customer (if needed) and subscription
   ↓
4. API returns clientSecret
   ↓
5. Modal opens with Stripe Elements payment form
   ↓
6. User enters card details
   ↓
7. User clicks "Subscribe Now"
   ↓
8. Stripe processes payment
   ↓
9. Webhook updates your database
   ↓
10. onSuccess callback fires → redirect to dashboard
```

### Code Flow

```tsx
// 1. User clicks button
<EmbeddedCheckout priceId="price_xxx" />

// 2. Component fetches client secret
const { clientSecret } = await fetch('/api/create-payment-intent', {
    body: JSON.stringify({ priceId })
});

// 3. Modal opens with Stripe Elements
<Elements stripe={stripePromise} options={{ clientSecret }}>
    <PaymentElement />
</Elements>

// 4. User submits payment
await stripe.confirmPayment({
    elements,
    confirmParams: { return_url: '...' },
    redirect: "if_required", // Key: stays on page!
});

// 5. Success callback
onSuccess(); // → router.push('/dashboard')
```

---

## 🎯 Advanced Features

### 1. Add Loading Skeleton

```tsx
{isLoading && (
    <div className="animate-pulse">
        <div className="h-12 bg-zinc-200 rounded"></div>
    </div>
)}
```

### 2. Add Payment Method Icons

```tsx
<div className="flex gap-2 justify-center mt-4">
    <img src="/visa.svg" alt="Visa" className="h-8" />
    <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
    <img src="/amex.svg" alt="Amex" className="h-8" />
</div>
```

### 3. Add Billing Address Collection

```tsx
<Elements
    stripe={stripePromise}
    options={{
        clientSecret,
        appearance: { ... },
        // Add this:
        fields: {
            billingDetails: {
                address: 'auto',
            },
        },
    }}
>
```

### 4. Add Email Collection

```tsx
<PaymentElement
    options={{
        fields: {
            billingDetails: {
                email: 'auto',
            },
        },
    }}
/>
```

### 5. Show Trial Information

```tsx
<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
    <p className="text-sm text-blue-600 dark:text-blue-400">
        🎉 Start your 14-day free trial today. You won't be charged until {trialEndDate}.
    </p>
</div>
```

---

## 🐛 Troubleshooting

### Error: "No such price"

**Fix**: Make sure your `.env.local` has the correct price IDs and restart your dev server.

### Error: "Invalid client secret"

**Fix**: The payment intent might have expired. Close the modal and try again.

### Payment succeeds but database not updated

**Fix**: Check your webhook is configured and firing. See `STRIPE_SETUP_GUIDE.md`.

### Modal doesn't close after payment

**Fix**: Make sure you're calling `onSuccess()` in the `CheckoutForm` component.

### Styling looks broken

**Fix**: Make sure you have Tailwind CSS configured and the component is inside your app's theme provider.

---

## 🔐 Security Notes

1. **Never expose secret keys**: Only use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in frontend
2. **Validate on backend**: Always validate the payment on your server via webhooks
3. **Use HTTPS in production**: Stripe requires HTTPS for live mode
4. **PCI Compliance**: Stripe Elements handles PCI compliance for you - never touch raw card data

---

## 📊 Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Insufficient funds: 4000 0000 0000 9995
```

### Test Flow

1. Open your subscription page
2. Click "Subscribe" on any plan
3. Modal should open with payment form
4. Enter test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., `12/34`)
6. CVC: Any 3 digits (e.g., `123`)
7. ZIP: Any 5 digits (e.g., `12345`)
8. Click "Subscribe Now"
9. Should process and call `onSuccess()`
10. Check Stripe Dashboard for new subscription
11. Check Supabase for updated membership

---

## 🎨 Design Tips

### Make it Premium

```tsx
// Add glassmorphism effect
<div className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80">

// Add glow effect
<div className="shadow-2xl shadow-blue-500/20">

// Add smooth animations
<div className="transition-all duration-300 ease-out">
```

### Match Your Brand

1. Update colors in `appearance.variables.colorPrimary`
2. Add your logo above the payment form
3. Customize button text and styling
4. Add trust badges (SSL, money-back guarantee, etc.)

---

## 🚀 Going Live

### Checklist

- [ ] Test with all test cards
- [ ] Verify webhooks are configured
- [ ] Test success/cancel flows
- [ ] Test error handling
- [ ] Verify database updates
- [ ] Test on mobile devices
- [ ] Switch to live Stripe keys
- [ ] Test with real card (small amount)
- [ ] Monitor Stripe Dashboard
- [ ] Set up error monitoring (Sentry, etc.)

---

## 📚 Resources

- [Stripe Elements Docs](https://stripe.com/docs/stripe-js)
- [Payment Element Docs](https://stripe.com/docs/payments/payment-element)
- [Stripe React Docs](https://stripe.com/docs/stripe-js/react)
- [Appearance API](https://stripe.com/docs/elements/appearance-api)

---

## 💡 Pro Tips

1. **Preload Stripe.js**: Add to your `_app.tsx` for faster loading
2. **Show loading states**: Users need feedback during async operations
3. **Handle errors gracefully**: Show clear, actionable error messages
4. **Mobile-first**: Test on mobile - most users will checkout on mobile
5. **A/B test**: Try both embedded and hosted to see which converts better
6. **Add analytics**: Track checkout abandonment, success rate, etc.

---

## 🎉 You're Done!

You now have a beautiful, embedded checkout that:
- ✅ Keeps users on your site
- ✅ Provides a seamless experience
- ✅ Is fully customizable
- ✅ Handles errors gracefully
- ✅ Works with your existing Stripe setup

Need help? Check the example implementation or reach out!
