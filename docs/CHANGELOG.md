# Changelog CartoMesh

Ce fichier trace les changements importants du projet.

## 2026-07-23 - Infra

- Type: Infra
- Fichiers: `.gitignore`, `.gitattributes`, `LICENSE`, depot GitHub `F4EED/Meshcore-carte-region`
- Impact utilisateur: projet versionne sur GitHub avec **Git LFS** pour les `*.geojson` ; doublon local `geojson/` ignore au profit de `public/geojson/`.
- Verification: `git lfs ls-files` liste les GeoJSON ; le depot distant contient le code et la doc.

## 2026-07-23 - Docs (3)

- Type: Docs
- Fichiers: `.markdownlint.json`, `README-Ubuntu-server.md`, `README.install.webserver.md`, `docs/CHANGELOG.md`
- Impact utilisateur: suppression des diagnostics markdownlint (~75 sur le guide Ubuntu, 324 au total) via config projet adaptee a la doc technique, plus correctifs locaux (titre etape 5, liste sous-chemin).
- Verification: `npx markdownlint-cli2 "**/*.md" "#node_modules"` affiche `Summary: 0 issues`.

## 2026-07-23 - Docs (2)

- Type: Docs
- Fichiers: `README.install.webserver.md`, `README.md`, `README-Ubuntu-server.md`, `README.install.github.md`, `docs/INDEX.md`, `docs/MAINTENANCE.md`, `docs/CHANGELOG.md`, `.cursor/rules/documentation-routine.mdc`
- Impact utilisateur: nouveau guide pas a pas pour installer CartoMesh sur un **serveur web existant** (build `dist/`, transfert, Nginx/Apache/IIS/Caddy/FTP, sous-chemin, checklist).
- Verification: ouvrir `README.install.webserver.md` et suivre la checklist de la section 10 ; confirmer le lien depuis `docs/INDEX.md`.

## 2026-07-23 - Docs

- Type: Docs
- Fichiers: `README.md`, `README-Ubuntu-server.md`, `README.install.github.md`, `docs/INDEX.md`, `docs/USAGE.md`, `docs/ARCHITECTURE.md`, `docs/MAINTENANCE.md`, `docs/CHANGELOG.md`, `.cursor/rules/documentation-routine.mdc`
- Impact utilisateur: documentation alignee sur l'app actuelle (Gaulix / ports / Meshcore), index central, guide d'usage et architecture ajoutes; guides Ubuntu et GitHub relinkes; depannage Netlify retire au profit de Cloudflare/Pages.
- Verification: ouvrir `docs/INDEX.md`, suivre les liens, lancer `npm run dev` puis comparer le parcours avec `docs/USAGE.md`.

## 2026-05-04 - Docs (5)

- Type: Docs
- Fichiers: `README-Ubuntu-server.md`, `docs/CHANGELOG.md`
- Impact utilisateur: section **Nginx** completee (`systemctl enable nginx`, rappel **service permanent** vs `preview`, port **80**).
- Verification: `sudo systemctl status nginx` puis `http://<IP>/` sans port.

## 2026-05-04 - Docs (4)

- Type: Docs
- Fichiers: `README-Ubuntu-server.md`, `docs/CHANGELOG.md`
- Impact utilisateur: la variante **5bis** detaille le transfert avec **WinSCP** (SFTP, depot de `cartomesh-src.tgz`, option envoi de dossier avec masque d’exclusion) et garde **scp** en option.
- Verification: deposer une archive via WinSCP puis `tar -xzf` + `npm ci` sur la VM.

## 2026-05-04 - Docs (3)

- Type: Docs
- Fichiers: `README-Ubuntu-server.md`, `docs/CHANGELOG.md`
- Impact utilisateur: ajout de la **section 5bis** (projet uniquement en local, transfert **tar** + **scp**, exclusions `node_modules`/`dist`, option **rsync**) sans retirer le flux **Git** (section 5) ; tableau des prérequis ajuste (Git / LFS contextualises).
- Verification: suivre 5bis depuis un dossier Windows sans depot Git, puis `npm run build` sur la VM.

## 2026-05-04 - Docs (2)

- Type: Docs
- Fichiers: `README-Ubuntu-server.md`, `docs/CHANGELOG.md`
- Impact utilisateur: le guide Ubuntu explicite le sens du **build** / **site statique**, le flux dev vs production, les etapes concretes de `npm run build` + verification de `dist/`, et une config Nginx avec **chemin absolu** injecte via `DIST_PATH`.
- Verification: relire les sections « A quoi sert le build » et « Build de production » ; tester le bloc `DIST_PATH` + `sudo nginx -t` sur une VM.

