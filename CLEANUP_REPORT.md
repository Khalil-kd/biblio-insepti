# Cleanup report

## Fichiers conservés
- Code applicatif actif : routes, composants, logique d’authentification, favoris, administration, import Notion.
- Médias réellement utilisés : public/brand/insepti-logo-primary.png, insepti-arrows-light.png, insepti-arrows-dark.png, insepti-flow-light.png, login-pop.png, insepti-logo-reveal-light.mp4.
- Données essentielles : data/prompts.json, scripts d’import et schéma Drizzle.
- Documents de migration et configuration : MIGRATION_GCP.md, Dockerfile, .dockerignore, .env.example.

## Fichiers supprimés ou rendus obsolètes
- Artefacts Cloudflare : wrangler.toml, cloudflare-env.d.ts, worker-configuration.d.ts, open-next.config.ts, fichiers OpenNext générés dans .open-next et dist/server/.build.
- Dossiers et archives de sauvegarde non nécessaires au fonctionnement : dist-server-assets-backup/, archives insepti-sites-v*.tar.gz, documents de passation obsolètes et dossiers de build temporaires.

## À vérifier manuellement
- La base PostgreSQL de destination et les migrations Drizzle associées.
- Les secrets Entra et les URLs de callback de production.
- Les éventuels assets ou scripts de build non référencés après l’intégration Cloud Run.
