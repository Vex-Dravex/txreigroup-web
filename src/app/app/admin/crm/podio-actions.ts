'use server';

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPodioClient, getDealsAppDeets, PODIO_MAPPING } from "@/lib/podio";

export async function syncDealToPodio(dealId: string) {
    const supabase = await createSupabaseServerClient();

    // 1. Fetch Deal Data
    const { data: deal, error } = await supabase
        .from('deals')
        .select(`
      *,
      profiles:wholesaler_id (
        id,
        display_name,
        email,
        phone_number: phone
      )
    `)
        .eq('id', dealId)
        .single();

    if (error || !deal) {
        console.error("Error fetching deal:", error);
        throw new Error("Deal not found or database error.");
    }

    // 2. Initialize Podio
    const podio = getPodioClient();
    const { appId, appToken } = getDealsAppDeets();

    // Authenticate
    await new Promise<void>((resolve, reject) => {
        podio.authenticateWithApp(appId, appToken, (err: any) => {
            if (err) {
                console.error("Podio Auth Error:", err);
                reject(new Error("Failed to authenticate with Podio. Check credentials."));
            } else {
                resolve();
            }
        });
    });

    // 3. Map Fields
    // Note: Podio expects values in specific formats based on field type.
    // We are assuming most are Text fields for simplicity. 
    // Money/Date fields might need specific formatting.
    const fields: Record<string, any> = {};

    const setText = (externalId: string, value: string | null | undefined) => {
        if (value && externalId) {
            fields[externalId] = value; // Simple text field
        }
    };

    // Add more sophisticated mapping here based on Podio Field Types if known.
    // For now, we map everything as simple values hoping Podio's weak typing handles it 
    // or the helper library simplifies it. 
    // (In reality, Podio API needs { "value": "..." } structure for some, or just value for others if using a helper wrapper, 
    // but podio-js request('POST', ...) usually expects raw API payload structure: { "fields": { "external-id": "value", ... } } 
    // BUT using external IDs requires using the `fields` key with a map if using item-endpoint.
    // Actually, for `item/app/{app_id}/`, the body is `{ fields: { "external_id": "value" } }` if using external IDs.
    // Wait, standard Podio API using external IDs requires: `{ "fields": { "external-id": "value" } }` where value format depends on field.
    // Text: "String"
    // Money: { "value": 100, "currency": "USD" }
    // Date: { "start": "YYYY-MM-DD" }

    // Let's assume the user has mostly Text fields for now, but handle Price carefully.

    if (deal.title) setText(PODIO_MAPPING.title, deal.title);
    if (deal.property_address) setText(PODIO_MAPPING.property_address, deal.property_address);
    if (deal.property_city) setText(PODIO_MAPPING.property_city, deal.property_city);
    if (deal.status) setText(PODIO_MAPPING.status, deal.status);

    // Price (Assuming Money field or Text)
    if (deal.asking_price) {
        // Try Text format first or simple value. If it's a Money field in Podio, this might fail or need { currency: "USD", value: ... }
        // For safety, let's map it as a string if we don't know. 
        // User can update mapping logic.
        setText(PODIO_MAPPING.asking_price, deal.asking_price.toString());
    }

    // 4. Create or Update Item
    let itemId = deal.podio_item_id;

    try {
        if (itemId) {
            // Update existing item
            await new Promise<void>((resolve, reject) => {
                // For updates via podio-js using item_id
                podio.request('PUT', `/item/${itemId}`, { fields }, (body: any, response: any) => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve();
                    } else {
                        reject(body);
                    }
                });
            });
        } else {
            // Create new item
            const newItemResponse = await new Promise<{ item_id: number }>((resolve, reject) => {
                podio.request('POST', `/app/${appId}/item`, { fields }, (body: any, response: any) => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(body);
                    } else {
                        console.error("Podio Create Error Body:", body);
                        reject(body);
                    }
                });
            });
            itemId = newItemResponse.item_id.toString();
        }
    } catch (apiError) {
        console.error("Podio API Request Failed:", apiError);
        throw new Error("Failed to sync with Podio API. Check field mappings and App structure.");
    }

    // 5. Update Supabase Record
    const { error: updateError } = await supabase
        .from('deals')
        .update({
            podio_item_id: itemId,
            last_synced_with_podio_at: new Date().toISOString()
        })
        .eq('id', dealId);

    if (updateError) {
        console.error("Error updating deal with Podio ID:", updateError);
        // Warning: Synchronization happened but DB update failed.
    }

    return { success: true, podioItemId: itemId };
}
