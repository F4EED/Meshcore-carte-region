# Index de la documentation CartoMesh

Point d'entree pour naviguer dans la documentation du projet.

## Documents racine

| Fichier | Public | Contenu |
|---------|--------|---------|
| [`README.md`](../README.md) | Developpeurs / contributeurs | Presentation, lancement local, structure, liens |
| [`README.install.webserver.md`](../README.install.webserver.md) | Ops / admin web | Install pas a pas sur un **serveur web existant** (Nginx, Apache, IIS, FTP) |
| [`README-Ubuntu-server.md`](../README-Ubuntu-server.md) | Ops / admin VM | Install Ubuntu, Node, build, Nginx, transfert WinSCP |
| [`README.install.github.md`](../README.install.github.md) | Ops / CI | GitHub, Git LFS, Cloudflare Pages, secrets Actions |

## Documents `docs/`

| Fichier | Contenu |
|---------|---------|
| [`USAGE.md`](USAGE.md) | Guide utilisateur de l'interface carte |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Architecture technique (Vite, Leaflet, couches, identify) |
| [`CHANGELOG.md`](CHANGELOG.md) | Historique des changements (obligatoire a chaque evolution) |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Routine et checklist de maintenance documentaire |
| [`INDEX.md`](INDEX.md) | Ce fichier |

## Quand lire quoi

1. **Je veux lancer l'app sur mon PC** -> `README.md`
2. **Je veux comprendre l'UI** -> `docs/USAGE.md`
3. **Je veux modifier le code** -> `docs/ARCHITECTURE.md` puis `src/main.js`
4. **Je deploie sur un serveur web deja en place** -> `README.install.webserver.md`
5. **Je deploie sur une VM Ubuntu** -> `README-Ubuntu-server.md`
6. **Je publie sur Cloudflare Pages** -> `README.install.github.md`
7. **Je viens de changer le code** -> `docs/MAINTENANCE.md` + entree dans `docs/CHANGELOG.md`
