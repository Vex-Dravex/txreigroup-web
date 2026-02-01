import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { couponCode } = body;

        if (!couponCode) {
            return new NextResponse("Missing coupon code", { status: 400 });
        }

        // Validate the coupon with Stripe
        try {
            // First, try to retrieve as a coupon ID
            const coupon = await stripe.coupons.retrieve(couponCode);

            // Check if coupon is valid and not expired
            if (!coupon.valid) {
                return NextResponse.json({ valid: false, message: "Coupon is no longer valid" }, { status: 400 });
            }

            // Check if coupon has expired
            if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
                return NextResponse.json({ valid: false, message: "Coupon has expired" }, { status: 400 });
            }

            // Check if coupon has reached max redemptions
            if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
                return NextResponse.json({ valid: false, message: "Coupon has reached maximum redemptions" }, { status: 400 });
            }

            return NextResponse.json({
                valid: true,
                coupon: {
                    id: coupon.id,
                    name: coupon.name,
                    percent_off: coupon.percent_off,
                    amount_off: coupon.amount_off,
                    currency: coupon.currency,
                    duration: coupon.duration,
                    duration_in_months: coupon.duration_in_months,
                }
            });
        } catch (error: any) {
            // If not found as coupon, try as promotion code
            if (error.code === 'resource_missing') {
                console.log(`Coupon ID "${couponCode}" not found, trying as promotion code...`);

                try {
                    const promoCodes = await stripe.promotionCodes.list({
                        code: couponCode,
                        limit: 1,
                    });

                    if (promoCodes.data.length > 0 && promoCodes.data[0].active) {
                        const promoCode = promoCodes.data[0];
                        const coupon = promoCode.coupon as any;

                        return NextResponse.json({
                            valid: true,
                            coupon: {
                                id: coupon.id,
                                name: coupon.name,
                                percent_off: coupon.percent_off,
                                amount_off: coupon.amount_off,
                                currency: coupon.currency,
                                duration: coupon.duration,
                                duration_in_months: coupon.duration_in_months,
                            }
                        });
                    }
                } catch (promoError) {
                    console.error('Error checking promotion code:', promoError);
                }

                console.log(`Neither coupon nor promotion code found for: "${couponCode}"`);
                return NextResponse.json({
                    valid: false,
                    message: "Invalid coupon code. Please check the code and try again."
                }, { status: 400 });
            }
            throw error;
        }
    } catch (error: any) {
        console.error("Error validating coupon:", error);
        return new NextResponse(error.message || "Internal Server Error", {
            status: 500,
        });
    }
}
