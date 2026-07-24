# Handoff complet — Bibliothèque de prompts INSEPTI

## 1. Résumé exécutif

La Bibliothèque de prompts INSEPTI est un portail web interne destiné aux consultants. Elle centralise des prompts Microsoft 365, permet de les rechercher, de les filtrer par application, de les personnaliser, de les copier et de les enregistrer en favoris.

L’application est aujourd’hui :

- développée en Next.js 15, TypeScript et Tailwind CSS ;
- connectée à Microsoft Entra ID avec le compte administrateur `kkadri@insepti.com` ;
- persistée dans une base Cloudflare D1 ;
- publiée 24 h/24 sur OpenAI Sites ;
- administrable depuis le menu du profil ;
- prévue pour une éventuelle migration future sur une VM Linux OVH.

URL de production actuelle :

`https://insepti-prompts.chahinez-bitouche98.chatgpt.site`

Le texte `chahinez-bitouche98` appartient au nom d’hébergement du projet Sites d’origine. Il ne correspond pas au compte Microsoft administrateur et ne peut pas être remplacé par une adresse e-mail. Pour le masquer proprement, utiliser un domaine personnalisé, par exemple `prompts.insepti.com`, ou recréer le projet Sites sous le compte propriétaire souhaité.

## 2. Objectif produit

Le portail doit offrir aux collaborateurs INSEPTI un accès simple et rapide aux prompts utiles dans leurs missions, sans exposer la partie technique ou administrative.

Expérience collaborateur :

- connexion avec une adresse Microsoft autorisée ;
- page Accueil présentant les applications Microsoft 365 ;
- catalogue complet des prompts ;
- recherche par titre, contenu, mot-clé ou application ;
- page dédiée par application ;
- personnalisation des variables d’un prompt ;
- copie du prompt final ;
- favoris personnels ;
- thème clair ou sombre.

Expérience administrateur :

- gestion et import du catalogue de prompts ;
- ajout, promotion, désactivation et suppression des utilisateurs ;
- suivi du journal de sécurité ;
- accès aux réglages depuis le profil uniquement.

## 3. Identité visuelle

Palette principale :

- graphite sombre : `#273238` ;
- blanc cassé : `#F7F8F6` ;
- verts INSEPTI définis dans Tailwind et les variables CSS ;
- thème clair et thème sombre uniquement.

Médias principaux :

- logo principal : `public/brand/insepti-logo-primary.png` ;
- animation claire du logo : `public/brand/insepti-logo-reveal-light.mp4` ;
- illustration de connexion Microsoft 365 : `public/brand/login-pop.png` ;
- icônes Microsoft haute définition : `public/icons/`.

La page de connexion est divisée en deux :

- à gauche, l’illustration sombre `pop.png` représentant les applications Microsoft 365 ;
- à droite, une petite animation du logo INSEPTI sur fond clair, le message « Bienvenue dans la bibliothèque de prompts » et le bouton Microsoft avec le logo officiel en quatre couleurs.

## 4. Fonctionnalités réalisées

### Navigation principale

- Accueil ;
- Prompts ;
- Favoris ;
- menu profil ;
- administration uniquement accessible aux administrateurs depuis le profil.

### Accueil

- message personnalisé avec le prénom du collaborateur ;
- recherche en direct ;
- bouton de validation de la recherche ;
- cartes des applications Microsoft 365 ;
- nombre de prompts par application ;
- clic sur une application vers sa page dédiée ;
- section des prompts récemment mis à jour.

### Catalogue et recherche

- recherche normalisée sans sensibilité à la casse ni aux accents ;
- recherche dans le titre, la description, le corps, les variables et l’application ;
- filtres par application ;
- tri par pertinence ou date ;
- menus de filtre personnalisés ;
- icône de l’application affichée sur chaque prompt ;
- étoile jaune lorsqu’un prompt est ajouté aux favoris ;
- aucun filtre « Favoris uniquement » dans la page Prompts.

### Pages application

- une page par application ;
- accès depuis les cartes de l’Accueil et depuis le nom ou l’icône d’une application ;
- liste des prompts correspondants ;
- bouton de retour vers l’Accueil.

### Détail d’un prompt

- titre, description et application ;
- champs à personnaliser ;
- génération du prompt final ;
- copie en un clic ;
- ajout aux favoris ;
- aperçu intermédiaire retiré pour simplifier le parcours.

### Profil

- identité et rôle de l’utilisateur ;
- accès à l’espace administrateur pour les administrateurs ;
- deux thèmes seulement : Clair et Sombre ;
- application et enregistrement immédiats du thème au clic ;
- déconnexion Microsoft.

### Administration

- navigation avec indication verte de la section active ;
- vue d’ensemble ;
- gestion des prompts ;
- gestion des utilisateurs ;
- journal de sécurité ;
- import ou réimport du seed des prompts.

### Gestion des utilisateurs

Depuis `Administration → Utilisateurs`, l’administrateur peut :

