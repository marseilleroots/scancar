/**
 * ScanCar — Évaluation véhicule (données réelles Argus + Le Bon Coin)
 * Scraping amélioré avec parsing robuste et gestion d'erreurs
 */

// Fetch avec timeout
function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    return Promise.race([
        fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            ...options
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
    ]);
}

// Extraire prix du HTML avec regex robuste
function extractPricesFromHTML(html) {
    if (!html) return [];
    const prices = [];

    // Patterns variés pour capturer les prix
    const patterns = [
        /(\d{2,6})\s*€/g,                          // 15800€
        /€\s*(\d{2,6})/g,                          // € 15800
        /price['":\s]*(\d{2,6})/gi,                // price: 15800
        /data-price['":\s]*['"]*(\d{2,6})/gi,      // data-price="15800"
        /EUR['\s]*(\d{2,6})/gi                     // EUR 15800
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const price = parseInt(match[1]);
            if (price > 500 && price < 1000000 && !prices.includes(price)) {
                prices.push(price);
            }
        }
    }

    return prices;
}

// Récupérer cote Argus avec fallback
async function fetchArgusPrice(marque, modele, annee) {
    try {
        const slug = `${(marque || '').toLowerCase().replace(/\s+/g, '-')}/${(modele || '').toLowerCase().replace(/\s+/g, '-')}`;
        const url = `https://www.largus.fr/cote-auto/${slug}.html`;

        const response = await fetchWithTimeout(url);
        const html = await response.text();

        // Parser agressif pour les prix Argus
        const prices = extractPricesFromHTML(html);

        // Prendre la première valeur cohérente (cote moyenne)
        if (prices.length > 0) {
            // Filtrer les valeurs aberrantes (ex: années 1999 mélangées)
            const validPrices = prices.filter(p => p > 1000 && p < 500000);
            if (validPrices.length > 0) {
                return Math.round(validPrices[0]);
            }
        }

        return null;
    } catch (error) {
        console.error('Argus error:', error.message);
        return null;
    }
}

// Récupérer annonces Le Bon Coin
async function fetchLeBonCoinPrices(marque, modelo, annee) {
    try {
        const query = encodeURIComponent(`${marque} ${modelo}`.trim());
        const url = `https://www.leboncoin.fr/recherche?category=2&text=${query}&th=1&ps=1&pe=100000`;

        const response = await fetchWithTimeout(url);
        const html = await response.text();

        const prices = extractPricesFromHTML(html);

        if (prices.length === 0) return null;

        // Filtrer les prix cohérents (enlever extrêmes)
        const filtered = prices.filter(p => p > 1000 && p < 200000);
        if (filtered.length === 0) return null;

        // Calculer stats
        filtered.sort((a, b) => a - b);
        const median = filtered[Math.floor(filtered.length / 2)];
        const avg = Math.round(filtered.reduce((a, b) => a + b) / filtered.length);

        return {
            min: filtered[0],
            max: filtered[filtered.length - 1],
            avg: avg,
            median: median,
            count: filtered.length
        };
    } catch (error) {
        console.error('LBC error:', error.message);
        return null;
    }
}

// Fonction principale
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { marque, modele, annee, type, energie, cv } = JSON.parse(event.body);

        if (!marque || !modele) {
            return { statusCode: 400, body: JSON.stringify({ error: 'marque et modele requis' }) };
        }

        // Récupérer données en parallèle (timeout court)
        const [argusPrice, lbcPrices] = await Promise.allSettled([
            fetchArgusPrice(marque, modele, annee),
            fetchLeBonCoinPrices(marque, modele, annee)
        ]).then(results => [
            results[0].status === 'fulfilled' ? results[0].value : null,
            results[1].status === 'fulfilled' ? results[1].value : null
        ]);

        // Déterminer valeur finale
        let valeurActu = null;
        let source = 'estimation';

        if (argusPrice && argusPrice > 1000) {
            valeurActu = argusPrice;
            source = 'argus';
        } else if (lbcPrices?.avg && lbcPrices.avg > 1000) {
            valeurActu = lbcPrices.avg;
            source = 'leboncoin';
        }

        // Fallback: estimation théorique
        if (!valeurActu) {
            const prixNeufBase = type === 'moto' ? 8000 : type === 'van' ? 40000 : 25000;
            const ageYears = new Date().getFullYear() - parseInt(annee);
            valeurActu = ageYears === 0
                ? prixNeufBase
                : ageYears <= 1
                    ? prixNeufBase * 0.78
                    : prixNeufBase * 0.78 * Math.pow(0.85, ageYears - 1);
            source = 'estimation';
        }

        valeurActu = Math.round(valeurActu / 100) * 100;
        const argusLow = Math.round(valeurActu * 0.88 / 100) * 100;
        const argusHigh = Math.round(valeurActu * 1.12 / 100) * 100;

        return {
            statusCode: 200,
            body: JSON.stringify({
                argus: valeurActu,
                argusLow,
                argusHigh,
                lbcData: lbcPrices,
                argusData: argusPrice,
                source,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, argus: null, argusLow: null, argusHigh: null })
        };
    }
};
