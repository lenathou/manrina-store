# Guide de Configuration et de Lancement du Projet

Ce document détaille les étapes nécessaires pour configurer, lancer et construire ce projet Next.js sans erreur. Il est destiné aux développeurs qui reprennent le projet après un clonage depuis GitHub.

## 1. Prérequis

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine :
- **Node.js** (version 18.x ou supérieure recommandée)
- **npm** (généralement inclus avec Node.js)
- **Docker** et **Docker Compose** (recommandé pour gérer la base de données facilement)

## 2. Configuration Initiale

Ces étapes sont cruciales pour éviter les erreurs de build.

### Étape 2.1 : Installation des Dépendances

La première étape consiste à installer toutes les dépendances du projet définies dans `package.json`.

```bash
npm install
```

### Étape 2.2 : Configuration des Variables d'Environnement

Le projet nécessite des variables d'environnement pour fonctionner. Un fichier d'exemple a été préparé pour vous.

1.  **Copiez le fichier d'exemple :**
    ```bash
    # Sur Windows
    copy .env.local.example .env.local

    # Sur macOS/Linux
    cp .env.local.example .env.local
    ```

2.  **Remplissez les valeurs dans `.env.local` :**
    - `DATABASE_URL`: L'URL de votre base de données PostgreSQL. Si vous utilisez Docker (voir étape 2.3), la valeur par défaut devrait fonctionner.
    - `JWT_SECRET`: Générez une chaîne de caractères longue et aléatoire.
    - `USE_MOCK_DATA`: Mettez cette variable à `"true"` pour utiliser les données de test locales au lieu de vous connecter à Airtable. C'est **fortement recommandé** pour le premier lancement.
      ```
      USE_MOCK_DATA="true"
      ```
    - Les autres variables (`BREVO_API_KEY`, `VAPID_KEYS`, etc.) peuvent être laissées vides si vous n'utilisez pas ces fonctionnalités dans l'immédiat.

### Étape 2.3 : Mise en Place de la Base de Données (Prisma)

Le projet utilise Prisma comme ORM. Une configuration incorrecte de la base de données est une source majeure d'erreurs de build.

1.  **Lancez la base de données PostgreSQL :**
    Le moyen le plus simple est d'utiliser le fichier `docker-compose.yml` inclus.
    ```bash
    docker-compose up -d
    ```
    Cela lancera un conteneur PostgreSQL en arrière-plan avec les bons identifiants.

2.  **Appliquez les migrations de la base de données :**
    Cette commande va synchroniser le schéma de la base de données avec les fichiers de migration présents dans `prisma/migrations`.
    ```bash
    npx prisma migrate dev
    ```

3.  **Générez le Client Prisma :**
    C'est une étape **essentielle**. Elle génère les types TypeScript basés sur votre schéma de base de données. Sans cela, le build échouera avec des erreurs de type liées à Prisma.
    ```bash
    npx prisma generate
    ```
    **Note :** Vous devez relancer cette commande chaque fois que vous modifiez le fichier `prisma/schema.prisma`.

## 3. Lancement et Build

Une fois la configuration terminée, vous pouvez lancer le projet.

### Étape 3.1 : Lancement en Mode Développement

Pour démarrer le serveur de développement :
```bash
npm run dev
```
Le site devrait être accessible sur `http://localhost:3000`. Vous devriez voir des messages dans la console indiquant si les données Airtable réelles ou mockées sont utilisées.

### Étape 3.2 : Vérification du Build de Production

C'est le test final pour s'assurer que tout est correctement configuré. Cette commande va compiler l'application pour la production.
```bash
npm run build
```
Si cette commande se termine sans erreur, votre projet est correctement configuré.

## 4. Points d'Attention et Erreurs Courantes

- **Erreurs de type Prisma (`PrismaClient is not defined`, etc.) :** Assurez-vous d'avoir bien exécuté `npx prisma generate`.
- **Échec de connexion à la base de données :** Vérifiez que votre conteneur Docker est bien en cours d'exécution et que la variable `DATABASE_URL` dans `.env.local` est correcte.
- **Intégration Stripe :** Le code lié à Stripe est actuellement commenté et remplacé par un service mock (`MockPaymentService`). Pour l'activer, vous devrez décommenter le code dans `src/server/index.ts` et fournir les clés `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` dans votre `.env.local`.
- **Linting :** Vous pouvez vérifier la qualité du code et anticiper certaines erreurs avec la commande `npm run lint`.
