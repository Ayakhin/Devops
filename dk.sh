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
    echo "Utilisation : ./dk.sh <command> [service_name]"
    echo ""
    echo "Commandes disponibles :"
    echo "  up [service]    : Construit et démarre (avec -d)."
    echo "  start [service] : Démarre les conteneurs existants."
    echo "  stop [service]  : Arrête les conteneurs."
    echo "  down            : Arrête et supprime les conteneurs et les réseaux."
    echo "  sh [service]    : Ouvre un shell interactif (sh) dans un conteneur."
    echo "  ps              : Affiche l'état des conteneurs."
    echo "  logs [service]  : Affiche les logs."
    echo ""
    echo "Exemples :"
    echo "  ./dk.sh up"
    echo "  ./dk.sh stop devops-app-1"
    echo "  ./dk.sh sh dashboard_db"
}

# Vérification de l'argument
if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

# Logique des commandes
case "$COMMAND" in
    up)
        # Utiliser l'option --build si l'utilisateur ne fournit pas de service spécifique.
        # Sinon, un simple up est suffisant.
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
        echo "Arrêt et suppression des conteneurs, images et réseaux..."
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
            echo "Erreur : Spécifiez le nom du service pour le shell (ex: ./dk.sh sh devops-app-1)."
            exit 1
        fi
        echo "Connexion au shell sh dans le conteneur $SERVICE (tapez 'exit' pour quitter)..."
        # Tenter d'exécuter sh, car l'image alpine n'a pas bash
        docker exec -it "$SERVICE" sh
        ;;
    *)
        echo "Erreur : Commande non reconnue : '$COMMAND'"
        show_help
        exit 1
        ;;
esac

exit 0