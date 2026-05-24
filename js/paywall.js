/* ScanCar — Unlock manager (Premium subscriptions + Ad-based fallback)
   Integration: RevenueCat (SDK) + Stripe (payment processor)
   Environment variables: REVENUECAT_API_KEY, STRIPE_PUBLIC_KEY (set in vercel.json) */

(function() {
    'use strict';

    const unlockManager = {
        initialized: false,
        userId: null,
        revenuecatInitialized: false,
        userEntitlements: {},

        // ========== INITIALIZATION ==========
        init() {
            this.userId = localStorage.getItem('scancar_userid')
                || 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('scancar_userid', this.userId);
            this.initialized = true;

            // Initialize RevenueCat if SDK is available
            this.initRevenueCat();
        },

        // ========== REVENUECAT SETUP ==========
        initRevenueCat() {
            if (typeof Purchases === 'undefined') {
                console.warn('[ScanCar] RevenueCat SDK not loaded. Ad-based unlock only.');
                return;
            }

            try {
                Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

                // Initialize RevenueCat with API key
                // This will be injected via environment variable
                const apiKey = window.SCANCAR_CONFIG?.REVENUECAT_API_KEY;
                if (!apiKey) {
                    console.warn('[ScanCar] RevenueCat API key not configured.');
                    return;
                }

                Purchases.configure({ apiKey: apiKey, appUserID: this.userId });
                this.revenuecatInitialized = true;

                // Fetch user entitlements
                this.fetchEntitlements();
            } catch (err) {
                console.error('[ScanCar] RevenueCat init failed:', err.message);
            }
        },

        // ========== ENTITLEMENTS & SUBSCRIPTION STATUS ==========
        async fetchEntitlements() {
            if (!this.revenuecatInitialized) return;

            try {
                const customerInfo = await Purchases.getCustomerInfo();
                this.userEntitlements = customerInfo.entitlements.active || {};

                // Check if user has "premium" entitlement
                if (this.userEntitlements.premium) {
                    console.log('[ScanCar] User has premium subscription');
                    localStorage.setItem('scancar_premium', 'true');
                } else {
                    localStorage.removeItem('scancar_premium');
                }
            } catch (err) {
                console.error('[ScanCar] Failed to fetch entitlements:', err.message);
            }
        },

        isPremium() {
            // Check if premium entitlement is active
            return !!this.userEntitlements.premium ||
                   localStorage.getItem('scancar_premium') === 'true';
        },

        // ========== PURCHASE FLOW ==========
        async showPurchaseModal() {
            if (!this.revenuecatInitialized) {
                console.warn('[ScanCar] RevenueCat not initialized. Using ad-based unlock instead.');
                return this.showRewardedAd();
            }

            try {
                // Get available products
                const offerings = await Purchases.getOfferings();

                if (!offerings.current) {
                    console.warn('[ScanCar] No offerings configured in RevenueCat.');
                    return this.showRewardedAd();
                }

                // Create and show paywall modal
                this.renderPaywallModal(offerings.current.availablePackages);
            } catch (err) {
                console.error('[ScanCar] Purchase modal failed:', err.message);
                // Fallback to ad-based unlock
                this.showRewardedAd();
            }
        },

        renderPaywallModal(packages) {
            // Create paywall container if it doesn't exist
            let modal = document.getElementById('scancar-paywall-modal');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'scancar-paywall-modal';
            modal.className = 'scancar-modal-overlay';
            modal.innerHTML = `
                <div class="scancar-paywall">
                    <button class="paywall-close" aria-label="Fermer">&times;</button>
                    <h2>Débloquez le Rapport Complet</h2>
                    <p class="paywall-subtitle">Accès illimité aux rapports détaillés des véhicules</p>

                    <div class="paywall-packages">
                        ${packages.map(pkg => `
                            <div class="paywall-package" data-package="${pkg.identifier}">
                                <h3>${pkg.product.title}</h3>
                                <p class="package-price">${pkg.product.priceString}</p>
                                <p class="package-desc">${pkg.product.description}</p>
                                <button class="btn-purchase" data-package="${pkg.identifier}">
                                    Acheter maintenant
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    <p class="paywall-footer">
                        <a href="/mentions-legales.html" target="_blank">Conditions</a> •
                        <a href="/confidentialite.html" target="_blank">Politique de confidentialité</a>
                    </p>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            modal.querySelector('.paywall-close').addEventListener('click', () => {
                modal.remove();
            });

            document.querySelectorAll('.btn-purchase').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const packageId = e.target.dataset.package;
                    await this.purchasePackage(packageId);
                });
            });

            // Track modal view
            this.trackEvent('paywall_shown');
        },

        async purchasePackage(packageId) {
            if (!this.revenuecatInitialized) return;

            try {
                const offerings = await Purchases.getOfferings();
                const pkg = offerings.current.availablePackages
                    .find(p => p.identifier === packageId);

                if (!pkg) {
                    console.error('[ScanCar] Package not found:', packageId);
                    return;
                }

                const result = await Purchases.purchasePackage(pkg);

                if (result.customerInfo.entitlements.active.premium) {
                    console.log('[ScanCar] Purchase successful!');
                    this.userEntitlements = result.customerInfo.entitlements.active;
                    localStorage.setItem('scancar_premium', 'true');

                    // Track purchase
                    this.trackEvent('premium_purchased', {
                        package: packageId,
                        price: pkg.product.price
                    });

                    // Close paywall and unlock report
                    document.getElementById('scancar-paywall-modal')?.remove();
                    window.unlockReport?.();
                }
            } catch (err) {
                if (err.code !== 'PURCHASE_CANCELLED_BY_USER') {
                    console.error('[ScanCar] Purchase failed:', err.message);
                    alert('Erreur lors de l\'achat. Veuillez réessayer.');
                }
            }
        },

        // ========== AD-BASED FALLBACK ==========
        showRewardedAd() {
            // Fallback to 30-second ad if RevenueCat unavailable
            console.log('[ScanCar] Using ad-based unlock (fallback)');
            // Dispatche un événement écouté par app.js pour lancer la pub récompensée
            document.dispatchEvent(new CustomEvent('scancar:show-rewarded-ad'));
        },

        // ========== ANALYTICS ==========
        trackEvent(name, params) {
            if (typeof gtag === 'function') {
                gtag('event', name, Object.assign({
                    event_category: 'monetization',
                    user_id: this.userId
                }, params || {}));
            }
        },

        trackUnlock(method) {
            this.trackEvent('report_unlock', { method: method });
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => unlockManager.init());
    window.unlockManager = unlockManager;
})();
