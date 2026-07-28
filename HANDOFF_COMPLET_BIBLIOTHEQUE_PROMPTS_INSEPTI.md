# Handoff complet — Bibliothèque de prompts INSEPTI

Dernière mise à jour : 28 juillet 2026

## 1. État du projet

La Bibliothèque de prompts INSEPTI est une application interne permettant aux collaborateurs de consulter, personnaliser, copier et organiser des prompts.

- Production : `https://biblio-insepti.onrender.com`
- Dépôt : `https://github.com/Khalil-kd/biblio-insepti`
- Branche déployée : `backup-before-gcp-migration`
- Hébergement : Render, service Docker
- Base : PostgreSQL Render
- Déploiement automatique : activé à chaque push sur la branche

L’application ne dépend plus de Notion pour créer et administrer les prompts. Les variables Notion peuvent être conservées uniquement pour les anciens outils d’import.

## 2. Stack technique

- Next.js 15 avec App Router
- React 19
- TypeScript strict
- Tailwind CSS
- PostgreSQL
- Drizzle ORM et migrations PostgreSQL
- Microsoft Entra ID, flux Authorization Code avec PKCE
- `jose` pour la validation OIDC
- Zod pour la validation des entrées
- Vitest pour les tests unitaires
- Playwright pour les tests de bout en bout
- Docker avec Node.js 20 Slim

Le conteneur exécute les migrations avant de lancer le serveur Next.js autonome :

```text
node scripts/migrate.mjs && node server.js
```

## 3. Authentification et sécurité

- connexion Microsoft professionnelle ;
- application Entra single-tenant ;
- validation de `state`, `nonce`, audience, émetteur et signature JWKS ;
- sessions opaques hachées côté base ;
- cookies `HttpOnly`, `Secure` et `SameSite=Lax` ;
- protection CSRF sur les écritures ;
- limitation de débit sur les routes sensibles ;
- validation Zod ;
- journal d’audit ;
- contrôle des rôles côté serveur ;
- liste de domaines et d’utilisateurs autorisés.

Variables Render nécessaires :

- `DATABASE_URL`
- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_CLIENT_SECRET`
- `ENTRA_REDIRECT_URI`
- `ENTRA_POST_LOGOUT_REDIRECT_URI`
- `ALLOWED_EMAIL_DOMAINS`
- `BOOTSTRAP_ADMIN_EMAIL`

Variables facultatives ou historiques :

- `NOTION_DATABASE_ID`
- `NOTION_TOKEN`
- `ENTRA_AUTHORITY_BASE_URL`
- `ENTRA_LOGOUT_ENDPOINT`

Ne jamais placer un secret dans Git ou dans ce document.

## 4. Fonctionnalités collaborateur

### Catalogue

- consultation des prompts INSEPTI publiés ;
- filtre par application ;
- filtre entre prompts INSEPTI et créations privées ;
- recherche par titre, description, contenu et application ;
- cartes compactes avec icône d’application ;
- distinction `INSEPTI` et `Ma création` ;
- favoris représentés par une étoile ;
- retrait de tous les favoris.

### Créations privées

- création, modification et suppression par leur auteur ;
- visibilité limitée à leur auteur et à l’administrateur ;
- choix d’une application Microsoft 365 ou d’un outil personnalisé ;
- choix d’une icône pour les outils personnalisés ;
- détection automatique des variables écrites avec `@`, par exemple `@client`.

### Dossiers

- création de dossiers personnels ;
- rangement d’un même prompt dans plusieurs dossiers ;
- retrait d’un prompt d’un dossier ;
- icône de dossier devant chaque nom ;
- suppression via une petite croix ;
- confirmation de suppression dans une modale centrée ;
- la suppression d’un dossier ne supprime pas ses prompts ;
- fermeture du sélecteur au clic extérieur ou avec la touche Échap.

### Compte

- thèmes clair et sombre ;
- favoris et préférences personnels ;
- suppression du compte par l’utilisateur ;
- déconnexion depuis le profil.

## 5. Fonctionnalités administrateur

- création directe de prompts INSEPTI dans l’application ;
- modification et suppression de tous les prompts ;
- statuts `Brouillon`, `Publié` et `Archivé` ;
- auteur ou responsable du contenu ;
- gestion des utilisateurs et des rôles ;
- gestion de la liste d’accès ;
- signalements réservés aux prompts INSEPTI publiés ;
- résolution ou classement sans suite des signalements ;
- export et import de bibliothèques JSON ou CSV ;
- sauvegarde des prompts INSEPTI et des créations privées ;
- journal d’audit.

La fonctionnalité permettant de proposer une création privée à INSEPTI a été supprimée. Les anciennes données éventuelles sont conservées dans la table d’archive `prompt_submissions_legacy`.

La fonctionnalité et l’affichage « prompt vérifié » ont également été retirés de l’interface.

## 6. Page de connexion

La page `/` est une page de connexion fixe occupant exactement la hauteur de l’écran.

- aucun défilement vertical ;
- panneau gauche graphite `#273238` ;
- composition de flèches INSEPTI en arrière-plan ;
- logo PNG transparent en haut à gauche, sans vidéo ;
- slogan : « Vos idées, mieux formulées. » ;
- panneau droit blanc avec le bouton Microsoft ;
- FAQ accessible sur une page publique séparée : `/faq`.

