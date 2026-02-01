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

        // Check if user has an active membership
        const { data: membership } = await supabase
            .from("memberships")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            console.error(`Portal Error: No membership found for user ${user.id}`);
            return new NextResponse("No active subscription found. Please subscribe first to access the portal.", { status: 404 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email, display_name")
            .eq("id", user.id)
            .single();

        let stripeCustomerId = profile?.stripe_customer_id;

        // If no stripe_customer_id but has membership, create customer and link it
        if (!stripeCustomerId && membership.stripe_customer_id) {
            stripeCustomerId = membership.stripe_customer_id;

            // Update profile with the stripe_customer_id from membership
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", user.id);
        } else if (!stripeCustomerId) {
            // This shouldn't happen, but handle it gracefully
            console.error(`Portal Error: No stripe_customer_id for user ${user.id} despite having membership`);
            return new NextResponse("Subscription configuration error. Please contact support.", { status: 500 });
        }

        const body = await req.json();
        const { returnUrl } = body;

        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: returnUrl || (req.headers.get("origin") || "http://localhost:3000") + "/app/account",
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating portal session:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
