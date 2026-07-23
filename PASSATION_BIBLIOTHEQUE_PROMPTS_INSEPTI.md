# Passation — Portail INSEPTI de prompts Microsoft 365 Copilot

## 1. Finalité du document

Ce document est la source de vérité fonctionnelle et technique pour transformer la bibliothèque Notion actuelle en une véritable application web privée destinée aux consultants INSEPTI.

Le site doit permettre à chaque collègue de s’identifier, rester connecté sur son ordinateur s’il le souhaite, rechercher les prompts, les personnaliser, les copier, les enregistrer dans ses favoris personnels et les ouvrir depuis n’importe quel appareil autorisé.

Le projet doit être réalisé sans modifier, déplacer ou supprimer la bibliothèque Notion existante. Notion est une source de migration en lecture seule jusqu’à validation explicite d’une synchronisation future.

## 2. Sources existantes

### Bibliothèque Notion publique

- URL publique canonique : `https://lava-balloon-ffb.notion.site/Biblioth-que-de-prompts-Microsoft-365-Copilot-3a4b883b8f848174a2edd3b19f08a97c`
- Page Notion interne : `3a4b883b-8f84-8174-a2ed-d3b19f08a97c`
- Base unique actuelle : `Tous les prompts`
- Data source Notion : `9b5f8fc8-cbbb-45e3-954a-15aa29be90d8`
- Schéma actuel : `Prompt` (titre), `Application` (sélection), `Description` (texte)
- Nombre de prompts métiers : 75
- Langue du contenu : français

### Répartition des 75 prompts

| Application | Nombre |
|---|---:|
| Copilot | 8 |
| Word | 9 |
| Excel | 10 |
| PowerPoint | 10 |
| Teams | 10 |
| Outlook | 10 |
| OneNote | 4 |
| OneDrive | 3 |
| SharePoint | 3 |
| Forms | 4 |
| Planner | 4 |

Total attendu après import : **75 prompts**, sans ligne vide et sans doublon.

### Structure d’une fiche de prompt Notion

Chaque fiche contient généralement :

1. un titre ;
2. une application Microsoft ;
3. une description courte ;
4. une section `À personnaliser` avec des variables comme `[CLIENT]`, `[MISSION]`, `[TABLE]` ou `[QUESTION]` ;
5. une section `Prompt prêt à copier` contenant le texte intégral.

Attention : certaines propriétés `Description` sont volontairement ou historiquement abrégées avec le caractère `…`. Exemple actuel : `Analyse … pour répondre à ….`. Le texte intégral du bloc `Prompt prêt à copier` reste la référence canonique. Lors de l’import, conserver le prompt intégral exactement et générer, si nécessaire, une description courte lisible qui n’invente aucun fait.

### Logo et identité visuelle

- Copie locale directement exploitable : `C:\Users\kadri\OneDrive\Documents\test1 2\insepti_logo_notion.png`
- Logo primaire du brand kit : `C:\Users\kadri\OneDrive - INSEPTI\Documents\brqnd-kit\Brand-kit Insepti\Insepti_Copilot_Brand_Kit_Package\Insepti_Copilot_Brand_Kit_Package\03_Logo\Insepti_logo_primary.png`
- Couleurs indicatives à confirmer à partir du logo : vert INSEPTI, gris anthracite, blanc, avec accents Microsoft par application.
- Ne pas redessiner le logo en SVG. Réutiliser l’asset officiel fourni.
- Utiliser les icônes officielles ou correctement licenciées pour Microsoft 365, Word, Excel, PowerPoint, Teams, Outlook, OneNote, OneDrive, SharePoint, Forms et Planner.

## 3. Utilisateurs et accès

### Public cible

- Consultants et collaborateurs INSEPTI.
- Administrateurs chargés de gérer les accès et le catalogue.
- Interface principale en français.

### Authentification recommandée

