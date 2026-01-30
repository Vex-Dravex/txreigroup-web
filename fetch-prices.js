const Stripe = require('stripe');

// Initialize with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listPrices() {
    try {
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            active: true,
            limit: 100,
        });

        console.log('Found prices:');
        prices.data.forEach(price => {
            const productName = typeof price.product === 'string' ? price.product : price.product.name;
            console.log(`Product: ${productName} | Price ID: ${price.id} | Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

listPrices();
