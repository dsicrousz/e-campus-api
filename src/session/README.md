# Module Session

## Description
Le module **Session** gère les sessions académiques (années scolaires) de l'application. Toutes les opérations sont automatiquement liées à la session active.

## Entité Session

```typescript
{
  annee: string,           // Ex: "2024", "2025"
  dateDebut: Date,         // Date de début de la session
  dateFin: Date,           // Date de fin de la session
  isActive: boolean,       // Une seule session peut être active à la fois
  description?: string,    // Description optionnelle
  createdAt: Date,
  updatedAt: Date
}
```

## Fonctionnalités

### 1. Gestion des sessions
- **Création** : Crée une nouvelle session académique
- **Activation** : Active une session (désactive automatiquement les autres)
- **Modification** : Met à jour les informations d'une session
- **Suppression** : Supprime une session (impossible si elle est active)

### 2. Session unique active
- Une seule session peut être active à la fois
- Lors de l'activation d'une session, toutes les autres sont automatiquement désactivées
- Index unique sur `isActive: true` pour garantir cette contrainte

### 3. Intégration avec les opérations
- Toutes les opérations (RECHARGE, UTILISATION, TRANSFERT) sont automatiquement liées à la session active
- La session est récupérée et assignée automatiquement lors de la création d'une opération
- Permet de filtrer les opérations par session

## Endpoints API

### Créer une session
```
POST /session
Body: CreateSessionDto
```

**Exemple :**
```json
{
  "annee": "2024",
  "dateDebut": "2024-09-01T00:00:00Z",
  "dateFin": "2025-08-31T23:59:59Z",
  "isActive": true,
  "description": "Année académique 2024-2025"
}
```

### Lister toutes les sessions
```
GET /session
```
Retourne toutes les sessions triées par année (décroissant).

### Récupérer la session active
```
GET /session/active
```
Retourne la session actuellement active. Erreur 404 si aucune session n'est active.

### Récupérer une session par année
```
GET /session/annee/:annee
```
Exemple : `GET /session/annee/2024`

### Détails d'une session
```
GET /session/:id
```

### Activer une session
```
PATCH /session/:id/activate
```
Active la session spécifiée et désactive automatiquement toutes les autres.

### Mettre à jour une session
```
PATCH /session/:id
Body: UpdateSessionDto
```

### Supprimer une session
```
DELETE /session/:id
```
⚠️ Impossible de supprimer la session active.

## Permissions (CASL)

- **SUPERADMIN** : Tous les droits
- **ADMIN** : CRUD complet
- **CONTROLEUR** : Lecture seule
- **VENDEUR** : Lecture seule
- **REPREUNEUR** : Lecture seule

## Validations

### Création/Modification
- `annee` : Format YYYY (ex: "2024")
- `dateDebut` < `dateFin`
- Une seule session active à la fois

### Suppression
- Impossible de supprimer la session active

## Utilisation dans l'application

### Création automatique d'opérations
Lorsqu'une opération est créée, la session active est automatiquement récupérée et assignée :

```typescript
// Dans OperationService.create()
const sessionActive = await this.sessionService.getActiveSession();
createOperationDto.session = sessionActive._id;
```

### Filtrage par session
Pour récupérer toutes les opérations d'une session :

```
GET /operation/session/:sessionId
```

## Workflow recommandé

1. **Début d'année** : Créer une nouvelle session et l'activer
   ```json
   POST /session
   {
     "annee": "2025",
     "dateDebut": "2025-09-01",
     "dateFin": "2026-08-31",
     "isActive": true
   }
   ```

2. **Pendant l'année** : Toutes les opérations sont automatiquement liées à cette session

3. **Fin d'année** : 
   - Consulter les statistiques de la session
   - Créer la nouvelle session
   - Activer la nouvelle session (l'ancienne sera automatiquement désactivée)

4. **Consultation historique** : Filtrer les opérations par session pour voir l'historique

## Erreurs courantes

### "Aucune session active"
**Cause** : Aucune session n'est marquée comme active
**Solution** : Activer une session via `PATCH /session/:id/activate`

### "Impossible de supprimer la session active"
**Cause** : Tentative de suppression de la session actuellement active
**Solution** : Activer une autre session avant de supprimer celle-ci

### "La date de début doit être antérieure à la date de fin"
**Cause** : Dates invalides
**Solution** : Vérifier que `dateDebut < dateFin`

## Exemple d'utilisation complète

```bash
# 1. Créer et activer la session 2024
POST /session
{
  "annee": "2024",
  "dateDebut": "2024-09-01",
  "dateFin": "2025-08-31",
  "isActive": true
}

# 2. Créer des opérations (automatiquement liées à la session 2024)
POST /operation
{
  "type": "RECHARGE",
  "compte": "...",
  "montant": 5000,
  "agentControle": "..."
}

# 3. Consulter les opérations de la session
GET /operation/session/64abc123...

# 4. En fin d'année, créer la session 2025
POST /session
{
  "annee": "2025",
  "dateDebut": "2025-09-01",
  "dateFin": "2026-08-31",
  "isActive": false
}

# 5. Activer la session 2025 (désactive automatiquement 2024)
PATCH /session/64xyz789.../activate

# 6. Les nouvelles opérations sont maintenant liées à 2025
```

## Dépendances

Le module Session est utilisé par :
- `OperationModule` - Pour lier les opérations à la session active
