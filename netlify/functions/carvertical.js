/**
 * ScanCar — Proxy CarVertical
 * Endpoint : GET /.netlify/functions/carvertical?plate=AB-123-CD
 *
 * Variables d'environnement Netlify à configurer :
 *   CARVERTICAL_API_KEY   → clé API CarVertical (B2B)
 *   CARVERTICAL_API_URL   → base URL (ex: https://api.carvertical.com/v1)  [optionnel]
 */

const CARVERTICAL_BASE = process.env.CARVERTICAL_API_URL || 'https://api.carvertical.com/v1';

exports.handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders() };
    }

    // Plaque depuis query string
    const plate = (event.queryStringParameters?.plate || '').trim().toUpperCase();
    if (!plate || plate.length < 4) {
        return jsonResponse(400, { error: 'Plaque invalide' });
    }

    // Clé API manquante → mode "pending" (intégration pas encore active)
    const apiKey = process.env.CARVERTICAL_API_KEY;
    if (!apiKey) {
        return jsonResponse(200, { status: 'pending', message: 'Rapport CarVertical bientôt disponible' });
    }

    try {
        // --- Étape 1 : résoudre la plaque → VIN (si l'API le demande) ---
        // CarVertical accepte soit /report?plate=XX&country=FR soit /vin?plate=XX&country=FR
        // On essaie directement par plaque d'abord
        const reportUrl = `${CARVERTICAL_BASE}/report?plate=${encodeURIComponent(plate)}&country=FR&lang=fr`;

        const resp = await fetch(reportUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) {
            const errText = await resp.text();
            console.error(`CarVertical error ${resp.status}:`, errText);
            return jsonResponse(resp.status, { error: 'Erreur CarVertical', details: errText });
        }

        const data = await resp.json();
        return jsonResponse(200, normalizeCarVerticalResponse(data, plate));

    } catch (err) {
        console.error('CarVertical fetch error:', err);
        return jsonResponse(500, { error: 'Erreur serveur', message: err.message });
    }
};

/**
 * Normalise la réponse CarVertical vers un format unifié ScanCar.
 * À ajuster selon la vraie réponse de l'API CarVertical une fois les credentials reçus.
 */
function normalizeCarVerticalResponse(data, plate) {
    // CarVertical retourne des structures comme :
    // data.mileage_records[], data.damage_records[], data.theft_records[], etc.
    // Adaptation à affiner avec la vraie doc API

    const mileageRecords = data.mileage_records || data.odometer_records || [];
    const damageRecords  = data.damage_records  || data.accident_records || [];
    const theftRecords   = data.theft_records   || [];
    const owners         = data.ownership_records || data.owners || [];
    const inspections    = data.inspection_records || data.ct_records || [];
    const pledge         = data.pledge           || data.gage || null;

    // Dernier kilométrage connu
    const lastMileage = mileageRecords.length
        ? mileageRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

    // Dernier CT
    const lastCT = inspections.length
        ? inspections.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

    return {
        status: 'ok',
        plate: plate,
        vin: data.vin || data.vehicle_id || null,

        // Accidents / sinistres
        accidents: {
            count: damageRecords.length,
            records: damageRecords.map(r => ({
                date: r.date || r.damage_date || null,
                type: r.type || r.damage_type || 'Sinistre déclaré',
                severity: r.severity || null,
                description: r.description || null
            }))
        },

        // Vol
        theft: {
            stolen: theftRecords.length > 0,
            records: theftRecords.map(r => ({
                date: r.date || null,
                country: r.country || null,
                status: r.status || null
            }))
        },

        // Gage / opposition
        pledge: {
            has_pledge: pledge ? (pledge.has_pledge || pledge.active || false) : false,
            details: pledge || null
        },

        // Kilométrage
        mileage: {
            last_known: lastMileage ? lastMileage.value || lastMileage.mileage : null,
            last_date: lastMileage ? lastMileage.date : null,
            unit: lastMileage ? (lastMileage.unit || 'km') : 'km',
            records: mileageRecords.slice(0, 10).map(r => ({
                date: r.date,
                value: r.value || r.mileage,
                source: r.source || null
            })),
            is_consistent: data.odometer_rollback === false || mileageRecords.length === 0 ? true :
                           (data.odometer_rollback === true ? false : null)
        },

        // Contrôle technique
        ct: {
            last_date: lastCT ? (lastCT.date || lastCT.inspection_date) : null,
            result: lastCT ? (lastCT.result || lastCT.status || null) : null,
            defects_minor: lastCT ? (lastCT.minor_defects ?? lastCT.minor_faults ?? null) : null,
            defects_critical: lastCT ? (lastCT.critical_defects ?? lastCT.major_faults ?? null) : null,
            records: inspections.slice(0, 5).map(r => ({
                date: r.date || r.inspection_date,
                result: r.result || r.status,
                mileage: r.mileage || r.odometer || null
            }))
        },

        // Propriétaires
        owners: {
            count: owners.length || data.owners_count || null,
            records: owners.map(r => ({
                from: r.from || r.start_date || null,
                to: r.to || r.end_date || null,
                country: r.country || null
            }))
        }
    };
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: JSON.stringify(body)
    };
}
