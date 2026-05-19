/* ============================================
   SCANCAR — Affiliate Tracking & Integration
   ============================================ */

(function() {
    'use strict';

    // Affiliate Programs Configuration
    const affiliatePrograms = {
        autoscout24: {
            name: 'AutoScout24',
            icon: '🚗',
            baseUrl: 'https://www.autoscout24.fr/',
            title: 'Trouvez votre prochaine voiture',
            description: 'Annonces de véhicules fiables'
        },
        carvertical: {
            name: 'carVertical',
            icon: '📋',
            baseUrl: 'https://www.carvertical.com/',
            title: 'Historique complet du véhicule',
            description: 'Rapport détaillé d\'historique'
        },
        delticom: {
            name: 'Delticom',
            icon: '🛞',
            baseUrl: 'https://www.delticom.eu/',
            title: 'Pneus et accessoires auto',
            description: 'Achat de pneus en ligne'
        },
        vipcars: {
            name: 'VIP Cars',
            icon: '🚕',
            baseUrl: 'https://www.vipcars.com/',
            title: 'Location de véhicules',
            description: 'Location de véhicules'
        },
        assurland: {
            name: 'Assurland',
            icon: '🛡️',
            baseUrl: 'https://www.assurland.com/',
            title: 'Devis d\'assurance auto',
            description: 'Comparateur d\'assurances auto'
        }
    };

    // Generate Affiliate URL with tracking
    function generateAffiliateLink(program, vehicleData = {}) {
        const trackingId = `scancar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const params = new URLSearchParams({
            utm_source: 'scancar-app',
            utm_medium: 'affiliate',
            utm_campaign: program,
            utm_content: vehicleData.plate || 'vehicle-details',
            utm_id: trackingId
        });

        return `${affiliatePrograms[program].baseUrl}?${params.toString()}`;
    }

    // Track Affiliate Click in GA4
    function trackAffiliateClick(program, vehicleData = {}) {
        if (typeof gtag === 'undefined') return;

        gtag('event', 'affiliate_click', {
            'affiliate_name': program,
            'vehicle_brand': vehicleData.marque || '',
            'vehicle_year': vehicleData.annee || '',
            'vehicle_plate': vehicleData.plate || '',
            'button_position': vehicleData.position || 'results',
            'timestamp': new Date().toISOString()
        });
    }

    // Track Premium Signup
    function trackPremiumSignup(planType, price) {
        if (typeof gtag === 'undefined') return;

        gtag('event', 'premium_signup', {
            'value': price,
            'currency': 'EUR',
            'plan_type': planType,
            'timestamp': new Date().toISOString()
        });
    }

    // Track Ad Impression
    function trackAdImpression(adFormat, adNetwork, placement) {
        if (typeof gtag === 'undefined') return;

        gtag('event', 'ad_impression', {
            'ad_format': adFormat,
            'ad_network': adNetwork,
            'placement': placement,
            'timestamp': new Date().toISOString()
        });
    }

    // Initialize Affiliate Cards in Results
    function initializeAffiliateCards(vehicleData) {
        // Add event listeners to affiliate cards
        document.querySelectorAll('.affiliate-card').forEach(card => {
            card.addEventListener('click', function(e) {
                const affiliateType = this.dataset.affiliate;
                if (affiliateType && affiliatePrograms[affiliateType]) {
                    trackAffiliateClick(affiliateType, vehicleData);
                    const url = generateAffiliateLink(affiliateType, vehicleData);
                    window.open(url, '_blank');
                }
            });
        });
    }

    // Create Affiliate Card HTML
    function createAffiliateCard(program, vehicleData) {
        const programData = affiliatePrograms[program];
        if (!programData) return '';

        return `
            <div class="affiliate-card" data-affiliate="${program}" style="cursor: pointer;">
                <div class="affiliate-icon">${programData.icon}</div>
                <div class="affiliate-text">
                    <span class="affiliate-title">${programData.title}</span>
                    <span class="affiliate-desc">${programData.description}</span>
                </div>
                <span class="affiliate-arrow">→</span>
            </div>
        `;
    }

    // Insert Affiliate Section After Market Value
    function addAffiliateSection(vehicleData) {
        const resultView = document.getElementById('resultView');
        if (!resultView) return;

        // Check if affiliate section already exists
        if (document.getElementById('scancar-affiliates-section')) return;

        const section = document.createElement('div');
        section.id = 'scancar-affiliates-section';
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header" onclick="toggleSection(this)">
                <div class="section-title-group">
                    <div class="section-icon blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <h3>Ressources & Annonces</h3>
                </div>
                <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            <div class="section-content">
                ${createAffiliateCard('autoscout24', vehicleData)}
                ${createAffiliateCard('carvertical', vehicleData)}
                ${createAffiliateCard('assurland', vehicleData)}
                ${createAffiliateCard('vipcars', vehicleData)}
                ${createAffiliateCard('delticom', vehicleData)}
            </div>
        `;

        // Insert before the last section or at the end
        const lastSection = resultView.querySelector('.result-sections .section:last-child');
        if (lastSection) {
            lastSection.parentNode.insertBefore(section, lastSection.nextSibling);
        } else {
            resultView.querySelector('.result-sections').appendChild(section);
        }

        // Initialize the newly added cards
        initializeAffiliateCards(vehicleData);
    }

    // Expose functions globally
    window.affiliateTracking = {
        createCard: createAffiliateCard,
        trackClick: trackAffiliateClick,
        trackPremium: trackPremiumSignup,
        trackAdImpression: trackAdImpression,
        addSection: addAffiliateSection,
        initialize: initializeAffiliateCards,
        generateLink: generateAffiliateLink
    };

})();
