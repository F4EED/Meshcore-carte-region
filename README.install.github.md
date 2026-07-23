# Installation / Deploiement via GitHub + Cloudflare Pages (Windows, sans nom de domaine)

Ce guide explique la procedure complete pour publier CartoMesh sur Internet en utilisant:

- un depot **GitHub** (code source)
- un site **Cloudflare Pages** (hebergement)
- **GitHub Actions** (build + deploy)

Contexte du projet:

- Le projet est un **site statique** (Vite).
- Le build genere un dossier `dist/` publie tel quel.
- Les GeoJSON sont servis comme fichiers statiques sous `geojson/*.geojson` (copie depuis `public/geojson/` vers `dist/geojson/`).

## Point critique: taille des GeoJSON (GitHub)

Dans ce projet, certains fichiers `*.geojson` sont tres gros (plus de 100 Mo).
GitHub bloque les push de fichiers > 100 Mo si tu n’utilises pas Git LFS.

Donc tu as 2 options:

- Option 1 (recommandee): **Git LFS** pour versionner les GeoJSON dans GitHub, puis **GitHub Actions** pour builder et deployer sur Cloudflare Pages.
- Option 2: ne pas versionner les gros GeoJSON dans GitHub et les heberger ailleurs (S3/CDN/R2) puis les telecharger au runtime (pas couvert ici car tu as demande "GeoJSON inclus dans le build").

La suite du guide part sur **Git LFS**.

## A. Prerequis (sur ton PC Windows)

1. Installer:

- Node.js (inclut npm)
- Git pour Windows
- Git LFS

Verifier dans un terminal (PowerShell ou CMD):

```bash
node -v
npm -v
git --version
git lfs version
```

1. Initialiser Git LFS (a faire une fois sur la machine):

```bash
git lfs install
```

## B. Preparation du projet (GeoJSON dans le build)

Dans ce projet, les GeoJSON doivent etre dans `public/geojson/` pour etre copies automatiquement dans `dist/geojson/` au build.

Verifier:

- `public/geojson/C_Europe.geojson`
- `public/geojson/C_FR_Region.geojson`
- `public/geojson/C_FR_Departement.geojson`

Tester un build local:

```bash
npm ci
npm run build
```

Verifier que les fichiers existent bien apres build:

- `dist/geojson/C_Europe.geojson`
- `dist/geojson/C_FR_Region.geojson`
- `dist/geojson/C_FR_Departement.geojson`

## C. Creer le depot GitHub

1. Sur GitHub:

- New repository
- Nom exemple: `cartomesh`
- Public ou Private (au choix)

1. Dans le dossier du projet (`C:\cartomesh`):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_DU_REPO_GITHUB>
```

Ne pousse pas tout de suite si tes gros `*.geojson` ne sont pas encore sous LFS.

## D. Activer Git LFS pour les GeoJSON (obligatoire ici)

1. Dire a Git LFS de gerer les GeoJSON:

```bash
git lfs track "*.geojson"
```

1. Verifier que `.gitattributes` a ete cree/modifie, puis committer:

```bash
git add .gitattributes
git commit -m "Configure Git LFS for GeoJSON"
```

1. Ajouter (ou re-ajouter) les fichiers GeoJSON apres activation LFS, puis committer:

```bash
git add public/geojson/*.geojson
git commit -m "Add GeoJSON assets (LFS)"
```

1. Push vers GitHub:

```bash
git push -u origin main
```

Si GitHub refuse encore (rare), verifie que les fichiers sont bien "LFS" avec:

```bash
git lfs ls-files
```

## E. Creer le projet Cloudflare Pages

Cloudflare Pages ne recupere pas nativement les fichiers Git LFS via l'integration Git. Pour un projet comme celui-ci, le plus fiable est:

- GitHub Actions fait le checkout du repo **avec LFS**
- GitHub Actions build le projet
- GitHub Actions deploy `dist/` sur Cloudflare Pages via Wrangler (direct upload)

1. Dans Cloudflare -> Pages:
   - Create a project (Pages)
   - Donner un **Project name** (ex: `cartomesh`)

2. Dans GitHub -> repo -> Settings -> Secrets and variables -> Actions:
   - Ajouter le secret `CLOUDFLARE_API_TOKEN`
   - Ajouter le secret `CLOUDFLARE_ACCOUNT_ID`
   - Ajouter une variable de repo `CF_PAGES_PROJECT_NAME` = le Project name Pages (ex: `cartomesh`)

3. Le repo contient deja un workflow GitHub Actions:
   - `.github/workflows/deploy-cloudflare-pages.yml`

4. Declencher un deploy:
   - pousser sur la branche `main`
   - puis verifier l'onglet Actions

SPA fallback:

- Le fallback SPA est gere via `public/_redirects`.

## F. Tester le site deploie

1. Ouvrir l’URL Cloudflare Pages (du style `https://<project>.pages.dev`).
1. Ouvrir les outils dev du navigateur -> onglet Network.
1. Verifier que ces URLs repondent en 200:

- `/geojson/C_Europe.geojson`
- `/geojson/C_FR_Region.geojson`
- `/geojson/C_FR_Departement.geojson`

## Depannage (les cas les plus frequents)

### 1) Build OK mais les GeoJSON ne chargent pas (404)

- Verifie que les fichiers sont bien dans `public/geojson/` dans le repo.
- Verifie que `npm run build` produit `dist/geojson/`.
- Verifie que tu as bien commit + push `public/geojson/*` (et que LFS a bien telecharge les objets).
- Sur le site deploye, teste directement `/geojson/C_Europe.geojson` (etc.).

### 2) Cloudflare Pages ne contient pas les GeoJSON (deploy incomplet)

- Verifie que le workflow fait bien `actions/checkout` avec `lfs: true`.
- Verifie que les secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` sont presents.
- Verifie que la variable `CF_PAGES_PROJECT_NAME` est definie.
- Regarde les logs GitHub Actions: tu dois voir `npm run build` puis `wrangler pages deploy`.

### 3) Le push GitHub est refuse (fichier > 100MB)

- Assure-toi que `git lfs track "*.geojson"` a ete fait AVANT le commit des fichiers.
- Verifie avec `git lfs ls-files`.
- Sans `.gitattributes` LFS, GitHub refuse les fichiers > 100 Mo.

## Notes de securite / cout

- Publier en Public rend le code et les donnees accessibles publiquement (au choix).
- Les GeoJSON tres volumineux peuvent rallonger les temps de build/deploy et le chargement client.
- Tailles actuelles approx.: Europe ~1 Mo, Region FR ~140 Mo, Departement FR ~190 Mo.

## Liens utiles dans ce depot

- Index documentation: `docs/INDEX.md`
- Lancement local: `README.md`
- Architecture / pourquoi Actions + LFS: `docs/ARCHITECTURE.md`
- Serveur web existant (sans Cloudflare): `README.install.webserver.md`
- VM Ubuntu (alternative self-host): `README-Ubuntu-server.md`
- Changelog: `docs/CHANGELOG.md`