Utiliser **Microsoft Entra ID / Microsoft 365 en OpenID Connect** comme méthode principale, car les utilisateurs évoluent déjà dans l’écosystème Microsoft.

Principes obligatoires :

- aucun mot de passe Microsoft n’est stocké par l’application ;
- authentification OIDC avec PKCE, `state` et `nonce` ;
- autorisation serveur par tenant Microsoft et/ou liste de domaines d’e-mail INSEPTI ;
- possibilité d’ajouter une allowlist d’utilisateurs ;
- comptes désactivés refusés immédiatement ;
- rôles `member` et `admin` contrôlés côté serveur ;
- aucune décision d’autorisation ne repose uniquement sur le navigateur ;
- aucune clé, aucun secret ou jeton dans le dépôt Git.

Si la plateforme de déploiement choisie ne permet pas proprement Entra ID, vérifier son mécanisme d’identité actuel avant d’écrire une pile d’authentification personnalisée. Ne jamais simuler une authentification en production.

### Option « Rester connecté »

L’écran de connexion comprend une case non cochée par défaut : `Rester connecté sur cet appareil`.

Comportement attendu :

- sans la case : cookie de session de courte durée, cible de 8 à 12 heures ;
- avec la case : cookie persistant, cible de 30 jours ;
- cookie `HttpOnly`, `Secure`, `SameSite=Lax`, chemin `/` ;
- jetons de session opaques, hachés côté base si des sessions applicatives sont stockées ;
- rotation après connexion et lors d’une élévation de privilège ;
- renouvellement glissant raisonnable sans rendre une session infinie ;
- déconnexion locale et révocation serveur ;
- expiration ou révocation d’un compte appliquée à la requête suivante ;
- ne jamais stocker de jeton d’accès dans `localStorage` ;
- afficher une recommandation de ne pas utiliser cette option sur un poste partagé.

### Données personnelles par utilisateur

Après authentification, chaque utilisateur possède :

- ses favoris personnels ;
- ses préférences d’interface ;
- éventuellement son historique récent de consultation, désactivable ;
- aucune visibilité sur les favoris ou l’historique des autres membres.

Le système de favoris qui n’était pas adapté à une page Notion partagée redevient pertinent grâce aux comptes individuels.

## 4. Périmètre fonctionnel

### Pages et routes minimales

- `/login` : connexion Microsoft, explication courte, case `Rester connecté`.
- `/` : accueil authentifié et tableau de bord de la bibliothèque.
- `/app/[slug]` : catalogue filtré par application.
- `/prompt/[slug]` : fiche complète, partageable entre utilisateurs autorisés.
- `/favoris` : favoris personnels.
- `/catalogue` : tableau de tous les prompts avec recherche, filtres et tri.
- `/profil` : identité, préférences, sessions et déconnexion.
- `/admin` : gestion du catalogue, des utilisateurs autorisés et des imports, réservée aux administrateurs.
- pages d’erreur : accès refusé, session expirée, page introuvable et erreur serveur.

### Accueil

L’accueil doit présenter immédiatement :

- le logo INSEPTI dans une taille maîtrisée ;
- un message de bienvenue personnalisé ;
- une recherche globale centrale ;
- des cartes carrées ou légèrement rectangulaires pour les 11 applications ;
- une carte `Favoris` personnelle ;
- les prompts récemment utilisés, si cette préférence est activée ;
- les prompts populaires ou recommandés, uniquement si une métrique réelle existe ;
- un accès clair au catalogue complet.

Les cartes d’applications contiennent uniquement le logo et le nom de l’application. Aucun double logo, aucune flèche décorative inutile, aucune numérotation du type `2. Word`.

### Recherche et catalogue

La recherche doit fonctionner sur :

- titre ;
- description ;
- contenu intégral du prompt ;
- application ;
- variables et mots-clés ;
- tags futurs.

Fonctions attendues :

