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
        pneusmoto: {
            name: 'Pneus-Moto',
            icon: '🏍️',
            baseUrl: 'https://www.awin1.com/cread.php?awinmid=7403&awinaffid=2899875&ued=https%3A%2F%2Fwww.pneus-moto.fr%2F',
            title: 'Pneus pour motos',
            description: 'Pneus de qualité pour motocyclettes',
            awinMid: 7403,
            awinAffid: 2899875
        },
        vevor: {
            name: 'Vevor',
            icon: '🔧',
            baseUrl: 'https://www.awin1.com/cread.php?awinmid=28835&awinaffid=2899875&ued=https%3A%2F%2Fwww.vevor.com%2F',
            title: 'Outils et équipements',
            description: 'Équipements et outils de qualité à prix compétitifs',
            awinMid: 28835,
            awinAffid: 2899875
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
        },
        ottocast: {
            name: 'Ottocast',
            icon: '📱',
            baseUrl: 'https://www.ottocast.com/',
            title: 'CarPlay & Android Auto sans fil',
            description: 'Transformez votre voiture en SUV connecté',
            awinMid: 96499,
            awinAffid: 2899875,
            blockStyle: true
        },
        goodwheel: {
            name: 'Goodwheel',
            icon: '🛞',
            baseUrl: 'https://www.goodwheel.fr/',
            title: 'Pneus en ligne',
            description: 'Marques premium (Michelin, Continental, Pirelli, Bridgestone)',
            awinMid: 123894,
            awinAffid: 2899875,
            blockStyle: true
        }
    };

    // Generate Awin Affiliate URL
    function generateAwinLink(program, vehicleData = {}) {
        const programData = affiliatePrograms[program];
        if (!programData || !programData.awinMid) return null;

        const params = new URLSearchParams({
            awinmid: programData.awinMid,
            awinaffid: programData.awinAffid,
            ued: programData.baseUrl
        });

        return `https://www.awin1.com/cread.php?${params.toString()}`;
    }

    // Generate Affiliate URL with tracking
    function generateAffiliateLink(program, vehicleData = {}) {
        // Check if it's an Awin partner
        if (affiliatePrograms[program]?.awinMid) {
            return generateAwinLink(program, vehicleData);
        }

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

    // Create Awin Block (for in-report display)
    function createAwinBlock(program, vehicleData = {}) {
        const programData = affiliatePrograms[program];
        if (!programData || !programData.blockStyle) return '';

        const awinLink = generateAwinLink(program, vehicleData);
        if (!awinLink) return '';

        let blockColor, btnColor, btnTextColor;

        if (program === 'ottocast') {
            blockColor = 'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)';
            btnColor = '#00C2FF';
            btnTextColor = '#000';
        } else if (program === 'goodwheel') {
            blockColor = 'linear-gradient(135deg,#0a3d62 0%,#0c5c8a 100%)';
            btnColor = '#FFD700';
            btnTextColor = '#000';
        }

        let title = programData.title;
        if (program === 'goodwheel' && vehicleData.pneus) {
            title = `🛞 Pneus ${(vehicleData.pneus || '').split('(')[0].trim() || 'adaptés'} dès 39€`;
        } else if (program === 'ottocast' && vehicleData.marque && vehicleData.modele) {
            title = `📱 CarPlay & Android Auto sans fil pour ${vehicleData.marque} ${vehicleData.modele}`;
        }

        return `
            <a href="${awinLink}" target="_blank" rel="noopener sponsored" style="display:block;text-decoration:none;">
                <div class="report-block" style="background:${blockColor};border:1px solid rgba(${program === 'ottocast' ? '0,194,255,0.3' : '255,255,255,0.15'});border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <span style="background:${btnColor};color:${btnTextColor};font-weight:800;font-size:10px;padding:3px 7px;border-radius:4px;">PARTENAIRE</span>
                        <strong style="font-size:13px;">${programData.name}</strong>
                    </div>
                    <h4 style="margin:0 0 6px 0;font-size:15px;">${title}</h4>
                    <p style="margin:0 0 12px 0;font-size:12px;opacity:${program === 'ottocast' ? '0.85' : '0.9'};">${programData.description}${program === 'goodwheel' ? ' — Livraison gratuite, montage chez un partenaire à 19€' : ' — Installation 5 min, compatible toutes marques'}</p>
                    <span style="display:inline-block;background:${btnColor};color:${btnTextColor};padding:8px 16px;border-radius:8px;font-weight:700;font-size:13px;">
                        ${program === 'ottocast' ? 'Découvrir Ottocast →' : 'Voir les pneus →'}
                    </span>
                </div>
            </a>
        `;
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
                ${createAffiliateCard('pneusmoto', vehicleData)}
                ${createAffiliateCard('vevor', vehicleData)}
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
        createAwinBlock: createAwinBlock,
        trackClick: trackAffiliateClick,
        trackPremium: trackPremiumSignup,
        trackAdImpression: trackAdImpression,
        addSection: addAffiliateSection,
        initialize: initializeAffiliateCards,
        generateLink: generateAffiliateLink
    };

})();
