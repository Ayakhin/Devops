# Définition du Provider Kubernetes (utilise la configuration kubectl existante)
provider "kubernetes" {
  # Assurez-vous que Docker Desktop avec Kubernetes est lancé
}

# --- 1. Kubernetes Deployment ---
# Gère les Pods (les instances de votre application) et assure qu'il y en a toujours 2
resource "kubernetes_deployment_v1" "app_deployment" {
  metadata {
    name = "devops-portfolio-deployment"
    labels = {
      app = "devops-portfolio-app"
    }
  }

  spec {
    replicas = 2 # Haute disponibilité
    selector {
      match_labels = {
        app = "devops-portfolio-app"
      }
    }
    template {
      metadata {
        labels = {
          app = "devops-portfolio-app"
        }
      }
      spec {
        container {
          name  = "devops-portfolio-container"
          # L'image doit être l'image Docker poussée par l'étape Jenkins
          image = "votre_docker_hub_user/devops-portfolio-app:latest" 
          port {
            container_port = 3000 # Le port que l'application expose
          }
        }
      }
    }
  }
}

# --- 2. Kubernetes Service ---
# Définit un point d'accès stable (IP/Port) pour atteindre les Pods
resource "kubernetes_service_v1" "app_service" {
  metadata {
    name = "devops-portfolio-service"
  }
  spec {
    selector = {
      app = kubernetes_deployment_v1.app_deployment.metadata[0].labels.app
    }
    port {
      port        = 80
      target_port = 3000 # Le port 80 du service redirige vers le port 3000 des conteneurs
    }
    # Pour un environnement local (Docker Desktop), NodePort est souvent plus fiable que LoadBalancer
    type = "NodePort" 
  }
}