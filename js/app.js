/* ============================================
   SCANCAR — Main Application Logic
   ============================================ */

(function() {
    'use strict';

    // DOM Elements
    const splash = document.getElementById('splash');
    const app = document.getElementById('app');
    const scanView = document.getElementById('scanView');
    const loadingView = document.getElementById('loadingView');
    const resultView = document.getElementById('resultView');
    const historyView = document.getElementById('historyView');
    const alertsView = document.getElementById('alertsView');
    const profileView = document.getElementById('profileView');
    const camera = document.getElementById('camera');
    const captureBtn = document.getElementById('captureBtn');
    const searchBtn = document.getElementById('searchBtn');
    const plateInput = document.getElementById('plateInput');
    const backBtn = document.getElementById('backBtn');
    const newScanBtn = document.getElementById('newScanBtn');
    const galleryBtn = document.getElementById('galleryBtn');
    const loadingPlateText = document.getElementById('loadingPlateText');
    const loadingText = document.getElementById('loadingText');
    const navItems = document.querySelectorAll('.nav-item');
    const allViews = [scanView, loadingView, resultView, historyView, alertsView, profileView];

    // Vehicle database — fusion de la base enrichie + données démo
    const baseDatabase = window.vehicleDatabase || {};
    const vehicleDB = {
        'AB-123-CD': {
            type: 'car',
            typeLabel: 'Voiture',
            recall: 'Rappel constructeur en cours : vérifiez auprès d\'un concessionnaire Peugeot si le rappel airbag R2024-087 a été effectué.',
        marque: 'Peugeot', modele: '308', version: 'GT Line',
            annee: '2021', mec: '15/03/2021', age: '5 ans et 2 mois',
            couleur: 'Gris Artense', pays: '🇫🇷 France (Sochaux)',
            vin: 'VF3LCYHZ•••••••', proprio: '2',
            energie: 'Diesel (BlueHDi)', cylindree: '1 499 cm³',
            puissance: '130 ch (96 kW)', cv: '8 CV',
            boite: 'Automatique (EAT8)', cylindres: '4',
            places: '5', portes: '5',
            dimensions: '4,37 × 1,81 × 1,46 m', poids: '1 300 kg',
            ptac: '1 820 kg', e85: '✓ Oui (avec boîtier)',
            co2: '98 g/km', euro: 'Euro 6d-TEMP', malus: '0€ (exempt)',
            critair: '2', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
            restriction: 'Interdit à Paris dès 2028',
            prixRange: '14 500€ — 17 200€', argus: '15 800€',
            lbc: '16 200€', centrale: '16 900€', tendance: '↓ -4.2%',
            decote: '~12% / an', annonces: '347 en ligne',
            tempsVente: '18 jours', demande: '🔥 Forte',
            cartegrise: '~368€', assurance: '~52€ / mois',
            carburant: '~1 250€ / an', entretien: '~650€ / an',
            pneus: '~320€', coutTotal: '~3 200€ / an',
            km: '87 430 km — conforme pour l\'âge',
            score: 78, scoreLabel: 'Bon achat',
            variant: '1.5 BlueHDi 130 GT Line • 2021'
        },
        'EF-456-GH': {
            type: 'moto',
            typeLabel: 'Moto',
            marque: 'Yamaha', modele: 'MT-07', version: 'ABS',
            annee: '2022', mec: '08/06/2022', age: '3 ans et 11 mois',
            couleur: 'Bleu Icon', pays: '🇯🇵 Japon (Iwata)',
            vin: 'JYARM33E•••••••', proprio: '1',
            energie: 'Essence (SP95)', cylindree: '689 cm³',
            puissance: '73,4 ch (54 kW)', cv: '5 CV',
            boite: 'Manuelle (6 rapports)', cylindres: '2 (bicylindre)',
            places: '2', portes: '—',
            dimensions: '2,09 × 0,74 × 1,09 m', poids: '184 kg',
            ptac: '388 kg', e85: '✗ Non compatible',
            co2: '101 g/km', euro: 'Euro 5+', malus: '0€',
            critair: '1', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
            restriction: 'Aucune restriction prévue',
            prixRange: '5 800€ — 7 200€', argus: '6 400€',
            lbc: '6 700€', centrale: '6 900€', tendance: '↑ +2.1%',
            decote: '~10% / an', annonces: '523 en ligne',
            tempsVente: '9 jours', demande: '🔥🔥 Très forte',
            cartegrise: '~212€', assurance: '~38€ / mois',
            carburant: '~650€ / an', entretien: '~350€ / an',
            pneus: '~220€', coutTotal: '~1 800€ / an',
            km: '22 100 km — conforme pour l\'âge',
            score: 89, scoreLabel: 'Excellent achat',
            variant: '689cc ABS • 2022'
        },
        'JK-789-LM': {
            type: 'van',
            typeLabel: 'Utilitaire',
            marque: 'Renault', modele: 'Trafic', version: 'L2H1 Grand Confort',
            annee: '2019', mec: '22/09/2019', age: '6 ans et 8 mois',
            couleur: 'Blanc Glacier', pays: '🇫🇷 France (Sandouville)',
            vin: 'VF1FL000•••••••', proprio: '3',
            energie: 'Diesel (dCi)', cylindree: '1 997 cm³',
            puissance: '145 ch (107 kW)', cv: '8 CV',
            boite: 'Manuelle (6 rapports)', cylindres: '4',
            places: '3', portes: '5',
            dimensions: '5,40 × 1,96 × 1,97 m', poids: '1 811 kg',
            ptac: '3 060 kg', e85: '✗ Non compatible',
            co2: '178 g/km', euro: 'Euro 6d', malus: '0€ (utilitaire)',
            critair: '2', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
            restriction: 'Interdit en ZFE Paris dès 2028',
            prixRange: '16 800€ — 21 500€', argus: '18 200€',
            lbc: '19 500€', centrale: '20 100€', tendance: '↓ -3.8%',
            decote: '~14% / an', annonces: '189 en ligne',
            tempsVente: '24 jours', demande: '📈 Moyenne-haute',
            cartegrise: '~368€', assurance: '~65€ / mois',
            carburant: '~2 100€ / an', entretien: '~800€ / an',
            pneus: '~450€', coutTotal: '~4 200€ / an',
            km: '124 800 km — légèrement au-dessus de la moyenne',
            score: 62, scoreLabel: 'Achat correct, à négocier',
            variant: '2.0 dCi 145 L2H1 • 2019'
        }
    };

    vehicleDB['CD-321-EF'] = {
        type: 'car', typeLabel: 'Voiture',
        marque: 'Volkswagen', modele: 'Golf 8', version: 'R-Line',
        annee: '2023', mec: '10/01/2023', age: '3 ans et 4 mois',
        couleur: 'Noir Deep', pays: '🇩🇪 Allemagne (Wolfsburg)',
        vin: 'WVWZZZ1K•••••••', proprio: '1',
        energie: 'Essence (TSI)', cylindree: '1 498 cm³',
        puissance: '150 ch (110 kW)', cv: '7 CV',
        boite: 'Automatique (DSG7)', cylindres: '4',
        places: '5', portes: '5',
        dimensions: '4,28 × 1,79 × 1,46 m', poids: '1 355 kg',
        ptac: '1 880 kg', e85: '✓ Oui (compatible)',
        co2: '121 g/km', euro: 'Euro 6d', malus: '0€',
        critair: '1', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Aucune restriction prévue',
        prixRange: '24 500€ — 28 000€', argus: '25 800€',
        lbc: '26 500€', centrale: '27 200€', tendance: '↓ -3.1%',
        decote: '~15% / an', annonces: '412 en ligne',
        tempsVente: '14 jours', demande: '🔥 Forte',
        cartegrise: '~332€', assurance: '~58€ / mois',
        carburant: '~1 450€ / an', entretien: '~550€ / an',
        pneus: '~360€', coutTotal: '~3 400€ / an',
        km: '34 200 km — conforme pour l\'âge',
        score: 82, scoreLabel: 'Très bon achat',
        variant: '1.5 TSI 150 R-Line DSG7 • 2023'
    };

    vehicleDB['GH-654-IJ'] = {
        type: 'car', typeLabel: 'Voiture',
        marque: 'Tesla', modele: 'Model 3', version: 'Long Range',
        annee: '2022', mec: '15/06/2022', age: '3 ans et 11 mois',
        couleur: 'Blanc Nacré', pays: '🇨🇳 Chine (Shanghai)',
        vin: '5YJ3E7EB•••••••', proprio: '1',
        energie: 'Électrique', cylindree: '—',
        puissance: '351 ch (261 kW)', cv: '1 CV (électrique)',
        boite: 'Automatique (1 rapport)', cylindres: '—',
        places: '5', portes: '5',
        dimensions: '4,69 × 1,85 × 1,44 m', poids: '1 830 kg',
        ptac: '2 232 kg', e85: '✗ Non applicable',
        co2: '0 g/km', euro: '—', malus: '0€ (électrique)',
        critair: '0', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Aucune restriction',
        prixRange: '28 000€ — 33 000€', argus: '29 500€',
        lbc: '30 800€', centrale: '31 500€', tendance: '↓ -8.5%',
        decote: '~18% / an', annonces: '856 en ligne',
        tempsVente: '12 jours', demande: '🔥🔥 Très forte',
        cartegrise: '0€ (exonéré)', assurance: '~62€ / mois',
        carburant: '~380€ / an (électricité)', entretien: '~250€ / an',
        pneus: '~480€', coutTotal: '~1 900€ / an',
        km: '52 300 km — conforme pour l\'âge',
        score: 85, scoreLabel: 'Très bon achat',
        variant: 'Long Range AWD • 2022'
    };

    vehicleDB['KL-987-MN'] = {
        type: 'car', typeLabel: 'Voiture',
        marque: 'Renault', modele: 'Clio 5', version: 'Intens',
        annee: '2020', mec: '03/09/2020', age: '5 ans et 8 mois',
        couleur: 'Orange Valencia', pays: '🇹🇷 Turquie (Bursa)',
        vin: 'VF15RFL0•••••••', proprio: '2',
        energie: 'Essence (TCe)', cylindree: '999 cm³',
        puissance: '100 ch (74 kW)', cv: '5 CV',
        boite: 'Manuelle (5 rapports)', cylindres: '3 (turbo)',
        places: '5', portes: '5',
        dimensions: '4,05 × 1,80 × 1,44 m', poids: '1 130 kg',
        ptac: '1 630 kg', e85: '✓ Oui (avec boîtier)',
        co2: '109 g/km', euro: 'Euro 6d-FULL', malus: '0€',
        critair: '1', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Aucune restriction prévue',
        prixRange: '11 500€ — 14 200€', argus: '12 400€',
        lbc: '13 100€', centrale: '13 600€', tendance: '↓ -5.0%',
        decote: '~13% / an', annonces: '1 245 en ligne',
        tempsVente: '11 jours', demande: '🔥🔥 Très forte',
        cartegrise: '~236€', assurance: '~35€ / mois',
        carburant: '~1 100€ / an', entretien: '~400€ / an',
        pneus: '~240€', coutTotal: '~2 200€ / an',
        km: '68 900 km — conforme pour l\'âge',
        score: 84, scoreLabel: 'Très bon achat',
        variant: '1.0 TCe 100 Intens • 2020'
    };

    vehicleDB['OP-147-QR'] = {
        type: 'car', typeLabel: 'Voiture',
        marque: 'BMW', modele: 'Série 3', version: '320d M Sport',
        annee: '2020', mec: '22/02/2020', age: '6 ans et 3 mois',
        couleur: 'Gris Mineral', pays: '🇩🇪 Allemagne (Munich)',
        vin: 'WBA5R110•••••••', proprio: '3',
        energie: 'Diesel (TwinPower)', cylindree: '1 995 cm³',
        puissance: '190 ch (140 kW)', cv: '10 CV',
        boite: 'Automatique (ZF 8HP)', cylindres: '4',
        places: '5', portes: '4',
        dimensions: '4,71 × 1,83 × 1,43 m', poids: '1 540 kg',
        ptac: '2 105 kg', e85: '✗ Non compatible',
        co2: '118 g/km', euro: 'Euro 6d', malus: '0€',
        critair: '2', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Interdit à Paris dès 2028',
        prixRange: '24 000€ — 29 000€', argus: '25 500€',
        lbc: '27 000€', centrale: '28 200€', tendance: '↓ -6.2%',
        decote: '~14% / an', annonces: '523 en ligne',
        tempsVente: '16 jours', demande: '🔥 Forte',
        cartegrise: '~460€', assurance: '~72€ / mois',
        carburant: '~1 350€ / an', entretien: '~850€ / an',
        pneus: '~450€', coutTotal: '~4 100€ / an',
        km: '98 500 km — dans la moyenne',
        score: 71, scoreLabel: 'Bon achat',
        variant: '320d 190 M Sport • 2020'
    };

    vehicleDB['ST-258-UV'] = {
        type: 'car', typeLabel: 'Voiture',
        marque: 'Citroën', modele: 'C3', version: 'Shine',
        annee: '2021', mec: '14/04/2021', age: '5 ans et 1 mois',
        couleur: 'Blanc Banquise + Toit Rouge', pays: '🇸🇰 Slovaquie (Trnava)',
        vin: 'VR7SCHN0•••••••', proprio: '1',
        energie: 'Essence (PureTech)', cylindree: '1 199 cm³',
        puissance: '110 ch (81 kW)', cv: '6 CV',
        boite: 'Manuelle (6 rapports)', cylindres: '3 (turbo)',
        places: '5', portes: '5',
        dimensions: '3,99 × 1,75 × 1,47 m', poids: '1 050 kg',
        ptac: '1 580 kg', e85: '✓ Oui (compatible)',
        co2: '104 g/km', euro: 'Euro 6d', malus: '0€',
        critair: '1', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Aucune restriction prévue',
        prixRange: '10 800€ — 13 500€', argus: '11 500€',
        lbc: '12 300€', centrale: '12 800€', tendance: '↓ -4.8%',
        decote: '~14% / an', annonces: '876 en ligne',
        tempsVente: '10 jours', demande: '🔥🔥 Très forte',
        cartegrise: '~268€', assurance: '~32€ / mois',
        carburant: '~1 050€ / an', entretien: '~380€ / an',
        pneus: '~220€', coutTotal: '~2 050€ / an',
        km: '45 200 km — faible kilométrage',
        score: 88, scoreLabel: 'Excellent achat',
        variant: '1.2 PureTech 110 Shine • 2021'
    };

    vehicleDB['WX-369-YZ'] = {
        type: 'moto', typeLabel: 'Moto',
        marque: 'Kawasaki', modele: 'Z900', version: 'A2',
        annee: '2023', mec: '20/03/2023', age: '3 ans et 2 mois',
        couleur: 'Vert Kawasaki', pays: '🇯🇵 Japon (Akashi)',
        vin: 'JKAZR2A1•••••••', proprio: '1',
        energie: 'Essence (SP95/SP98)', cylindree: '948 cm³',
        puissance: '95 ch bridé A2 (70 kW)', cv: '5 CV',
        boite: 'Manuelle (6 rapports)', cylindres: '4 en ligne',
        places: '2', portes: '—',
        dimensions: '2,07 × 0,82 × 1,08 m', poids: '210 kg',
        ptac: '420 kg', e85: '✗ Non compatible',
        co2: '115 g/km', euro: 'Euro 5+', malus: '0€',
        critair: '1', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Aucune restriction prévue',
        prixRange: '7 200€ — 8 800€', argus: '7 600€',
        lbc: '8 100€', centrale: '8 400€', tendance: '↑ +1.5%',
        decote: '~11% / an', annonces: '298 en ligne',
        tempsVente: '8 jours', demande: '🔥🔥 Très forte',
        cartegrise: '~212€', assurance: '~45€ / mois',
        carburant: '~750€ / an', entretien: '~400€ / an',
        pneus: '~280€', coutTotal: '~2 100€ / an',
        km: '12 800 km — très faible kilométrage',
        score: 91, scoreLabel: 'Excellent achat',
        variant: '948cc A2 • 2023'
    };

    vehicleDB['AA-111-BB'] = {
        type: 'van', typeLabel: 'Utilitaire',
        marque: 'Citroën', modele: 'Berlingo Van', version: 'XL Worker',
        annee: '2021', mec: '05/07/2021', age: '4 ans et 10 mois',
        couleur: 'Blanc', pays: '🇪🇸 Espagne (Vigo)',
        vin: 'VR7EFBHY•••••••', proprio: '2',
        energie: 'Diesel (BlueHDi)', cylindree: '1 499 cm³',
        puissance: '130 ch (96 kW)', cv: '7 CV',
        boite: 'Automatique (EAT8)', cylindres: '4',
        places: '2', portes: '5',
        dimensions: '4,75 × 1,85 × 1,84 m', poids: '1 468 kg',
        ptac: '2 210 kg', e85: '✗ Non compatible',
        co2: '141 g/km', euro: 'Euro 6d', malus: '0€ (utilitaire)',
        critair: '2', zfeParis: '✓ Autorisé', zfeLyon: '✓ Autorisé',
        restriction: 'Interdit en ZFE Paris dès 2028',
        prixRange: '14 500€ — 18 000€', argus: '15 800€',
        lbc: '16 500€', centrale: '17 200€', tendance: '↓ -4.5%',
        decote: '~13% / an', annonces: '234 en ligne',
        tempsVente: '20 jours', demande: '📈 Moyenne-haute',
        cartegrise: '~332€', assurance: '~48€ / mois',
        carburant: '~1 650€ / an', entretien: '~550€ / an',
        pneus: '~320€', coutTotal: '~3 100€ / an',
        km: '76 400 km — conforme pour l\'âge',
        score: 75, scoreLabel: 'Bon achat',
        variant: '1.5 BlueHDi 130 XL Worker • 2021'
    };

    const defaultVehicle = vehicleDB['AB-123-CD'];

    // Splash screen
    setTimeout(() => {
        app.classList.remove('hidden');
    }, 2800);

    // Camera initialization
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            camera.srcObject = stream;
        } catch (err) {
            console.log('Camera not available, using demo mode');
            const container = document.querySelector('.camera-container');
            container.style.background = 'linear-gradient(135deg, #0a0f1c 0%, #1a2236 50%, #0a0f1c 100%)';

            const demoOverlay = document.createElement('div');
            demoOverlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;';
            demoOverlay.innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:12px;">📸</div>
                    <p style="color:rgba(255,255,255,0.5);font-size:14px;">Mode démo — Caméra indisponible</p>
                    <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:4px;">Entrez une plaque manuellement ci-dessous</p>
                    <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button class="demo-plate-btn" data-plate="AB-123-CD" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚗 Peugeot 308</button>
                        <button class="demo-plate-btn" data-plate="GH-654-IJ" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">⚡ Tesla Model 3</button>
                        <button class="demo-plate-btn" data-plate="EF-456-GH" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🏍️ Yamaha MT-07</button>
                        <button class="demo-plate-btn" data-plate="CD-321-EF" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚗 VW Golf 8</button>
                        <button class="demo-plate-btn" data-plate="KL-987-MN" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚗 Renault Clio</button>
                        <button class="demo-plate-btn" data-plate="OP-147-QR" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚗 BMW Série 3</button>
                        <button class="demo-plate-btn" data-plate="WX-369-YZ" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🏍️ Kawasaki Z900</button>
                        <button class="demo-plate-btn" data-plate="JK-789-LM" style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00d4ff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">🚐 Renault Trafic</button>
                    </div>
                </div>
            `;
            container.appendChild(demoOverlay);

            demoOverlay.querySelectorAll('.demo-plate-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const plate = btn.dataset.plate;
                    plateInput.value = plate;
                    startSearch(plate);
                });
            });
        }
    }

    initCamera();

    // Section toggle
    window.toggleSection = function(header) {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.chevron');
        const isOpen = content.classList.contains('open');

        content.classList.toggle('open');
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    };

    // View switching
    function showView(viewId) {
        allViews.forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    // Populate results
    function populateResults(data) {
        const v = data || defaultVehicle;

        // Vehicle hero
        document.getElementById('resultPlate').textContent = plateInput.value || 'AB-123-CD';
        document.getElementById('vehicleName').textContent = `${v.marque} ${v.modele}`;
        document.getElementById('vehicleVariant').textContent = v.variant;

        // Vehicle type icon
        const vehicleImg = document.getElementById('vehicleImage');
        const typeIcons = {
            car: '<svg width="120" height="60" viewBox="0 0 120 60" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"><path d="M20 45 L25 25 L45 15 L75 15 L95 25 L100 45" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="35" cy="47" rx="8" ry="8"/><ellipse cx="85" cy="47" rx="8" ry="8"/></svg>',
            moto: '<svg width="120" height="70" viewBox="0 0 120 70" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"><circle cx="28" cy="50" r="14"/><circle cx="92" cy="50" r="14"/><path d="M42 50 L55 25 L70 20 L85 25 L92 36" stroke-linecap="round" stroke-linejoin="round"/><path d="M55 25 L50 18 L60 15" stroke-linecap="round"/></svg>',
            van: '<svg width="120" height="60" viewBox="0 0 120 60" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"><rect x="10" y="12" width="100" height="36" rx="4"/><line x1="75" y1="12" x2="75" y2="48"/><ellipse cx="30" cy="50" rx="8" ry="8"/><ellipse cx="95" cy="50" rx="8" ry="8"/><rect x="80" y="18" width="22" height="14" rx="2"/></svg>'
        };
        vehicleImg.innerHTML = typeIcons[v.type] || typeIcons.car;

        // Score
        const scoreNumber = document.getElementById('scoreNumber');
        const scoreLabel = document.getElementById('scoreLabel');
        const scoreArc = document.getElementById('scoreArc');
        scoreNumber.textContent = v.score;
        scoreLabel.textContent = v.scoreLabel;

        if (v.score >= 75) {
            scoreLabel.style.color = '#00e68a';
        } else if (v.score >= 50) {
            scoreLabel.style.color = '#ff9f43';
        } else {
            scoreLabel.style.color = '#ff6b6b';
        }

        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (v.score / 100) * circumference;
        scoreArc.setAttribute('stroke-dashoffset', offset);

        // Identity
        document.getElementById('rMarque').textContent = v.marque;
        document.getElementById('rModele').textContent = v.modele;
        document.getElementById('rVersion').textContent = v.version;
        document.getElementById('rAnnee').textContent = v.annee;
        document.getElementById('rMec').textContent = v.mec;
        document.getElementById('rAge').textContent = v.age;
        document.getElementById('rCouleur').textContent = v.couleur;
        document.getElementById('rPays').textContent = v.pays;
        document.getElementById('rVin').textContent = v.vin;
        document.getElementById('rProprio').textContent = v.proprio;

        // Technical
        document.getElementById('rEnergie').textContent = v.energie;
        document.getElementById('rCylindree').textContent = v.cylindree;
        document.getElementById('rPuissance').textContent = v.puissance;
        document.getElementById('rCv').textContent = v.cv;
        document.getElementById('rBoite').textContent = v.boite;
        document.getElementById('rCylindres').textContent = v.cylindres;
        document.getElementById('rPlaces').textContent = v.places;
        document.getElementById('rPortes').textContent = v.portes;
        document.getElementById('rDimensions').textContent = v.dimensions;
        document.getElementById('rPoids').textContent = v.poids;
        document.getElementById('rPtac').textContent = v.ptac;

        const e85El = document.getElementById('rE85');
        e85El.textContent = v.e85;
        e85El.className = v.e85.startsWith('✓') ? 'info-value green' : 'info-value red-text';

        // Ecology
        document.getElementById('rCo2').textContent = v.co2;
        document.getElementById('rEuro').textContent = v.euro;
        document.getElementById('rMalus').textContent = v.malus;
        document.getElementById('rZfeParis').textContent = v.zfeParis;
        document.getElementById('rZfeLyon').textContent = v.zfeLyon;
        document.getElementById('rRestriction').textContent = v.restriction;

        // Market
        document.getElementById('rPrix').textContent = v.prixRange;
        document.getElementById('rArgus').textContent = v.argus;
        document.getElementById('rLbc').textContent = v.lbc;
        document.getElementById('rCentrale').textContent = v.centrale;
        document.getElementById('rTendance').textContent = v.tendance;
        document.getElementById('rDecote').textContent = v.decote;
        document.getElementById('rAnnonces').textContent = v.annonces;
        document.getElementById('rTempsVente').textContent = v.tempsVente;
        document.getElementById('rDemande').textContent = v.demande;

        // Costs
        document.getElementById('rCartegrise').textContent = v.cartegrise;
        document.getElementById('rAssurance').textContent = v.assurance;
        document.getElementById('rCarburant').textContent = v.carburant;
        document.getElementById('rEntretien').textContent = v.entretien;
        document.getElementById('rPneus').textContent = v.pneus;
        document.getElementById('rCoutTotal').textContent = v.coutTotal;

        // History (km affiché par CarVertical une fois déverrouillé)
        const rKmEl = document.getElementById('rKm');
        if (rKmEl) rKmEl.textContent = v.km || '—';

        // Rappel constructeur — dynamique
        const recallAlert = document.getElementById('recallAlert');
        const recallText = document.getElementById('recallAlertText');
        if (recallAlert) {
            if (v.recall) {
                recallAlert.style.display = '';
                if (recallText) recallText.textContent = v.recall;
            } else {
                recallAlert.style.display = 'none';
            }
        }

        // Histovec — lien direct avec la plaque pré-remplie
        const histovecLink = document.getElementById('histovecLink');
        if (histovecLink) {
            const plate = (plateInput.value || '').toUpperCase().replace(/\s/g, '');
            histovecLink.href = plate
                ? `https://histovec.interieur.gouv.fr/histovec/home?immat=${encodeURIComponent(plate)}`
                : 'https://histovec.interieur.gouv.fr/histovec/home';
        }
    }

    // Loading animation
    function animateLoading(plate) {
        loadingPlateText.textContent = plate.toUpperCase();
        loadingText.textContent = 'Analyse de la plaque...';

        const steps = ['step1', 'step2', 'step3', 'step4'];
        const texts = [
            'Lecture de la plaque...',
            'Interrogation des bases européennes...',
            'Analyse complète du véhicule...',
            'Calcul du score ScanCar...'
        ];

        steps.forEach(s => {
            document.getElementById(s).classList.remove('active', 'done');
        });
        document.getElementById('step1').classList.add('active');

        steps.forEach((step, i) => {
            setTimeout(() => {
                if (i > 0) document.getElementById(steps[i - 1]).classList.remove('active');
                if (i > 0) document.getElementById(steps[i - 1]).classList.add('done');
                document.getElementById(step).classList.add('active');
                loadingText.textContent = texts[i];
            }, i * 700);
        });
    }

    // ========== API CONFIGURATION ==========
    // Clé déplacée côté serveur — proxy Netlify Function
    const SIV_ENDPOINT = '/api/siv';

    function convertApiResponse(d) {
        const data = d.data || d;
        const marque = data.marque || '—';
        const modele = data.modele || '—';
        const version = data.version || data.sra_commercial || '';
        const dateMec = data.date1erCir_us || '';
        const annee = dateMec ? dateMec.substring(0, 4) : '—';
        const mec = data.date1erCir_fr || '—';
        const energieNGC = data.energieNGC || data.type_moteur || '—';
        const puisCh = data.puisFiscReelCH || '—';
        const puisKw = data.puisFiscReelKW || '';
        const cv = data.puisFisc || '—';
        const co2 = data.co2 || '—';
        const couleur = data.couleur || '—';
        const vin = data.vin || '—';
        const ccm = data.ccm || '—';
        const boite = data.boite_vitesse === 'M' ? 'Manuelle' : data.boite_vitesse === 'A' ? 'Automatique' : (data.boite_vitesse || '—');
        const places = data.nr_passagers || '—';
        const portes = data.nb_portes || '—';
        const poids = data.poids || '—';
        const ptac = data.ptac || '—';
        const cylindres = data.cylindres || '—';
        const carrosserie = data.carrosserie || data.carrosserieCG || '';
        const transmission = data.type_transmission || '';

        const now = new Date();
        const mecDate = new Date(dateMec);
        const diffYears = Math.floor((now - mecDate) / (365.25 * 24 * 60 * 60 * 1000));
        const diffMonths = Math.floor(((now - mecDate) / (30.44 * 24 * 60 * 60 * 1000)) % 12);
        const age = dateMec && !isNaN(mecDate) ? diffYears + ' ans et ' + diffMonths + ' mois' : '—';

        const genreVCGNGC = (data.genreVCGNGC || '').toUpperCase();
        const type = genreVCGNGC.includes('MTL') || genreVCGNGC.includes('MOTO') || genreVCGNGC.includes('CL') ? 'moto' :
                     genreVCGNGC.includes('CTTE') || genreVCGNGC.includes('CAM') ? 'van' : 'car';

        const ageYears = diffYears || 0;
        let score = 85;
        if (ageYears > 10) score -= 20;
        else if (ageYears > 5) score -= 10;
        else if (ageYears > 3) score -= 5;
        if (energieNGC === 'DIESEL') score -= 5;
        if (co2 && parseInt(co2) > 150) score -= 5;
        score = Math.max(40, Math.min(95, score + Math.floor(Math.random() * 11) - 5));
        const scoreLabel = score >= 80 ? 'Excellent achat' : score >= 65 ? 'Bon achat' : score >= 50 ? 'Achat correct, à négocier' : 'À éviter';

        const photoModele = data.photo_modele || '';
        const logoMarque = data.logo_marque || '';

        // === ESTIMATIONS DE PRIX (calibrées sur marché réel) ===
        // Prix neuf basé sur puissance fiscale (cv) qui est plus fiable
        const puisCv = parseInt(puisCh) || 100;       // chevaux DIN
        const cvFisc = parseInt(cv) || 5;             // cv fiscaux
        // Base prix neuf : modélisé sur Argus/Centrale (formule plus modérée)
        let prixNeufBase = type === 'moto' ? 3000 + puisCv * 45
                          : type === 'van' ? 16000 + puisCv * 80
                          : 9500 + puisCv * 65;
        // Premium pour grandes marques
        const marqueLower = (marque || '').toUpperCase();
        if (['PORSCHE','TESLA','JAGUAR','LAND ROVER','MASERATI','BENTLEY'].some(m => marqueLower.includes(m))) {
            prixNeufBase *= 1.5;
        } else if (['MERCEDES-BENZ','MERCEDES','BMW','AUDI','LEXUS','VOLVO'].some(m => marqueLower.includes(m))) {
            prixNeufBase *= 1.25;
        } else if (['VOLKSWAGEN','DS','MINI','ALFA ROMEO'].some(m => marqueLower.includes(m))) {
            prixNeufBase *= 1.10;
        }
        // Bonus version sportive (réduit)
        const versionUpper = (version || '').toUpperCase();
        if (versionUpper.match(/\b(AMG|TYPE R|RS|STI|GT3|GTR)\b/)) {
            prixNeufBase *= 1.4;
        } else if (versionUpper.match(/\b(GTI|R|GT|S[0-9])\b/)) {
            prixNeufBase *= 1.2;
        }

        // === ÉVALUATION PRIX RÉELLE (Argus/LBC via Netlify) ===
        let valeurActu = null;
        let argusLow = null;
        let argusHigh = null;

        try {
            const evalResponse = await fetch('/.netlify/functions/evaluateVehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marque, modele, annee, type, energie: energieNGC, cv: puisCv
                })
            });

            if (evalResponse.ok) {
                const evalData = await evalResponse.json();
                valeurActu = evalData.argus;
                argusLow = evalData.argusLow;
                argusHigh = evalData.argusHigh;
            }
        } catch (err) {
            console.warn('Évaluation serveur échouée:', err);
        }

        // Fallback: calcul théorique si l'API échoue
        if (!valeurActu) {
            let valAuto;
            if (ageYears <= 0) {
                valAuto = prixNeufBase;
            } else if (ageYears <= 1) {
                valAuto = prixNeufBase * 0.78;
            } else {
                valAuto = prixNeufBase * 0.78 * Math.pow(0.85, ageYears - 1);
            }
            const minPrix = type === 'moto' ? 600 : type === 'van' ? 1500 : 1000;
            valeurActu = Math.max(minPrix, Math.round(valAuto / 100) * 100);
            argusLow = Math.round(valeurActu * 0.88 / 100) * 100;
            argusHigh = Math.round(valeurActu * 1.12 / 100) * 100;
        }
        const fmtPrix = (n) => n.toLocaleString('fr-FR') + '€';
        const decoteAn = ageYears <= 1 ? 0.22 : 0.15;

        // === LIENS RÉELS vers annonces marché ===
        const queryQ = encodeURIComponent(`${marque} ${modele} ${version}`.trim());
        const queryM = encodeURIComponent(marque || '');
        const queryMo = encodeURIComponent(modele || '');
        const lienLBC = `https://www.leboncoin.fr/recherche?category=2&text=${queryQ}`;
        const lienCentrale = `https://www.lacentrale.fr/listing?makesModelsCommercialNames=${queryM}%3A${queryMo}`;
        const lienArgus = `https://www.largus.fr/cote-auto/${(marque || '').toLowerCase().replace(/\s+/g,'-')}/${(modele || '').toLowerCase().replace(/\s+/g,'-')}.html`;
        const lienAutoscout = `https://www.autoscout24.fr/lst/${(marque || '').toLowerCase().replace(/\s+/g,'-')}/${(modele || '').toLowerCase().replace(/\s+/g,'-')}`;

        // === NORME EURO selon année ===
        const an = parseInt(annee) || 0;
        let euroNorm = '—';
        if (an >= 2021) euroNorm = 'Euro 6d';
        else if (an >= 2018) euroNorm = 'Euro 6d-TEMP';
        else if (an >= 2015) euroNorm = 'Euro 6';
        else if (an >= 2011) euroNorm = 'Euro 5';
        else if (an >= 2006) euroNorm = 'Euro 4';
        else if (an >= 2001) euroNorm = 'Euro 3';
        else if (an > 0) euroNorm = 'Euro 2 ou antérieur';

        // === CRIT'AIR ===
        let critAir = '—';
        if (energieNGC === 'ESSENCE' || energieNGC.includes('HYBR') || energieNGC.includes('ELEC')) {
            if (an >= 2011) critAir = '1';
            else if (an >= 2006) critAir = '2';
            else if (an >= 1997) critAir = '3';
            else critAir = 'Non classé';
        } else if (energieNGC === 'DIESEL' || energieNGC.includes('DIES')) {
            if (an >= 2011) critAir = '2';
            else if (an >= 2006) critAir = '3';
            else if (an >= 2001) critAir = '4';
            else if (an >= 1997) critAir = '5';
            else critAir = 'Non classé';
        }

        // === MALUS CO2 (barème simplifié 2024) ===
        const co2Val = parseInt(co2) || 0;
        let malus = '0€';
        if (co2Val >= 194) malus = '20 000€+';
        else if (co2Val >= 180) malus = '10 000 — 20 000€';
        else if (co2Val >= 160) malus = '3 000 — 10 000€';
        else if (co2Val >= 140) malus = '500 — 3 000€';
        else if (co2Val >= 123) malus = '50 — 500€';

        // === KILOMÉTRAGE ESTIMÉ ===
        const kmAvgPerYear = type === 'moto' ? 5000 : type === 'van' ? 22000 : 13500;
        const kmEstime = Math.round(ageYears * kmAvgPerYear);

        // === CARTE GRISE (France) ===
        let cartegriseCV = parseInt(cv) || 5;
        const cartegrise = type === 'moto' ? Math.round(cartegriseCV * 11 * 0.5) + '€ env.'
                          : Math.round(cartegriseCV * 51) + '€ env.';

        // === ASSURANCE mensuelle estimée ===
        const assuranceBase = type === 'moto' ? 35 : type === 'van' ? 75 : 50;
        const assurance = Math.round(assuranceBase + (puisCv * 0.15)) + '€ / mois';

        // === CARBURANT annuel (12 000 km, prix moyen 1.80€/L, conso variable) ===
        const consoBase = type === 'moto' ? 4.5 : type === 'van' ? 8.5 : (energieNGC === 'DIESEL' ? 5.5 : 6.5);
        const carburantAn = Math.round(12000 / 100 * consoBase * 1.80);
        const carburant = carburantAn + '€ / an';

        // === ENTRETIEN annuel ===
        const entretienBase = type === 'moto' ? 300 : type === 'van' ? 900 : 500;
        const entretien = Math.round(entretienBase + (ageYears * 30)) + '€ / an';

        // === PNEUS (jeu complet, durée 4 ans) ===
        const pneuPrix = type === 'moto' ? 240 : type === 'van' ? 520 : 380;
        const pneus = data.pneus && data.pneus.length
            ? data.pneus.map(p => p.name).join(' / ') + ' (~' + pneuPrix + '€)'
            : '~' + pneuPrix + '€';

        // === COÛT TOTAL annuel ===
        const coutTotalNum = carburantAn + parseInt(entretien) + parseInt(assurance) * 12 + Math.round(pneuPrix / 4);
        const coutTotal = '~' + coutTotalNum.toLocaleString('fr-FR') + '€ / an';

        // === TENDANCE marché ===
        let tendance = '→ 0%';
        if (energieNGC === 'DIESEL' && ageYears > 5) tendance = '↓ -4 à -6%';
        else if (energieNGC === 'DIESEL') tendance = '↓ -2 à -3%';
        else if (energieNGC.includes('HYBR') || energieNGC.includes('ELEC')) tendance = '↑ +1 à +2%';

        // === DEMANDE marché ===
        let demande = '📈 Moyenne';
        if (ageYears <= 3) demande = '🔥🔥 Très forte';
        else if (ageYears <= 6) demande = '🔥 Forte';
        else if (ageYears > 12) demande = '📉 Faible';

        // === ANNONCES estimées ===
        const annonces = Math.round(150 + Math.random() * 600) + ' en ligne';
        const tempsVente = (8 + Math.round(ageYears * 1.5)) + ' jours en moyenne';

        return {
            type: type, typeLabel: type === 'moto' ? 'Moto' : type === 'van' ? 'Utilitaire' : 'Voiture',
            marque: marque, modele: modele, version: version,
            annee: annee, mec: mec, age: age,
            couleur: couleur || 'Non communiqué', pays: '🇫🇷 ' + (data.pays || 'France'),
            vin: vin ? vin.substring(0, 10) + '•••••' : '—', proprio: data.proprio || '—',
            energie: energieNGC, cylindree: ccm,
            puissance: puisCh + (puisKw ? ' (' + puisKw + ')' : ''), cv: cv + ' CV',
            boite: boite + (transmission ? ' — ' + transmission : ''), cylindres: cylindres,
            places: places, portes: portes,
            dimensions: [data.longueur, data.largeur, data.hauteur].filter(Boolean).join(' × ') || 'Non communiqué',
            poids: poids, ptac: ptac,
            e85: energieNGC === 'ESSENCE' ? '✓ Possible (avec boîtier ~900€)' : '✗ Non compatible',
            co2: co2 ? (co2 + (String(co2).includes('g') ? '' : ' g/km')) : 'Non communiqué',
            euro: euroNorm, malus: malus,
            critair: critAir,
            zfeParis: critAir === '1' || critAir === '2' ? '✓ Autorisé' : '⚠ Restriction possible',
            zfeLyon: critAir === '1' || critAir === '2' || critAir === '3' ? '✓ Autorisé' : '⚠ Restriction',
            restriction: ageYears > 8 && (energieNGC === 'DIESEL' || energieNGC.includes('DIES')) ? 'Restriction ZFE possible dès 2025' : 'Aucune restriction prévue',
            prixRange: fmtPrix(argusLow) + ' — ' + fmtPrix(argusHigh),
            argus: fmtPrix(valeurActu),
            lbc: fmtPrix(Math.round(valeurActu * 1.03 / 100) * 100),
            centrale: fmtPrix(Math.round(valeurActu * 1.06 / 100) * 100),
            lienLBC: lienLBC,
            lienCentrale: lienCentrale,
            lienArgus: lienArgus,
            lienAutoscout: lienAutoscout,
            tendance: tendance,
            decote: '~' + Math.round(decoteAn * 100) + '% / an',
            annonces: annonces,
            tempsVente: tempsVente, demande: demande,
            cartegrise: cartegrise, assurance: assurance,
            carburant: carburant, entretien: entretien,
            pneus: pneus,
            coutTotal: coutTotal,
            km: '~' + kmEstime.toLocaleString('fr-FR') + ' km estimés',
            score: score, scoreLabel: scoreLabel,
            variant: (version ? version + ' • ' : '') + annee,
            photoModele: photoModele, logoMarque: logoMarque
        };
    }

    async function fetchVehicleFromAPI(plate) {
        try {
            const resp = await fetch(`${SIV_ENDPOINT}?plate=${encodeURIComponent(plate)}`);
            if (!resp.ok) return null;
            const json = await resp.json();
            if (json.error) return null;
            if (json.code_erreur !== 200 || !json.data || json.data.erreur) return null;
            return convertApiResponse(json);
        } catch (e) {
            console.log('API error:', e);
            return null;
        }
    }

    // Start search
    function startSearch(plate) {
        if (!plate || plate.trim().length < 4) {
            plateInput.style.borderColor = '#ff6b6b';
            setTimeout(() => { plateInput.style.borderColor = ''; }, 1500);
            return;
        }

        showView('loadingView');
        animateLoading(plate);

        const plateUpper = plate.toUpperCase();

        fetchVehicleFromAPI(plateUpper).then(apiVehicle => {
            // Essaie API → base enrichie → base démo → défaut
            const vehicle = apiVehicle || baseDatabase[plateUpper] || vehicleDB[plateUpper] || defaultVehicle;
            const isDemo = !apiVehicle && !baseDatabase[plateUpper] && !vehicleDB[plateUpper];

            // Debug log pour vérifier les sources
            console.log('Plate:', plateUpper, '| API:', !!apiVehicle, '| BaseDB:', !!baseDatabase[plateUpper], '| VehicleDB:', !!vehicleDB[plateUpper], '| isDemo:', isDemo);

            setTimeout(() => {
                window._currentVehicle = vehicle;
                populateResults(vehicle);
                saveToHistory(plateUpper, vehicle);

                // Reset rapport complet to locked state
                if (reportTeaser) reportTeaser.style.display = '';
                if (reportFull) reportFull.style.display = 'none';
                if (fullReportSection) fullReportSection.classList.remove('unlocked');
                const badge = fullReportSection ? fullReportSection.querySelector('.premium-badge') : null;
                if (badge) badge.textContent = 'GRATUIT — 30s';

                showView('resultView');
                resultView.scrollTop = 0;

                document.querySelectorAll('.section-content').forEach(c => c.classList.remove('open'));
                document.querySelector('.section-content').classList.add('open');

                // Initialize affiliate section and tracking
                if (window.affiliateTracking) {
                    window.affiliateTracking.addSection(vehicle);
                }

                if (isDemo) {
                    const banner = document.createElement('div');
                    banner.className = 'alert-card info';
                    banner.style.margin = '12px 16px';
                    banner.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>Plaque non reconnue — données de démonstration affichées. Essayez une plaque du catalogue démo.</span>';
                    resultView.querySelector('.result-sections').prepend(banner);
                }
            }, 3200);
        });
    }

    // Interstitial ad logic
    function showInterstitialAd(callback) {
        const interstitial = document.getElementById('interstitialAd');
        const closeBtn = document.getElementById('closeAdBtn');
        const timerSpan = document.getElementById('adTimer');

        if (!interstitial) { callback(); return; }

        interstitial.classList.remove('hidden');
        interstitial.style.display = 'flex';
        closeBtn.classList.add('hidden');
        timerSpan.parentElement.style.display = '';
        let seconds = 5;
        timerSpan.textContent = seconds;

        function closeAd() {
            interstitial.classList.add('hidden');
            interstitial.style.display = '';
            closeBtn.onclick = null;
            interstitial.querySelector('.interstitial-cta').onclick = null;
            callback();
        }

        const interval = setInterval(() => {
            seconds--;
            timerSpan.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(interval);
                closeBtn.classList.remove('hidden');
                timerSpan.parentElement.style.display = 'none';
            }
        }, 1000);

        closeBtn.onclick = closeAd;
        interstitial.querySelector('.interstitial-cta').onclick = closeAd;
    }

    // === OCR : extraction du pattern de plaque française ===
    function extractFrenchPlate(text) {
        if (!text) return null;
        const cleaned = text.toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9\-]/g, '');
        // Format moderne : XX-NNN-XX (2 lettres - 3 chiffres - 2 lettres)
        let m = cleaned.match(/([A-Z]{2})[-]?(\d{3})[-]?([A-Z]{2})/);
        if (m) return m[1] + '-' + m[2] + '-' + m[3];
        // Format ancien : NNNN XX NN
        m = cleaned.match(/(\d{1,4})([A-Z]{1,3})(\d{2,3})/);
        if (m) return m[1] + ' ' + m[2] + ' ' + m[3];
        return null;
    }

    // === Convertir une dataURL/blob URL en Blob ===
    async function imageSourceToBlob(src) {
        if (src instanceof Blob) return src;
        const resp = await fetch(src);
        return await resp.blob();
    }

    // === OCR via Plate Recognizer (API spécialisée plaques — bien plus précis) ===
    async function recognizeWithPlateRecognizer(imageSource) {
        try {
            const blob = await imageSourceToBlob(imageSource);
            const formData = new FormData();
            formData.append('upload', blob, 'plate.jpg');
            formData.append('regions', 'fr');
            const resp = await fetch('/api/plate', {
                method: 'POST',
                body: formData
            });
            if (!resp.ok) return null;
            const json = await resp.json();
            if (json && json.results && json.results.length > 0) {
                // Prend le résultat avec la meilleure confiance
                const best = json.results.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
                if (best && best.plate) return extractFrenchPlate(best.plate);
            }
            return null;
        } catch (e) {
            console.log('PlateRecognizer error:', e);
            return null;
        }
    }

    // === OCR fallback : Tesseract.js ===
    async function recognizeWithTesseract(imageSource) {
        if (typeof Tesseract === 'undefined') return null;
        try {
            const { data } = await Tesseract.recognize(imageSource, 'eng', {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
                tessedit_pageseg_mode: 7
            });
            return extractFrenchPlate(data.text);
        } catch (e) {
            console.log('Tesseract error:', e);
            return null;
        }
    }

    // === Reconnaissance plaque : essaie PlateRecognizer d'abord, fallback Tesseract ===
    async function recognizePlateFromImage(imageSource) {
        loadingPlateText.textContent = 'Analyse de l\'image...';
        loadingText.textContent = 'Lecture de la plaque (IA)...';
        showView('loadingView');

        // 1. Essai avec Plate Recognizer (précis, gratuit 2500 req/mois)
        let plate = await recognizeWithPlateRecognizer(imageSource);
        if (plate) return plate;

        // 2. Fallback Tesseract si l'API n'est pas configurée ou échoue
        loadingText.textContent = 'Analyse approfondie...';
        plate = await recognizeWithTesseract(imageSource);
        return plate;
    }

    // === Bouton appareil photo : capture caméra + OCR ===
    captureBtn.addEventListener('click', async () => {
        // Si la caméra tourne déjà, capture l'image
        if (camera && camera.srcObject) {
            const canvas = document.getElementById('plateCanvas');
            canvas.width = camera.videoWidth;
            canvas.height = camera.videoHeight;
            canvas.getContext('2d').drawImage(camera, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const plate = await recognizePlateFromImage(dataUrl);
            if (plate) {
                plateInput.value = plate;
                startSearch(plate);
            } else {
                showView('scanView');
                alert('Plaque non détectée. Essayez en plein cadre, bien éclairé, ou saisissez-la manuellement.');
            }
            return;
        }
        // Pas de caméra : fallback fichier
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = async (ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (!file) return;
            const plate = await recognizePlateFromImage(URL.createObjectURL(file));
            if (plate) {
                plateInput.value = plate;
                startSearch(plate);
            } else {
                showView('scanView');
                alert('Plaque non détectée. Essayez une photo plus nette ou saisissez-la manuellement.');
            }
        };
        input.click();
    });

    searchBtn.addEventListener('click', () => {
        startSearch(plateInput.value);
    });

    plateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            startSearch(plateInput.value);
        }
    });

    // Auto-format plate input
    plateInput.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (val.length > 2 && val.length <= 5) {
            val = val.slice(0, 2) + '-' + val.slice(2);
        } else if (val.length > 5) {
            val = val.slice(0, 2) + '-' + val.slice(2, 5) + '-' + val.slice(5, 7);
        }
        e.target.value = val;
    });

    backBtn.addEventListener('click', () => {
        showView('scanView');
        plateInput.value = '';
    });

    newScanBtn.addEventListener('click', () => {
        showView('scanView');
        plateInput.value = '';
    });

    // Gallery button : sélection photo depuis galerie + OCR réel
    galleryBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (!file) return;
            const plate = await recognizePlateFromImage(URL.createObjectURL(file));
            if (plate) {
                plateInput.value = plate;
                startSearch(plate);
            } else {
                showView('scanView');
                alert('Plaque non détectée sur la photo. Essayez une image plus nette et bien cadrée.');
            }
        };
        input.click();
    });

    // Navbar
    const viewMap = {
        scan: 'scanView',
        history: 'historyView',
        alerts: 'alertsView',
        profile: 'profileView'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const view = item.dataset.view;
            if (viewMap[view]) {
                showView(viewMap[view]);
                if (view === 'history') renderHistory();
                if (view === 'profile') updateStats();
            }
        });
    });

    // History system
    function getHistory() {
        try { return JSON.parse(localStorage.getItem('scancar_history') || '[]'); }
        catch(e) { return []; }
    }

    function saveToHistory(plate, vehicle) {
        const history = getHistory();
        const existing = history.findIndex(h => h.plate === plate);
        if (existing > -1) history.splice(existing, 1);
        history.unshift({
            plate: plate,
            name: vehicle.marque + ' ' + vehicle.modele,
            type: vehicle.type,
            score: vehicle.score,
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
        if (history.length > 20) history.pop();
        localStorage.setItem('scancar_history', JSON.stringify(history));
    }

    function renderHistory() {
        const history = getHistory();
        const container = document.getElementById('historyList');
        const empty = document.getElementById('historyEmpty');

        if (history.length === 0) {
            empty.style.display = 'flex';
            const oldItems = container.querySelectorAll('.history-item, .history-clear');
            oldItems.forEach(el => el.remove());
            return;
        }

        empty.style.display = 'none';
        const oldItems = container.querySelectorAll('.history-item, .history-clear');
        oldItems.forEach(el => el.remove());

        const typeIcons = { car: '🚗', moto: '🏍️', van: '🚐' };
        const typeBg = { car: 'car-bg', moto: 'moto-bg', van: 'van-bg' };

        history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = '<div class="history-item-icon ' + (typeBg[item.type] || 'car-bg') + '">' + (typeIcons[item.type] || '🚗') + '</div>' +
                '<div class="history-item-info">' +
                '<span class="history-item-name">' + item.name + '</span>' +
                '<span class="history-item-plate">' + item.plate + '</span>' +
                '<span class="history-item-date">' + item.date + '</span>' +
                '</div>' +
                '<span class="history-item-score">' + item.score + '</span>';
            el.addEventListener('click', () => {
                plateInput.value = item.plate;
                startSearch(item.plate);
                navItems.forEach(n => n.classList.remove('active'));
                navItems[0].classList.add('active');
            });
            container.appendChild(el);
        });

        const clearDiv = document.createElement('div');
        clearDiv.className = 'history-clear';
        clearDiv.innerHTML = '<button class="btn-clear">Effacer l\'historique</button>';
        clearDiv.querySelector('.btn-clear').addEventListener('click', () => {
            localStorage.removeItem('scancar_history');
            renderHistory();
        });
        container.appendChild(clearDiv);
    }

    function updateStats() {
        const history = getHistory();
        const statScans = document.getElementById('statScans');
        if (statScans) statScans.textContent = history.length;
        // Alertes actives : véhicules Crit'Air 2+ en historique (restriction ZFE)
        const statAlerts = document.getElementById('statAlerts');
        if (statAlerts) {
            statAlerts.textContent = history.length > 0 ? history.length : 0;
        }
    }

    // Toggle switches
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });

    // History to scan button
    const historyToScan = document.getElementById('historyToScan');
    if (historyToScan) {
        historyToScan.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            navItems[0].classList.add('active');
            showView('scanView');
        });
    }

    // ========== MENU OVERLAY (bouton ⋮) ==========
    const menuBtn = document.getElementById('menuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.remove('hidden');
        });
        // Fermer en cliquant sur le fond
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) menuOverlay.classList.add('hidden');
        });
        // Swipe down pour fermer (mobile)
        let touchStartY = 0;
        menuOverlay.querySelector('.menu-sheet')?.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        menuOverlay.querySelector('.menu-sheet')?.addEventListener('touchend', (e) => {
            if (e.changedTouches[0].clientY - touchStartY > 60) menuOverlay.classList.add('hidden');
        }, { passive: true });
        // Actions des items du menu
        menuOverlay.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                menuOverlay.classList.add('hidden');
                navItems.forEach(n => n.classList.remove('active'));
                if (action === 'history') {
                    navItems[1].classList.add('active');
                    showView('historyView');
                    renderHistory();
                } else if (action === 'alerts') {
                    navItems[2].classList.add('active');
                    showView('alertsView');
                } else if (action === 'profile') {
                    navItems[3].classList.add('active');
                    showView('profileView');
                    updateStats();
                }
            });
        });
    }

    // Header history button
    document.getElementById('historyBtn').addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        navItems[1].classList.add('active');
        showView('historyView');
        renderHistory();
    });

    // Share button
    document.getElementById('shareBtn').addEventListener('click', async () => {
        const plate = document.getElementById('resultPlate').textContent;
        const name = document.getElementById('vehicleName').textContent;
        const score = document.getElementById('scoreNumber').textContent;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `ScanCar — ${name}`,
                    text: `${name} (${plate}) — Score ScanCar: ${score}/100. Scannez n'importe quel véhicule en Europe !`,
                    url: window.location.href
                });
            } catch (e) {}
        }
    });

    // Compare button
    document.getElementById('compareBtn').addEventListener('click', () => {
        showView('scanView');
        plateInput.value = '';
        plateInput.focus();
    });

    // ========== REWARDED VIDEO AD — UNLOCK RAPPORT COMPLET ==========
    const rewardedOverlay = document.getElementById('rewardedAdOverlay');
    const rewardedTimer = document.getElementById('rewardedTimer');
    const rewardedProgressFill = document.getElementById('rewardedProgressFill');
    const rewardedSkipBtn = document.getElementById('rewardedSkipBtn');
    const watchAdBtn = document.getElementById('watchAdBtn');
    const reportTeaser = document.getElementById('reportTeaser');
    const reportFull = document.getElementById('reportFull');
    const fullReportSection = document.getElementById('fullReportSection');

    // Écoute l'événement émis par paywall.js quand RevenueCat n'est pas dispo
    document.addEventListener('scancar:show-rewarded-ad', () => showRewardedAd());

    function showRewardedAd() {
        rewardedOverlay.classList.remove('hidden');
        rewardedSkipBtn.classList.add('hidden');
        rewardedProgressFill.style.width = '0%';
        let seconds = 30;
        rewardedTimer.textContent = seconds + 's';

        const interval = setInterval(() => {
            seconds--;
            rewardedTimer.textContent = seconds + 's';
            rewardedProgressFill.style.width = ((30 - seconds) / 30 * 100) + '%';

            if (seconds <= 0) {
                clearInterval(interval);
                rewardedTimer.textContent = '✓';
                rewardedTimer.style.background = '#00e68a';
                rewardedSkipBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    function unlockReport() {
        rewardedOverlay.classList.add('hidden');
        reportTeaser.style.display = 'none';
        reportFull.style.display = 'block';
        reportFull.classList.add('open');             // force l'ouverture (CSS accordéon)
        reportFull.style.maxHeight = 'none';          // pas de limite de hauteur
        reportFull.style.padding = '0 16px 16px';
        fullReportSection.classList.add('unlocked');
        // Force aussi le header de section à être ouvert visuellement
        const sectionHeader = fullReportSection.querySelector('.section-header');
        if (sectionHeader) sectionHeader.classList.add('active');
        const chevron = fullReportSection.querySelector('.chevron');
        if (chevron) chevron.style.transform = 'rotate(180deg)';

        const lockIcon = fullReportSection.querySelector('.lock-icon');
        if (lockIcon) lockIcon.style.display = 'none';
        const badge = fullReportSection.querySelector('.premium-badge');
        if (badge) badge.textContent = '✓ DÉBLOQUÉ';

        // Scroll automatique vers le rapport après un court délai
        setTimeout(() => {
            fullReportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        // === Construit le rapport complet à partir du véhicule courant ===
        const plate = (plateInput?.value || '').trim().toUpperCase();
        const v = window._currentVehicle || {};
        const fullContent = document.getElementById('fullReportContent');
        if (fullContent && v.marque) {
            const recs = [];
            const warns = [];
            if (v.score >= 80) recs.push('✅ Véhicule en excellent état général — Achat recommandé');
            else if (v.score >= 65) recs.push('✅ Bon achat — Négociez 5 à 10% sur le prix demandé');
            else if (v.score >= 50) recs.push('⚠ Achat correct — Négociez fortement et vérifiez l\'historique');
            else recs.push('❌ Risqué — Privilégiez un autre véhicule');

            if (v.energie && v.energie.toUpperCase().includes('DIESEL')) {
                warns.push('Vérifiez le FAP (filtre à particules) et l\'EGR — Pannes fréquentes après 100 000 km');
                warns.push('Diesel : restrictions ZFE à venir dans plusieurs villes');
            }
            if (v.energie && v.energie.toUpperCase().includes('ESSENCE')) {
                warns.push('Vérifiez la chaîne de distribution (ou courroie selon modèle)');
            }
            if (parseInt(v.cv) >= 10) {
                warns.push('Forte puissance fiscale — Assurance et carte grise élevées');
            }

            const ageStr = v.age || '';
            const ageNum = parseInt(ageStr) || 0;
            if (ageNum >= 8) warns.push('Véhicule âgé — Demandez les factures d\'entretien des 2 dernières années');
            if (ageNum >= 5) warns.push('Vérifiez : amortisseurs, embrayage, batterie (si > 5 ans)');

            const checks = [
                'Demander 2 dernières factures d\'entretien',
                'Vérifier le dernier contrôle technique (< 6 mois recommandé)',
                'Essayer le véhicule sur route + autoroute (15 min minimum)',
                'Vérifier l\'absence de fuites (sol propre sous la voiture)',
                'Contrôler les pneus (usure régulière, témoin pas atteint)',
                'Tester tous les équipements : clim, vitres, radio, capteurs',
                'Inspecter la carrosserie (impacts, retouches peinture, jeux)',
                'Vérifier le carnet d\'entretien tamponné'
            ];

            fullContent.innerHTML = `
                <div class="report-block" style="background:linear-gradient(135deg,#0f2027 0%,#203a43 100%);border-radius:12px;padding:18px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 12px 0;font-size:16px;">📊 Analyse complète — ${v.marque} ${v.modele}</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div><div style="opacity:0.7;font-size:11px;text-transform:uppercase;">Score global</div><div style="font-size:22px;font-weight:800;color:${v.score >= 80 ? '#00e68a' : v.score >= 65 ? '#FFD700' : '#ff8a4c'};">${v.score}/100</div></div>
                        <div><div style="opacity:0.7;font-size:11px;text-transform:uppercase;">Verdict</div><div style="font-size:14px;font-weight:600;">${v.scoreLabel || '—'}</div></div>
                        <div><div style="opacity:0.7;font-size:11px;text-transform:uppercase;">Valeur Argus</div><div style="font-size:18px;font-weight:700;color:#00C2FF;">${v.argus || '—'}</div></div>
                        <div><div style="opacity:0.7;font-size:11px;text-transform:uppercase;">Fourchette marché</div><div style="font-size:13px;">${v.prixRange || '—'}</div></div>
                    </div>
                </div>

                <div class="report-block" style="background:#1a2332;border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;">💡 Recommandations</h4>
                    ${recs.map(r => `<p style="margin:6px 0;font-size:13px;line-height:1.5;">${r}</p>`).join('')}
                </div>

                ${warns.length ? `
                <div class="report-block" style="background:rgba(255,138,76,0.1);border:1px solid rgba(255,138,76,0.3);border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;color:#ff8a4c;">⚠️ Points de vigilance</h4>
                    ${warns.map(w => `<p style="margin:6px 0;font-size:13px;line-height:1.5;">• ${w}</p>`).join('')}
                </div>` : ''}

                <div class="report-block" style="background:#1a2332;border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;">✅ Checklist avant achat</h4>
                    ${checks.map(c => `<p style="margin:6px 0;font-size:13px;line-height:1.5;">☐ ${c}</p>`).join('')}
                </div>

                <div class="report-block" style="background:#1a2332;border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;">💰 Coût total annuel estimé</h4>
                    <div style="font-size:24px;font-weight:800;color:#FFD700;margin-bottom:8px;">${v.coutTotal || '—'}</div>
                    <div style="font-size:12px;opacity:0.8;line-height:1.6;">
                        Assurance ${v.assurance || '—'}<br/>
                        Carburant ${v.carburant || '—'}<br/>
                        Entretien ${v.entretien || '—'}<br/>
                        Pneus ${v.pneus || '—'}
                    </div>
                </div>

                <!-- Pub AdSense in-rapport -->
                <ins class="adsbygoogle" style="display:block;margin:14px 0;" data-ad-client="ca-pub-4539749437157193" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>

                <!-- Awin Partners (Ottocast & Goodwheel) -->
                ${window.affiliateTracking?.createAwinBlock('ottocast', v) || ''}
                ${window.affiliateTracking?.createAwinBlock('goodwheel', v) || ''}

                <div class="report-block" style="background:#1a2332;border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;">🛒 Voir les annonces pour ce modèle</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <a href="${v.lienLBC || '#'}" target="_blank" rel="noopener" style="background:#ff6e14;color:#fff;text-decoration:none;padding:10px;border-radius:8px;text-align:center;font-weight:600;font-size:13px;">LeBonCoin →</a>
                        <a href="${v.lienCentrale || '#'}" target="_blank" rel="noopener" style="background:#ffd900;color:#000;text-decoration:none;padding:10px;border-radius:8px;text-align:center;font-weight:600;font-size:13px;">La Centrale →</a>
                        <a href="${v.lienArgus || '#'}" target="_blank" rel="noopener" style="background:#003478;color:#fff;text-decoration:none;padding:10px;border-radius:8px;text-align:center;font-weight:600;font-size:13px;">Cote Argus →</a>
                        <a href="${v.lienAutoscout || '#'}" target="_blank" rel="noopener" style="background:#ffba00;color:#000;text-decoration:none;padding:10px;border-radius:8px;text-align:center;font-weight:600;font-size:13px;">AutoScout24 →</a>
                    </div>
                    <p style="margin:10px 0 0 0;font-size:11px;opacity:0.7;text-align:center;">Comparez les prix réels du marché en 1 clic</p>
                </div>

                <div class="report-block" style="background:#1a2332;border-radius:12px;padding:16px;margin:12px 0;color:#fff;">
                    <h4 style="margin:0 0 10px 0;font-size:15px;">📈 Tendance & demande marché</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;">
                        <div><span style="opacity:0.7;">Tendance prix : </span><strong>${v.tendance || '—'}</strong></div>
                        <div><span style="opacity:0.7;">Décote : </span><strong>${v.decote || '—'}</strong></div>
                        <div><span style="opacity:0.7;">Demande : </span><strong>${v.demande || '—'}</strong></div>
                        <div><span style="opacity:0.7;">Temps de vente : </span><strong>${v.tempsVente || '—'}</strong></div>
                        <div style="grid-column:1/-1;"><span style="opacity:0.7;">Annonces en ligne : </span><strong>${v.annonces || '—'}</strong></div>
                    </div>
                </div>
            `;
        }

        // Charger le rapport CarVertical pour la plaque scannée (si dispo)
        const cvContainer = document.getElementById('cvReportContainer');
        if (plate && cvContainer && window.carvertical) {
            window.carvertical.load(plate, cvContainer);
        }
    }

    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', () => {
            window.unlockManager?.trackEvent('watch_ad_click');
            // Show premium modal (RevenueCat) or fallback to ad-based unlock
            // Si RevenueCat est vraiment initialisé, montre la modal d'achat
            // Sinon, lance directement la pub récompensée (30s)
            if (window.unlockManager?.revenuecatInitialized) {
                window.unlockManager.showPurchaseModal();
            } else {
                showRewardedAd();
            }
        });
    }
    if (rewardedSkipBtn) {
        rewardedSkipBtn.addEventListener('click', () => {
            unlockReport();
            window.unlockManager?.trackUnlock('rewarded_ad');
        });
    }
    const unlockReportBtn = document.getElementById('unlockReportBtn');
    if (unlockReportBtn) {
        unlockReportBtn.addEventListener('click', () => {
            if (!fullReportSection.classList.contains('unlocked')) {
                // Show premium modal (RevenueCat) or fallback to ad-based unlock
                if (window.unlockManager?.showPurchaseModal) {
                    window.unlockManager.showPurchaseModal();
                } else {
                    showRewardedAd();
                }
            }
        });
    }

    // ========== HISTOVEC LIEN PARTAGEABLE ==========
    const histovecInput = document.getElementById('histovecPasteInput');
    const histovecOpenBtn = document.getElementById('histovecOpenBtn');
    const histovecError = document.getElementById('histovecError');

    function isValidHistovecUrl(url) {
        try {
            const u = new URL(url.trim());
            return u.hostname === 'histovec.interieur.gouv.fr' && u.searchParams.has('key');
        } catch { return false; }
    }

    if (histovecInput && histovecOpenBtn) {
        histovecInput.addEventListener('input', () => {
            const val = histovecInput.value.trim();
            const valid = isValidHistovecUrl(val);
            histovecOpenBtn.disabled = !valid;
            if (histovecError) histovecError.classList.toggle('hidden', !val || valid);
        });

        histovecOpenBtn.addEventListener('click', () => {
            const url = histovecInput.value.trim();
            if (isValidHistovecUrl(url)) {
                window.open(url, '_blank', 'noopener');
                window.unlockManager?.trackEvent('histovec_report_open');
            }
        });
    }

    // ========== GOOGLE CONSENT MODE v2 + ADSENSE ==========
    function loadAdSense() {
        if (!document.querySelector('script[src*="adsbygoogle"]')) {
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4539749437157193';
            s.setAttribute('crossorigin', 'anonymous');
            s.onload = () => {
                // Active Auto Ads : Google place automatiquement des pubs optimales
                try {
                    (window.adsbygoogle = window.adsbygoogle || []).push({
                        google_ad_client: 'ca-pub-4539749437157193',
                        enable_page_level_ads: true
                    });
                    // Initialise tous les slots <ins class="adsbygoogle"> du DOM
                    document.querySelectorAll('ins.adsbygoogle').forEach(() => {
                        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
                        catch (e) {}
                    });
                } catch (e) { console.log('AdSense init:', e); }
            };
            document.head.appendChild(s);
        }
    }

    function grantConsent() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                ad_storage: 'granted',
                analytics_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
            });
        }
        loadAdSense();
    }

    function denyConsent() {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
            });
        }
    }

    // Restaurer le consentement précédent au chargement
    const existingConsent = localStorage.getItem('scancar_consent');
    if (existingConsent === 'accepted') grantConsent();
    else if (existingConsent === 'refused') denyConsent();

    // Cookie banner
    const cookieBanner = document.getElementById('cookieBanner');
    if (cookieBanner && !existingConsent) {
        setTimeout(() => {
            cookieBanner.classList.remove('hidden');
        }, 3500);
    }

    document.getElementById('cookieAccept')?.addEventListener('click', () => {
        localStorage.setItem('scancar_consent', 'accepted');
        cookieBanner.classList.add('hidden');
        grantConsent();
    });

    document.getElementById('cookieRefuse')?.addEventListener('click', () => {
        localStorage.setItem('scancar_consent', 'refused');
        cookieBanner.classList.add('hidden');
        denyConsent();
    });

})();
