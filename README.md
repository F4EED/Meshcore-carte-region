# Gaulix - CartoMesh

Depot: [F4EED/Meshcore-carte-region](https://github.com/F4EED/Meshcore-carte-region)

Application web de cartographie (Vite + Leaflet) pour visualiser des reseaux Mesh (Meshtastic / Meshcore), afficher des couches GeoJSON et identifier une zone au clic (infos + configuration repeteur Meshcore).

Licence: **GPL-3.0** (voir `LICENSE`).

## Lancement rapide (local)

Prerequis:

- Node.js (LTS recommande: 20.x ou 22.x)
- npm

Installation:

```bash
npm install
```

Demarrage (port Vite par defaut):

```bash
npm run dev
```

Application disponible sur:

- `http://localhost:5173/`

Variante avec port fixe:

```bash
npm run dev -- --port 8000
```

Arret: `Ctrl + C` dans le terminal du serveur.

### Windows (scripts automatises)

```bat
start.bat
```

Arret:

```bat
stop.bat
```

Details:

- `start.bat` appelle `start.ps1`, lance Vite en arriere-plan, enregistre le PID dans `.vite-dev.pid`, logs dans `.vite-dev.log` / `.vite-dev.err.log`.
- `stop.bat` appelle `stop.ps1` et stoppe le processus enregistre.
- URL par defaut des scripts: `http://localhost:5173/`

### Build et apercu production

```bash
npm run build
npm run preview
```

Le build ecrit le site statique dans `dist/` (GeoJSON inclus depuis `public/geojson/`).

## Fonctionnalites principales

- Carte Leaflet centree Europe, panneaux Outils / Coordonnees / Infos au clic (deplacables).
- Switch **Meshcore**: chargement des couches GeoJSON (Europe, Region FR, Departement FR), legendes, toggles "Afficher les limites".
- Clic carte (Meshcore actif): identification pays / region / departement, surbrillance, generation d'une **Configuration repeteur** (copiable).
- Couche departements chargee seulement a partir du zoom `8` (performance).
- Switches **Meshtastic**, **SAR**, **...**: presents dans l'UI (placeholders / evolutions futures).

## Structure du projet

| Chemin | Role |
|--------|------|
| `index.html` | Page principale et structure UI |
| `src/main.js` | Logique carte, couches, identification, interactions |
| `src/style.css` | Styles de l'interface |
| `public/geojson/` | GeoJSON embarques dans le build (`dist/geojson/`) |
| `public/_redirects` | Fallback SPA (Cloudflare Pages) |
| `geojson/` | Copies / references locales des GeoJSON (hors build si non dans `public/`) |
| `images/` | Assets visuels (dev) ; pour la prod, preferer `public/images/` |
| `docs/` | Documentation projet |
| `start.bat` / `stop.bat` (+ `.ps1`) | Demarrage / arret Windows |
| `.github/workflows/` | Deploy Cloudflare Pages via GitHub Actions |

## Documentation

Index complet: [`docs/INDEX.md`](docs/INDEX.md)

| Document | Contenu |
|----------|---------|
| [`docs/USAGE.md`](docs/USAGE.md) | Guide utilisateur de l'interface |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture technique |
| [`README.install.webserver.md`](README.install.webserver.md) | Install pas a pas sur un **serveur web existant** |
| [`README-Ubuntu-server.md`](README-Ubuntu-server.md) | Installation sur VM Ubuntu Server (dev / Nginx) |
| [`README.install.github.md`](README.install.github.md) | Deploy GitHub + Cloudflare Pages (Git LFS) |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Historique des changements |
| [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) | Routine de maintenance documentaire |

## Deploiement

Site **statique** (Vite -> `dist/`). Trois chemins courants:

1. **Serveur web deja en place** (Nginx / Apache / IIS / FTP): copier le contenu de `dist/` → guide `README.install.webserver.md`.
2. **VM Ubuntu** (Node + Nginx from scratch ou transfert): `README-Ubuntu-server.md`.
3. **Cloudflare Pages** via GitHub Actions (recommande si gros GeoJSON + Git LFS): `README.install.github.md`.

Les gros GeoJSON (> 100 Mo) imposent en general **Git LFS** si vous versionnez sur GitHub.

## Maintenance documentaire

A chaque changement de code ou de comportement:

1. Mettre a jour `docs/CHANGELOG.md`.
2. Mettre a jour `README.md` si commandes, structure ou flux changent.
3. Mettre a jour les guides concernes (`USAGE`, `ARCHITECTURE`, serveur web, Ubuntu, GitHub).
4. Mettre a jour `docs/MAINTENANCE.md` si le processus de doc evolue.

Details: `docs/MAINTENANCE.md`.
