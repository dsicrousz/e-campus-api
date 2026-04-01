# Migration vers Better Auth - Authentification Centralisée

## Vue d'ensemble

Ce projet a migré d'un système d'authentification local (MongoDB + JWT) vers **Better Auth**, un serveur d'authentification centralisé.

## Changements principaux

### 1. Suppression de l'entité User locale

**Avant :**
- `src/user/entities/user.entity.ts` - Entité Mongoose User
- `src/user/user.service.ts` - Service CRUD pour User
- Stockage des utilisateurs dans MongoDB local

**Après :**
- Entité User supprimée
- Les utilisateurs sont maintenant gérés par Better Auth (serveur externe)
- Accès via `UserProxyService`

### 2. Nouveau service : UserProxyService

**Fichier :** `src/auth/user-proxy.service.ts`

Ce service remplace `UserService` et communique avec Better Auth pour récupérer les informations utilisateur.

**Méthodes disponibles :**
```typescript
// Récupérer un utilisateur par ID
await userProxyService.findOne(userId: string): Promise<BetterAuthUser>

// Récupérer plusieurs utilisateurs
await userProxyService.findMany(userIds: string[]): Promise<BetterAuthUser[]>

// Vérifier l'existence d'un utilisateur
await userProxyService.exists(userId: string): Promise<boolean>

// Valider une liste d'IDs
await userProxyService.validateUserIds(userIds: string[]): Promise<boolean>
```

**Interface BetterAuthUser :**
```typescript
interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string[];
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### 3. Mise à jour des schémas Mongoose

Toutes les références `ObjectId` vers User ont été remplacées par des `string` (ID Better Auth).

**Entités modifiées :**
- `Versement` : `vendeur_id`, `caissier_id`
- `Service` : `gerant`, `agentsControle[]`
- `Operation` : `agentControle`
- `Soldevendeur` : `vendeur_id`
- `Soldecaissier` : `caissier_id`

**Exemple de migration :**
```typescript
// AVANT
@Prop({ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: User.name, 
  autopopulate: true 
})
vendeur_id: User;

// APRÈS
@Prop({ type: String, required: true })
vendeur_id: string;
```

### 4. Authentification et Guards

**BetterAuthGuard** (`src/auth/better-auth.guard.ts`)
- Remplace l'ancien `JwtAuthGuard` pour les utilisateurs
- Vérifie les sessions via le serveur Better Auth
- Extrait le token depuis cookies, headers Authorization ou custom headers

**Utilisation :**
```typescript
@Controller('user')
@UseGuards(BetterAuthGuard)
export class UserController {
  // Routes protégées
}
```

### 5. Configuration

**Variables d'environnement requises :**
```env
# URL du serveur Better Auth
BETTER_AUTH_API=http://localhost:3100
```

## Migration des modules existants

### VersementModule
- ✅ Import `AuthModule` au lieu de `UserModule`
- ✅ Injection `UserProxyService` au lieu de `UserService`
- ✅ Validation des utilisateurs via Better Auth

### OperationModule
- ✅ Suppression de l'import `UserModule` (non utilisé)
- ✅ Les IDs utilisateurs sont maintenant des strings

### ServiceModule
- ✅ `gerant` et `agentsControle` sont des strings
- ✅ Pas de changement dans la logique métier

### CASL (Permissions)
- ✅ Utilise `BetterAuthUser` au lieu de `User`
- ✅ Enum `USER_ROLE` déplacé dans `casl-ability.factory.ts`

## Compatibilité

### AuthService (Deprecated)
`src/auth/auth.service.ts` est conservé temporairement pour :
- Compatibilité avec `CompteModule` (authentification étudiants via JWT)
- Sera supprimé une fois les comptes étudiants migrés

### UserModule
`src/user/user.module.ts` est conservé mais vide :
- Permet de ne pas casser les imports existants
- Redirige vers `AuthModule` pour `UserProxyService`

## Limitations actuelles

### Méthodes non implémentées
Certaines méthodes de `UserProxyService` ne sont pas encore disponibles car Better Auth ne les expose pas nativement :

- `findAll()` - Récupérer tous les utilisateurs
- `findByRole(role)` - Filtrer par rôle

**Solution :** Implémenter des endpoints custom sur le serveur Better Auth ou maintenir un cache local.

## Tests

Pour tester l'intégration :

1. **Démarrer le serveur Better Auth**
   ```bash
   cd auth-server
   npm run dev
   ```

2. **Vérifier la connexion**
   ```bash
   curl http://localhost:3100/api/auth/session
   ```

3. **Tester un endpoint protégé**
   ```bash
   curl -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
        http://localhost:3000/user/USER_ID
   ```

## Rollback (si nécessaire)

En cas de problème, les fichiers suivants ont été supprimés et peuvent être restaurés depuis Git :
- `src/user/entities/user.entity.ts`
- `src/user/user.service.ts`
- `src/user/user.service.spec.ts`
- `src/user/user.controller.spec.ts`

## Prochaines étapes

1. ✅ Migration des utilisateurs (staff) vers Better Auth
2. ⏳ Migration des comptes étudiants vers Better Auth
3. ⏳ Suppression complète de `AuthService` (JWT local)
4. ⏳ Implémentation d'endpoints custom sur Better Auth pour `findAll()` et `findByRole()`
5. ⏳ Mise en place d'un cache Redis pour les données utilisateur

## Support

Pour toute question sur Better Auth :
- Documentation : https://better-auth.com
- Configuration serveur : `auth-server/` (si applicable)
