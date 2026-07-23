# Prompt complet à transmettre à Claude Code

Copiez-collez tout le bloc ci-dessous dans Claude Code depuis le dossier où vous voulez créer le projet. Placez le fichier `PASSATION_BIBLIOTHEQUE_PROMPTS_INSEPTI.md` dans le même dossier avant de lancer la demande.

---

<role>
Tu es le lead engineer, architecte sécurité, product designer UX/UI et responsable qualité chargé de livrer une application web privée prête à être utilisée par les consultants INSEPTI. Tu travailles de manière autonome jusqu’à l’obtention d’un produit complet, testé et déployable.
</role>

<source_of_truth>
Lis intégralement le fichier `PASSATION_BIBLIOTHEQUE_PROMPTS_INSEPTI.md` avant toute modification. Ce fichier est la source de vérité fonctionnelle, visuelle, technique, de sécurité, de données et d’acceptation.

La bibliothèque Notion indiquée dans la passation est une source en lecture seule. Tu n’as jamais l’autorisation de modifier, déplacer ou supprimer son contenu.
</source_of_truth>

<objective>
Construis en une exécution un portail web INSEPTI moderne, premium, responsive et accessible qui permet aux collègues autorisés de se connecter, de rester connectés sur leur appareil s’ils cochent l’option correspondante, puis d’accéder à la bibliothèque de 75 prompts Microsoft 365 Copilot.

Le portail doit inclure la recherche globale, les pages par application, le catalogue, les fiches complètes, la personnalisation des variables, la copie, les favoris personnels, le profil, la déconnexion, une administration sécurisée, l’import idempotent depuis la source Notion et une base persistante.
</objective>

<operating_mode>
1. Travaille de façon autonome et continue. Ne t’arrête pas après une maquette, une page de connexion ou un plan.
2. Commence par lire la passation, les règles du dépôt et les fichiers structurants existants.
3. Si le dossier ne contient pas encore de projet, initialise une application moderne compatible avec la cible d’hébergement. Si `.openai/hosting.json` existe ou si OpenAI Sites est disponible, respecte la pile Vinext/Cloudflare Worker et le workflow Sites.
4. Préserve le gestionnaire de paquets, le lockfile et l’architecture existante lorsqu’ils existent.
5. Crée un fichier `IMPLEMENTATION_STATUS.md` avec les exigences, décisions, jalons, tests et éléments restants. Mets-le à jour pendant le travail afin de reprendre correctement après tout compactage de contexte.
6. Utilise des sous-tâches ou agents spécialisés si disponibles pour auditer en parallèle la sécurité, l’UX et les tests, mais conserve une seule architecture cohérente.
7. Ne demande pas de validation intermédiaire pour des choix réversibles. Prends des décisions raisonnables conformes à la passation.
8. Ne pose une question que si un secret, un tenant, une autorisation ou une décision irréversible bloque réellement la mise en production. Avant de poser cette question, termine tout ce qui peut l’être sans cette information.
9. Ne simule jamais une fonctionnalité de production. Les données factices ne sont autorisées qu’en développement et doivent être clairement séparées.
10. N’effectue aucune suppression irréversible. Pour les contenus métiers, utilise l’archivage.
</operating_mode>

<architecture>
- TypeScript strict.
- Rendu serveur et autorisation serveur par défaut.
- Authentification Microsoft Entra ID / OIDC avec PKCE, `state` et `nonce`, sous réserve du mécanisme officiellement supporté par la plateforme cible.
- Contrôle du tenant, du domaine et/ou d’une allowlist côté serveur.
- Rôles `member` et `admin`.
- Sessions sécurisées avec cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- Case `Rester connecté sur cet appareil` non cochée par défaut : session courte de 8 à 12 heures sans la case, session persistante de 30 jours avec la case, révocable et renouvelée raisonnablement.
- Aucun token dans `localStorage`.
- Persistance relationnelle : D1 sur OpenAI Sites/Cloudflare ou PostgreSQL équivalent sur une autre cible justifiée.
- D1 déclaré par binding logique `DB`; R2 reste `null` en l’absence d’upload.
- Schéma et migrations versionnés.
- Secrets uniquement dans l’environnement d’exécution, jamais dans Git.
- Catalogue servi depuis la base applicative, sans dépendance temps réel à Notion.
</architecture>

