# Refonte du système de solde - Gestion par tickets

## 📋 Vue d'ensemble

Le système a été refondu pour gérer le **solde comme une Map de tickets** au lieu d'un montant monétaire unique.

### Ancien système
- `solde: number` - Montant en argent

### Nouveau système
- `solde: Map<string, number>` - Map avec `ticketId` comme clé et `quantité de tickets` comme valeur

---

## ✅ Modifications effectuées

### 1. **Entité Compte** (`compte.entity.ts`)
```typescript
@Prop({ type: Map, of: Number, default: () => new Map() })
solde: Map<string, number>; // Map avec ticketId comme clé et nombre de tickets comme valeur
```

### 2. **DTO CreateCompteDto** (`create-compte.dto.ts`)
```typescript
@IsOptional()
@IsObject()
solde?: Record<string, number>; // Object avec ticketId comme clé et nombre de tickets comme valeur
```

### 3. **Service Compte** (`compte.service.ts`)

#### Nouvelles méthodes utilitaires :

- **`ajouterTickets(compteId, ticketId, quantite)`**
  - Ajoute des tickets au solde d'un compte
  
- **`retirerTickets(compteId, ticketId, quantite)`**
  - Retire des tickets du solde d'un compte
  - Vérifie la disponibilité avant retrait
  
- **`getQuantiteTicket(compteId, ticketId)`**
  - Récupère le nombre de tickets disponibles pour un type donné
  
- **`getTousLesTickets(compteId)`**
  - Récupère tous les tickets d'un compte avec leurs quantités

#### Méthode adaptée :

- **`getSumSolde()`**
  - Calcule maintenant la somme totale de tous les tickets dans toutes les Maps

### 4. **Service Ticket** (`ticket.service.ts`)

#### Méthode `utiliserTicket()` :
- Vérifie que l'étudiant possède le ticket (au lieu de vérifier le solde monétaire)
- Retire 1 ticket du solde avant de créer l'opération
- Message d'erreur : `"Vous ne possédez pas ce ticket. Veuillez d'abord l'acheter."`

#### Méthode `peutUtiliserTicket()` :
- Vérifie la disponibilité du ticket dans la Map
- Retourne la quantité disponible au lieu du solde monétaire

### 5. **Service Operation** (`operation.service.ts`)

#### Méthode `depot()` :
- **Ancien** : Ajoutait un montant au solde monétaire
- **Nouveau** : Ajoute des tickets au solde via `compteService.ajouterTickets()`
- Nécessite maintenant `createOperationDto.ticket` et `createOperationDto.quantite`

#### Méthode `recuperationticket()` :
- **Ancien** : Ajoutait un montant au solde monétaire
- **Nouveau** : Ajoute des tickets au solde via `compteService.ajouterTickets()`

#### Méthode `retrait()` :
- **Ancien** : Retirait un montant du solde monétaire
- **Nouveau** : Retire des tickets du solde via `compteService.retirerTickets()`
- Renommé conceptuellement en "retour de tickets"

#### Méthode `utiliserTicket()` :
- Ne manipule plus le solde directement
- Le retrait du ticket est géré par `TicketService` avant l'appel
- Cette méthode crée uniquement l'opération pour l'historique

### 6. **DTO CreateOperationDto** (`create-operation.dto.ts`)

Nouveau champ ajouté :
```typescript
@IsOptional()
@IsNumber()
quantite?: number; // Nombre de tickets pour les opérations d'achat/récupération
```

### 7. **Contrôleur Operation** (`operation.controller.ts`)

#### Méthode `virement()` :
- **Ancien** : Transférait un montant monétaire
- **Nouveau** : Transfère des tickets entre comptes
- Nécessite maintenant `virementOperationDto.ticket` et `virementOperationDto.quantite`
- Vérifie la disponibilité des tickets avant le transfert

### 8. **DTO VirementOperationDto** (`virement-operation.dto.ts`)

Nouveaux champs ajoutés :
```typescript
@IsMongoId()
ticket: string; // ID du ticket à transférer

@IsOptional()
@IsNumber()
quantite?: number; // Nombre de tickets à transférer (par défaut 1)
```

---

## 🔄 Flux d'utilisation

### Achat de tickets (Dépôt)
1. L'étudiant achète des tickets via l'endpoint de dépôt
2. Le système ajoute les tickets au solde via `ajouterTickets()`
3. Une opération est créée pour l'historique

### Utilisation de tickets
1. L'étudiant scanne son code pour utiliser un ticket
2. Le système vérifie la disponibilité via `getQuantiteTicket()`
3. Le ticket est retiré du solde via `retirerTickets()`
4. Une opération d'utilisation est créée

