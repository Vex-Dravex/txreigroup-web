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

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            console.error(`Portal Error: No stripe_customer_id for user ${user.id}`);
            return new NextResponse("No Stripe customer found. Please subscribe first to access the portal.", { status: 404 });
        }

        const body = await req.json();
        const { returnUrl } = body;

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl || (req.headers.get("origin") || "http://localhost:3000") + "/app/account",
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Error creating portal session:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