- résultats instantanés avec délai anti-rebond ;
- recherche tolérant les accents et la casse ;
- filtres par application et favoris ;
- tri par pertinence, ordre alphabétique et date de mise à jour ;
- état vide utile ;
- raccourci clavier de type `Ctrl/Cmd + K` pour ouvrir une palette de recherche ;
- URL partageable des recherches et filtres lorsque c’est pertinent.

### Cartes de prompts

Chaque carte affiche :

- le titre complet ;
- une mini-description lisible, jamais une troncature incohérente enregistrée comme contenu ;
- l’application via sa couleur ou une petite icône unique ;
- l’état favori propre à l’utilisateur ;
- un accès clavier et tactile.

La grille doit respirer, exploiter la largeur de l’écran et s’adapter aux écrans de bureau, tablettes et mobiles.

### Fiche de prompt

La fiche affiche :

- titre complet ;
- description complète ;
- application ;
- bouton favori personnel ;
- zone `À personnaliser` dans la couleur de l’application ;
- champs générés à partir des variables détectées entre crochets ;
- aperçu du prompt final avec les valeurs injectées ;
- bloc `Prompt prêt à copier` dans la couleur de l’application ;
- bouton `Copier` toujours visible et retour visuel accessible ;
- bouton `Utiliser` lorsque le comportement est fiable ;
- navigation de retour interne à l’application, sans dépendre d’une URL d’éditeur Notion.

Le bouton `Utiliser` doit au minimum copier le prompt puis ouvrir l’application Microsoft pertinente dans un nouvel onglet. Ne promettre le préremplissage automatique d’un chat Copilot que si Microsoft fournit un lien profond stable et officiellement documenté. Sinon, expliquer clairement : `Prompt copié — collez-le dans Copilot`.

### Favoris

- ajout et retrait optimistes avec restauration en cas d’erreur ;
- synchronisation serveur ;
- page dédiée ;
- compteur sur l’accueil ;
- résultat propre à l’utilisateur connecté ;
- contrainte d’unicité `(user_id, prompt_id)`.

### Administration

Un administrateur peut :

- créer, modifier, archiver et restaurer un prompt ;
- gérer titre, application, description, texte intégral, variables, tags et ordre ;
- prévisualiser avant publication ;
- importer ou réimporter depuis une source structurée ;
- consulter la date du dernier import ;
- gérer l’allowlist et les rôles ;
- consulter un journal d’audit minimal.

La suppression définitive est évitée. Utiliser un archivage récupérable.

## 5. Direction UX/UI

### Intention

Le produit doit impressionner les collègues tout en restant immédiatement compréhensible : premium, moderne, précis, rapide, vivant et professionnel. Éviter l’apparence d’un tableau de bord générique ou d’un simple clone de Notion.

### Principes visuels

- largeur généreuse avec conteneur adaptatif ;
- hiérarchie typographique forte ;
- beaucoup d’espace blanc maîtrisé ;
- surfaces légèrement translucides ou élevées, sans excès ;
- bordures subtiles, rayons contemporains et ombres légères ;
- couleurs propres à chaque application Microsoft ;
- mode clair et sombre ;
- micro-interactions sur survol, focus, copie, favori et ouverture de fiche ;
- transitions de 150 à 250 ms ;
- respecter `prefers-reduced-motion` ;
- aucun carrousel inutile, aucune animation qui bloque la lecture ;
- aucune image générique décorative si la typographie et le produit suffisent.

### Expérience attendue

- recherche accessible en un geste ;
- retour à l’accueil toujours évident ;
- chargements avec skeletons cohérents ;
- toasts lisibles et non intrusifs ;
- conservation des filtres lors du retour ;
- focus clavier restauré après fermeture d’une modale ;
- feedback immédiat après copie et favori ;
- aucune ligne de texte importante coupée sans possibilité de la lire.

### Accessibilité

