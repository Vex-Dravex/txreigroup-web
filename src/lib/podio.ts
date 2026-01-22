import Podio from 'podio-js';

// Configuration for Podio credentials
const CLIENT_ID = process.env.PODIO_CLIENT_ID;
const CLIENT_SECRET = process.env.PODIO_CLIENT_SECRET;

// App configuration (Deals App)
const DEALS_APP_ID = process.env.PODIO_DEALS_APP_ID;
const DEALS_APP_TOKEN = process.env.PODIO_DEALS_APP_TOKEN;

export const PODIO_MAPPING = {
    // These keys should match the internal Supabase field names or logical names
    // The values should be the External ID (or Field ID) from Podio
    title: 'title',
    asking_price: 'asking-price',
    arv: 'arv',
    status: 'status', // e.g. category field in Podio
    property_address: 'property-address',
    property_city: 'city',
    property_state: 'state',
    property_zip: 'zip',
    description: 'description',
    wholesaler_name: 'wholesaler-name',
    wholesaler_email: 'wholesaler-email',
    wholesaler_phone: 'wholesaler-phone',
    disposition_status: 'disposition-status'
};

export function getPodioClient() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('Missing PODIO_CLIENT_ID or PODIO_CLIENT_SECRET environment variables');
    }

    // Initialize the Podio client
    // Note: Using 'app' auth type requires auth with app_id and app_token per request usually, 
    // or we authenticate globally if the library supports it. 
    // podio-js typically uses `podio.authenticateWithApp(appId, appToken, callback)`
    const podio = new Podio({
        authType: 'app',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });

    return podio;
}

export function getDealsAppDeets() {
    if (!DEALS_APP_ID || !DEALS_APP_TOKEN) {
        throw new Error('Missing PODIO_DEALS_APP_ID or PODIO_DEALS_APP_TOKEN');
    }
    return {
        appId: parseInt(DEALS_APP_ID),
        appToken: DEALS_APP_TOKEN
    };
}
