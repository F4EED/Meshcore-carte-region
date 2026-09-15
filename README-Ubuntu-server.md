# CartoMesh sur Ubuntu Server (VM)

Ce guide decrit l’installation des prérequis sur une machine **Ubuntu Server** pour cloner, construire et servir CartoMesh (application **Vite + Leaflet**).

## A quoi sert le build, et pourquoi on parle de « site statique »

**Dans le depot**, vous avez du code source (`src/`, `index.html`, etc.) et des fichiers publics (`public/`, souvent les GeoJSON). Les visiteurs du site ne telechargent pas ce depot tel quel : il faut d’abord **generer la version livrable**.

**Commande a lancer sur la VM** (dans le dossier du projet, apres `npm ci` ou `npm install`) :

```bash
npm run build
```

**Ce que fait cette commande** : **Vite** lit la configuration du projet, compile le JavaScript, optimise les assets, et ecrit le resultat dans le dossier **`dist/`** a la racine du clone. Ce dossier contient typiquement `index.html`, des fichiers `.js` / `.css` hashes, et une copie de ce qui etait dans `public/` (par ex. `dist/geojson/*.geojson`).

**« Site statique »** signifie qu’une fois `dist/` produit, le serveur web (Nginx, etc.) **se contente d’envoyer ces fichiers** au navigateur. Il n’y a pas besoin d’un moteur Node.js qui « calcule » chaque page HTTP comme sur une application PHP classique. **Node/npm restent necessaires sur la VM pour construire et mettre a jour `dist/`** ; en production, seuls les fichiers de `dist/` sont servis (sauf si vous choisissez volontairement un mode developpement).

**Deux usages courants sur la VM** :

| Objectif | Commandes (resume) | Ce qui ecoute / sert |
|----------|--------------------|----------------------|
| **Developper / tester** sans rebuild a chaque modification | `npm run dev -- --host 0.0.0.0 --port 8000` | Le processus **Vite** (Node) sur le port 8000 |
| **Servir comme un site « fini »** (LAN ou Internet) | `npm run build` puis Nginx avec `root` = `.../dist` | **Nginx** sur le port 80 (exemple ci-dessous) |

La suite du document installe les outils, puis detaille ces deux chemins et le deploiement Nginx.

## Ce dont vous avez besoin

| Composant | Role |
|-----------|------|
| **Node.js** + **npm** | `npm install` / `npm ci`, `npm run dev`, `npm run build`, `npm run preview` |
| **Git** | **Si le projet est sur un depot** : cloner sur la VM (section 5) |
| **Git LFS** | **Si vous clonez un depot avec LFS** pour les gros GeoJSON (voir `README.install.github.md`) ; **inutile** si vous copiez le dossier deja « plein » depuis votre PC (section 5bis) |
| **Navigateur** (sur votre poste) | Tester l’app une fois le serveur ecoute sur le reseau |
| **Nginx** (optionnel) | Servir le dossier `dist/` en production sur le port 80/443 |

Il n’y a pas de base de donnees obligatoire pour CartoMesh. Pour la **production statique**, le **runtime applicatif permanent** peut se limiter a **Nginx** (ou tout autre serveur de fichiers) qui lit uniquement **`dist/`**.

---

## 1. Mise a jour du systeme

Connectez-vous en SSH sur la VM, puis :

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2. Outils de base

```bash
sudo apt install -y curl ca-certificates gnupg git
```

---

## 3. Node.js et npm (recommandation : NodeSource LTS)

CartoMesh utilise **Vite 5** ; une version **LTS recente** (par ex. **Node.js 20.x ou 22.x**) convient.

Exemple avec le depot NodeSource pour **Node 22** (adapter le numero si vous preferez la branche 20) :

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Verification :

```bash
node -v
npm -v
```