<data_migration>
1. Construis un importeur idempotent en lecture seule depuis l’URL publique Notion ou depuis un export structuré reproductible.
2. Extrais titre, application, description, variables entre crochets, contenu intégral et identifiant Notion source.
3. Conserve exactement le texte intégral des prompts. N’invente aucun prompt.
4. Corrige uniquement les descriptions manifestement abrégées en générant un résumé fidèle à partir du prompt intégral, sans modifier le prompt.
5. Stocke un seed local reproductible, par exemple `data/prompts.json`.
6. Valide exactement 75 prompts publiés et la répartition suivante : Copilot 8, Word 9, Excel 10, PowerPoint 10, Teams 10, Outlook 10, OneNote 4, OneDrive 3, SharePoint 3, Forms 4, Planner 4.
7. Échoue explicitement si une fiche est vide, dupliquée ou rattachée à une application inconnue.
8. Produis un rapport d’import lisible.
</data_migration>

<product_requirements>
- Route de connexion Microsoft avec logo INSEPTI, bénéfice clair, message de confidentialité et case `Rester connecté`.
- Toutes les routes de bibliothèque sont protégées.
- Accueil personnalisé avec recherche globale, carte Favoris, accès catalogue et 11 cartes d’applications.
- Chaque carte d’application affiche un seul logo et le nom, sans numérotation ni flèche décorative.
- Catalogue de tous les prompts avec recherche, filtres, tri et URL partageable entre utilisateurs autorisés.
- Recherche sur titre, description, application, contenu, variables et tags; insensible aux accents et à la casse.
- Palette de recherche `Ctrl/Cmd + K`.
- Pages par application avec cartes aérées et descriptions lisibles.
- Fiche de prompt avec description complète, variables détectées, formulaire de personnalisation, aperçu final, copie accessible et favori personnel.
- Le bouton `Utiliser` copie le prompt puis ouvre l’application Microsoft pertinente. Ne prétends pas préremplir Copilot sans lien profond Microsoft officiellement stable.
- Favoris persistants par utilisateur et synchronisés entre appareils.
- Profil avec préférences, sessions et déconnexion.
- Administration protégée : CRUD, prévisualisation, archivage/restauration, import, utilisateurs autorisés, rôles et audit minimal.
- États de chargement, états vides, erreurs utiles, session expirée, accès refusé et page 404.
</product_requirements>

<design_direction>
Crée une expérience premium et contemporaine propre à INSEPTI, pas un clone de Notion et pas un tableau de bord générique.

- Utilise le logo fourni dans la passation; ne le redessine pas.
- Dérive la palette INSEPTI du brand asset et combine-la avec les couleurs propres aux applications Microsoft.
- Mise en page large, respirante et parfaitement responsive.
- Typographie forte, grille soignée, surfaces subtiles, bordures fines et profondeur légère.
- Mode clair et sombre.
- Micro-interactions précises sur recherche, cartes, copie, favoris et navigation.
- Animations de 150 à 250 ms, compatibles `prefers-reduced-motion`.
- Aucun effet gratuit qui ralentit la tâche.
- Aucun texte important tronqué sans moyen immédiat de le lire.
- Accessibilité WCAG 2.2 AA, navigation clavier complète, focus visible, contrastes, cibles tactiles et annonces `aria-live`.

Si un choix visuel est nécessaire, décide en cohérence avec cette direction et documente-le; ne bloque pas le travail avec une demande de préférence.
</design_direction>

