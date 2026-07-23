# État d'implémentation — Bibliothèque de prompts INSEPTI

Dernière mise à jour : 2026-07-23. Ce fichier est la source de vérité de progression, à maintenir à jour pour survivre à un compactage de contexte.

## Modernisation INSEPTI — 2026-07-23

- Identité visuelle alignée sur `insepti/Insepti_Template_PPT - Copy.pptx` : vert action `#75C044`, vert accessible `#315F2A`, graphite `#273238`, ardoise `#737D85`, brume `#ECEEEE`, blanc cassé `#F7F8F6` et titres Bahnschrift.
- Deux thèmes fonctionnels : clair sur fond `#F7F8F6` et sombre sur fond principal `#273238`, avec préférence utilisateur persistante.
- Navigation principale réduite à **Prompts** et **Favoris**. Profil, réglages, sessions, déconnexion et fonctions administratives sont regroupés derrière le menu profil.
- Espace administrateur exposé depuis le profil sous trois entrées : gestion des prompts, comptes et accès, journal de sécurité.
- Page de connexion modernisée avec l'animation de logo fournie et maintien de l'authentification Microsoft Entra ID.
- Icônes Microsoft 365 vectorielles ajoutées localement pour les 11 applications (assets Microsoft officiels ; l'icône Project est utilisée pour Planner, les deux produits partageant désormais l'expérience de planification Microsoft).
- Vérifications après modernisation : TypeScript propre, 25 tests unitaires passants, build Next.js de production réussi.

### Décision d'hébergement à valider

Le projet reste local pour cette étape. Le socle actuel cible Cloudflare Workers + D1. Un hébergement sur une VM Linux OVH est possible, mais nécessite une adaptation planifiée de la base D1 vers PostgreSQL ou SQLite serveur, puis une conteneurisation et un reverse proxy HTTPS. Cette migration n'a pas été engagée sans validation.

## Fait et vérifié

- **Extraction Notion** : intégration API Notion (lecture seule) créée par l'utilisateur, 75 fiches extraites avec titre/application/description/variables/prompt intégral. Répartition validée : Copilot 8, Word 9, Excel 10, PowerPoint 10, Teams 10, Outlook 10, OneNote 4, OneDrive 3, SharePoint 3, Forms 4, Planner 4 (`scripts/notion-export.mjs`, `data/notion-raw.json` non commité).
- **Seed reproductible** : `scripts/build-seed.ts` (logique pure dans `src/lib/notion-transform.ts`, testée) produit `data/prompts.json`, validé 75/75, commité.
- **Schéma + migrations** : `db/schema.ts` (10 tables), migrations Drizzle générées et **appliquées avec succès sur une base D1 locale vide** (`npx wrangler d1 migrations apply --local`).
- **Auth Entra ID (OIDC maison)** : PKCE + state + nonce, vérification JWKS via `jose`, allowlist domaine/DB/bootstrap admin, sessions opaques hachées avec durée 10h/30j et renouvellement plafonné. Code complet dans `src/lib/oidc.ts`, `src/lib/session.ts`, `src/lib/session-policy.ts`, `src/lib/users.ts`, routes `src/app/api/auth/*`.
- **Importeur idempotent** : `src/lib/import-prompts.ts`, upsert par `source_notion_page_id`, rapport créés/mis à jour/inchangés/erreurs. **Testé en conditions réelles** : import exécuté deux fois sur D1 local via l'API `/api/admin/import`, résultat stable (75 publiés, 0 erreur).
- **Toutes les pages** de la passation section 4 : `/login`, `/`, `/app/[slug]`, `/prompt/[slug]`, `/favoris`, `/catalogue`, `/profil`, `/admin` (+ sous-pages prompts/utilisateurs/journal), pages d'erreur (404, accès refusé, session expirée, erreur serveur).
- **Sécurité** : CSRF double-submit-cookie sur toutes les mutations, rate limiting D1 sur connexion/recherche, CSP + en-têtes de sécurité (`next.config.ts`), validation Zod sur toutes les routes API, autorisation vérifiée indépendamment dans chaque route `/api/admin/*` (pas seulement dans le layout).
- **Design** : palette INSEPTI + couleurs par application Microsoft, mode clair/sombre, `prefers-reduced-motion` respecté, focus visible, `aria-live` pour toasts, cibles tactiles ≥44px.
- **Tests unitaires** : 25 tests Vitest passants (`npm run test:unit`) couvrant extraction de variables, génération de description, `slugify`, remplacement de variables dans le prompt, politique de durée/renouvellement de session, normalisation de recherche.
- **Build** : `npm run build` (Next.js) et `npx opennextjs-cloudflare build` (bundle Worker Cloudflare) **passent sans erreur**. `tsc --noEmit` propre.
- **Vérification navigateur (partielle, voir limitation ci-dessous)** : accueil, catalogue, page par application, fiche de prompt, favoris, import admin — tous vérifiés visuellement et fonctionnellement via appels API directs. Les données réelles (75 prompts, 11 applications, couleurs, favoris) s'affichent correctement.

