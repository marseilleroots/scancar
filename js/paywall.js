/* ScanCar — Unlock manager (ad-based)
   No paid subscriptions: unlock the full report by watching the rewarded ad.
   When real subscriptions are added (Stripe/RevenueCat), wire showPurchaseModal here. */
(function() {
    'use strict';

    const unlockManager = {
        initialized: false,
        userId: null,

        init() {
            this.userId = localStorage.getItem('scancar_userid')
                || 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('scancar_userid', this.userId);
            this.initialized = true;
        },

        trackEvent(name, params) {
            if (typeof gtag === 'function') {
                gtag('event', name, Object.assign({
                    event_category: 'engagement',
                    user_id: this.userId
                }, params || {}));
            }
        },

        trackUnlock(method) {
            this.trackEvent('report_unlock', { method: method });
        }
    };

    document.addEventListener('DOMContentLoaded', () => unlockManager.init());
    window.unlockManager = unlockManager;
})();
