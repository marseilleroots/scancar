/**
 * ScanCar — Proxy SIV / RapidAPI
 * Endpoint : GET /.netlify/functions/siv?plate=AB-123-CD
 *
 * Variables d'environnement Netlify à configurer :
 *   RAPIDAPI_KEY   → clé API RapidAPI (api-plaque-immatriculation-siv)
 */

const RAPIDAPI_HOST = 'api-plaque-immatriculation-siv.p.rapidapi.com';

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders() };
    }

    const plate = (event.queryStringParameters?.plate || '').trim().toUpperCase();
    if (!plate || plate.length < 4) {
        return jsonResponse(400, { error: 'Plaque manquante ou invalide' });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return jsonResponse(503, { error: 'API non configurée' });
    }

    try {
        const url = `https://${RAPIDAPI_HOST}/get-vehicule-info?token=TokenDemoRapidapi&host_name=${encodeURIComponent('https://apiplaqueimmatriculation.com')}&immatriculation=${encodeURIComponent(plate)}`;
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey
            }
        });

        if (!resp.ok) {
            return jsonResponse(resp.status, { error: `API error ${resp.status}` });
        }

        const json = await resp.json();
        return jsonResponse(200, json);
    } catch (e) {
        return jsonResponse(500, { error: e.message });
    }
};

function jsonResponse(status, body) {
    return {
        statusCode: status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        body: JSON.stringify(body)
    };
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };
}
