# Installer CartoMesh sur un serveur web existant

Ce guide explique **pas a pas** comment publier CartoMesh sur un **serveur web deja en place** (Nginx, Apache, IIS, Caddy, hebergement mutualise avec FTP, etc.).

Hypotheses:

- le serveur HTTP tourne deja (site, vhost ou dossier web existant) ;
- vous n’avez **pas** besoin d’installer Node.js **sur le serveur de production** si vous construisez `dist/` ailleurs ;
- CartoMesh est un **site statique** : on depose le contenu de `dist/` et on le sert comme des fichiers.

Guides proches (autres scenarios):

| Scenario | Document |
|----------|----------|
| VM Ubuntu a configurer from scratch (Node + Nginx) | `README-Ubuntu-server.md` |
| GitHub + Cloudflare Pages | `README.install.github.md` |
| Lancement local developpeur | `README.md` |

---

## 0. Ce que vous allez obtenir

Apres installation, le navigateur doit pouvoir charger:

- `https://votredomaine.exemple/` (ou un sous-chemin, voir section 6) → `index.html`
- `https://votredomaine.exemple/geojson/C_Europe.geojson`
- `https://votredomaine.exemple/geojson/C_FR_Region.geojson`
- `https://votredomaine.exemple/geojson/C_FR_Departement.geojson`
- les assets JS/CSS sous `/assets/...`

Espace disque: prevoir **au moins ~400 Mo** libres pour les GeoJSON (Region ~140 Mo, Departement ~190 Mo).

---

## 1. Preparatifs cote machine de build (PC ou CI)

Sur une machine avec **Node.js** et **npm** (pas forcement le serveur web):

### 1.1 Recuperer le projet

**Option A — Git (recommandee si depot disponible):**

```bash
git clone <URL_DU_DEPOT> cartomesh
cd cartomesh
git lfs install
git lfs pull
```

**Option B — Copie locale:** dossier projet deja present (ex. `C:\cartomesh`), avec `public/geojson/` rempli.

### 1.2 Verifier les GeoJSON sources

Les fichiers suivants doivent exister **avant** le build:

- `public/geojson/C_Europe.geojson`
- `public/geojson/C_FR_Region.geojson`
- `public/geojson/C_FR_Departement.geojson`

### 1.3 Installer les dependances et construire

```bash
npm ci
npm run build
```

*(Si `npm ci` echoue faute de lockfile fiable: `npm install` puis `npm run build`.)*

### 1.4 Controler le resultat

Dans `dist/` vous devez voir au minimum:

```text
dist/
  index.html
  assets/          (fichiers .js / .css hashes)
  geojson/
    C_Europe.geojson
    C_FR_Region.geojson
    C_FR_Departement.geojson
  _redirects       (utile surtout Cloudflare ; inoffensif ailleurs)
```

Verification rapide:

```bash
# Linux / macOS / Git Bash
ls -la dist/
ls -la dist/geojson/
```

```powershell
# Windows PowerShell
Get-ChildItem dist
Get-ChildItem dist\geojson
```

**Seul le contenu de `dist/`** doit etre copie sur le serveur web. Ne copiez pas `node_modules/`, `src/`, ni le depot entier sauf besoin de rebuild sur place.

---

## 2. Choisir l’emplacement sur le serveur existant

Decidez **ou** le site sera servi:

| Cas | Exemple de dossier cible |
|-----|--------------------------|
| Nouveau site / vhost dedie | `/var/www/cartomesh/` ou `C:\inetpub\wwwroot\cartomesh\` |
| Sous-dossier d’un site existant | `/var/www/monsite/cartomesh/` → URL `https://monsite/cartomesh/` |
| Remplacement d’un site deja pointe vers un `DocumentRoot` | le `DocumentRoot` / `root` actuel |

Notez le **chemin absolu** (ex. `/var/www/cartomesh`) et l’**URL publique** (ex. `https://mesh.exemple.org/`).

---

## 3. Transferer `dist/` vers le serveur

### 3.1 Methode SFTP / WinSCP / FileZilla (courante)

1. Connectez-vous en **SFTP** (ou FTPS selon l’hebergeur) au serveur.
2. Ouvrez le dossier cible (ex. `/var/www/cartomesh`).
3. Copiez **le contenu** de `dist/` (pas forcement le dossier `dist` lui-meme):
   - `index.html`
   - `assets/`
   - `geojson/`
   - `_redirects` (optionnel)
