# Nightshift — DevOps Control

Dashboard DevOps sombre à l’esthétique terminale rouge et noire, construit avec React, Vite, Tailwind CSS, Recharts, Express et MySQL.

## Démarrage avec Docker

1. Copier `.env.example` vers `.env` et modifier les mots de passe locaux si nécessaire.
2. Démarrer l’application : `docker compose up --build -d`
3. Ouvrir le dashboard : <http://localhost:3000>

L’API est exposée sur le port `5000` et MySQL sur le port `3307` côté hôte (`3306` dans Docker). Les paramètres sont conservés dans le volume `mysql_data`.

## Développement local

1. Copier `.env.example` vers `.env`.
2. Installer les dépendances : `npm ci`
3. Démarrer MySQL : `docker compose up -d db`
4. Lancer l’API et Vite : `npm run dev`
5. Ouvrir <http://localhost:5173>

Le proxy Vite relaie `/api` et `/ws` vers Express. Node.js 22 et Docker Compose sont requis. Les valeurs MySQL de développement par défaut (`127.0.0.1:3307`, utilisateur `dashboard`) correspondent à celles de Compose : démarrez bien MySQL avec `docker compose up -d db` avant `npm run dev`. Si vous utilisez un autre serveur MySQL, définissez `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` et `MYSQL_PASSWORD` dans `.env`.

## Fonctionnalités

- Vue d’ensemble, sélecteur d’environnement `dev` / `prod`, état des services et graphiques CPU/RAM sur 24 heures.
- Actions Docker simulées, données de conteneurs et flux de logs WebSocket de démonstration.
- Pods, métriques, logs REST et scaling Kubernetes simulés.
- Health check MySQL réel : latence, connexions actives et taille de la base.
- CRUD des paramètres stocké dans MySQL et envoi d’un message de test à un webhook Discord HTTPS configuré.
- Interface sombre par défaut et responsive.

> **Mode démonstration :** les données Docker, Kubernetes, uptime, alertes et métriques sont fictives et ne commandent aucun moteur Docker ou cluster Kubernetes. Le sélecteur sépare les jeux de démonstration `dev` et `prod`. Seuls le health check MySQL, le CRUD MySQL des paramètres et le test explicite du webhook Discord contactent des services réels. Les métriques ne sont pas persistées ; leur jeu d’exemple est limité à 24 points.

## API REST

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | État de l’API |
| `GET` | `/api/dashboard?environment=dev` | Données de synthèse |
| `GET` | `/api/containers?environment=dev` | Liste des conteneurs de démonstration |
| `POST` | `/api/containers/:id/:action?environment=dev` | `start`, `stop`, `restart` ou `remove` simulé |
| `GET` | `/api/kubernetes/pods?environment=dev` | Pods et réplicas de démonstration |
| `GET` | `/api/kubernetes/pods/:name/logs?environment=dev` | Logs de démonstration d’un pod |
| `PUT` | `/api/kubernetes/deployments/:name/scale` | Scaling simulé (`{ "replicas": 3, "environment": "dev" }`) |
| `GET` | `/api/database/health` | Health check MySQL et métriques |
| `GET` | `/api/metrics?environment=dev` | Série CPU/RAM (24 points) |
| `GET` | `/api/monitoring` | État des services et alertes de démonstration |
| `POST` | `/api/monitoring/alerts/test` | Envoi d’un message au webhook Discord actif |
| `GET`, `POST` | `/api/settings` | Liste ou création d’un paramètre |
| `PUT`, `DELETE` | `/api/settings/:id` | Modification ou suppression d’un paramètre |
| `WS` | `/ws?containerId=c1` | Flux de logs de conteneur simulé |

Les paramètres acceptent les types `alert`, `discord_webhook`, `metric_threshold` et `service`. Les URL de webhook doivent utiliser HTTPS sur `discord.com` ou `discordapp.com`.

Le service n’a pas d’authentification ni de RBAC : garder l’interface et l’API sur un réseau de confiance et remplacer les valeurs d’exemple du fichier `.env` avant toute exposition.

## Vérification

- `npm run lint` — ESLint sur le frontend et le backend.
- `npm test` — tests des données de démonstration et des limites de scaling.
- `npm run build` — build frontend et vérification TypeScript du backend.

## Pipeline et branches

Les branches `dev`, `uat` et `prod` déclenchent les contrôles CI sur chaque push et pull request. GitHub Actions exécute ESLint, les tests, le build et `npm audit`, avec CodeQL SAST en requêtes `security-extended`. Le fichier `.gitlab-ci.yml` fournit aussi les jobs équivalents si le dépôt est utilisé sur GitLab, avec les modèles SAST et Secret Detection de GitLab. Une règle ESLint React Hooks est désactivée pour les chargements réseau asynchrones : le hook reçoit une fonction de récupération, et le state change après la réponse HTTP, pas de manière synchrone dans l’effet.

Les règles du pipeline signalent les échecs ; pour bloquer effectivement les fusions, configurez les règles de protection GitHub sur ces branches et rendez les vérifications `Lint, tests and build` et `CodeQL SAST` obligatoires.

Les fichiers `.env*`, clés privées, certificats et fichiers de secrets locaux sont exclus par `.gitignore`. Seuls les fichiers d’exemple explicitement nommés `.env.example` sont autorisés. Ne placez jamais de vrais identifiants dans un commit ou dans un fichier de pipeline : configurez-les dans les variables CI/CD protégées.