- objectif WCAG 2.2 AA ;
- contraste suffisant ;
- navigation intégrale au clavier ;
- focus visible ;
- labels explicites ;
- cibles tactiles d’au moins 44 × 44 px ;
- annonces `aria-live` pour copie, favoris et erreurs ;
- structure sémantique et ordre de tabulation logique.

## 6. Architecture technique recommandée

### Cible OpenAI Sites / Cloudflare

Si le projet est construit avec la pile Sites :

- conserver le starter Vinext et sa compatibilité Cloudflare Worker ESM ;
- TypeScript strict ;
- composants serveur par défaut et composants client seulement pour l’interactivité ;
- D1 pour les données structurées persistantes ;
- R2 à `null` tant qu’aucun upload n’est demandé ;
- `.openai/hosting.json` contient uniquement le `project_id` et les bindings logiques nécessaires ;
- schéma dans `db/schema.ts` ;
- migrations Drizzle versionnées et inspectées ;
- accès D1 centralisé dans un petit module serveur ;
- requêtes préparées, paramètres liés, index pertinents ;
- déploiement privé par défaut.

Avant d’implémenter Entra ID sur cette cible, vérifier le mécanisme d’authentification externe actuellement supporté par la plateforme. Si l’hébergement Sites impose un autre modèle d’identité, documenter le compromis et conserver les contrôles d’autorisation serveur.

### Modèle de données minimal

#### `users`

- `id`
- `entra_subject` unique
- `email` unique normalisé
- `display_name`
- `avatar_url` nullable
- `role` (`member` ou `admin`)
- `status` (`active` ou `disabled`)
- `created_at`, `updated_at`, `last_login_at`

#### `sessions` si la bibliothèque d’authentification n’en fournit pas

- `id`
- `user_id`
- `token_hash` unique
- `remember_me`
- `created_at`, `last_seen_at`, `expires_at`, `revoked_at`
- métadonnées minimales de sécurité, sans empreinte invasive

#### `applications`

- `id`, `slug`, `name`, `color`, `icon_key`, `sort_order`, `is_active`

#### `prompts`

- `id`, `slug`, `title`, `description`, `body`
- `application_id`
- `variables_json`
- `tags_json` ou table normalisée si nécessaire
- `source_notion_page_id` unique nullable
- `source_updated_at` nullable
- `status` (`draft`, `published`, `archived`)
- `created_at`, `updated_at`, `published_at`

#### `favorites`

- `user_id`, `prompt_id`, `created_at`
- clé primaire ou index unique sur `(user_id, prompt_id)`

#### `prompt_events` optionnel et respectueux de la vie privée

- événements agrégés de consultation, copie et utilisation ;
- ne pas stocker le contenu personnalisé saisi par l’utilisateur ;
- politique de rétention documentée.

#### `audit_log`

- actions administratives importantes, acteur, cible, horodatage et résumé non sensible.

### Import de Notion

Créer un importeur idempotent qui :

1. lit la bibliothèque publique ou un export structuré en lecture seule ;
2. découvre les 11 applications et leurs fiches ;
3. extrait titre, application, description, variables et prompt intégral ;
4. normalise uniquement les espaces et sauts de ligne nécessaires ;
5. ne réécrit jamais le contenu source dans Notion ;
6. utilise `source_notion_page_id` pour éviter les doublons ;
7. produit un rapport : créés, mis à jour, inchangés, ignorés et erreurs ;
8. échoue si le total final publié n’est pas 75 lors du premier import ;
9. valide la répartition par application indiquée plus haut ;
10. permet un seed local reproductible dans `data/prompts.json` ou équivalent.

Ne pas rendre le fonctionnement quotidien du site dépendant du temps de réponse de Notion. Le catalogue actif est servi depuis la base applicative.

## 7. Sécurité et confidentialité

