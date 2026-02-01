import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("STRIPE_WEBHOOK_SECRET is missing");
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error("Webhook signature verification failed:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Retrieve the subscription details
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                ) as Stripe.Subscription;

                const userId = session.metadata?.supabaseUserId;
                if (!userId) {
                    console.error("No supabaseUserId in metadata for session:", session.id);
                    break;
                }

                // Upsert membership
                await supabase.from("memberships").upsert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscription.id,
                    tier: "investor_pro", // You might want to map this from priceId in the future
                    status: subscription.status,
                    subscription_id: subscription.id,
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                    trial_end: subscription.trial_end
                        ? new Date(subscription.trial_end * 1000).toISOString()
                        : null,
                });

                // Update profile status
                await supabase
                    .from("profiles")
                    .update({
                        subscription_status: subscription.status,
                        stripe_customer_id: session.customer as string
                    })
                    .eq("id", userId);

                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                // Find user by stripe_customer_id
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", subscription.customer as string)
                    .single();

                if (profile) {
                    await supabase.from("memberships").upsert({
                        user_id: profile.id,
                        stripe_customer_id: subscription.customer as string,
                        stripe_subscription_id: subscription.id,
                        status: subscription.status,
                        subscription_id: subscription.id,
                        tier: "investor_pro", // Maintain existing tier or fetch from price 
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                        trial_end: subscription.trial_end
                            ? new Date(subscription.trial_end * 1000).toISOString()
                            : null,
                    }, { onConflict: 'user_id' }); // Ensure we update the existing row

                    await supabase
                        .from("profiles")
                        .update({ subscription_status: subscription.status })
                        .eq("id", profile.id);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", subscription.customer as string)
                    .single();

                if (profile) {
                    await supabase.from("memberships").update({
                        status: 'canceled',
                        subscription_id: null,
                        current_period_end: null
                    }).eq("user_id", profile.id);

                    await supabase
                        .from("profiles")
                        .update({ subscription_status: 'canceled' })
                        .eq("id", profile.id);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error("Error processing webhook:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
