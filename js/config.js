/* ScanCar — Public runtime config
   Fill these values to activate optional features. Leave empty to disable. */
window.SCANCAR_CONFIG = {
    // Google Analytics 4 — Measurement ID (format: G-XXXXXXXXXX)
    GA4_ID: 'G-JT6M4QWPZ5',

    // RevenueCat API Key — Set via Vercel environment variable
    // Create account at https://app.revenuecat.com
    // Leave empty to use ad-based unlock fallback
    REVENUECAT_API_KEY: process.env.REACT_APP_REVENUECAT_API_KEY || '',

    // Stripe Public Key — Set via Vercel environment variable
    // Create account at https://stripe.com
    STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || ''
};