- authentification et autorisation vérifiées côté serveur sur toutes les routes protégées ;
- défense CSRF pour les mutations ;
- validation stricte des entrées ;
- échappement des sorties et absence de HTML non fiable ;
- politique CSP adaptée ;
- en-têtes de sécurité ;
- limitation de débit sur connexion, recherche abusive et administration ;
- journalisation sans secrets, tokens, prompts personnalisés ni données sensibles ;
- messages d’erreur non révélateurs ;
- secrets uniquement dans le gestionnaire d’environnement de la plateforme ;
- `.env.example` documenté avec valeurs factices ;
- dépendances minimales et maintenues ;
- sauvegarde et restauration documentées ;
- conformité avec les règles internes INSEPTI avant ouverture générale.

## 8. Performance et qualité

- rendu initial rapide ;
- pagination ou virtualisation si le catalogue grandit ;
- recherche indexée ;
- cache raisonnable des données publiques aux utilisateurs authentifiés ;
- invalidation après modification administrative ;
- objectifs indicatifs : LCP < 2,5 s, CLS < 0,1, INP < 200 ms sur un poste standard ;
- aucune dépendance lourde uniquement pour une animation mineure.

## 9. Tests et validation

### Tests obligatoires

- tests unitaires : détection/remplacement des variables, permissions, durées de session, normalisation de recherche ;
- tests d’intégration : import, favoris, catalogue, rôles, révocation de session ;
- tests de bout en bout : connexion, option rester connecté, recherche, filtre, ouverture, personnalisation, copie, favori, déconnexion et refus d’accès ;
- tests d’accessibilité automatisés sur les routes principales ;
- vérification responsive mobile, tablette et bureau ;
- build de production sans erreur TypeScript ;
- migrations reproductibles sur une base vide.

### Critères d’acceptation

- un utilisateur non connecté ne peut pas accéder à la bibliothèque ;
- un membre autorisé se connecte avec Microsoft ;
- la case `Rester connecté` modifie réellement la durée de session ;
- la session persiste après fermeture/réouverture du navigateur dans le cas autorisé ;
- les favoris sont personnels et disponibles sur un second appareil après connexion ;
- les 75 prompts sont présents avec la bonne répartition ;
- les contenus complets sont copiables ;
- la recherche retrouve un prompt par titre, contenu ou application ;
- l’interface est intégralement utilisable au clavier ;
- aucun secret ne figure dans le client ou le dépôt ;
- un administrateur peut archiver sans suppression irréversible ;
- le site est déployé avec accès privé et une documentation de reprise.

## 10. Livrables attendus de Claude Code

- application complète, pas une simple maquette ;
- code source propre et typé ;
- design system et composants réutilisables ;
- schéma de base et migrations ;
- seed/importeur des 75 prompts ;
- authentification prête pour Entra ID avec configuration documentée ;
- tests et scripts de validation ;
- `.env.example` sans secret ;
- README d’installation, développement, import, administration, déploiement et restauration ;
- journal des décisions techniques ;
- liste très courte des seules actions humaines restantes, notamment les identifiants Entra ID si indisponibles ;
- build validé ;
- déploiement privé si les accès et la plateforme le permettent.

## 11. Règles de conduite pour l’implémentation

- lire ce document en entier avant de modifier le dépôt ;
- inspecter le projet existant et préserver son architecture, son gestionnaire de paquets et son lockfile ;
- ne jamais modifier la bibliothèque Notion ;
- ne jamais inventer des prompts absents de la source ;
- ne jamais supprimer de fichiers ou données sans nécessité démontrée et sauvegarde récupérable ;
- avancer de manière autonome ;
- ne poser une question que si une information externe bloque réellement la sécurité ou la mise en production ;
- si des identifiants Entra ID manquent, terminer tout le reste avec une configuration locale sûre et fournir la procédure exacte ;
- maintenir un fichier de progression pour survivre aux compactages de contexte ;
- valider chaque jalon important avant de passer au suivant ;
- livrer un produit cohérent, pas une juxtaposition de composants génériques.

