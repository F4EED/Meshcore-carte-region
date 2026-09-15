# MeshCore — carte des régions

Outil local pour choisir un point en France métropolitaine et générer les commandes CLI MeshCore (`region put`, `region allowf`, `region home`, `region save`) destinées à un répéteur.

## Accès

Depuis le portail du poste :

- [http://127.0.0.1:8080/Meshcore-carte-region/](http://127.0.0.1:8080/Meshcore-carte-region/)

Le portail (`python3 serveur.py` à la racine de `Apps`) sert ces fichiers. Aucun second processus n’est nécessaire.

## Usage

1. Cliquez sur la carte ou saisissez un département (nom, numéro ou code `fr-42`).
2. Vérifiez la chaîne : pays `fr`, région administrative (`fr-ara`, `fr-idf`, …), éventuellement département (`fr-42`).
3. Copiez les commandes et collez-les dans la CLI du répéteur.
4. Contrôlez avec `region` puis conservez la config (`region save` est déjà inclus).

Options :

- **Département** : convention communautaire française, en plus du pays et de la région. Les codes pays/région correspondent à [regions.meshcore.nz](https://regions.meshcore.nz/).
- **allowf** : à conserver sur firmware antérieur à 1.15 ; à partir de 1.15, `region put` active déjà le flood.
- **home** : région d’origine du nœud (département si coché, sinon région).

## Données

| Fichier | Rôle |
|---|---|
| `data/codes.js` | Correspondance département → code MeshCore |
| `data/departements.geojson` | Contours simplifiés (source [france-geojson](https://github.com/gregoiredavid/france-geojson)) |
| `vendor/leaflet.*` | Carte |

Les tuiles OpenStreetMap demandent une connexion. Les contours et la génération des commandes restent utilisables sans tuiles.

## Références

- [MeshCore : régions et scopes (LoraMesh France)](https://www.loramesh.fr/meshcore-configuration-regions/)
- [CLI régions MeshCore](https://github.com/meshcore-dev/MeshCore/wiki/Repeater-&-Room-Server-CLI-Reference)