## 2026-05-04 - Docs

- Type: Docs
- Fichiers: `README-Ubuntu-server.md`, `README.md`, `docs/CHANGELOG.md`
- Impact utilisateur: guide d’installation des prérequis sur une VM **Ubuntu Server** (Node.js, npm, Git, Git LFS, dev Vite, build, Nginx optionnel) et lien depuis le README principal.
- Verification: ouvrir `README-Ubuntu-server.md` et suivre les commandes sur une VM de test (versions `node -v` / `npm -v` coherentes).

## 2026-04-28 - Correction (14)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: le bouton Afficher/Masquer de la section "Configuration répéteur" est remplace par un toggle gris/vert homogene avec les controles de la fenetre Outils.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier le switch gris/vert "Afficher/Masquer" dans "Infos au clic (Meshcore)" et son comportement.

## 2026-04-28 - Correction (13)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: dans "Infos au clic (Meshcore)", la section "Configuration répéteur" est masquee par defaut et un bouton toggle permet maintenant de l'afficher/masquer sans quitter la fenetre.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier que seul le bouton "Afficher" apparait initialement; cliquer dessus pour afficher la configuration puis "Masquer" pour la recacher.

## 2026-04-28 - Correction (12)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: ajustement fin des epaisseurs de contour (Pays 6.2, Region 4.2, Departement 2.2) pour renforcer la lisibilite en superposition.
- Verification: activer `Meshcore`, afficher les limites, puis verifier visuellement les nouvelles epaisseurs pour les trois niveaux.

## 2026-04-28 - Correction (11)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: l'epaisseur du contour Pays est augmentee, et celle du contour Departement est reduite pour renforcer la hierarchie visuelle.
- Verification: activer `Meshcore`, afficher les limites, puis verifier visuellement que Pays est plus epais et Departement plus fin qu'avant.

## 2026-04-28 - Correction (10)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le resume textuel "Vous avez cliqué sur ..." est temporairement masque dans la fenetre "Infos au clic (Meshcore)".
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier l'absence de la phrase "Vous avez cliqué sur ..." dans le panneau.

## 2026-04-28 - Correction (9)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la section "Configuration répéteur" applique maintenant le meme filtrage que le panneau d'infos (suppression des valeurs inconnues), et n'affiche plus de lignes `fr-inconnu`.
- Verification: activer `Meshcore`, cliquer sur une zone partielle, puis verifier que la configuration n'affiche que des codes valides et masque les valeurs inconnues.

## 2026-04-28 - Correction (8)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: dans "Infos au clic (Meshcore)", les lignes contenant `Aucun objet` ou `fr-inconnu` sont maintenant masquees pour ne garder que les informations pertinentes.
- Verification: activer `Meshcore`, cliquer sur des zones partielles, puis verifier qu'aucune ligne "Aucun objet" ou "fr-inconnu" n'apparait.

## 2026-04-28 - Correction (7)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: dans "Infos au clic (Meshcore)", les informations Pays/Region/Departement sont maintenant affichees sur plusieurs lignes (retour chariot) au lieu d'un separateur `|`.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier que Pays, Region et Departement s'affichent chacun sur une ligne distincte.

## 2026-04-28 - Correction (6)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: suppression de la redondance dans la ligne Region du panneau "Infos au clic (Meshcore)" et renommage du titre en "Configuration répéteur".
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier l'affichage `region : ...` sans prefixe duplique et le titre "Configuration répéteur".

## 2026-04-28 - Correction (5)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le champ Region dans "Infos au clic (Meshcore)" suit maintenant le format `region : nom_officiel (Region_gaulix_MC)` quand les deux valeurs sont disponibles.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier la ligne Region (exemple: `region : Bretagne (fr-bre)`).

## 2026-04-28 - Correction (4)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: dans "Infos au clic (Meshcore)", le libelle du pays utilise maintenant le format `DPAY_L_LIB : pays` quand les deux champs sont disponibles.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier que la partie "Pays" affiche une valeur du type `France : fr`.

## 2026-04-28 - Correction (3)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la fenetre "Infos au clic (Meshcore)" reaffiche le texte explicatif des niveaux selectionnes (pays, region, departement) en plus du resume et de la configuration repeteur.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier la presence des 3 lignes de contexte geographique dans le panneau d'infos.