- saisir l’adresse Microsoft professionnelle d’un collaborateur ;
- créer immédiatement une ligne utilisateur en statut actif ;
- voir « En attente de connexion » avant sa première connexion ;
- promouvoir ou rétrograder un administrateur ;
- désactiver ou réactiver un compte ;
- supprimer un compte directement depuis le tableau ;
- retirer automatiquement l’adresse de la liste d’accès lors de la suppression.

Lors de la première connexion Microsoft, le compte provisoire est relié à l’identifiant Entra réel et le nom Microsoft remplace automatiquement le nom dérivé de l’adresse e-mail.

## 5. Authentification Microsoft Entra ID

Modèle :

- application Entra single-tenant ;
- flux Authorization Code avec PKCE ;
- vérification de `state`, `nonce`, de l’émetteur, de l’audience et de la signature JWKS ;
- prise en charge des comptes invités Entra au format `#EXT#` ;
- choix explicite du compte Microsoft à chaque connexion ;
- déconnexion côté application puis redirection vers la déconnexion Microsoft.

Configuration actuelle :

- Tenant / Directory ID : `6f0d84bd-9b5d-4042-a6b5-6a7b6835bc72` ;
- Application / Client ID : `61860a29-d35a-4539-a72b-6d107b8a08b9` ;
- administrateur de démarrage : `kkadri@insepti.com` ;
- callback de production : `https://insepti-prompts.chahinez-bitouche98.chatgpt.site/api/auth/callback` ;
- retour après déconnexion : `https://insepti-prompts.chahinez-bitouche98.chatgpt.site/login`.

Variables de production :

- `ENTRA_TENANT_ID` ;
- `ENTRA_CLIENT_ID` ;
- `ENTRA_CLIENT_SECRET` ;
- `ENTRA_REDIRECT_URI` ;
- `ENTRA_POST_LOGOUT_REDIRECT_URI` ;
- `BOOTSTRAP_ADMIN_EMAIL` ;
- `APP_ADMIN_EMAIL` ;
- `APP_ADMIN_NAME` ;
- `ALLOWED_EMAIL_DOMAINS`.

Ne jamais écrire le secret client dans Git, un document de handoff ou une capture.

Important : un secret client a été communiqué dans une conversation pendant la configuration. Avant un déploiement large auprès des équipes, créer un nouveau secret dans Azure, mettre à jour `ENTRA_CLIENT_SECRET` dans Sites, redéployer, puis supprimer l’ancien secret dans Azure.

## 6. Autorisation et rôles

Rôles :

- `member` : consultation, recherche, personnalisation, copie et favoris ;
- `admin` : toutes les fonctions membre plus l’administration.

Règles :

- toutes les décisions d’autorisation importantes sont vérifiées côté serveur ;
- un utilisateur doit appartenir au tenant Entra configuré ;
- il doit être l’administrateur de démarrage, appartenir à un domaine autorisé ou être présent dans la liste d’accès ;
- un compte désactivé ne peut pas créer ni utiliser de session ;
- un administrateur ne peut pas modifier ou supprimer son propre compte depuis le tableau.

## 7. Sécurité déjà intégrée

- cookies de session `HttpOnly`, `Secure`, `SameSite=Lax` ;
- jetons de session opaques et hachés en SHA-256 dans la base ;
- expiration et renouvellement glissant plafonné ;
- révocation des sessions lors d’une désactivation ou d’un changement de rôle ;
- protection CSRF sur les écritures ;
- limitation de débit sur les routes sensibles ;
- journal d’audit ;
- validation des entrées avec Zod ;
- requêtes de base paramétrées via Drizzle ;
- CSP restrictive ;
- `X-Frame-Options: DENY` ;
- `X-Content-Type-Options: nosniff` ;
- HSTS ;
- politique de permissions désactivant caméra, micro et géolocalisation ;
- aucun mot de passe Microsoft stocké dans l’application ;
- aucun secret stocké dans le dépôt.

## 8. Données et base D1

Binding de production : `DB`.

Tables principales :

- `users` : comptes, rôles, statuts et dernière connexion ;
- `sessions` : sessions opaques et révocables ;
- `applications` : applications Microsoft 365 ;
- `prompts` : contenu, variables, tags, recherche et statut ;
- `favorites` : favoris personnels ;
- `prompt_events` : événements agrégés ;
- `audit_log` : journal des actions administratives et de sécurité ;
- `allowlist_entries` : adresses ou domaines autorisés ;
- `rate_limit_events` : limitation de débit ;
- `user_preferences` : thème et préférences.

Le catalogue est reconstructible depuis `data/prompts.json`.

## 9. Catalogue de prompts

Le seed applicatif contient les prompts Microsoft 365 sélectionnés pour INSEPTI.

Pipeline :

1. import direct en lecture seule depuis Notion avec le bouton de `/admin/prompts` ;
2. transformation des pages côté serveur ;
3. création ou mise à jour idempotente dans D1.

La production requiert les variables serveur `NOTION_TOKEN` (secret) et
`NOTION_DATABASE_ID`. Le pipeline local `scripts/notion-export.mjs` puis
`scripts/build-seed.ts` conserve une copie de secours dans `data/prompts.json`.

