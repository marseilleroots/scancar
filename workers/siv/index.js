const RAPIDAPI_HOST = 'api-plaque-immatriculation-siv.p.rapidapi.com';

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        const url = new URL(request.url);
        const plate = (url.searchParams.get('plate') || '').trim().toUpperCase();

        if (!plate || plate.length < 4) {
            return jsonResponse(400, { error: 'Plaque manquante ou invalide' });
        }

        const apiKey = env.RAPIDAPI_KEY;
        if (!apiKey) {
            return jsonResponse(503, { error: 'API non configurée' });
        }

        try {
            const apiUrl = `https://${RAPIDAPI_HOST}/get-vehicule-info?token=TokenDemoRapidapi&host_name=${encodeURIComponent('https://apiplaqueimmatriculation.com')}&immatriculation=${encodeURIComponent(plate)}`;
            const resp = await fetch(apiUrl, {
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
    }
};

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
