# FITTRACK Lite

Application web de suivi d'entraînement sportif — version simplifiée pour un projet de fin de module de développement web.

Frontend en HTML / CSS / JavaScript pur (modules ES6, `fetch`), API REST simulée par **json-server** sur `db.json`. Aucun backend applicatif, aucune base de données réelle, aucune authentification — le but est de rester réalisable dans le temps imparti à un module tout en gardant une vraie logique de séparation des responsabilités.

## Sommaire

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Architecture des modules JS](#architecture-des-modules-js)
- [Architecture des styles CSS](#architecture-des-styles-css)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Modèle de données](#modèle-de-données)
- [Endpoints json-server utilisés](#endpoints-json-server-utilisés)
- [Dépannage](#dépannage)
- [Limites assumées](#limites-assumées)
- [Évolutions possibles](#évolutions-possibles)

## Aperçu

FITTRACK Lite permet d'enregistrer ses séances de musculation (exercices, séries, répétitions, charges), de suivre son poids corporel dans le temps, de se fixer des objectifs et de consulter un tableau de bord de synthèse. C'est une version resserrée du projet FITTRACK original, pensée pour tenir dans le calibre d'un module plutôt que d'un semestre.

## Fonctionnalités

- **Exercices** : bibliothèque avec recherche par nom et filtre par groupe musculaire
- **Séances** : création, modification, suppression ; exercices et séries imbriqués ; vue détail au clic
- **Modèles de séance** : Push / Pull / Legs / Full Body pré-remplis, sélectionnables à la création d'une séance
- **Progression** : ajout de pesées, graphique d'évolution filtrable par période (7 jours / 30 jours / tout), comparaison de la charge maximale par exercice au fil des séances
- **Objectifs** : création, barre de progression calculée (valeur actuelle / cible)
- **Dashboard** : nombre de séances, dernière séance, poids actuel, volume total, meilleures performances par exercice, objectifs en cours
- **Export** : CSV des séances (téléchargement direct) et PDF via la boîte d'impression du navigateur
- **Mode clair / sombre**, préférence gardée en `localStorage`
- **Barre de navigation masquable** (bouton dans la sidebar pour la cacher, barre repliée avec bouton pour la faire réapparaître), préférence gardée en `localStorage`

## Stack technique

| Domaine | Choix |
|---|---|
| Structure / style | HTML5, CSS3 (variables CSS, sans framework) |
| Logique | JavaScript ES6+ (modules natifs, `fetch`) |
| Données | json-server sur `db.json` (API REST simulée) |
| Graphiques | Chart.js (via CDN) |
| Polices | Oswald (titres), Inter (texte), IBM Plex Mono (chiffres) |

## Structure du projet

```
fittrack-lite/
├── index.html
├── scripts/
│   ├── core.js               # état partagé + fonctions utilitaires pures
│   ├── api.js                 # appels fetch vers json-server (GET/POST/PUT/DELETE)
│   ├── toast.js                 # notifications
│   ├── modals.js                  # ouverture/fermeture des fenêtres modales
│   ├── sidebar.js                   # afficher/masquer la barre latérale
│   ├── theme.js                        # mode clair/sombre
│   ├── exercises.js                       # recherche + filtre des exercices
│   ├── dashboard.js                          # statistiques et graphiques du tableau de bord
│   ├── workouts.js                              # CRUD séances, modèles, export CSV/PDF
│   ├── progress.js                                 # poids, période, graphique comparatif
│   ├── goals.js                                       # CRUD objectifs
│   ├── data.js                                          # chargement initial des données (loadAll)
│   ├── navigation.js                                       # changement de vue
│   └── init.js                                                # point d'entrée (DOMContentLoaded)
├── styles/
│   ├── main.css              # point d'entrée unique (@import des 6 fichiers ci-dessous)
│   ├── tokens-base.css      # variables (clair/sombre) + reset + typographie
│   ├── layout.css            # sidebar, topbar, content, grilles
│   ├── forms.css               # champs, boutons, formulaires
│   ├── features.css              # cartes, exercices, séances, objectifs, dashboard
│   ├── overlays-and-ui.css         # modals, toast
│   └── print-responsive.css          # impression + responsive mobile
├── db.json                # données (exercises, workouts, goals, weightHistory, workoutTemplates)
├── package.json            # dépendance json-server + scripts npm
├── .gitignore
└── README.md
```


## Architecture des modules JS

`index.html` ne charge qu'un seul script : `<script type="module" src="scripts/init.js">`. Tous les autres fichiers sont importés en cascade via `import`/`export` — le navigateur résout lui-même le graphe de dépendances, il n'y a plus besoin de faire attention à l'ordre des balises `<script>`.

Sens des dépendances (aucune boucle) :

```
core.js  ←  (aucune dépendance : état + utilitaires purs)
api.js   ←  (aucune dépendance)
toast.js ←  (aucune dépendance)
modals.js ← (aucune dépendance)
sidebar.js ← (aucune dépendance)
theme.js  ←  (aucune dépendance)

exercises.js ← core.js
dashboard.js ← core.js

workouts.js  ← core.js, api.js, toast.js, modals.js, dashboard.js
progress.js  ← core.js, api.js, toast.js, dashboard.js
goals.js     ← core.js, api.js, toast.js, modals.js, dashboard.js

data.js       ← core.js, api.js, toast.js, exercises.js, workouts.js, goals.js, progress.js, dashboard.js
navigation.js ← core.js, data.js, progress.js, dashboard.js

init.js ← navigation.js, modals.js, workouts.js, goals.js, progress.js, sidebar.js, theme.js, data.js
```

`core.js` fait office de socle commun (état partagé + fonctions comme `formatDate`, `exerciseName`, `workoutVolume`, `goalProgress`) : c'est le seul fichier importé par presque tous les autres.

## Architecture des styles CSS

Même logique côté CSS : `index.html` ne charge qu'un seul fichier, `styles/main.css`, qui importe les 6 autres via `@import` :

```css
@import url("./tokens-base.css");
@import url("./layout.css");
@import url("./forms.css");
@import url("./features.css");
@import url("./overlays-and-ui.css");
@import url("./print-responsive.css");
```

L'ordre des `@import` respecte l'ordre naturel de la cascade : les variables et le reset (`tokens-base.css`) d'abord, la structure de page (`layout.css`), puis les composants génériques (`forms.css`), les styles spécifiques à chaque fonctionnalité (`features.css`), les overlays (`overlays-and-ui.css`), et enfin l'impression/responsive (`print-responsive.css`) qui doit pouvoir surcharger tout le reste. Cette organisation évite d'avoir six balises `<link>` à maintenir dans le `<head>` — un seul point d'entrée, comme pour les scripts JS.

## Installation

Prérequis : [Node.js](https://nodejs.org/) (pour `npm` et `json-server`).

```bash
git clone <url-du-dépôt>
cd fittrack-lite
npm install
```

## Lancer le projet

Deux serveurs doivent tourner **en parallèle**, dans deux terminaux séparés :

**Terminal 1 — API simulée (json-server)**
```bash
npm run server
```
→ sert `db.json` comme API REST sur `http://localhost:3000`.

**Terminal 2 — Frontend**
```bash
npm run dev
```
→ sert `index.html` sur `http://localhost:5500` (ou utilise l'extension VS Code "Live Server").

> ⚠️ Les modules ES6 ne fonctionnent pas en ouvrant `index.html` directement (`file://`) — il faut obligatoirement un serveur local pour le frontend, même si tu n'utilises pas `npm run dev`.

Si json-server n'est pas lancé, le dashboard reste vide et la barre latérale affiche "hors ligne".

## Modèle de données

`db.json` contient cinq collections, servies telles quelles par json-server :

- **exercises** : `id, name, muscleGroup, description, difficulty`
- **workouts** : `id, name, date, duration, notes, exercises: [{ exerciseId, sets: [{ setNumber, repetitions, weight }] }]`
- **workoutTemplates** : `id, name, description, exerciseIds: []`
- **goals** : `id, name, currentValue, targetValue, unit, deadline, status`
- **weightHistory** : `id, weight, date`

Les séries sont imbriquées directement dans l'objet `workout` plutôt que dans une table séparée — plus simple à consommer en `fetch` côté frontend, sans jointures ni ORM.

## Endpoints json-server utilisés

| Ressource | Endpoints |
|---|---|
| Exercices | `GET /exercises` |
| Séances | `GET/POST /workouts`, `PUT/DELETE /workouts/:id` |
| Modèles de séance | `GET /workoutTemplates` |
| Progression | `GET/POST /weightHistory` |
| Objectifs | `GET/POST /goals` |

Le dashboard n'a pas d'endpoint dédié : ses statistiques (volume, meilleures performances, etc.) sont calculées côté client en JavaScript à partir des données déjà récupérées.

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ERR_CONNECTION_REFUSED` sur `:3000` | json-server n'est pas lancé | Lancer `npm run server` dans un terminal séparé et le laisser ouvert |
| Page blanche / rien ne s'affiche | `index.html` ouvert en `file://` | Servir le projet via `npm run dev` ou Live Server |
| Erreur d'import de module dans la console | Un chemin `import` est incorrect ou un fichier a été renommé | Vérifier les chemins relatifs (`./core.js`, etc.) dans les fichiers `scripts/` |
| Graphiques absents | Chart.js (CDN) bloqué ou hors ligne | Vérifier la connexion internet — Chart.js est chargé depuis `cdn.jsdelivr.net` |
| "hors ligne" alors que json-server tourne | Une exception JS a interrompu `loadAll()` avant la fin | Ouvrir la console développeur pour voir l'erreur exacte |

## Limites assumées

- Application mono-utilisateur, sans authentification : toutes les données de `db.json` sont partagées, il n'y a pas de notion de compte.
- L'export PDF passe par l'impression navigateur plutôt qu'une vraie génération PDF côté client — plus simple, sans dépendance supplémentaire.
- json-server sert de backend de substitution : pas de validation serveur, pas de logique métier côté serveur, tout est fait côté client.

## Évolutions possibles

Si le projet est repris au-delà du cadre du module :

- Vrai backend (Node.js / Express) avec base de données relationnelle (PostgreSQL / Prisma)
- Authentification multi-utilisateur (JWT, mots de passe hashés)
- Isolation des données par utilisateur (`userId` sur `workouts`, `goals`, `weightHistory`)
- Génération PDF côté client sans passer par l'impression navigateur