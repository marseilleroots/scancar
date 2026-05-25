/* ScanCar — Public runtime config
   Fill these values to activate optional features. Leave empty to disable. */
window.SCANCAR_CONFIG = {
    // Google Analytics 4 — Measurement ID (format: G-XXXXXXXXXX)
    GA4_ID: 'G-JT6M4QWPZ5',

    // AppLovin MAX SDK — Set via Vercel environment variable
    // ⚠️ DISABLED TEMPORARILY - Configure proper AppLovin account to enable
    // Create account at https://www.applovin.com/
    // Format: e.g., "4dc31de6fa6e2c5d"
    APPLOVIN_SDK_KEY: 'DISABLED',

    // AppLovin Rewarded Ad Unit ID
    // Create in AppLovin dashboard
    APPLOVIN_REWARDED_AD_UNIT: 'DISABLED',

    // RevenueCat API Key — Set via Vercel environment variable
    // Create account at https://app.revenuecat.com
    // Leave empty to use ad-based unlock fallback
    REVENUECAT_API_KEY: '',

    // Stripe Public Key — Set via Vercel environment variable
    // Create account at https://stripe.com
    STRIPE_PUBLIC_KEY: ''
};
