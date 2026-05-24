/**
 * ScanCar — Proxy Plate Recognizer (Vercel Function)
 * Forward l'image vers l'API Plate Recognizer pour OCR plaque précis.
 * Endpoint : POST /api/plate (multipart/form-data avec champ "upload")
 */

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const apiKey = process.env.PLATE_RECOGNIZER_TOKEN;
    if (!apiKey) {
        res.status(503).json({ error: 'PLATE_RECOGNIZER_TOKEN non configuré' });
        return;
    }

    try {
        // Lit le body brut (multipart/form-data)
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks);

        // Forward à Plate Recognizer
        const resp = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': req.headers['content-type']
            },
            body: body
        });

        const text = await resp.text();
        let json;
        try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

        res.status(resp.status).json(json);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Désactive le bodyParser de Vercel pour pouvoir forwarder multipart/form-data
module.exports.config = {
    api: {
        bodyParser: false
    }
};
