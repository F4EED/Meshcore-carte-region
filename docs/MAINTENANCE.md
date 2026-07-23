# Regles de maintenance documentation

Ce document definit la routine de documentation a appliquer a chaque evolution du projet.

## Objectif

Garder une documentation toujours alignee avec le code pour eviter les regressions d'usage et la perte de contexte.

## Documents a maintenir

| Document | Mettre a jour quand... |
|----------|------------------------|
| `docs/CHANGELOG.md` | **Toujours** (chaque changement fonctionnel ou documentaire notable) |
| `README.md` | Commandes, prerequis, structure, flux utilisateur, liens |
| `docs/USAGE.md` | Comportement UI, switches, panneaux, zoom, copy/config |
| `docs/ARCHITECTURE.md` | Stack, flux build, couches, CI, limites techniques |
| `docs/INDEX.md` | Ajout / renommage / suppression d'un document |
| `README-Ubuntu-server.md` | Install VM, Nginx, ports, transfert, Node |
| `README.install.webserver.md` | Deploy sur serveur web existant (Nginx/Apache/IIS/FTP) |
| `README.install.github.md` | GitHub, LFS, Cloudflare, secrets, workflow Actions |
| `docs/MAINTENANCE.md` | Evolution de cette routine elle-meme |
| `.markdownlint.json` | Regles markdownlint du depot (longueur de ligne, tableaux) |
| `.cursor/rules/documentation-routine.mdc` | Si la regle agent Cursor doit refleter un nouveau process |

## Checklist obligatoire a chaque changement

Pour chaque modification fonctionnelle (feature, bugfix, refactor, config):

1. Ajouter une entree dans `docs/CHANGELOG.md`.
2. Verifier si `README.md` doit etre ajuste (commande, prerequis, comportement, structure).
3. Verifier `docs/USAGE.md` si l'interface ou le parcours utilisateur change.
4. Verifier `docs/ARCHITECTURE.md` si la structure technique, les couches ou le deploy changent.
5. Verifier les guides Ubuntu / serveur web / GitHub si l'installation ou le deploiement change.
6. Mettre a jour `docs/INDEX.md` si un fichier de doc est ajoute ou renomme.
7. Si un comportement utilisateur change, decrire comment le tester rapidement (dans le changelog et/ou USAGE).

## Format minimal d'une entree de changelog

- Date (`YYYY-MM-DD`)
- Type de changement (`Ajout`, `Correction`, `Refactor`, `Docs`, `Infra`)
- Fichiers principaux impactes
- Impact utilisateur
- Verification rapide

Exemple:

```markdown
## 2026-07-23 - Docs

- Type: Docs
- Fichiers: `README.md`, `docs/USAGE.md`
- Impact utilisateur: ...
- Verification: ...
```

## Convention

- Ecrire court, factuel, oriente "ce qui change et pourquoi".
- Eviter les details de commit inutiles.
- Preferer un langage stable dans le temps (pas de references au "chat precedent").
- Garder les accents / orthographe coherents avec le reste du depot (francais sans accents dans certains fichiers historiques: ne pas reformater massivement sans besoin).
- Mettre a jour l'index (`docs/INDEX.md`) des qu'un nouveau document est cree.

## Definition de "termine"

Une tache de dev est consideree terminee uniquement si:

- le code est modifie (si applicable),
- et la documentation associee est mise a jour dans la meme tache.
