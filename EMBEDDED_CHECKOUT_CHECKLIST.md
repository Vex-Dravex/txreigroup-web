# ✅ Embedded Checkout Implementation Checklist

## 🎯 Quick Start Checklist

Use this checklist to implement the embedded checkout step-by-step.

---

## 📋 Phase 1: Setup (5 minutes)

- [ ] **Verify Stripe packages are installed**
  ```bash
  npm list @stripe/stripe-js @stripe/react-stripe-js
  ```
  If not installed:
  ```bash
  npm install @stripe/stripe-js @stripe/react-stripe-js
  ```

- [ ] **Verify environment variables in `.env.local`**
  ```bash
  cat .env.local | grep STRIPE
  ```
  Should show:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL`
  - `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL`

- [ ] **Restart dev server**
  ```bash
  pkill -f "next dev"
  npm run dev
  ```

---

## 📋 Phase 2: Test the Component (10 minutes)

- [ ] **Navigate to subscription page**
  ```
  http://localhost:3000/onboarding/subscription
  ```

- [ ] **Temporarily update the page to use embedded checkout**
  
  In `/src/app/onboarding/subscription/page.tsx`:
  
  ```tsx
  // Add this import at the top
  import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
  
  // Replace the handleSelectPlan function with this:
  const handleSuccess = () => {
    router.push('/app?success=true');
  };
  
  // In the JSX, replace PricingCard with:
  <div className="pricing-card-wrapper">
    {/* Keep your existing card UI */}
    <h3>{tier.name}</h3>
    <p>{tier.price}</p>
    
    {/* Replace button with: */}
    <EmbeddedCheckout
      priceId={tier.priceId}
      planName={tier.name}
      planPrice={tier.price}
      onSuccess={handleSuccess}
    />
  </div>
  ```

- [ ] **Test the flow**
  - Click "Subscribe" on any plan
  - Modal should open
  - Enter test card: `4242 4242 4242 4242`
  - Expiry: `12/34`, CVC: `123`, ZIP: `12345`
  - Click "Subscribe Now"
  - Should process successfully

- [ ] **Verify in Stripe Dashboard**
  - Go to: https://dashboard.stripe.com/subscriptions
  - Should see new subscription with status "trialing"

- [ ] **Verify in Supabase**
  - Check `memberships` table
  - Should have new row with:
    - `stripe_subscription_id`
    - `status: 'trialing'`
    - `current_period_end` (14 days from now)

---

## 📋 Phase 3: Customize (Optional, 15 minutes)

- [ ] **Update button text**
  
  In `/src/components/checkout/EmbeddedCheckout.tsx` (line ~100):
  ```tsx
  <button>Subscribe to {planName}</button>
  // Change to your preferred text
  ```

- [ ] **Update modal styling**
  
  Change modal size (line ~120):
  ```tsx
  <div className="max-w-2xl"> {/* Default */}
  // Options: max-w-lg (small), max-w-4xl (large)
  ```

- [ ] **Update Stripe Elements theme**
  
  Change colors (line ~150):
  ```tsx
  appearance: {
    variables: {
      colorPrimary: "#2563eb", // Your brand color
      borderRadius: "8px",
    }
  }
  ```

- [ ] **Add dark mode support**
  ```tsx
  const isDark = document.documentElement.classList.contains('dark');
  
  appearance: {
    theme: isDark ? "night" : "stripe",
  }
  ```

---

## 📋 Phase 4: Production Deployment (30 minutes)

- [ ] **Set up production webhooks**
  
  1. Go to: https://dashboard.stripe.com/webhooks
  2. Click "Add endpoint"
  3. URL: `https://yourdomain.com/api/webhooks/stripe`
  4. Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
  5. Copy webhook signing secret
  6. Add to production environment variables

- [ ] **Configure Stripe Customer Portal**
  
  1. Go to: https://dashboard.stripe.com/settings/billing/portal
  2. Enable:
     - Cancel subscriptions
     - Update payment methods
     - View invoices
  3. Add your logo and brand colors
  4. Save changes

- [ ] **Test with real card (small amount)**
  
  - Use a real card
  - Subscribe to cheapest plan
  - Verify payment processes
  - Immediately cancel to avoid charges
  - Verify cancellation works

- [ ] **Update success/cancel URLs**
  
  In your implementation:
  ```tsx
  <EmbeddedCheckout
    onSuccess={() => router.push('/app/dashboard')}
    onCancel={() => router.push('/pricing')}
  />
  ```

- [ ] **Add error monitoring**
  
  Consider adding Sentry or similar:
  ```tsx
  try {
    // ... payment code
  } catch (error) {
    Sentry.captureException(error);
    setError(error.message);
  }
  ```