### Transfert de tickets (Virement)
1. L'étudiant A transfère des tickets à l'étudiant B
2. Le système vérifie que A possède suffisamment de tickets
3. Les tickets sont retirés du solde de A
4. Les tickets sont ajoutés au solde de B
5. Deux opérations sont créées (retrait + dépôt)

---

## ⚠️ Points d'attention

### Erreurs de lint existantes
Les erreurs de lint suivantes existaient **avant** cette refonte et sont liées à des propriétés manquantes dans les DTOs et entités :
- `CreateTicketDto` : propriétés `prixReel`, `ticketType`, `validFrom`, `validTo`, `prixRepreneur`
- `Ticket` entity : propriétés `validFrom`, `validTo`, `prixReel`, `isSpecial`
- `Service` entity : propriété `restaurant`

Ces erreurs doivent être corrigées séparément en ajoutant les propriétés manquantes aux DTOs et entités concernés.

### Migration de données
Si vous avez déjà des données en production avec l'ancien système (`solde: number`), vous devrez :
1. Créer un script de migration pour convertir les soldes monétaires en tickets
2. Définir une stratégie de conversion (ex: 1 ticket = X FCFA)
3. Exécuter la migration avant de déployer cette version

### Compatibilité
- Les anciens endpoints qui attendaient un `solde: number` doivent être mis à jour côté frontend
- Les réponses API retournent maintenant `solde: Map<string, number>` (sérialisé en objet JSON)

### 9. **Entités Soldecaissier et Soldevendeur**

Les deux champs ont été adaptés pour utiliser des Maps :
```typescript
@Prop({ type: Map, of: Number, default: () => new Map() })
solde: Map<string, number>; // Map avec ticketId comme clé et nombre de tickets comme valeur

@Prop({ type: Map, of: Number, default: () => new Map() })
ticket: Map<string, number>; // Map avec ticketId comme clé et nombre de tickets comme valeur
```

### 10. **Services Soldecaissier et Soldevendeur**

Les méthodes ont été refactorisées pour gérer les Maps :

#### Nouvelles signatures :
- **`updateSoldecaissier(caissier_id, ticketId, quantite)`**
  - Ancien : `updateSoldecaissier(caissier_id, value)`
  - Nouveau : Gère les tickets individuellement par ID
  
- **`updateTicketcaissier(caissier_id, ticketId, quantite)`**
  - Ancien : `updateTicketcaissier(caissier_id, value)`
  - Nouveau : Gère les tickets individuellement par ID

- **`updateSoldevendeur(vendeur_id, ticketId, quantite)`**
  - Ancien : `updateSoldevendeur(vendeur_id, value)`
  - Nouveau : Gère les tickets individuellement par ID

- **`updateTicketvendeur(vendeur_id, ticketId, quantite)`**
  - Ancien : `updateTicketvendeur(vendeur_id, value)`
  - Nouveau : Gère les tickets individuellement par ID

### 11. **Service Versement**

Le service de versement a été adapté pour utiliser `ticketMetadata` :

#### Méthode `create()` :
- Parcourt `ticketMetadata` pour traiter chaque ticket individuellement
- Appelle les méthodes de mise à jour avec `ticketId` et `quantite`

#### Méthode `validate()` :
- Traite les tickets via `ticketMetadata`
- Retire du vendeur et ajoute au caissier

#### Méthode `refuse()` :
- Annule le versement en inversant les opérations
- Rend au vendeur et retire du caissier

---

## 🚀 Prochaines étapes recommandées

1. **Corriger les erreurs de lint** en ajoutant les propriétés manquantes aux DTOs
2. **Créer un script de migration** pour les données existantes
3. **Mettre à jour le frontend** pour gérer le nouveau format de solde
4. **Ajouter des tests unitaires** pour les nouvelles méthodes utilitaires
5. **Documenter les nouveaux endpoints** avec Swagger

---

## 📝 Exemple d'utilisation

### Structure du solde
```json
{
  "solde": {
    "ticket_id_1": 5,  // 5 tickets de type 1
    "ticket_id_2": 3,  // 3 tickets de type 2
    "ticket_id_3": 10  // 10 tickets de type 3
  }
}
```

### Achat de tickets
```typescript
POST /operation/depot
{
  "compte": "compte_id",
  "ticket": "ticket_id",
  "quantite": 5,
  "montant": 2500,
  "agentControle": "agent_id"
}
```

### Transfert de tickets
```typescript
POST /operation/virement
{
  "id_from": "compte_id_1",
  "id_to": "compte_id_2",
  "ticket": "ticket_id",
  "quantite": 2,
  "montant": 1000
}
```
