# 🚀 Quick Start: Embedded Checkout

## 📦 Files Created

```
✅ /src/components/checkout/EmbeddedCheckout.tsx
   → Main component - drop this anywhere you want checkout

✅ /src/app/api/create-payment-intent/route.ts
   → Backend API - creates payment intents

✅ /src/components/checkout/CheckoutComparison.tsx
   → Side-by-side comparison of both checkout types

✅ /src/app/examples/embedded-checkout-example.tsx
   → Full example implementation

✅ EMBEDDED_CHECKOUT_GUIDE.md
   → Complete documentation
```

## ⚡ Quick Implementation (3 Steps)

### Step 1: Import the Component

```tsx
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
```

### Step 2: Use It

```tsx
<EmbeddedCheckout
  priceId="price_1SvDj0FFZDZ2nlnZAkYVfofJ"
  planName="Monthly Access"
  planPrice="$99"
  onSuccess={() => router.push('/success')}
  onCancel={() => console.log('Cancelled')}
/>
```

### Step 3: Done! 🎉

That's it! The component handles everything:
- ✅ Opens beautiful modal
- ✅ Collects payment securely
- ✅ Processes subscription
- ✅ Handles errors
- ✅ Calls your success callback

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────┐
│  Complete Your Subscription        [X] │
│  Monthly Access - $99/month            │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Card number                       │ │
│  │ 1234 5678 9012 3456              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │ MM / YY     │  │ CVC              │ │
│  │ 12 / 34     │  │ 123              │ │
│  └─────────────┘  └──────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ZIP Code                            ││
│  │ 12345                               ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Cancel]  [Subscribe Now →]           │
│                                         │
│  🔒 Secured by Stripe                  │
└─────────────────────────────────────────┘
```

## 🔄 Replace Your Current Checkout

### Before (Hosted Checkout):

```tsx
const handleCheckout = async () => {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, successUrl, cancelUrl })
  });
  const { url } = await res.json();
  window.location.href = url; // ❌ User leaves your site
};

<button onClick={handleCheckout}>Subscribe</button>
```

### After (Embedded Checkout):

```tsx
<EmbeddedCheckout
  priceId={priceId}
  planName="Monthly"
  planPrice="$99"
  onSuccess={() => router.push('/dashboard')} // ✅ User stays!
/>
```

## 📊 Comparison

| Feature | Hosted | Embedded |
|---------|--------|----------|
| User stays on site | ❌ | ✅ |
| Custom branding | ⚠️ Limited | ✅ Full |
| Conversion rate | Good | Better |
| Implementation | Easy | Medium |
| PCI Compliance | ✅ | ✅ |
| Mobile friendly | ✅ | ✅ |

## 🎯 When to Use Each

### Use **Hosted Checkout** when:
- You want the fastest implementation
- You're okay with redirects
- You want Stripe to handle everything

### Use **Embedded Checkout** when:
- You want users to stay on your site
- You need full control over UX
- You want better conversion rates
- You want a premium, branded experience

## 🧪 Test It

```bash
# 1. Make sure dev server is running
npm run dev

# 2. Navigate to your subscription page
http://localhost:3000/onboarding/subscription

# 3. Click "Subscribe" on any plan

# 4. Modal opens - enter test card:
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345

# 5. Click "Subscribe Now"

# 6. Should process and redirect to success page
```

## 🎨 Customize

### Change Button Text
```tsx
// In EmbeddedCheckout.tsx, line ~100
<button>Subscribe to {planName}</button>
// Change to:
<button>Get Started with {planName}</button>
```

### Change Modal Size
```tsx
// In EmbeddedCheckout.tsx, line ~120
<div className="max-w-2xl">
// Change to:
<div className="max-w-lg"> // Smaller
<div className="max-w-4xl"> // Larger
```

### Change Colors
```tsx
// In EmbeddedCheckout.tsx, line ~150
appearance: {
  variables: {
    colorPrimary: "#2563eb", // Change to your brand color
  }
}
```

## 🐛 Common Issues

### "No such price"
→ Check your `.env.local` has correct price IDs
→ Restart dev server

### Modal doesn't open
→ Check browser console for errors
→ Make sure Stripe packages are installed: `npm install @stripe/stripe-js @stripe/react-stripe-js`

### Payment succeeds but database not updated
→ Configure webhooks (see STRIPE_SETUP_GUIDE.md)

## 📚 Full Documentation

See `EMBEDDED_CHECKOUT_GUIDE.md` for:
- Advanced customization
- Dark mode support
- Coupon codes
- Billing address collection
- Error handling
- And much more!

## 💡 Pro Tip

You can use BOTH checkout types and let users choose:

```tsx
<div className="flex gap-3">
  <EmbeddedCheckout {...props} />
  <button onClick={redirectToStripe}>
    Or checkout with Stripe →
  </button>
</div>
```

Then A/B test to see which converts better!

## 🎉 That's It!

You now have a beautiful embedded checkout that:
- ✅ Keeps users on your site
- ✅ Looks premium and branded
- ✅ Handles payments securely
- ✅ Works with your existing setup
- ✅ Is fully customizable

Questions? Check the full guide or the example implementation!