**Alternative** : installer [nvm](https://github.com/nvm-sh/nvm) si vous devez jongler entre plusieurs versions de Node sur la meme machine.

---

## 4. Git LFS (si le depot utilise LFS pour les GeoJSON)

```bash
sudo apt install -y git-lfs
git lfs install
```

Verification :

```bash
git lfs version
```

Apres un `git clone`, si le projet utilise LFS, executer dans le clone :

```bash
git lfs pull
```

---

## 5. Cloner le projet et installer les dependances

Remplacez l’URL par celle de votre depot :

```bash
git clone <URL_DU_DEPOT> cartomesh
cd cartomesh
git lfs pull
npm ci
```

*(Si vous n’avez pas de `package-lock.json` fiable, utilisez `npm install` a la place de `npm ci`.)*

---

## 5bis. Variante temporaire : projet seulement sur votre disque local (sans Git)

Utilisez ce flux **tant que le projet n’est pas encore dans un depot Git** (ou si vous preferez synchroniser a la main). Vous **ne supprimez pas** la possibilite Git : quand un depot existera, passez a la **section 5** (`git clone`, LFS si besoin).

**Idee** : les dependances npm (`node_modules`) et le build (`dist/`) sont **lourds** et **dependants de l’OS** ; on les **exclut** de l’archive et on refait **`npm ci`** puis **`npm run build`** sur la VM.

### Sur votre PC (Windows), preparer une archive

Ouvrez **PowerShell**, placez-vous dans le dossier du projet (celui qui contient `package.json`), puis creez une archive **sans** `node_modules` ni `dist` :

```powershell
cd C:\chemin\vers\cartomesh
tar -czvf $env:USERPROFILE\Desktop\cartomesh-src.tgz --exclude=node_modules --exclude=dist .
```

*(Adaptez `C:\chemin\vers\cartomesh` ; vous pouvez changer le chemin de sortie de `cartomesh-src.tgz`.)*

Verifiez que vos GeoJSON et assets sont bien presents localement sous `public\geojson\` (ou la structure attendue du projet) **avant** l’archive : ce qui n’est pas sur le disque ne partira pas sur la VM.

### Transfert vers la VM avec **WinSCP** (pratique si vous l’utilisez deja)

**Cas le plus simple (un seul fichier)** : vous avez cree `cartomesh-src.tgz` comme ci-dessus (sans `node_modules` ni `dist`).

1. Lancez **WinSCP** > **Nouvelle session** (ou **Session** > **Nouvelle session**).
2. **Protocole de fichier** : **SFTP** (le serveur Ubuntu expose en general SSH/SFTP, pas du « FTP » seul).
3. **Nom d’hote** : l’adresse IP ou le nom DNS de la VM (ex. `192.168.1.50`).
4. **Nom d’utilisateur** : compte Linux sur la VM (souvent `ubuntu`).
5. **Mot de passe** ou **fichier de cle privee** : selon ce que votre administrateur vous a fourni.
6. Enregistrez si vous voulez, puis **Connexion**.
7. Cote **local** (panneau de gauche), ouvrez le dossier ou se trouve `cartomesh-src.tgz` (ex. le Bureau).
8. Cote **distant** (panneau de droite), ouvrez le **repertoire personnel** de l’utilisateur (souvent `/home/ubuntu/` — c’est l’equivalent du `~` utilise dans les commandes SSH).
9. **Glissez-deposez** `cartomesh-src.tgz` de la gauche vers la droite et laissez le transfert se terminer.

Ensuite, sur la VM (SSH ou terminal integre WinSCP **Console** si disponible), enchainez avec la sous-section **« Sur la VM Ubuntu : deballer… »** ci-dessous (le fichier est alors dans `~/cartomesh-src.tgz`).

**Option dossier sans passer par une archive** (a utiliser avec prudence : bien exclure les gros dossiers) :

1. Creez sur le serveur distant un dossier vide, par ex. `/home/ubuntu/cartomesh` (clic droit > **Nouveau** > **Repertoire**).
2. Dans WinSCP, selectionnez le contenu de votre projet local **ou** le dossier `cartomesh`, puis **Envoyer** (ou glisser-deposer vers la droite).
3. **Avant** de valider un envoi massif : ouvrez les **parametres de transfert** (souvent un bouton **Transfert** / **Parametres** / **Reglages** selon la langue et la version — parfois accessible via **Preferences** > **Transfert** > regle par defaut **Modifier**).
4. Activez une **exclusion** de fichiers / masque du type : **`*/node_modules/*;*/dist/*`** (objectif : ne pas copier `node_modules` ni `dist` depuis Windows vers Linux). Verifiez dans l’aide WinSCP de votre version le libelle exact du champ (« masque », « fichiers a exclure », etc.).

Si l’exclusion n’est pas claire dans l’interface, preferez la methode **archive `.tgz` + glisser-deposer** : elle reproduit exactement la meme logique que `tar --exclude=...`.

### Transfert vers la VM en ligne de commande (**scp**, optionnel)

Si le **Client OpenSSH** est installe sous Windows :

```powershell
scp $env:USERPROFILE\Desktop\cartomesh-src.tgz ubuntu@IP_DE_LA_VM:~/
```

Remplacez **`ubuntu`**, **`IP_DE_LA_VM`** et le chemin du fichier par vos valeurs.

### Sur la VM Ubuntu : deballer et installer les dependances

En SSH sur la VM :

```bash
mkdir -p ~/cartomesh
tar -xzf ~/cartomesh-src.tgz -C ~/cartomesh
cd ~/cartomesh
npm ci
```

*(Comme en section 5 : si vous n’avez pas de `package-lock.json` fiable, utilisez `npm install`.)*

Ensuite, enchainez avec le **mode dev** (section 6) ou le **build + Nginx** (sections 7 et 8). Apres chaque modification sur le PC, **refaites l’archive puis le transfert** (WinSCP ou `scp`), puis sur la VM **`npm ci`** si les dependances ont change et **`npm run build`** si vous servez la production (ou seulement rebuild si seul le code a bouge et les deps sont deja a jour).

**Raccourci possible** : si **rsync** est disponible (souvent via **WSL** ou Git Bash sur le PC), une commande du type `rsync -avz --exclude=node_modules --exclude=dist ./ ubuntu@IP:~/cartomesh/` evite de recreer une archive a chaque fois ; les etapes `cd ~/cartomesh` puis `npm ci` / `npm run build` restent sur la VM.

---

## 6. Mode developpement (acces depuis le reseau)

Par defaut, Vite ecoute souvent sur `127.0.0.1`. Pour tester depuis un autre poste sur le LAN, lancez :

```bash
npm run dev -- --host 0.0.0.0 --port 8000
```

Puis ouvrez dans le navigateur : `http://<IP_DE_LA_VM>:8000/`

Arret : `Ctrl+C`.

**Pare-feu** : si `ufw` est actif, ouvrez le port choisi :

```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

---

## 7. Build de production : comment le faire, concretement

Objectif : obtenir le dossier **`dist/`** pret a etre copie ou servi par Nginx.

**Etape 1 — Se placer dans le clone du projet** (exemple : le depot est dans `~/cartomesh`) :

```bash
cd ~/cartomesh
```

*(Adaptez le chemin : la ou se trouve votre `package.json`.)*

**Etape 2 — Verifier que les dependances sont installees** (une fois par machine / apres mise a jour des deps) :

```bash
npm ci
```

*(Ou `npm install` si vous n’utilisez pas `package-lock.json` de maniere stricte.)*

**Etape 3 — Lancer le build** :

```bash
npm run build
```

La commande doit se terminer **sans erreur**. En cas d’erreur, lire le message dans le terminal (fichier manquant, memoire, etc.).

**Etape 4 — Verifier que `dist/` existe et contient l’essentiel** :

```bash
ls -la dist/
ls -la dist/geojson/
```

Vous devez voir au minimum **`dist/index.html`**. Si le projet embarque des couches dans `public/geojson/`, vous devez voir les memes noms (ou equivalents) sous **`dist/geojson/`**.

### Etape 5 — Choisir comment servir ce dossier

- **Option A — Test rapide du build** (toujours avec Node, utile avant de configurer Nginx) : lancez le serveur de preview Vite, accessible sur le reseau :

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Puis dans un navigateur : `http://<IP_DE_LA_VM>:4173/`  
Arret : `Ctrl+C`. Si **ufw** est actif : `sudo ufw allow 4173/tcp` puis `sudo ufw reload`.

- **Option B — Production avec Nginx** : ne pas laisser `preview` tourner en permanence ; configurez Nginx pour que **`root`** pointe vers le chemin **absolu** du dossier `dist/` (voir section 8). Apres chaque modification du code sur la VM, **repetez les etapes 3 et 4** (`npm run build`, verifier `dist/`) ; les fichiers dans `dist/` sont remplaces : **pas besoin de redemarrer Nginx** pour que les nouveaux fichiers statiques soient pris en compte (rechargement navigateur / cache eventuellement a vider).

---

## 8. Nginx (servir `dist/` en HTTP)

Installation :

```bash
sudo apt install -y nginx
```

**Prerequis** : vous avez deja execute `npm run build` au moins une fois ; le dossier `dist/` existe (voir section 7). Si `readlink -f .../dist` echoue, le dossier n’existe pas encore : retournez a la section 7.

Verifier le **chemin absolu** de `dist/` (exemple : clone dans `~/cartomesh` ; adaptez si besoin) :

```bash
readlink -f ~/cartomesh/dist
```

La commande suivante **ecrit la config Nginx** en injectant ce chemin dans la directive `root` (variable shell `DIST_PATH`). Les `\$uri` sont des echappements pour que le shell laisse les variables **`$uri`** a Nginx.

```bash
DIST_PATH="$(readlink -f ~/cartomesh/dist)"
sudo tee /etc/nginx/sites-available/cartomesh >/dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root $DIST_PATH;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/cartomesh /etc/nginx/sites-enabled/cartomesh
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

**Site toujours accessible** : Nginx tourne en **service** (`systemd`). Verifier avec `sudo systemctl status nginx`. Apres un reboot de la VM, le site reste sur le **port 80** sans relancer `npm run preview`. Si un **`npm run preview`** etait encore actif, arretez-le (`Ctrl+C`) pour eviter la confusion entre le port 4173 et le port 80.

Pare-feu HTTP :

```bash
sudo ufw allow 'Nginx Full'
# ou seulement HTTP :
# sudo ufw allow 'Nginx HTTP'
sudo ufw reload
```

Apres chaque `npm run build` sur la VM, le contenu de `dist/` est a jour ; aucun redemarrage Nginx n’est necessaire pour des fichiers statiques.

**HTTPS** : utilisez en general **Let’s Encrypt** (`certbot` avec le plugin nginx) une fois un **nom de domaine** pointe vers la VM ; sans DNS public, restez en HTTP interne ou tunnel (Cloudflare Tunnel, etc.) selon votre infrastructure.

---

## 9. Depannage rapide

| Probleme | Piste |
|----------|--------|
| `npm` / `node` introuvable | Verifier le PATH ; rouvrir la session SSH apres installation NodeSource. |
| GeoJSON manquants apres clone | `git lfs pull` ; verifier que `public/geojson/` contient les fichiers attendus. |
| Page blanche ou 404 au refresh | Verifier `try_files ... /index.html` dans Nginx (SPA). |
| Impossible d’acceder au port depuis l’exterieur | `ufw`, groupe de securite du cloud, ou regles du pare-feu du serveur hote. |

---

## Liens utiles dans ce depot

- Index documentation : `docs/INDEX.md`
- Lancement local general : `README.md`
- Guide utilisateur interface : `docs/USAGE.md`
- Architecture technique : `docs/ARCHITECTURE.md`
- Serveur web existant (Nginx/Apache/IIS/FTP) : `README.install.webserver.md`
- Deploiement GitHub + Cloudflare Pages : `README.install.github.md`
- Suivi des changements : `docs/CHANGELOG.md`
- Routine doc : `docs/MAINTENANCE.md`
