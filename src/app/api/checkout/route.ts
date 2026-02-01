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
            console.error("Checkout error: No user found");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { priceId, successUrl, cancelUrl } = body;

        console.log("Checkout request:", { priceId, userId: user.id });

        if (!priceId || !successUrl || !cancelUrl) {
            console.error("Checkout error: Missing required fields", { priceId, successUrl, cancelUrl });
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Get or Create Stripe Customer
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

        // 2. Create Checkout Session
        console.log("Creating checkout session with price:", priceId);
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 14,
                metadata: {
                    supabaseUserId: user.id,
                }
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                supabaseUserId: user.id,
            },
        });

        console.log("Checkout session created:", session.id);
        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        console.error("Error details:", {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
        });
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
