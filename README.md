# Bibliothèque de prompts INSEPTI

Portail web privé pour les consultants INSEPTI : connexion Microsoft Entra ID, recherche, personnalisation et copie des 75 prompts Microsoft 365 Copilot, favoris personnels, administration du catalogue.

Voir [PASSATION_BIBLIOTHEQUE_PROMPTS_INSEPTI.md](./PASSATION_BIBLIOTHEQUE_PROMPTS_INSEPTI.md) pour la spécification complète, et [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) pour l'état d'avancement détaillé.

## Stack technique

- Next.js 15 (App Router), TypeScript strict, Tailwind CSS.
- Authentification : client OIDC maison pour Microsoft Entra ID (PKCE + state + nonce), sessions opaques hachées en base, sans dépendance à une librairie tierce.
- Base de données : Cloudflare D1 (SQLite) via Drizzle ORM, migrations versionnées dans `db/migrations`.
- Hébergement actuel : développement local avec cible technique Cloudflare Workers via `@opennextjs/cloudflare`.
- Hébergement envisagé : VM Linux OVH 24/7. Avant ce choix, prévoir une migration de D1 vers PostgreSQL ou SQLite serveur et une image Docker ; ne pas déployer le build Cloudflare tel quel sur la VM.

## Installation

```bash
npm install
cp .env.example .env.local
```

Remplissez `.env.local` avec vos identifiants Entra ID (voir ci-dessous) et vos domaines autorisés.

## Développement local

```bash
npm run cf:types          # génère worker-configuration.d.ts depuis wrangler.toml
npx wrangler d1 migrations apply insepti_biblio --local
npm run dev
```

`next dev` utilise Miniflare (via `initOpenNextCloudflareForDev`) pour exposer le binding D1 local déclaré dans `wrangler.toml`, donc aucune étape supplémentaire n'est nécessaire pour que `getCloudflareContext()` fonctionne en local.

## Import des prompts depuis Notion

L'import est un pipeline en trois étapes, toutes idempotentes et sans écriture dans Notion :

1. **Extraction** (nécessite `NOTION_TOKEN`, voir `.env.notion.local`, jamais commité) :
   ```bash
   npm run import:notion
   ```
   Interroge l'API Notion officielle en lecture seule et écrit `data/notion-raw.json` (non commité — régénérable).

2. **Construction du seed reproductible** :
   ```bash
   npm run import:seed
   ```
   Transforme `data/notion-raw.json` en `data/prompts.json` (commité, source de vérité applicative). Échoue explicitement si le total n'est pas 75 ou si la répartition par application ne correspond pas exactement à la passation.

3. **Import en base** : depuis `/admin` (rôle administrateur), bouton **Importer / réimporter depuis le seed**. Idempotent via `source_notion_page_id` : réexécutable sans créer de doublons. Le rapport (créés / mis à jour / inchangés / erreurs) s'affiche immédiatement.

## Authentification Microsoft Entra ID

Aucune librairie d'authentification tierce : le portail implémente directement le flux OIDC "Authorization Code + PKCE" contre les endpoints `login.microsoftonline.com`, avec vérification `state`/`nonce`/signature JWKS via `jose`.

Configuration requise (voir `.env.example`) :

1. Dans Azure Portal → Microsoft Entra ID → Inscriptions d'applications → **Nouvelle inscription**.
2. Type de compte : **comptes de cet annuaire uniquement** (single-tenant).
3. Redirect URI (Web) : `https://<votre-domaine>/api/auth/callback` (et `http://localhost:3000/api/auth/callback` en dev).
4. Générer un secret client (Certificats et secrets), le reporter dans `ENTRA_CLIENT_SECRET`.
5. Renseigner `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`.
6. Définir `ALLOWED_EMAIL_DOMAINS` (domaines INSEPTI autorisés) et/ou gérer l'allowlist depuis `/admin/utilisateurs` une fois un premier administrateur créé.
7. `BOOTSTRAP_ADMIN_EMAIL` : la première connexion réussie avec cette adresse devient automatiquement administrateur. À retirer une fois au moins un admin actif.

Sans domaine ni allowlist configurés, **personne n'est autorisé** (sécurisé par défaut), à l'exception de l'e-mail de démarrage.

### Session et « Rester connecté »

- Sans la case cochée : cookie de session ~10h (cible 8-12h).
- Avec la case cochée : cookie persistant 30 jours.
- Cookie `HttpOnly`, `Secure`, `SameSite=Lax`. Jeton opaque, haché (SHA-256) en base — jamais stocké en clair.
- Renouvellement glissant plafonné (jamais de session infinie) : voir `src/lib/session-policy.ts`.
- Révocation serveur immédiate possible depuis `/profil` (sessions actives) ou par un administrateur (désactivation de compte, changement de rôle).

## Tests

```bash
npm run test:unit       # Vitest — variables, description, recherche, politique de session
npm run typecheck
npm run build
```

Voir `IMPLEMENTATION_STATUS.md` pour la liste des tests d'intégration/E2E encore à écrire et leur périmètre prévu.

## Déploiement Cloudflare

```bash
npm run cf:types
npx wrangler d1 create insepti_biblio      # une seule fois, reporter l'ID dans wrangler.toml
npx wrangler d1 migrations apply insepti_biblio --remote
npm run cf:deploy
```

Configurez les secrets (`ENTRA_CLIENT_SECRET`, etc.) via `wrangler secret put <NOM>` — jamais dans `wrangler.toml` ni dans Git.

## Restauration / sauvegarde

- Le catalogue est entièrement reconstructible depuis `data/prompts.json` (commité) via le bouton d'import — aucune dépendance à un service externe pour fonctionner au quotidien.
- Sauvegarde D1 : `npx wrangler d1 export insepti_biblio --remote --output backup.sql`.
- Restauration : `npx wrangler d1 execute insepti_biblio --remote --file backup.sql`.
- Révocation d'accès immédiate : administrateur → `/admin/utilisateurs` → **Désactiver** (révoque aussi toutes les sessions actives de l'utilisateur).

## Structure du dépôt

- `src/app` — routes et pages (App Router).
- `src/lib` — logique serveur (session, auth OIDC, requêtes Drizzle) et logique pure testée unitairement.
- `src/components` — composants d'interface (client et serveur).
- `db/schema.ts`, `db/migrations/` — schéma et migrations Drizzle/D1.
- `data/prompts.json` — seed reproductible des 75 prompts (source de vérité applicative).
- `scripts/notion-export.mjs`, `scripts/build-seed.ts` — pipeline d'import Notion → seed.
- `tests/unit/` — tests Vitest.