Les mentions « Espace collaborateurs », « Bibliothèque de prompts » et l’ancien texte descriptif ont été retirés de la connexion.

Média utilisé :

```text
public/brand/insepti-logo-primary.png
public/brand/insepti-arrows-dark.png
```

## 7. Identité visuelle

Palette principale :

- graphite : `#273238`
- blanc cassé : `#F7F8F6`
- vert INSEPTI : `#75C044`
- vert profond : `#315F2A`

Principes :

- thème clair sur fonds blanc et blanc cassé ;
- thème sombre graphite ;
- noms d’applications dans leur couleur native en thème clair ;
- noms d’applications en blanc en thème sombre pour conserver le contraste ;
- badge `INSEPTI` en vert INSEPTI ;
- icônes personnalisées en graphite, gris et vert INSEPTI.

## 8. Modèle de données principal

- `users`
- `sessions`
- `applications`
- `prompts`
- `prompt_reports`
- `prompt_folders`
- `prompt_folder_items`
- `favorites`
- `prompt_events`
- `audit_log`
- `allowlist_entries`
- `rate_limit_events`
- `user_preferences`

Les prompts utilisent `source_type = insepti` ou `source_type = personal`.

## 9. Routes principales

Routes publiques :

- `/`
- `/login` redirige vers `/`
- `/faq`
- `/api/auth/login`
- `/api/auth/callback`
- `/api/auth/logout`

Routes authentifiées :

- `/bibliotheque`
- `/catalogue`
- `/favoris`
- `/mes-prompts`
- `/dossiers`
- `/app/[slug]`
- `/prompt/[slug]`
- `/profil`

Routes administrateur :

- `/admin`
- `/admin/prompts`
- `/admin/utilisateurs`
- `/admin/signalements`
- `/admin/sauvegarde`
- `/admin/journal`

## 10. Commandes locales

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

Migrations :

```bash
npm run db:generate
npm run db:migrate
```

## 11. Déploiement Render

Le fichier `render.yaml` décrit :

- un service web Docker gratuit ;
- une base PostgreSQL ;
- la région Francfort ;
- le health check `/` ;
- l’auto-déploiement sur `backup-before-gcp-migration`.

Le `Dockerfile` utilise `node:20-slim`. Ne pas revenir à Alpine : le projet a déjà rencontré une incompatibilité avec le binaire Cloudflare Workerd pendant la construction.

Procédure :

1. valider localement le typage, les tests et le build ;
2. committer uniquement les fichiers du projet ;
3. pousser `backup-before-gcp-migration` ;
4. suivre le déploiement jusqu’au statut `Live` dans Render ;
5. effectuer ensuite les vérifications fonctionnelles demandées.

## 12. Dernières modifications — 28 juillet 2026

- remplacement de la vidéo du logo par le PNG transparent ;
- logo légèrement agrandi sur la connexion ;
- simplification du contenu de la connexion ;
- nouveau slogan ;
- page de connexion figée sans défilement ;
- déplacement de la FAQ vers `/faq` ;
- largeur de la recherche d’accueil réduite d’environ 30 % ;
- fermeture automatique du sélecteur de dossiers au clic extérieur ;
- ajout d’icônes aux dossiers ;
- petite croix de suppression ;
- confirmation de suppression centrée ;
- suppression de l’affichage et de l’action « vérifié » ;
- amélioration du contraste des noms d’applications en thème sombre ;
- nouvelles couleurs graphite, grise et verte pour les icônes personnalisées ;
- badge `INSEPTI` affiché avec le vert de marque en thème clair.