## 2026-04-28 - Correction (2)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le libelle du panneau est renomme en "Configuration repeteur" pour correspondre au nouveau vocabulaire.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier que le titre affiche "Configuration repeteur".

## 2026-04-28 - Correction

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: un clic sur la carte avec `Meshcore` actif met maintenant en surbrillance les zones selectionnees (pays, region et departement) en plus du marqueur et du panneau d'information.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier l'affichage simultane des surbrillances sur les 3 niveaux quand les donnees sont disponibles.

## 2026-04-28 - Infra

- Type: Infra
- Fichiers: `public/geojson/*`, `public/_redirects`, `README.md`, `.github/workflows/deploy-cloudflare-pages.yml`
- Impact utilisateur: deploiement simplifie sur Cloudflare Pages (sans nom de domaine) via GitHub Actions (build + direct upload), avec GeoJSON inclus dans le build et fallback SPA.
- Verification: `npm run build` puis verifier la presence de `dist/geojson/*.geojson`, puis verifier un deploy Cloudflare Pages et le chargement des couches.

## 2026-04-28 - Docs

- Type: Docs
- Fichiers: `README.install.github.md`
- Impact utilisateur: procedure pas-a-pas pour publier le projet via GitHub + Cloudflare Pages (GitHub Actions + Wrangler), avec prise en compte de Git LFS pour les gros GeoJSON.
- Verification: suivre le guide et confirmer qu’un deploy Cloudflare Pages charge bien `/geojson/*.geojson`.

## 2026-04-27 - Ajout

- Type: Ajout
- Fichiers: `start.bat`, `stop.bat`, `start.ps1`, `stop.ps1`, `README.md`
- Impact utilisateur: lancement et arret simplifies du projet en local sous Windows via scripts batch/PowerShell, sans gerer manuellement les processus; logs disponibles dans des fichiers dedies.
- Verification: lancer `start.bat`, verifier l'acces a `http://localhost:5173/`, puis lancer `stop.bat` et verifier l'arret du serveur.

## 2026-04-26 - Docs

- Type: Docs
- Fichiers: `README.md`, `docs/MAINTENANCE.md`, `docs/CHANGELOG.md`
- Impact utilisateur: ajout d'une documentation de base et d'un processus de mise a jour continue.
- Verification: la procedure de lancement (`npm run dev -- --port 8000`) est documentee.

## 2026-04-26 - Docs (2)

- Type: Docs
- Fichiers: `.cursor/rules/documentation-routine.mdc`
- Impact utilisateur: activation d'une routine automatique pour imposer la mise a jour de la documentation a chaque changement de code.
- Verification: la regle existe dans `.cursor/rules/` avec `alwaysApply: true`.

## 2026-04-26 - Correction

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la configuration repeteur generee au clic suit maintenant la sequence attendue avec 3 lignes `region put` (pays, region meshcore, departement meshcore) puis 3 lignes `region allowf`, avant `region save`.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier dans le panneau "Configuration repeteur" la presence des 7 lignes dans l'ordre.

## 2026-04-26 - Correction (2)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la popup de configuration respecte mieux les retours chariot et adapte mieux sa largeur au texte affiche, avec echappement HTML securise.
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier que chaque commande apparait sur sa propre ligne dans la popup.

## 2026-04-26 - Correction (3)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la valeur `<pays>` utilisee dans la configuration repeteur est maintenant prise en priorite depuis le champ `pays` de `C_Europe.geojson`.
- Verification: activer `Meshcore`, cliquer sur la carte, puis verifier que la premiere ligne est `region put <pays>` avec la valeur issue de la couche Europe.

## 2026-04-26 - Ajout

- Type: Ajout
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: chaque GeoJSON charge dispose maintenant d'un mini toggle "Contour" dans la liste de statut pour afficher/masquer son contour individuellement.
- Verification: activer `Meshcore`, attendre le statut "charge", puis basculer les toggles "Contour" et verifier l'affichage/masquage independant des contours.

## 2026-04-26 - Correction (4)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le libelle du mini toggle est renomme en "afficher les limites" pour etre plus explicite.
- Verification: dans "GeoJSON charges", verifier que chaque ligne affiche le texte "afficher les limites".

## 2026-04-26 - Correction (5)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: harmonisation du libelle UI en "Afficher les limites" (majuscule initiale).
- Verification: verifier dans "GeoJSON charges" que le toggle affiche "Afficher les limites".

