# Configuration Android App pour ScanCar

## État actuel
- PWA générée: https://scancar-app.netlify.app
- Domain: scancar.fr

## Fichiers nécessaires pour Google Play Store

1. **package.json** - Métadonnées pour Bubblewrap
2. **.well-known/assetlinks.json** - Vérification du domaine
3. **build.gradle** - Configuration de build Android
4. **AndroidManifest.xml** - Configuration d'app Android

## Prochaines étapes

### Option 1: Avec Bubblewrap (recommandé)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://scancar-app.netlify.app/manifest.json
bubblewrap build
```

Cela créera:
- scancar-app.aab (Android App Bundle pour Google Play)
- Clé de signature (keystore.jks)

### Option 2: Sans Android SDK
- Utiliser PWABuilder pour générer le package Android
- Ou utiliser des services cloud (Bubblewrap en ligne)

## SHA256 Fingerprint
À remplir dans .well-known/assetlinks.json après génération du package Android.

## Configuration assetlinks.json
```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.scancar.app",
    "sha256_cert_fingerprints": ["VOTRE_SHA256_ICI"]
  }
}
```
