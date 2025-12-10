# Étape 1 : Build (Construction)
# Utiliser une image Node.js pour compiler l'application React
FROM node:22 AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de configuration de dépendances pour profiter du cache Docker
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Lancer la construction de l'application (créer les fichiers statiques)
RUN npm run build

# Étape 2 : Runtime (Environnement d'exécution léger)
# Utiliser une image Nginx très légère pour servir l'application
FROM nginx:alpine

# Copier les fichiers statiques générés depuis l'étape 'builder' vers le dossier de service Nginx
# CORRECTION : Utilisation de /app/public, le dossier probable de sortie de Webpack
COPY --from=builder /app/public /usr/share/nginx/html

# Copier un fichier de configuration Nginx personnalisé (optionnel, mais recommandé pour les apps React/SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Le conteneur écoute le port 80 (par défaut pour Nginx)
EXPOSE 80

# Commande par défaut pour démarrer Nginx (déjà définie dans l'image de base)
CMD ["nginx", "-g", "daemon off;"]