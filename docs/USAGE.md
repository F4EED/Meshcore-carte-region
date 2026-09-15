# Guide d'utilisation - Gaulix CartoMesh

Ce guide decrit l'usage de l'interface web (navigateur).

## Ecran principal

- **Carte** (Leaflet): fond de carte, zoom, pan.
- **Panneau Outils** (haut / deplacable): legendes et switches de couches.
- **Position geographique**: latitude / longitude sous le curseur.
- **Infos au clic (Meshcore)**: resultat d'identification apres un clic (si Meshcore actif).

Les panneaux a en-tete peuvent etre deplaces en glissant l'en-tete.

## Panneau Outils

### Meshcore

1. Activer le switch **Meshcore**.
2. Les couches GeoJSON demarrent leur chargement (statut dans **GeoJSON charges**):
   - `C_Europe`
   - `C_FR_Region`
   - `C_FR_Departement` (uniquement si le zoom carte est >= **8**)
3. Une fois une couche en statut **charge**, activer **Afficher les limites** pour voir son contour.
4. La **Legende des limites** rappelle les couleurs des niveaux.

Couleurs de contour (ordre de grandeur):

| Niveau | Couleur indicative |
|--------|--------------------|
| Pays (Europe) | Cyan / bleu |
| Region FR | Orange |
| Departement FR | Magenta / violet |

### Identification au clic

1. Laisser **Meshcore** active.
2. Cliquer sur la carte.
3. Le panneau **Infos au clic (Meshcore)** affiche:
   - coordonnees du clic
   - Pays / Region / Departement (lignes pertinentes uniquement)
   - section **Configuration repeteur** (masquee par defaut)

Dans **Configuration repeteur**:

- switch **Afficher / Masquer** pour reveler les commandes generees
- bouton **Copier** pour mettre la configuration dans le presse-papiers

Exemple de commandes generees (selon les attributs GeoJSON trouves):

```text
region put <code_pays>
region put <code_region>
region put <code_departement>
region allowf <code_pays>
region allowf <code_region>
region allowf <code_departement>
region save
```

Les valeurs inconnues (`fr-inconnu`, `Aucun objet`, etc.) sont filtrees.

### Autres switches

| Switch | Etat actuel |
|--------|-------------|
| **Meshtastic** | Present dans l'UI (evolution prevue) |
| **SAR** | Present dans l'UI (evolution prevue) |
| **...** | Placeholder |

### Reduire le panneau Outils

Bouton **Reduire** / **Agrandir** dans l'en-tete du panneau Outils.

## Zoom et performance

- La couche **Departement** est volumineuse (~190 Mo).
- Elle n'est chargee / affichee que lorsque le **niveau de zoom** est au moins **8**.
- Si le zoom est trop bas, le statut indique un zoom insuffisant.

## Deploiement / acces distant

- En local: en general `http://localhost:5173/`
- Sur VM Ubuntu: voir `README-Ubuntu-server.md`
- Site public Cloudflare Pages: voir `README.install.github.md`
