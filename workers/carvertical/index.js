const CARVERTICAL_BASE = 'https://api.carvertical.com/v1';

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        const url = new URL(request.url);
        const plate = (url.searchParams.get('plate') || '').trim().toUpperCase();

        if (!plate || plate.length < 4) {
            return jsonResponse(400, { error: 'Plaque invalide' });
        }

        const apiKey = env.CARVERTICAL_API_KEY;
        if (!apiKey) {
            return jsonResponse(200, { status: 'pending', message: 'Rapport CarVertical bientôt disponible' });
        }

        try {
            const reportUrl = `${env.CARVERTICAL_API_URL || CARVERTICAL_BASE}/report?plate=${encodeURIComponent(plate)}&country=FR&lang=fr`;
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
                return jsonResponse(resp.status, { error: 'Erreur CarVertical', details: errText });
            }

            const data = await resp.json();
            return jsonResponse(200, normalizeCarVerticalResponse(data, plate));
        } catch (err) {
            return jsonResponse(500, { error: 'Erreur serveur', message: err.message });
        }
    }
};

function normalizeCarVerticalResponse(data, plate) {
    const mileageRecords = data.mileage_records || data.odometer_records || [];
    const damageRecords  = data.damage_records  || data.accident_records || [];
    const theftRecords   = data.theft_records   || [];
    const owners         = data.ownership_records || data.owners || [];
    const inspections    = data.inspection_records || data.ct_records || [];
    const pledge         = data.pledge || data.gage || null;

    const lastMileage = mileageRecords.length
        ? mileageRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

    const lastCT = inspections.length
        ? inspections.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

    return {
        status: 'ok',
        plate,
        vin: data.vin || data.vehicle_id || null,
        accidents: {
            count: damageRecords.length,
            records: damageRecords.map(r => ({
                date: r.date || r.damage_date || null,
                type: r.type || r.damage_type || 'Sinistre déclaré',
                severity: r.severity || null,
                description: r.description || null
            }))
        },
        theft: {
            stolen: theftRecords.length > 0,
            records: theftRecords.map(r => ({ date: r.date || null, country: r.country || null, status: r.status || null }))
        },
        pledge: {
            has_pledge: pledge ? (pledge.has_pledge || pledge.active || false) : false,
            details: pledge || null
        },
        mileage: {
            last_known: lastMileage ? lastMileage.value || lastMileage.mileage : null,
            last_date: lastMileage ? lastMileage.date : null,
            unit: lastMileage ? (lastMileage.unit || 'km') : 'km',
            records: mileageRecords.slice(0, 10).map(r => ({ date: r.date, value: r.value || r.mileage, source: r.source || null })),
            is_consistent: data.odometer_rollback === false || mileageRecords.length === 0 ? true :
                           (data.odometer_rollback === true ? false : null)
        },
        ct: {
            last_date: lastCT ? (lastCT.date || lastCT.inspection_date) : null,
            result: lastCT ? (lastCT.result || lastCT.status || null) : null,
            defects_minor: lastCT ? (lastCT.minor_defects ?? lastCT.minor_faults ?? null) : null,
            defects_critical: lastCT ? (lastCT.critical_defects ?? lastCT.major_faults ?? null) : null,
            records: inspections.slice(0, 5).map(r => ({ date: r.date || r.inspection_date, result: r.result || r.status, mileage: r.mileage || r.odometer || null }))
        },
        owners: {
            count: owners.length || data.owners_count || null,
            records: owners.map(r => ({ from: r.from || r.start_date || null, to: r.to || r.end_date || null, country: r.country || null }))
        }
    };
}

function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };
}
