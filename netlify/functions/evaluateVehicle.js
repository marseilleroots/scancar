/**
 * ScanCar — Évaluation véhicule basée sur données réelles
 * Récupère cote Argus + annonces Le Bon Coin/La Centrale pour évaluation précise
 */

const https = require('https');
const { JSDOM } = require('jsdom');

// Fetch helper
function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Récupérer cote Argus (scrape largus.fr)
async function fetchArgusPrice(marque, modele, annee) {
    try {
        const slug = `${(marque || '').toLowerCase().replace(/\s+/g, '-')}/${(modele || '').toLowerCase().replace(/\s+/g, '-')}`;
        const url = `https://www.largus.fr/cote-auto/${slug}.html`;

        const html = await httpGet(url);
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Chercher la cote pour l'année spécifique
        const priceElements = doc.querySelectorAll('[data-price]');
        if (priceElements.length > 0) {
            const price = priceElements[0].getAttribute('data-price');
            return parseInt(price) || null;
        }

        // Fallback: chercher dans le texte
        const regex = /(\d+\s*€|\d+\s*EUR)/gi;
        const matches = html.match(regex);
        if (matches && matches.length > 0) {
            return parseInt(matches[0].replace(/\D/g, '')) || null;
        }

        return null;
    } catch (error) {
        console.error('Argus fetch error:', error.message);
        return null;
    }
}

// Récupérer annonces Le Bon Coin (moyenne)
async function fetchLeBonCoinPrices(marque, modele, annee) {
    try {
        const query = encodeURIComponent(`${marque} ${modele} ${annee}`.trim());
        const url = `https://www.leboncoin.fr/recherche?category=2&text=${query}&th=1`;

        const html = await httpGet(url);
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const prices = [];
        const listItems = doc.querySelectorAll('[data-listing-id]');

        listItems.forEach(item => {
            const priceElement = item.querySelector('[data-price]');
            if (priceElement) {
                const price = parseInt(priceElement.getAttribute('data-price'));
                if (price > 500 && price < 500000) prices.push(price);
            }
        });

        if (prices.length === 0) return null;

        // Retourner min, max, moyenne
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b) / prices.length),
            count: prices.length
        };
    } catch (error) {
        console.error('LBC fetch error:', error.message);
        return null;
    }
}

// Fonction principale
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    try {
        const { marque, modele, annee, type, energie, cv } = JSON.parse(event.body);

        // Récupérer les données réelles
        const argusPrice = await fetchArgusPrice(marque, modele, annee);
        const lbcPrices = await fetchLeBonCoinPrices(marque, modele, annee);

        // Si pas de données réelles, fallback sur calcul théorique
        let valeurActu = argusPrice;

        if (!valeurActu && lbcPrices) {
            valeurActu = lbcPrices.avg;
        }

        if (!valeurActu) {
            // Fallback: calcul basé sur dépréciation
            const prixNeufBase = type === 'moto' ? 8000 : type === 'van' ? 40000 : 25000;
            const ageYears = new Date().getFullYear() - parseInt(annee);
            valeurActu = ageYears === 0
                ? prixNeufBase
                : ageYears <= 1
                    ? prixNeufBase * 0.78
                    : prixNeufBase * 0.78 * Math.pow(0.85, ageYears - 1);
        }

        valeurActu = Math.round(valeurActu / 100) * 100;

        // Générer fourchette
        const argusLow = Math.round(valeurActu * 0.88 / 100) * 100;
        const argusHigh = Math.round(valeurActu * 1.12 / 100) * 100;

        return {
            statusCode: 200,
            body: JSON.stringify({
                argus: valeurActu,
                argusLow,
                argusHigh,
                lbcData: lbcPrices,
                source: argusPrice ? 'argus' : lbcPrices ? 'leboncoin' : 'estimation'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