- [ ] **Deploy to production**
  ```bash
  git add .
  git commit -m "Add embedded checkout"
  git push origin main
  ```

---

## 📋 Phase 5: Monitoring (Ongoing)

- [ ] **Set up analytics tracking**
  ```tsx
  // Track modal opens
  analytics.track('Checkout Modal Opened', { planName });
  
  // Track successful subscriptions
  analytics.track('Subscription Created', { planName, priceId });
  
  // Track errors
  analytics.track('Checkout Error', { error: error.message });
  ```

- [ ] **Monitor Stripe Dashboard**
  - Check for failed payments
  - Monitor subscription churn
  - Review customer feedback

- [ ] **Monitor webhook logs**
  - Go to: https://dashboard.stripe.com/webhooks
  - Check for failed webhook deliveries
  - Fix any issues

- [ ] **A/B test conversion rates**
  - Compare embedded vs hosted checkout
  - Track which converts better
  - Optimize based on data

---

## 🐛 Troubleshooting Checklist

### Issue: Modal doesn't open

- [ ] Check browser console for errors
- [ ] Verify Stripe packages installed
- [ ] Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- [ ] Restart dev server

### Issue: "No such price" error

- [ ] Verify price IDs in `.env.local`
- [ ] Check prices are active in Stripe Dashboard
- [ ] Restart dev server
- [ ] Clear browser cache

### Issue: Payment succeeds but database not updated

- [ ] Verify webhook endpoint is configured
- [ ] Check webhook signing secret is correct
- [ ] Check webhook logs in Stripe Dashboard
- [ ] Verify `/api/webhooks/stripe` route exists

### Issue: "Invalid client secret" error

- [ ] Close modal and try again
- [ ] Check API route is returning clientSecret
- [ ] Verify Stripe secret key is correct

---

## 📚 Reference Documents

- [ ] **Quick Start**: `EMBEDDED_CHECKOUT_QUICKSTART.md`
- [ ] **Complete Guide**: `EMBEDDED_CHECKOUT_GUIDE.md`
- [ ] **Architecture**: `EMBEDDED_CHECKOUT_ARCHITECTURE.md`
- [ ] **Summary**: `EMBEDDED_CHECKOUT_SUMMARY.md`
- [ ] **Stripe Setup**: `STRIPE_SETUP_GUIDE.md`

---

## 🎯 Success Criteria

Your implementation is successful when:

- [x] ✅ Modal opens when user clicks subscribe
- [x] ✅ Payment form displays correctly
- [x] ✅ Test card processes successfully
- [x] ✅ User stays on your site (no redirect)
- [x] ✅ Subscription appears in Stripe Dashboard
- [x] ✅ Database updates via webhook
- [x] ✅ Success callback fires
- [x] ✅ Error handling works
- [x] ✅ Mobile responsive
- [x] ✅ Dark mode works (if applicable)

---

## 📊 Performance Benchmarks

Target metrics:

- [ ] **Modal open time**: < 500ms
- [ ] **Payment processing**: < 3 seconds
- [ ] **Webhook processing**: < 1 second
- [ ] **Conversion rate**: > 3% (vs ~2% for hosted)
- [ ] **Error rate**: < 1%

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js

# Check environment variables
cat .env.local | grep STRIPE

# Restart dev server
pkill -f "next dev" && npm run dev

# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# View Stripe logs
stripe logs tail

# Deploy to production
git add . && git commit -m "Add embedded checkout" && git push
```

---

## 🎉 You're Done!

Once all checkboxes are complete, you have:

✅ A fully functional embedded checkout  
✅ Seamless user experience  
✅ Production-ready implementation  
✅ Proper monitoring and analytics  
✅ Error handling and recovery  

**Next Steps:**
1. Monitor conversion rates
2. Gather user feedback
3. Iterate and improve
4. Consider A/B testing vs hosted checkout

---

## 💡 Pro Tips

1. **Start with test mode** - Don't use live keys until you've tested thoroughly
2. **Test on mobile** - Most users will checkout on mobile devices
3. **Monitor webhooks** - Failed webhooks = unhappy customers
4. **Add loading states** - Users need feedback during async operations
5. **Handle errors gracefully** - Show clear, actionable error messages
6. **A/B test** - Compare embedded vs hosted to see which converts better
7. **Optimize for speed** - Faster checkout = higher conversion
8. **Add trust badges** - SSL, money-back guarantee, etc.

---

## 📞 Need Help?

- Review the documentation in the project root
- Check the example implementation
- Test with the comparison component
- Review Stripe Dashboard for errors
- Check webhook logs for issues

---

**Happy coding! 🚀**
