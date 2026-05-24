/**
 * ScanCar — Proxy SIV (Vercel Function)
 * Utilise l'API source apiplaqueimmatriculation.com directement.
 * Endpoint : GET /api/siv?plate=AB-123-CD[&pays=FR]
 */

const API_BASE = 'https://api.apiplaqueimmatriculation.com/plaque';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const plate = ((req.query && req.query.plate) || '').toString().trim().toUpperCase();
    const pays = ((req.query && req.query.pays) || 'FR').toString().trim().toUpperCase();

    if (!plate || plate.length < 4) {
        res.status(400).json({ error: 'Plaque manquante ou invalide' });
        return;
    }

    // Token : variable d'env si disponible, sinon TokenDemo2026B (token démo public)
    const token = process.env.APIPLAQUE_TOKEN || 'TokenDemo2026B';

    try {
        const url = `${API_BASE}?immatriculation=${encodeURIComponent(plate)}&token=${encodeURIComponent(token)}&pays=${encodeURIComponent(pays)}`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
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
        res.status(500).json({ error: e.message });
    }
};
