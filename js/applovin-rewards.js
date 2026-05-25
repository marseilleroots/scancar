/**
 * ScanCar — AppLovin MAX Rewarded Ads
 * Pubs vidéo rewarded 30 secondes pour débloquer le rapport
 */

(function() {
    'use strict';

    const appLovinModule = {
        initialized: false,
        sdkKey: window.SCANCAR_CONFIG?.APPLOVIN_SDK_KEY || null,
        adUnitId: window.SCANCAR_CONFIG?.APPLOVIN_REWARDED_AD_UNIT || null,
        rewardedAd: null,
        isReady: false,

        // Initialiser AppLovin MAX
        async init() {
            if (this.initialized) return;
            if (!this.sdkKey) {
                console.warn('[AppLovin] SDK Key not configured');
                return;
            }

            try {
                // Charger le SDK AppLovin
                if (!window.apptentive) {
                    const script = document.createElement('script');
                    script.src = 'https://a.applovin.com/applovin_sdk.js';
                    script.async = true;
                    script.onload = () => this.setupAds();
                    document.head.appendChild(script);
                } else {
                    this.setupAds();
                }

                this.initialized = true;
                console.log('[AppLovin] Module initialized');
            } catch (error) {
                console.error('[AppLovin] Init failed:', error);
            }
        },

        // Configurer les pubs
        setupAds() {
            try {
                // Initialiser AppLovin SDK
                if (window.AppLovinSdk) {
                    AppLovinSdk.getInstance(appLovinModule.sdkKey, (sdk) => {
                        appLovinModule.loadRewardedAd(sdk);
                    });
                }
            } catch (error) {
                console.error('[AppLovin] Setup failed:', error);
            }
        },

        // Charger pub rewarded
        loadRewardedAd(sdk) {
            try {
                if (!this.adUnitId) {
                    console.warn('[AppLovin] Ad unit ID not configured');
                    return;
                }

                this.rewardedAd = sdk.createRewardedAd(this.adUnitId);

                // Event listeners
                this.rewardedAd.addEventListener('adLoaded', () => {
                    this.isReady = true;
                    console.log('[AppLovin] Rewarded ad loaded');
                });

                this.rewardedAd.addEventListener('adDisplayFailed', () => {
                    this.isReady = false;
                    console.error('[AppLovin] Ad display failed');
                    this.showFallback();
                });

                this.rewardedAd.addEventListener('adHidden', () => {
                    this.isReady = false;
                    this.loadRewardedAd(sdk);
                });

                this.rewardedAd.addEventListener('adClicked', () => {
                    console.log('[AppLovin] Ad clicked');
                });

                // Charger première pub
                this.rewardedAd.load();
            } catch (error) {
                console.error('[AppLovin] Load failed:', error);
            }
        },

        // Afficher pub et attendre récompense
        async showRewardedAd() {
            return new Promise((resolve) => {
                try {
                    if (!this.rewardedAd) {
                        console.warn('[AppLovin] Ad not ready');
                        this.showFallback();
                        resolve();
                        return;
                    }

                    // Listener pour récompense
                    this.rewardedAd.addEventListener('userRewarded', (reward) => {
                        console.log('[AppLovin] User rewarded:', reward);
                        this.trackRewardedAdCompletion();
                        resolve();
                    });

                    // Afficher la pub
                    if (this.isReady) {
                        this.rewardedAd.show();
                    } else {
                        console.warn('[AppLovin] Ad not ready yet');
                        this.showFallback();
                        resolve();
                    }
                } catch (error) {
                    console.error('[AppLovin] Show failed:', error);
                    this.showFallback();
                    resolve();
                }
            });
        },

        // Fallback: minuteur 30 secondes
        showFallback() {
            console.log('[AppLovin] Showing 30s fallback timer');
            this.showTimerOverlay();
        },

        // Afficher overlay timer 30s
        showTimerOverlay() {
            let overlay = document.getElementById('applovin-timer-overlay');
            if (overlay) overlay.remove();

            overlay = document.createElement('div');
            overlay.id = 'applovin-timer-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
            `;

            let timeLeft = 30;
            const timerEl = document.createElement('div');
            timerEl.style.cssText = `
                font-size: 72px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #00C2FF;
            `;
            timerEl.textContent = timeLeft;

            const msgEl = document.createElement('div');
            msgEl.style.cssText = `
                font-size: 18px;
                text-align: center;
                color: #ccc;
                max-width: 80%;
            `;
            msgEl.textContent = 'Regardez cette publicité pour débloquer le rapport complet';

            overlay.appendChild(msgEl);
            overlay.appendChild(timerEl);
            document.body.appendChild(overlay);

            const interval = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    overlay.remove();
                    this.trackRewardedAdCompletion();
                }
            }, 1000);
        },

        // Tracker completion
        trackRewardedAdCompletion() {
            if (typeof gtag === 'function') {
                gtag('event', 'rewarded_ad_completed', {
                    event_category: 'monetization',
                    event_label: 'applovin',
                    value: 1
                });
            }

            // Déverrouiller le rapport
            if (window.unlockReport) {
                window.unlockReport();
            }

            // Dispatcher événement
            document.dispatchEvent(new CustomEvent('scancar:ad-completed'));
        }
    };

    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => appLovinModule.init());
    } else {
        appLovinModule.init();
    }

    // Exposer globalement
    window.appLovinRewards = {
        show: () => appLovinModule.showRewardedAd(),
        isReady: () => appLovinModule.isReady
    };

})();
