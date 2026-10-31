#!/bin/bash

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    echo "Erreur : Docker Compose est introuvable ou indisponible."
    exit 1
fi

COMMAND=$1
SERVICE=$2

show_help() {
    echo "Utilisation : dk <commande> [service]"
    echo ""
    echo "Commandes disponibles :"
    echo "  up [service]    : Construit et démarre les services."
    echo "  start [service] : Démarre les conteneurs arrêtés."
    echo "  stop [service]  : Arrête les conteneurs sans supprimer les données."
    echo "  down            : Supprime les conteneurs, conserve le volume MySQL."
    echo "  sh [service]    : Ouvre un shell, ou le client MySQL pour db."
    echo "  ps              : Affiche l'état des conteneurs."
    echo "  logs [service]  : Affiche les journaux."
}

if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

case "$COMMAND" in
    up)
        if [ -z "$SERVICE" ]; then
            docker compose up --build -d
        else
            docker compose up --build -d "$SERVICE"
        fi
        ;;
    start)
        if [ -z "$SERVICE" ]; then docker compose start; else docker compose start "$SERVICE"; fi
        ;;
    stop)
        if [ -z "$SERVICE" ]; then docker compose stop; else docker compose stop "$SERVICE"; fi
        ;;
    down)
        docker compose down --remove-orphans
        ;;
    ps)
        docker compose ps
        ;;
    logs)
        if [ -z "$SERVICE" ]; then docker compose logs -f; else docker compose logs -f "$SERVICE"; fi
        ;;
    sh)
        if [ -z "$SERVICE" ]; then
            echo "Erreur : indiquez le nom du service."
            exit 1
        fi
        if [ "$SERVICE" = "db" ]; then
            docker compose exec db sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
        else
            docker compose exec "$SERVICE" sh
        fi
        ;;
    *)
        echo "Erreur : commande inconnue : '$COMMAND'"
        show_help
        exit 1
        ;;
esac
