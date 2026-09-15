# Architecture technique - CartoMesh

Vue d'ensemble pour developpeurs. Le projet est un **front-end statique** sans backend applicatif.

## Stack

| Element | Choix |
|---------|--------|
| Bundler / dev server | Vite 5 |
| Carte | Leaflet 1.9 (CDN dans `index.html` + dependance npm) |
| Langage | JavaScript (module ES), CSS |
| Donnees | Fichiers GeoJSON statiques |
| Hebergement cible | Site statique (`dist/`), Cloudflare Pages ou Nginx |

Pas de base de donnees, pas d'API metier obligatoire.

## Flux de build

```text
sources (index.html, src/*, public/*)
        |
        v
   npm run build  (Vite)
        |
        v
   dist/  (HTML/JS/CSS hashes + copie de public/)
        |
        +--> dist/geojson/*.geojson
        +--> dist/_redirects
```

- Assets a livrer tels quels: placer sous `public/`.
- Le dossier racine `geojson/` n'est **pas** copie automatiquement dans `dist/` ; le runtime charge `geojson/...` depuis `public/geojson/` apres build.
- Les images sous `images/` a la racine sont utiles en **dev** ; pour la production, les placer sous `public/images/` (sinon absentes de `dist/`).

## Structure runtime (navigateur)

```text
index.html
  |- Leaflet CSS/JS (CDN)
  |- /src/style.css
  |- /src/main.js
       |- init carte + bornes Europe
       |- panneaux UI (outils, coords, identify)
       |- chargement lazy des GeoJSON Meshcore
       |- hit-test point-in-polygon au clic
       |- generation config repeteur + copie presse-papiers
```

Point d'entree logique: `src/main.js`.

## Couches Meshcore

Configurees dans `meshcoreGeojsonConfigs`:

| id | Fichier | Role |
|----|---------|------|
| `europe` | `geojson/C_Europe.geojson` | Limites pays |
| `region` | `geojson/C_FR_Region.geojson` | Regions France |
| `departement` | `geojson/C_FR_Departement.geojson` | Departements France |

Comportements cles:

- Chargement via `fetch` a l'activation Meshcore (promesse par couche).
- Visibilite des contours via switches "Afficher les limites".
- `MIN_ZOOM_FOR_DEPARTEMENT = 8`: pas de charge / affichage departement sous ce zoom.
- Styles de contour et de surbrillance separes (`meshcoreLayerStyleById`, `meshcoreHighlightStyleById`).

## Identification au clic

1. Clic carte si Meshcore actif.
2. `identifyMeshcoreAtPoint` teste le point contre les geometries chargees (point-in-polygon).
3. Mise a jour des highlights + panneau infos.
4. `buildNodeConfigFromResults` extrait les codes Meshcore depuis les proprietes GeoJSON et produit les lignes `region put` / `region allowf` / `region save`.

Champs utilises (priorites / noms selon couche):

- Europe: `pays`, fallbacks lies au pays Meshcore
- Region: `Region_gaulix_MC`, libelles officiels
- Departement: `region_departement_meshcore`

## UI

- Panneaux deplacables (`makeDraggable`).
- Etat de chargement Meshcore rendu dans le DOM (`renderMeshcoreLoadStatus`, `renderMeshcoreLegend`).
- Sous-menus Meshcore (Region Europe / France / Departement) presents en commentaire HTML: desactives pour l'instant.

## CI / deploiement

Workflow: `.github/workflows/deploy-cloudflare-pages.yml`

1. Checkout avec `lfs: true`
2. `npm ci` + `npm run build`
3. `wrangler pages deploy dist` (secrets Cloudflare + variable `CF_PAGES_PROJECT_NAME`)

Raison du flux Actions: Cloudflare Pages (integration Git native) ne recupere pas correctement les objets **Git LFS** ; le checkout LFS cote Actions puis upload de `dist/` est le chemin fiable.

## Scripts Windows

| Script | Role |
|--------|------|
| `start.ps1` / `start.bat` | Demarre `npm run dev`, PID dans `.vite-dev.pid` |
| `stop.ps1` / `stop.bat` | Stoppe le PID enregistre |

Port des scripts: **5173** (defaut Vite).

## Limites connues / points d'attention

- GeoJSON region / departement tres volumineux: temps de chargement reseau et memoire navigateur eleves.
- Switches Meshtastic / SAR / `...` non branches sur des couches metier pour l'instant.
- Pas de `vite.config.*`: configuration Vite par defaut.
- Leaflet charge via CDN: necessite acces reseau au CDN en navigation (sauf mise en cache / miroir local ulterieur).
