/**
 * ScanCar — Intégration CarVertical (affiliation)
 * Affiche un bloc CarVertical avec lien d'affiliation pour acheter
 * le vrai rapport d'historique du véhicule.
 */

window.carvertical = (function () {

    // Code d'affiliation CarVertical (à personnaliser)
    const AFFILIATE_PARTNER_ID = 'scancar';
    const BASE_URL = 'https://www.carvertical.com/fr/check';

    function buildAffiliateUrl(plate) {
        const params = new URLSearchParams({
            vin: '',
            license_plate: plate,
            country: 'fr',
            utm_source: AFFILIATE_PARTNER_ID,
            utm_medium: 'app',
            utm_campaign: 'scancar_unlock'
        });
        return BASE_URL + '?' + params.toString();
    }

    function load(plate, container) {
        if (!container) return;
        const safePlate = (plate || '').toUpperCase();
        container.innerHTML = `
            <div class="cv-block" style="background:linear-gradient(135deg,#0a0e27 0%,#1a2147 100%);border:1px solid rgba(0,194,255,0.25);border-radius:14px;padding:18px;margin:14px 0;color:#fff;position:relative;overflow:hidden;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <div style="background:#00C2FF;color:#000;font-weight:800;font-size:11px;letter-spacing:1px;padding:3px 8px;border-radius:4px;">PARTENAIRE</div>
                    <div style="font-size:18px;font-weight:800;">carVertical</div>
                </div>
                <h4 style="margin:0 0 8px 0;font-size:16px;line-height:1.3;">🔍 Historique mondial du véhicule</h4>
                <p style="margin:0 0 14px 0;font-size:13px;line-height:1.5;opacity:0.9;">
                    Découvrez l'historique complet de <strong>${safePlate}</strong> : accidents, sinistres, vol, kilométrage frauduleux, propriétaires précédents — données issues de 900+ sources mondiales.
                </p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px;font-size:12px;">
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">🚗 Accidents déclarés</div>
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">📏 Vérif. kilométrage</div>
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">🔒 Statut vol / gage</div>
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">👥 Propriétaires</div>
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">🛠 Contrôle technique</div>
                    <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:8px;">🌍 Importation</div>
                </div>
                <a href="${buildAffiliateUrl(safePlate)}" target="_blank" rel="noopener sponsored"
                   style="display:block;background:#00C2FF;color:#000;text-align:center;padding:12px 16px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">
                    Obtenir le rapport carVertical →
                </a>
                <p style="text-align:center;margin:10px 0 0 0;font-size:11px;opacity:0.65;">
                    Rapport disponible à partir de 14,99€ · Garantie satisfait ou remboursé
                </p>
            </div>
        `;
    }

    return { load };
})();
