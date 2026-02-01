import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("Payment Intent error: No user found");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { priceId, couponCode } = body;

        console.log("Creating payment intent for:", { priceId, couponCode, userId: user.id });

        if (!priceId) {
            console.error("Payment Intent error: Missing priceId");
            return new NextResponse("Missing priceId", { status: 400 });
        }

        // Get or Create Stripe Customer
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email, display_name")
            .eq("id", user.id)
            .single();

        let stripeCustomerId = profile?.stripe_customer_id;

        if (!stripeCustomerId) {
            console.log("Creating new Stripe customer for user:", user.id);
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                name: profile?.display_name || undefined,
                metadata: {
                    supabaseUserId: user.id,
                },
            });
            stripeCustomerId = customer.id;
            console.log("Created Stripe customer:", stripeCustomerId);

            // Update profile with stripe_customer_id
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", user.id);
        } else {
            console.log("Using existing Stripe customer:", stripeCustomerId);
        }

        // Check if user already has an active subscription
        const { data: existingMembership } = await supabase
            .from("memberships")
            .select("status, subscription_id")
            .eq("user_id", user.id)
            .single();

        if (existingMembership && ['active', 'trialing'].includes(existingMembership.status)) {
            console.log("User already has an active subscription:", existingMembership.subscription_id);
            return new NextResponse(
                JSON.stringify({
                    error: "You already have an active subscription. Please manage your subscription from your account settings."
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Create a Subscription with Payment Intent
        // Note: With trial_period_days, Stripe creates a setup intent instead of payment intent
        const subscriptionParams: any = {
            customer: stripeCustomerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            payment_settings: {
                payment_method_types: ["card", "cashapp", "link"],
                save_default_payment_method: "on_subscription",
            },
            expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
            trial_period_days: 14,
            metadata: {
                supabaseUserId: user.id,
            },
        };

        // Apply coupon/promotion code if provided
        if (couponCode) {
            console.log("Attempting to apply coupon/promo code:", couponCode);

            // First, try to find it as a promotion code
            try {
                const promoCodes = await stripe.promotionCodes.list({
                    code: couponCode,
                    limit: 1,
                });

                if (promoCodes.data.length > 0 && promoCodes.data[0].active) {
                    // Use the promotion code ID
                    subscriptionParams.promotion_code = promoCodes.data[0].id;
                    console.log("Applied promotion code:", promoCodes.data[0].id);
                } else {
                    // Fall back to treating it as a coupon ID
                    subscriptionParams.coupon = couponCode;
                    console.log("Applied as coupon ID:", couponCode);
                }
            } catch (error) {
                // If promotion code lookup fails, try as direct coupon ID
                console.log("Promotion code lookup failed, trying as coupon ID");
                subscriptionParams.coupon = couponCode;
            }
        }

        const subscription = await stripe.subscriptions.create(subscriptionParams);

        // With trial period, Stripe uses setup intent (no immediate charge)
        const setupIntent = (subscription as any).pending_setup_intent;
        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice?.payment_intent;

        // Get the client secret from either setup intent or payment intent
        let clientSecret: string | null = null;

        if (setupIntent?.client_secret) {
            clientSecret = setupIntent.client_secret;
            console.log("Setup intent created (trial period):", setupIntent.id);
        } else if (paymentIntent?.client_secret) {
            clientSecret = paymentIntent.client_secret;
            console.log("Payment intent created:", paymentIntent.id);
        }

        if (!clientSecret) {
            throw new Error("Failed to create payment/setup intent");
        }

        return NextResponse.json({
            clientSecret,
            subscriptionId: subscription.id,
        });
    } catch (error: any) {
        console.error("Error creating payment intent:", error);
        console.error("Error details:", {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
        });
        return new NextResponse(error.message || "Internal Server Error", {
            status: 500,
        });
    }
}