<security_requirements>
- Autorisation côté serveur sur chaque route, action et API protégée.
- Validation et normalisation strictes des entrées.
- Protection CSRF des mutations.
- Prévention XSS, injection SQL, open redirect et fuite de secrets.
- Requêtes préparées et paramètres liés.
- Rotation et révocation des sessions.
- Rate limiting sur connexion, recherche abusive et administration.
- CSP et en-têtes de sécurité adaptés.
- Logs sans tokens, secrets, contenu personnalisé ni données sensibles.
- Aucune donnée personnalisée saisie dans un prompt ne doit être enregistrée par défaut.
- `.env.example` complet avec valeurs factices et documentation des secrets Entra ID nécessaires.
</security_requirements>

<testing_and_validation>
Avant de considérer le projet terminé :

1. Exécute le build de production et corrige toutes les erreurs.
2. Génère et inspecte les migrations.
3. Teste l’import sur une base vide.
4. Ajoute des tests unitaires pour variables, recherche, permissions et durées de session.
5. Ajoute des tests d’intégration pour import, favoris, rôles et révocation.
6. Ajoute des tests E2E pour connexion, rester connecté, recherche, filtre, ouverture, personnalisation, copie, favori et déconnexion.
7. Vérifie l’accessibilité automatisée des routes principales.
8. Vérifie les vues mobile, tablette et bureau.
9. Vérifie qu’un utilisateur anonyme ne peut accéder à aucune donnée privée.
10. Vérifie le total de 75 prompts et les 11 répartitions attendues.
11. Recherche les secrets accidentellement suivis et les dépendances manifestement inutiles.
12. Fais une revue finale sécurité, UX et cohérence.
</testing_and_validation>

<hosting>
Si OpenAI Sites est configuré :

1. respecte `.openai/hosting.json` et les bindings logiques ;
2. produis une sortie Cloudflare Worker ESM compatible ;
3. conserve les migrations dans l’artefact ;
4. déploie en accès privé après un build réussi ;
5. ne publie jamais publiquement sans autorisation explicite ;
6. si l’authentification Entra ID exige une configuration externe indisponible, déploie seulement si la surface reste réellement protégée; sinon fournis un build prêt à déployer et les étapes exactes restantes.

Si Sites n’est pas disponible, prépare un déploiement sécurisé sur une cible compatible et documente clairement le choix sans dégrader les exigences.
</hosting>

<required_deliverables>
- application complète ;
- design system et composants ;
- schéma, migrations et seed des 75 prompts ;
- importeur Notion en lecture seule ;
- authentification et sessions ;
- favoris personnels ;
- administration ;
- tests ;
- `.env.example` ;
- `README.md` complet ;
- `IMPLEMENTATION_STATUS.md` à jour ;
- journal des décisions techniques ;
- procédure d’exploitation, sauvegarde, restauration et révocation d’accès ;
- build validé ;
- URL privée déployée si les autorisations et secrets disponibles le permettent.
</required_deliverables>

<definition_of_done>
Le travail n’est terminé que lorsque les critères d’acceptation de la passation sont satisfaits, que le build réussit, que les migrations et tests essentiels passent, que les 75 prompts sont présents, que l’accès anonyme est bloqué, que `Rester connecté` a un comportement réel et sécurisé, que les favoris sont personnels et persistants et que la documentation permet à une autre personne de reprendre le projet.
</definition_of_done>

<final_response>
À la fin, réponds en français avec uniquement :

1. le résultat livré ;
2. l’URL privée si elle existe ;
3. les principales fonctionnalités vérifiées ;
4. les tests et le build exécutés ;
5. les seules actions humaines encore nécessaires, avec étapes exactes ;
6. les emplacements des fichiers importants.

Ne masque aucun blocage réel et ne déclare pas une fonctionnalité terminée si elle est simulée.
</final_response>

Commence maintenant. Lis d’abord `PASSATION_BIBLIOTHEQUE_PROMPTS_INSEPTI.md`, puis réalise le projet jusqu’à satisfaction de la définition de terminé.

---

