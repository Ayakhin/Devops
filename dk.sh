#!/bin/bash
# Description: Wrapper script for Docker Compose commands (dk up, dk stop, dk sh, etc.).
# Usage: ./dk.sh <command> [service]

# Vérifier si docker compose est disponible
if ! command -v docker compose &> /dev/null
then
    echo "Erreur : 'docker compose' n'est pas trouvé. Assurez-vous que Docker est installé et en cours d'exécution."
    exit 1
fi

# Définir la commande et le service (le premier argument est la commande, le second le service)
COMMAND=$1
SERVICE=$2

# Fonction pour afficher l'aide
show_help() {
    echo "========================================="
    echo "Docker Compose Wrapper Script (dk)"
    echo "========================================="
    echo "Utilisation : dk <command> [service_name]"
    echo ""
    echo "Commandes disponibles :"
    echo "  up [service]    : Construit et démarre (avec --build si pas de service spécifié)."
    echo "  start [service] : Démarre les conteneurs existants."
    echo "  stop [service]  : Arrête les conteneurs."
    echo "  down            : Arrête et supprime les conteneurs, images et volumes locaux."
    echo "  sh [service]    : Ouvre un shell interactif (sh) ou le client psql dans un conteneur."
    echo "  ps              : Affiche l'état des conteneurs."
    echo "  logs [service]  : Affiche les logs."
    echo ""
    echo "Exemples :"
    echo "  dk up"
    echo "  dk stop devops-app-1"
    echo "  dk sh dashboard_db (Se connecte directement à psql)"
}

# Vérification de l'argument
if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

# Logique des commandes
case "$COMMAND" in
    up)
        if [ -z "$SERVICE" ]; then
            echo "Démarrage et construction des conteneurs..."
            docker compose up --build -d
        else
            echo "Démarrage du service '$SERVICE'..."
            docker compose up -d "$SERVICE"
        fi
        ;;
    start)
        echo "Démarrage des conteneurs existants..."
        docker compose start "$SERVICE"
        ;;
    stop)
        echo "Arrêt des conteneurs..."
        docker compose stop "$SERVICE"
        ;;
    down)
        echo "Arrêt et suppression des conteneurs, images et volumes locaux..."
        docker compose down --rmi local --volumes --remove-orphans
        ;;
    ps)
        echo "Affichage de l'état des conteneurs..."
        docker compose ps
        ;;
    logs)
        echo "Affichage des logs du service '$SERVICE'..."
        if [ -z "$SERVICE" ]; then
            docker compose logs -f
        else
            docker compose logs -f "$SERVICE"
        fi
        ;;
    sh)
        if [ -z "$SERVICE" ]; then
            echo "Erreur : Spécifiez le nom du service pour le shell (ex: dk sh devops-app-1)."
            exit 1
        fi
        
        # Logique spécifique pour PostgreSQL : Connexion directe au client psql
        if [ "$SERVICE" == "dashboard_db" ] || [ "$SERVICE" == "db" ]; then
            echo "Connexion au client psql dans le conteneur $SERVICE (tapez '\q' pour quitter)..."
            # Utilisation de 'docker compose exec' avec les bonnes variables d'environnement
            docker compose exec "$SERVICE" psql -U user_dashboard -d dashboard_data
        else
            echo "Connexion au shell sh dans le conteneur $SERVICE (tapez 'exit' pour quitter)..."
            # Pour les autres conteneurs (ex: Nginx), nous utilisons le shell sh
            docker compose exec "$SERVICE" sh
        fi
        ;;
    *)
        echo "Erreur : Commande non reconnue : '$COMMAND'"
        show_help
        exit 1
        ;;
esac

exit 0