# Module Operation

## Description
Le module **Operation** unifie et remplace les anciens modules `Vente` et `Consommation`. Il gère les trois types d'opérations principales de l'application :

1. **RECHARGE** - Achat de tickets et ajout de solde au compte
2. **UTILISATION** - Utilisation d'un service (consommation)
3. **TRANSFERT** - Transfert de montant entre deux comptes

## Architecture

### Entité Operation
```typescript
{
  type: TypeOperation,           // RECHARGE | UTILISATION | TRANSFERT
  montant: number,               // Montant de l'opération
  compte: Compte,                // Compte source (tous types)
  compteDestinataire?: Compte,   // Compte destinataire (TRANSFERT uniquement)
  ticket?: Ticket,               // Ticket concerné (UTILISATION uniquement)
  service?: Service,             // Service utilisé (UTILISATION uniquement)
  decade?: Decade,               // Décade (UTILISATION restaurant uniquement)
  agentControle?: User,          // Agent (obligatoire pour RECHARGE et UTILISATION, optionnel pour TRANSFERT)
  note?: string,                 // Note optionnelle
  createdAt: Date,
  updatedAt: Date
}
```

## Types d'opérations

### 1. RECHARGE
**Description :** Recharge du solde d'un compte étudiant.

**Champs requis :**
- `type`: `RECHARGE`
- `compte`: ID du compte à recharger
- `montant`: Montant à ajouter au compte
- `agentControle`: ID de l'agent (vendeur)

**Logique métier :**
1. Vérifie que le montant est positif
2. Ajoute le montant au solde du compte
3. Ajoute le montant au solde du vendeur
4. Crée l'opération

**Exemple :**
```json
{
  "type": "RECHARGE",
  "compte": "64abc123...",
  "montant": 5000,
  "agentControle": "64ghi789..."
}
```

### 2. UTILISATION
**Description :** Utilisation d'un service (restaurant, sport, santé, etc.).

**Champs requis :**
- `type`: `UTILISATION`
- `compte`: ID du compte utilisateur
- `ticket`: ID du ticket utilisé
- `service`: ID du service
- `agentControle`: ID de l'agent de contrôle

**Logique métier :**
1. Vérifie que le compte a suffisamment de solde
2. Retire le prix du ticket du solde
3. Si c'est un restaurant, associe la décade active
4. Crée l'opération

**Exemple :**
```json
{
  "type": "UTILISATION",
  "compte": "64abc123...",
  "ticket": "64def456...",
  "service": "64jkl012...",
  "agentControle": "64ghi789..."
}
```

### 3. TRANSFERT
**Description :** Transfert de montant d'un compte vers un autre compte.

**Champs requis :**
- `type`: `TRANSFERT`
- `compte`: ID du compte source
- `compteDestinataire`: ID du compte destinataire
- `montant`: Montant à transférer
- `note`: (optionnel) Motif du transfert

**Champs optionnels :**
- `agentControle`: ID de l'agent (non obligatoire pour les transferts)

**Logique métier :**
1. Vérifie que le compte destinataire existe et est actif
2. Vérifie que les comptes sont différents
3. Vérifie que le montant est positif
4. Vérifie que le compte source a suffisamment de solde
5. Retire le montant du compte source
6. Ajoute le montant au compte destinataire
7. Crée l'opération

**Exemple :**
```json
{
  "type": "TRANSFERT",
  "compte": "64abc123...",
  "compteDestinataire": "64xyz789...",
  "montant": 5000,
  "note": "Remboursement"
}
```

## Filtrage automatique par session

⚠️ **IMPORTANT** : Toutes les opérations de récupération sont automatiquement filtrées sur la **session active**.

Cela signifie que :
- Seules les opérations de la session active sont retournées
- Les opérations des sessions passées ne sont pas visibles
- Pour consulter les opérations d'une session spécifique, utilisez `GET /operation/session/:sessionId`

## Endpoints API

### Créer une opération
```
POST /operation
Body: CreateOperationDto
```
⚠️ La session active est automatiquement assignée à l'opération.

### Lister toutes les opérations
```
GET /operation
```
⚠️ Retourne uniquement les opérations de la session active.

### Filtrer par type
```
GET /operation/type/:type
Params: type = RECHARGE | UTILISATION | TRANSFERT
```
⚠️ Filtre sur la session active uniquement.

### Filtrer par période
```
GET /operation/period?startDate=2024-01-01&endDate=2024-12-31
```
⚠️ Filtre sur la session active uniquement.

### Opérations d'un compte
```
GET /operation/compte/:compteId
```
⚠️ Filtre sur la session active uniquement.

### Opérations d'un agent
```
GET /operation/agent/:agentId
```
⚠️ Filtre sur la session active uniquement.

### Opérations d'un ticket
```
GET /operation/ticket/:ticketId
```
⚠️ Filtre sur la session active uniquement.

### Opérations d'un service
```
GET /operation/service/:serviceId
```
⚠️ Filtre sur la session active uniquement.

### Opérations par décade
```
GET /operation/decade/:decadeId
```
⚠️ Filtre sur la session active uniquement.

### Vérifier si un ticket a été consommé aujourd'hui
```
GET /operation/hasconsumedtoday/:compteId?ticketType=:ticketId
```
Vérifie si un compte a déjà consommé un ticket spécifique aujourd'hui.
⚠️ Vérifie uniquement dans la session active.

**Paramètres :**
- `compteId` (path) : ID du compte
- `ticketType` (query) : ID du ticket

**Réponse :**
```json
{
  "hasConsumed": true,
  "operation": {
    "_id": "64abc123...",
    "type": "UTILISATION",
    "compte": { ... },
    "ticket": { ... },
    "createdAt": "2024-01-15T12:30:00Z"
  }
}
```
ou
```json
{
  "hasConsumed": false
}
```

### Détails d'une opération
```
GET /operation/:id
```

### Mettre à jour une opération
```
PATCH /operation/:id
Body: UpdateOperationDto
```

### Supprimer une opération
```
DELETE /operation/:id
```

## Permissions (CASL)

- **SUPERADMIN** : Tous les droits
- **ADMIN** : CRUD complet
- **CONTROLEUR** : Lecture + Création
- **VENDEUR** : Lecture + Création
- **REPREUNEUR** : Lecture seule

## Cascade Delete

Lorsqu'un compte est supprimé, toutes les opérations liées (en tant que source ou destinataire) sont automatiquement supprimées.

## Migration depuis Vente et Consommation

### Anciennes ressources
- `Vente` → `Operation` de type `RECHARGE`
- `Consommation` → `Operation` de type `UTILISATION`

### Nouvelles fonctionnalités
- Type `TRANSFERT` pour les transferts entre comptes
- Champ `montant` unifié pour toutes les opérations
- Support du compte destinataire pour les transferts
- Note optionnelle pour documenter les opérations

## Dépendances

Le module Operation dépend de :
- `CompteModule` - Gestion des comptes
- `TicketModule` - Gestion des tickets
- `UserModule` - Gestion des utilisateurs
- `ServiceModule` - Gestion des services
- `DecadeModule` - Gestion des décades
- `SoldevendeurModule` - Gestion des stocks de tickets vendeurs
- `CaslModule` - Gestion des permissions
