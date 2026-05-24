/**
 * ScanCar — Proxy SIV / RapidAPI (Vercel Function)
 * Endpoint : GET /api/siv?plate=AB-123-CD
 */

const RAPIDAPI_HOST = 'api-plaque-immatriculation-siv2.p.rapidapi.com';

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const plate = ((req.query && req.query.plate) || '').toString().trim().toUpperCase();
    if (!plate || plate.length < 4) {
        res.status(400).json({ error: 'Plaque manquante ou invalide' });
        return;
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        res.status(503).json({ error: 'API non configurée (RAPIDAPI_KEY manquante)' });
        return;
    }

    try {
        const url = `https://${RAPIDAPI_HOST}/api.php?immatriculation=${encodeURIComponent(plate)}`;
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey,
                'Accept': '*/*'
            }
        });

        const text = await resp.text();
        let json;
        try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

        if (!resp.ok) {
            res.status(resp.status).json({ error: `API error ${resp.status}`, details: json });
            return;
        }

        res.status(200).json(json);
    } catch (e) {
        res.status(500).json({ error: e.message, stack: e.stack });
    }
};
