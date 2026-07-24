# Migration GCP — Bibliothèque de prompts INSEPTI

## Objectif
Ce dépôt a été préparé pour un futur déploiement sur Google Cloud Platform, avec un runtime Next.js standalone et une base PostgreSQL compatible Cloud SQL.

## Ressources GCP à créer
- Projet Google Cloud Platform avec API Cloud Run, Cloud Build, Secret Manager, Cloud SQL Admin et Artifact Registry activées.
- Instance Cloud SQL PostgreSQL (recommandé : Postgres 15, réseau privé ou Cloud SQL Auth Proxy).
- Service Cloud Run avec image Docker construite depuis ce dépôt.
- Secret Manager pour les variables sensibles : ENTRA_CLIENT_SECRET, DATABASE_URL ou DB_PASSWORD.
- Bucket de stockage si des pièces jointes ou exports doivent être conservés à l’avenir.

## Variables d’environnement requises
- DATABASE_URL ou DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
- ENTRA_TENANT_ID
- ENTRA_CLIENT_ID
- ENTRA_CLIENT_SECRET
- ENTRA_REDIRECT_URI
- ENTRA_POST_LOGOUT_REDIRECT_URI
- ALLOWED_EMAIL_DOMAINS
- BOOTSTRAP_ADMIN_EMAIL
- NOTION_DATABASE_ID (si l’import Notion reste utilisé)

## Étapes de déploiement
1. Créer la base PostgreSQL et appliquer les migrations Drizzle.
2. Configurer les secrets dans Secret Manager et les injecter dans Cloud Run.
3. Construire l’image Docker localement ou via Cloud Build.
4. Déployer le service Cloud Run avec la variable PORT=8080.
5. Configurer le domaine, le TLS et les variables Entra ID de production.
6. Vérifier les routes d’authentification, de session et d’administration après déploiement.

## Notes importantes
- Les URL Microsoft Entra sont maintenant configurables via ENTRA_AUTHORITY_BASE_URL et ENTRA_LOGOUT_ENDPOINT.
- Le projet ne déploie rien ici ; cette étape reste à exécuter manuellement dans l’environnement GCP cible.