4. Attendez la fin du transfert des gros GeoJSON (plusieurs minutes possibles).

Astuce: archiver avant envoi pour un seul fichier, puis decompressor sur le serveur:

```powershell
# Sur le PC (depuis la racine du projet)
tar -czvf $env:USERPROFILE\Desktop\cartomesh-dist.tgz -C dist .
```

```bash
# Sur le serveur
sudo mkdir -p /var/www/cartomesh
sudo tar -xzf ~/cartomesh-dist.tgz -C /var/www/cartomesh
```

### 3.2 Methode scp / rsync

```bash
# Depuis la machine de build
scp -r dist/* utilisateur@IP_OU_HOTE:/var/www/cartomesh/
# ou
rsync -avz --delete dist/ utilisateur@IP_OU_HOTE:/var/www/cartomesh/
```

`--delete` synchronise en supprimant sur le serveur les anciens fichiers absents du nouveau build (utile apres rebuild).

### 3.3 Droits fichiers (Linux)

Adaptez l’utilisateur du serveur web (`www-data`, `nginx`, `apache`, …):

```bash
sudo chown -R www-data:www-data /var/www/cartomesh
sudo find /var/www/cartomesh -type d -exec chmod 755 {} \;
sudo find /var/www/cartomesh -type f -exec chmod 644 {} \;
```

---

## 4. Configurer le serveur web existant

Objectif commun a tous les serveurs:

1. `root` / `DocumentRoot` / repertoire virtuel = dossier ou se trouve `index.html` (contenu de `dist/`).
2. Fichier par defaut: `index.html`.
3. Fallback SPA (recommandé): si une URL n’est pas un fichier, renvoyer `index.html`.
4. Servir correctement les `.geojson` (type MIME `application/geo+json` ou `application/json`).

### 4.1 Nginx (site / vhost deja present)

**Variante A — vhost dedie** (nouveau `server` ou remplacement du `root`):

```nginx
server {
    listen 80;
    server_name mesh.exemple.org;

    root /var/www/cartomesh;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # GeoJSON volumineux: timeouts / buffers optionnels si reverse-proxy
    location /geojson/ {
        try_files $uri =404;
    }
}
```

Puis:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Variante B — sous-chemin sur un site existant** (ex. `/cartomesh/`):

```nginx
location /cartomesh/ {
    alias /var/www/cartomesh/;
    index index.html;
    try_files $uri $uri/ /cartomesh/index.html;
}
```

Attention sous-chemin: voir **section 6** (Vite `base`).

### 4.2 Apache (site deja present)

Activez si besoin `mod_rewrite` et autorisez les `.htaccess`, ou placez les regles dans le vhost.

Fichier `.htaccess` a la racine du depot web (a cote de `index.html`):

```apache
Options -MultiViews
RewriteEngine On

# Ne pas reecrire les fichiers / dossiers existants
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

Fragment de vhost:

```apache
<VirtualHost *:80>
    ServerName mesh.exemple.org
    DocumentRoot /var/www/cartomesh

    <Directory /var/www/cartomesh>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

MIME GeoJSON (si le navigateur ou un proxy est strict):

```apache
AddType application/geo+json .geojson
```

Recharger Apache:

```bash
sudo apachectl configtest
sudo systemctl reload apache2
# ou: sudo systemctl reload httpd
```

### 4.3 IIS (Windows Server existant)

1. Ouvrir **Gestionnaire IIS** → site existant ou nouveau site.
2. **Chemin physique** = dossier contenant `index.html` (contenu de `dist/`).
3. Document par defaut: ajouter `index.html` en tete de liste.
4. Installer / activer **URL Rewrite** si besoin du fallback SPA.
5. Exemple `web.config` a la racine du site:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <remove fileExtension=".geojson" />
      <mimeMap fileExtension=".geojson" mimeType="application/geo+json" />
    </staticContent>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 4.4 Caddy (exemple)

```caddy
mesh.exemple.org {
    root * /var/www/cartomesh
    encode gzip
    try_files {path} /index.html
    file_server
}
```

### 4.5 Hebergement mutualise (FTP uniquement)

1. Buildez `dist/` en local.
2. Uploadez le contenu de `dist/` vers `public_html/`, `www/` ou le sous-dossier prevu.
3. Si l’hebergeur est Apache, deposez aussi le `.htaccess` de la section 4.2.
4. Verifiez les quotas disque (GeoJSON lourds).