## 2026-04-26 - Correction (6)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: le controle "Afficher les limites" utilise maintenant le meme style de switch que `Meshcore` et les contours GeoJSON sont plus visibles (epaisseur/opacite renforcees, remise au premier plan).
- Verification: avec `Meshcore` actif, basculer un switch "Afficher les limites" puis verifier l'affichage net du contour correspondant.

## 2026-04-26 - Correction (7)

- Type: Correction
- Fichiers: `src/style.css`
- Impact utilisateur: la fenetre "Outils" adapte maintenant automatiquement sa largeur au texte present (au lieu d'une largeur fixe), avec bornes min/max pour rester lisible.
- Verification: verifier que la largeur de la fenetre "Outils" s'ajuste au contenu et reste stable a differentes tailles d'ecran.

## 2026-04-26 - Correction (8)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: les 3 toggles "Afficher les limites" (Europe, Region, Departement) sont maintenant desactives par defaut.
- Verification: recharger l'application, activer `Meshcore`, puis verifier que les trois toggles sont initialement non coches.

## 2026-04-26 - Correction (9)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: les toggles "Afficher les limites" sont maintenant grises et inactifs tant que `Meshcore` est desactive (et tant qu'une couche n'est pas chargee).
- Verification: verifier que les toggles sont grises quand `Meshcore` est OFF, puis actifs quand `Meshcore` est ON et les couches chargees.

## 2026-04-26 - Correction (10)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le grisage des toggles "Afficher les limites" depend maintenant uniquement de l'etat de chargement GeoJSON (actifs uniquement quand le statut est `charge`/vert).
- Verification: verifier que les toggles deviennent actifs des que chaque couche passe en vert, independamment de l'etat du switch `Meshcore`.

## 2026-04-26 - Correction (11)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: les contours GeoJSON s'affichent correctement apres reprojection automatique des geometries de `EPSG:2154` vers `EPSG:4326` pour Leaflet.
- Verification: activer `Meshcore`, cocher "Afficher les limites", puis verifier l'apparition des contours pays/regions/departements sur la carte.

## 2026-04-26 - Correction (12)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la hierarchie visuelle des contours est renforcee avec des largeurs distinctes (Europe plus epais, regions intermediaires, departements plus fins).
- Verification: activer les trois couches et verifier la difference nette d'epaisseur entre Europe, Region et Departement.

## 2026-04-26 - Ajout (2)

- Type: Ajout
- Fichiers: `index.html`, `src/main.js`, `src/style.css`
- Impact utilisateur: ajout d'une legende dediee dans la fenetre Outils avec couleur et epaisseur de trait pour chaque GeoJSON (Europe, Region, Departement).
- Verification: ouvrir la fenetre Outils et verifier la presence de la legende avec les echantillons de traits et leurs informations de style.

## 2026-04-26 - Correction (13)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: la couleur des contours de la couche Departement passe en vert clair.
- Verification: activer l'affichage des limites Departement et verifier la couleur verte sur la carte et dans la legende.

## 2026-04-26 - Correction (14)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: passage des trois couches en couleurs fluo pour une meilleure lisibilite (Europe bleu fluo, Region orange fluo, Departement vert fluo).
- Verification: afficher les trois niveaux et verifier les couleurs fluo sur la carte et dans la legende.

## 2026-04-26 - Correction (15)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: quand `Meshcore` est desactive, la legende des limites est masquee et l'affichage des GeoJSON est reinitialise (toggles limites decoches).
- Verification: activer des limites, desactiver `Meshcore`, puis verifier la disparition de la legende et le reset des toggles "Afficher les limites".

## 2026-04-26 - Correction (16)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: quand `Meshcore` est OFF, la liste "GeoJSON charges" est maintenant masquee.
- Verification: desactiver `Meshcore` et verifier que la liste des GeoJSON n'est plus visible dans la fenetre Outils.

## 2026-04-26 - Correction (17)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: optimisation majeure du chargement GeoJSON avec chargement progressif par couche (a la demande) au lieu d'un chargement global immediat.
- Verification: activer `Meshcore` et constater un affichage initial plus rapide; les GeoJSON se chargent quand "Afficher les limites" est coche ou lors d'un clic d'identification.

## 2026-04-26 - Correction (18)

- Type: Correction
- Fichiers: `src/main.js`, `index.html`
- Impact utilisateur: suppression de la reprojection runtime et de la dependance `proj4` apres migration des GeoJSON en CRS84/EPSG:4326, ce qui reduit le cout CPU et accelere l'affichage.
- Verification: activer `Meshcore`, afficher les limites et verifier le bon affichage des couches sans script `proj4`.

## 2026-04-26 - Correction (19)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: optimisation zoom-aware pour la couche Departement (chargement/affichage seulement a partir du zoom 8), avec statut explicite dans la liste GeoJSON.
- Verification: avec `Meshcore` actif, verifier que Departement reste indisponible sous zoom 8 puis devient activable et affichable a zoom >= 8.

## 2026-04-26 - Correction (20)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: Europe et Region sont maintenant precharges automatiquement quand `Meshcore` est ON, ce qui evite un statut gris persistant inattendu.
- Verification: activer `Meshcore` et verifier que Europe/Region passent en statut charge sans cocher leurs toggles.

## 2026-04-26 - Correction (21)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le statut de limitation zoom est renomme en "zoom insuffisant" pour une meilleure comprehension.
- Verification: sous zoom 8, verifier que la ligne Departement affiche "zoom insuffisant (< 8)".

## 2026-04-26 - Correction (22)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: le statut "en attente" est remplace en affichage par "non charge (activer l'affichage)" pour clarifier qu'il ne s'agit pas d'un blocage.
- Verification: avec `Meshcore` actif et limites non cochees, verifier l'affichage "non charge (activer l'affichage)".