L’import utilise l’identifiant de page Notion pour éviter les doublons et produit un rapport créés / modifiés / inchangés / erreurs.

## 10. Architecture technique

Stack :

- Next.js 15 App Router ;
- React 19 ;
- TypeScript strict ;
- Tailwind CSS ;
- Drizzle ORM ;
- Cloudflare D1 ;
- OpenNext Cloudflare ;
- `jose` pour la validation OIDC ;
- Zod pour la validation.

Répertoires importants :

- `src/app` : pages, layouts et routes API ;
- `src/components` : interface et interactions client ;
- `src/lib` : authentification, sessions, sécurité, base et logique métier ;
- `db/schema.ts` : schéma Drizzle ;
- `drizzle/` : migrations embarquées pour Sites ;
- `data/prompts.json` : catalogue source ;
- `public/brand` : identité visuelle et médias ;
- `public/icons` : icônes Microsoft ;
- `.openai/hosting.json` : identifiant Sites et binding D1.

Routes principales :

- `/login` ;
- `/bibliotheque` ;
- `/catalogue` ;
- `/favoris` ;
- `/app/[slug]` ;
- `/prompt/[slug]` ;
- `/profil` ;
- `/admin` ;
- `/admin/prompts` ;
- `/admin/utilisateurs` ;
- `/admin/journal`.

## 11. Hébergement actuel

Le site est publié sur OpenAI Sites et fonctionne 24 h/24 sans que le poste local reste allumé.

Le projet Sites utilise :

- un projet de production existant ;
- un build OpenNext compatible Cloudflare Workers ;
- une base D1 persistante ;
- des variables d’environnement hébergées séparément du code ;
- un déploiement public au niveau de l’hébergement, avec protection applicative Microsoft pour les pages privées.

Le fait que l’hébergement soit « public » signifie que la page de connexion est accessible par URL. Les données applicatives restent protégées par Microsoft Entra et les contrôles serveur.

## 12. Domaine personnalisé recommandé

Pour ne plus afficher `chahinez-bitouche98.chatgpt.site`, la meilleure solution est :

1. choisir un sous-domaine, par exemple `prompts.insepti.com` ;
2. l’ajouter comme domaine personnalisé dans Sites ;
3. créer les enregistrements DNS demandés chez le gestionnaire du domaine ;
4. ajouter `https://prompts.insepti.com/api/auth/callback` aux Redirect URIs Azure ;
5. mettre à jour les URI Entra dans les variables Sites ;
6. redéployer ;
7. tester connexion et déconnexion.

Changer uniquement le nom, l’e-mail administrateur ou le titre du site ne modifie pas l’URL actuelle.

## 13. Migration future vers la VM OVH

Le projet peut être déplacé sur une VM Linux, mais le build Sites/Cloudflare ne doit pas être copié tel quel.

Travail recommandé :

- conteneuriser l’application avec Docker ;
- déployer Next.js en mode Node ;
- remplacer D1 par PostgreSQL ou SQLite serveur ;
- migrer les données ;
- placer Nginx ou Caddy devant l’application ;
- activer HTTPS automatique ;
- stocker les secrets dans des variables système ou un gestionnaire de secrets ;
- ajouter sauvegardes quotidiennes et supervision ;
- mettre à jour les Redirect URIs Azure ;
- limiter l’accès SSH et activer un pare-feu.

Tant qu’aucune contrainte métier n’impose la VM, Sites est le moyen le plus simple de conserver le portail disponible 24 h/24.

## 14. Commandes locales utiles

```bash
npm install
npm run dev
npm run typecheck
npm run test:unit
npm run build
npx opennextjs-cloudflare build
```

Développement local :

- copier `.env.example` vers `.env.local` ;
- renseigner les identifiants Entra de développement ;
- appliquer les migrations D1 locales ;
- ne jamais commiter `.env.local`.

## 15. Points à surveiller

- Faire tourner le secret client Azure avant diffusion large.
- Configurer un domaine personnalisé pour une URL réellement INSEPTI.
- Nettoyer depuis l’administration les anciens comptes techniques ou Gmail devenus inutiles.
- Sauvegarder régulièrement la base D1.
- Vérifier que deux administrateurs actifs existent avant de retirer un ancien compte administrateur.
- Ne jamais supprimer le dernier administrateur.
- Tester une connexion collaborateur réelle après chaque changement Azure.

## 16. État final de cette livraison

Cette livraison comprend :

- illustration `pop` à gauche de la connexion ;
- vidéo `Insepti Logo Reveal (1)` sur fond blanc, légèrement agrandie à droite ;
- logo Microsoft dans le bouton ;
- largeur de recherche d’Accueil réduite ;
- thème appliqué immédiatement sans bouton Enregistrer ;
- section active visible dans l’administration ;
- ajout d’un collaborateur directement dans le tableau ;
- suppression d’un collaborateur depuis le tableau ;
- statut actif affiché en vert ;
- retrait de la liste séparée sous le formulaire d’ajout ;
- documentation complète de reprise ;
- publication de production 24 h/24.
