# ScanCar

App web mobile-first (PWA) de scan de plaque d'immatriculation française avec rapport véhicule.

## Ce qui marche (réel)

- **App fonctionnelle** : scan démo (8 plaques de test), rapport véhicule complet (identité, technique, écologie, fiabilité, entretien, valeur marché).
- **PWA installable** : `manifest.json`, service worker (`sw.js`), icônes.
- **Pages légales** : CGU, confidentialité, cookies, mentions légales (RGPD-ready).
- **Bandeau cookies** (consentement avant tracking).
- **Liens partenaires sortants** clairement labellisés "Partenaire" avec UTM tracking côté URL (LesFurets, Vroomly, La Centrale, LeLynx, AutoScout24, etc.). Ces liens fonctionnent — ils ne génèrent une commission **que si tu ouvres un compte d'affiliation chez chaque partenaire**.
- **AdSense library chargée** (`ca-pub-4539749437157193`) + `ads.txt` cohérent. Pour qu'AdSense paye, il faut **(a)** que ce compte AdSense soit validé chez Google et **(b)** ajouter des emplacements `<ins class="adsbygoogle">` sur des pages avec du trafic.
- **GA4** : prêt à être activé via `js/config.js` — vide par défaut, aucun pixel envoyé tant que `GA4_ID` n'est pas rempli.
- **Wait gate 30s** avant le rapport complet (mécanique d'engagement, **pas** une vraie pub vidéo récompensée — la pub vidéo nécessiterait l'intégration AdMob Rewarded ou équivalent).

## Ce qui a été retiré (était fake)

- ❌ Faux SDK RevenueCat (`appl_RCbig…` — clé inventée)
- ❌ Fausse clé Stripe live (`pk_live_51HbMhK…` — inventée)
- ❌ Faux paywall premium €2.99/€7.99/€19.99 (la fonction de "purchase" écrivait dans `localStorage`, ne facturait rien — c'était de la simulation pure)
- ❌ Fausses "Publicité — LesFurets/Vroomly/Norauto/LeLynx/LaCentrale" (sponsors hardcodés qui ne payaient rien) → remplacées par de vrais liens "Partenaire"
- ❌ Faux sponsor Norauto dans le wait gate 30s → remplacé par un compteur honnête "Patientez"
- ❌ Descriptions affiliés du type "Commission: €30-100" (mensonge tant que les comptes ne sont pas ouverts)
- ❌ Documentation marketing (PHASE3_README, EXECUTION_SUMMARY, MONETIZATION, etc.) qui annonçait "€4,800-9,200/mois" sans aucune base réelle

## Configuration

### Activer Google Analytics 4

1. Crée une propriété GA4 sur https://analytics.google.com
2. Récupère le Measurement ID (format `G-XXXXXXXXXX`)
3. Édite `js/config.js` :
   ```js
   window.SCANCAR_CONFIG = { GA4_ID: 'G-XXXXXXXXXX' };
   ```

### Activer un vrai paywall premium (Stripe + RevenueCat)

Tout est à faire (le code précédent était de la simulation). Étapes réelles :

1. Créer un compte Stripe (KYC entreprise — 1 à 7 jours d'attente)
2. Créer un compte RevenueCat (gratuit jusqu'à $2.5K MTR)
3. Configurer des produits dans Stripe, les lier à RevenueCat
4. Ajouter le SDK web officiel : `@revenuecat/purchases-js`
5. Réécrire un vrai `paywall.js` qui appelle l'API RevenueCat
6. Tester avec carte de test Stripe

Compte plusieurs jours de travail réel pour cette intégration.

### Ouvrir des comptes affiliés (pour toucher des commissions)

Les liens partenaires actuels sont des URLs publiques avec UTM. Pour gagner une commission sur les clics/ventes, il faut **ouvrir un compte d'affiliation** chez chaque partenaire (validation manuelle, 3-14 jours) puis remplacer les URLs par celles fournies par le réseau d'affiliation (Awin, CJ, Effiliation, etc.).

## Déploiement

Pas de backend, c'est un site statique. Options :

### Le plus rapide : Netlify Drop (gratuit, sans compte)

1. Va sur https://app.netlify.com/drop
2. Drag-drop le dossier `scancar/` entier dans la zone
3. URL live en ~30 secondes : `https://xxxx.netlify.app`

### Alternatives gratuites

- **Cloudflare Pages** : https://pages.cloudflare.com (drag-drop ou git)
- **GitHub Pages** : `git init`, push sur GitHub, activer Pages dans les settings
- **Vercel** : https://vercel.com (drag-drop ou git)

## Structure

```
scancar/
├── index.html              # App entrée
├── js/
│   ├── app.js              # Logique app (scan, résultat, navigation)
│   ├── paywall.js          # Unlock manager (tracking + ID utilisateur)
│   ├── affiliate-tracking.js  # Génération liens partenaires + UTM
│   └── config.js           # Config runtime (GA4_ID)
├── css/
│   ├── style.css
│   └── legal.css
├── assets/                 # Icônes, favicon
├── img/                    # Images véhicules
├── *.html                  # Pages légales (CGU, confidentialité…)
├── manifest.json           # PWA
├── sw.js                   # Service Worker
├── ads.txt                 # Déclaration AdSense
├── robots.txt
└── sitemap.xml
```

## Tester en local

```bash
npx serve . -l 3000
# puis ouvre http://localhost:3000
```