---

## 5. HTTPS, pare-feu, reverse-proxy

Sur un serveur **deja** en production:

- **HTTPS**: conservez le certificat existant (Let’s Encrypt / panneau hebergeur). Pointez le vhost TLS vers le meme `root`.
- **Reverse-proxy** (Nginx devant Apache, Traefik, etc.): augmentez si besoin `proxy_read_timeout` et la taille des reponses pour `/geojson/`.
- **Pare-feu**: ports 80/443 deja ouverts en general ; rien de specifique a Node en production (Node n’ecoute pas).

---

## 6. Installation dans un sous-chemin (`/cartomesh/`)

Par defaut, Vite suppose que l’app est a la **racine** du domaine (`/`).

Si l’URL publique est `https://exemple.org/cartomesh/`:

1. Creez ou editez `vite.config.js` a la racine du projet:

    ```js
    import { defineConfig } from 'vite';

    export default defineConfig({
      base: '/cartomesh/'
    });
    ```

2. Relancez `npm run build`.
3. Deposez `dist/` dans le dossier mappe a `/cartomesh/`.
4. Adaptez la config serveur (alias / location) en consequence.

Sans cette etape, les chemins `/assets/...` et `/geojson/...` pointeront vers la racine du domaine et echoueront (404).

---

## 7. Verification pas a pas

1. Ouvrir l’URL du site (HTTP ou HTTPS).
2. La page **Gaulix - CartoMesh** s’affiche (carte + panneau Outils).
3. Ouvrir les outils developpeur → onglet **Network**.
4. Activer **Meshcore** dans l’UI.
5. Verifier le statut HTTP **200** pour:
   - `/geojson/C_Europe.geojson`
   - `/geojson/C_FR_Region.geojson`
   - (apres zoom >= 8) `/geojson/C_FR_Departement.geojson`
6. Cliquer sur la carte: le panneau **Infos au clic** se remplit.
7. Tester un **rafraichissement** (F5) sur l’URL: pas d’erreur 404 grâce au fallback SPA.

Si un GeoJSON est en 404: le fichier n’est pas au bon endroit relatif a `index.html`, ou le transfert a ete tronque.

Si la page est blanche: regarder la console (chemins `base` incorrects, Leaflet CDN bloque, etc.).

---

## 8. Mettre a jour le site plus tard

A chaque nouvelle version:

1. Sur la machine de build: `git pull` (et `git lfs pull` si besoin) puis `npm ci` / `npm install` puis `npm run build`.
2. Re-synchroniser le contenu de `dist/` vers le dossier web (`rsync --delete`, WinSCP, FTP, …).
3. **Pas besoin** de redemarrer Nginx/Apache/IIS pour des fichiers purement statiques (vider le cache navigateur / CDN si present).

---

## 9. Depannage rapide

| Symptome | Piste |
|----------|--------|
| 404 sur `/geojson/*.geojson` | Contenu de `dist/geojson/` non copie ; mauvais `root` ; sous-chemin sans `base` Vite |
| Page blanche | Mauvais `base` ; erreurs JS console ; CDN Leaflet inaccessible |
| 404 au refresh d’une URL | Fallback SPA manquant (`try_files` / `RewriteRule` / URL Rewrite) |
| GeoJSON tres lents | Bande passante ; activer gzip/brotli si le serveur le permet ; CDN devant les gros fichiers |
| Permission denied | `chown` / ACL du user du serveur web |
| Build local OK, prod incomplete | Transfert interrompu (fichiers > 100 Mo) ; reessayer archive `.tgz` |

---

## 10. Checklist resumee

- [ ] `npm run build` produit `dist/index.html` + `dist/geojson/*.geojson`
- [ ] Contenu de `dist/` copie sur le serveur
- [ ] `root` / DocumentRoot pointe vers ce dossier
- [ ] Fallback SPA configure
- [ ] MIME `.geojson` OK (si requis)
- [ ] URL de test charge la carte et les GeoJSON en 200
- [ ] (Optionnel) HTTPS et sous-chemin `base` valides

---

## Liens utiles

- Index doc: `docs/INDEX.md`
- Architecture (pourquoi site statique): `docs/ARCHITECTURE.md`
- Usage interface: `docs/USAGE.md`
- VM Ubuntu complete: `README-Ubuntu-server.md`
- Cloudflare Pages: `README.install.github.md`