## Limitation de test connue — À refaire dans un vrai navigateur

L'environnement de navigateur automatisé utilisé pendant cette session (Electron intégré à l'outil, erreurs visibles dans sa propre console : `Cannot destructure property 'preloadScripts'...`) n'est pas parvenu à déclencher fiablement les clics/saisies sur les composants interactifs (bouton favori, personnalisation de variable, palette de recherche Ctrl/Cmd+K), alors que :

- le bundle client contient bien le code attendu (vérifié par inspection du chunk JS) ;
- la console applicative ne montre **aucune** erreur React/hydratation ;
- toutes les API concernées fonctionnent correctement quand on les appelle directement (`fetch` manuel depuis la console) : ajout aux favoris, recherche, import — vérifiés avec succès de bout en bout (la page `/favoris` reflète bien l'ajout effectué via l'API).

**Action recommandée avant mise en production** : ouvrir l'application dans un vrai navigateur (Chrome/Edge) et cliquer manuellement sur : étoile favoris, champ de personnalisation de variable (vérifier l'aperçu live), bouton Copier, bouton Utiliser, palette Ctrl/Cmd+K, boutons d'administration (import, changement de statut/rôle). Le code suit des patterns React standards (composants clients, `useState`/`onChange` contrôlés) qui n'ont aucune raison de ne pas fonctionner dans un navigateur réel ; cette limitation semble propre à l'outil d'automatisation utilisé ici, pas au code livré — mais elle n'a **pas été vérifiée à l'œil humain** et doit donc être confirmée.

## Non fait / actions humaines restantes

1. **Identifiants Entra ID réels** : `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET` sont des placeholders. Un administrateur INSEPTI doit créer l'inscription d'application dans Azure (procédure exacte dans `README.md`).
2. **Icônes officielles des applications Microsoft** : les cartes utilisent actuellement un badge typographique coloré (2 lettres) faute de pouvoir vérifier la licence exacte des icônes officielles sans les télécharger moi-même depuis une source non fournie par l'utilisateur. Remplacer par les icônes Fluent UI officielles (`https://github.com/microsoft/fluentui-system-icons`, licence MIT) dans `public/icons/` et les référencer dans `src/lib/applications-data.ts`.
3. **Compte Cloudflare / déploiement réel** : `wrangler.toml` contient `database_id = "REPLACE_WITH_D1_DATABASE_ID"` — à remplacer après `wrangler d1 create insepti_biblio`. Aucun déploiement distant n'a été effectué (pas d'accès à un compte Cloudflare dans cet environnement).
4. **Vérification manuelle en navigateur réel** de l'interactivité (voir section limitation ci-dessus).
5. **Tests d'intégration et E2E** (Playwright) : le harnais (`@playwright/test`, `@axe-core/playwright`) est installé et scripté (`npm run test:e2e`) mais aucun scénario n'est encore écrit. Prioriser : connexion (mock OIDC ou compte de test), rester connecté, recherche, filtre, personnalisation, copie, favori, déconnexion, refus d'accès anonyme, accessibilité automatisée sur les routes principales.
6. **Édition de contenu de prompt côté admin** : l'API `PATCH /api/admin/prompts/[id]` supporte déjà la modification du contenu (titre/description/corps), mais aucune page d'édition dédiée n'a été construite dans `/admin/prompts` (seuls les changements de statut publié/archivé/brouillon ont une interface). À ajouter si l'équipe a besoin d'éditer le texte sans repasser par Notion.
7. **Compte de démonstration local** : une base D1 locale (`.wrangler/state`, non commitée) contient un utilisateur/session de test (`dev.admin@insepti.com`) créé uniquement pour la vérification manuelle pendant le développement. Sans effet en production (base distincte), mais à ignorer/supprimer si vous réutilisez cet état local.

## Décisions techniques notables

Voir aussi le journal détaillé dans ce même fichier ci-dessous.

- **Pas d'OpenAI Sites détecté** dans l'environnement (pas de `.openai/hosting.json`, pas de CLI Sites) → cible Cloudflare Workers directe via `@opennextjs/cloudflare` + Wrangler, qui est explicitement l'architecture de repli prévue par la passation (D1 + Drizzle + Cloudflare Worker ESM), sans la couche Sites.
- **Pas de librairie d'auth tierce** (Auth.js/NextAuth) : implémentation OIDC directe pour garder un contrôle total sur le modèle de session opaque exact exigé par la passation (table `sessions` avec `token_hash`, `remember_me`, `revoked_at`), plutôt que d'adapter le modèle de session propre à une librairie.
- **Sécurisé par défaut** : sans domaine e-mail ni allowlist configurés, aucun utilisateur n'est autorisé (sauf le compte de démarrage explicite), pour éviter une ouverture accidentelle du portail à tout titulaire d'un compte Microsoft.
- **Recherche** : colonne `search_text` normalisée (minuscules, sans accents) calculée à l'import plutôt que FTS5, pour rester simple et prévisible sur un catalogue de cette taille (75-quelques centaines de prompts).
