/**
 * ScanCar — Proxy SIV / RapidAPI (Vercel Function)
 * Endpoint : GET /api/siv?plate=AB-123-CD
 */

const RAPIDAPI_HOST = 'api-plaque-immatriculation-siv.p.rapidapi.com';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const plate = (req.query.plate || '').trim().toUpperCase();
    if (!plate || plate.length < 4) {
        return res.status(400).json({ error: 'Plaque manquante ou invalide' });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return res.status(503).json({ error: 'API non configurée (RAPIDAPI_KEY manquante)' });
    }

    try {
        const url = `https://${RAPIDAPI_HOST}/get-vehicule-info?immatriculation=${encodeURIComponent(plate)}`;
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey
            }
        });

        const text = await resp.text();
        let json;
        try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

        if (!resp.ok) {
            return res.status(resp.status).json({ error: `API error ${resp.status}`, details: json });
        }

        return res.status(200).json(json);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
