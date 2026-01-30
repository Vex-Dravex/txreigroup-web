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
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { priceId, successUrl, cancelUrl } = body;

        if (!priceId || !successUrl || !cancelUrl) {
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
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                name: profile?.display_name || undefined,
                metadata: {
                    supabaseUserId: user.id,
                },
            });
            stripeCustomerId = customer.id;

            // Update profile with stripe_customer_id
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", user.id);
        }

        // 2. Create Checkout Session
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

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