## 2026-04-26 - Correction (23)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: le toggle est maintenant actif en etat "pret a charger" (si zoom suffisant) et le point de statut associe n'est plus gris pour eviter la confusion.
- Verification: avec `Meshcore` actif et zoom >= 8, verifier que le toggle Departement est cliquable avant chargement et que le statut affiche un point non gris.

## 2026-04-26 - Correction (24)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: la fenetre "Infos au clic (Meshcore)" est desormais visible uniquement quand `Meshcore` est active.
- Verification: desactiver `Meshcore` et verifier la disparition du panneau; le reactiver et verifier son retour.

## 2026-04-26 - Correction (25)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: au clic avec `Meshcore` actif, le popup flottant de programmation n'est plus affiche; la configuration reste visible uniquement dans le panneau "Infos au clic (Meshcore)".
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier l'absence du popup de configuration sur la carte.

## 2026-04-26 - Ajout (3)

- Type: Ajout
- Fichiers: `src/main.js`
- Impact utilisateur: le texte affiche dans le popup d'information au clic est copie automatiquement dans le presse-papiers.
- Verification: cliquer sur la carte avec `Meshcore` actif puis coller (Ctrl+V) pour verifier le texte copie.

## 2026-04-26 - Correction (26)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le texte de resume au clic est deplace du popup carte vers le panneau "Infos au clic (Meshcore)".
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier que le resume apparait dans le panneau sans popup sur la carte.

## 2026-04-26 - Correction (27)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: le panneau "Infos au clic (Meshcore)" n'affiche plus le detail par couche (`C_Europe`, `C_FR_Region`, `C_FR_Departement`); il garde uniquement les coordonnees, le resume et la configuration repeteur.
- Verification: cliquer sur la carte et verifier l'absence des lignes detaillees par couche dans le panneau.

## 2026-04-26 - Correction (28)

- Type: Correction
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: le libelle "Configuration repeteur" dans le panneau infos est maintenant plus grand, en gras et souligne.
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier le style du titre "Configuration repeteur".

## 2026-04-26 - Ajout (4)

- Type: Ajout
- Fichiers: `src/main.js`, `src/style.css`
- Impact utilisateur: ajout d'un bouton "Copier" a cote de "Configuration repeteur" pour copier en un clic la configuration affichee dans le presse-papiers.
- Verification: cliquer sur la carte avec `Meshcore` actif, cliquer sur "Copier", puis coller (Ctrl+V) pour verifier la configuration.

## 2026-04-26 - Correction (29)

- Type: Correction
- Fichiers: `src/main.js`
- Impact utilisateur: correction orthographique du resume au clic ("Vous avez cliqué").
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier le texte du resume.

## 2026-04-26 - Ajout (5)

- Type: Ajout
- Fichiers: `src/main.js`
- Impact utilisateur: ajout d'un marqueur visuel a l'endroit du clic sur la carte pour mieux localiser le point selectionne.
- Verification: cliquer sur la carte avec `Meshcore` actif et verifier l'apparition/deplacement du marqueur.
