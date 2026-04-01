# Implémentation des modules Vente et Consommation

## 📋 Vue d'ensemble

Les modules **Vente** et **Consommation** remplacent le module **Operation** pour gérer respectivement :
- **Vente** : Vente de tickets aux étudiants (ajout de tickets au compte)
- **Consommation** : Utilisation de tickets par les étudiants (retrait de tickets du compte)

---

## 🎫 Module Vente

### **Entité Vente**
```typescript
@Schema({ timestamps: true })
export class Vente {
  _id: string;
  compte: Compte;           // Compte de l'étudiant
  ticket: Ticket;           // Type de ticket vendu
  quantite: number;         // Nombre de tickets vendus
  agentControle: User;      // Vendeur qui a effectué la vente
  date: string;             // Date de la vente
}
```

### **DTO CreateVenteDto**
```typescript
{
  compte: string;           // ID du compte
  ticket: string;           // ID du ticket
  quantite: number;         // Quantité (min: 1)
  agentControle: string;    // ID de l'agent vendeur
  date: string;             // Date au format ISO
}
```

### **Service VenteService**

#### Méthode `create()`
1. Vérifie l'agent de contrôle (actif)
2. Vérifie le compte (actif)
3. Vérifie le ticket (actif)
4. **Ajoute les tickets au compte** via `compteService.ajouterTickets()`
5. **Ajoute les tickets au solde du vendeur** via `soldevendeurService.updateSoldevendeur()`
6. Crée l'enregistrement de vente

#### Autres méthodes
- `findAll()` : Liste toutes les ventes
- `findOne(id)` : Récupère une vente
- `findByCompte(compteId)` : Ventes d'un compte
- `findByAgent(agentId)` : Ventes d'un agent
- `findByDate(date)` : Ventes d'une date
- `update(id, dto)` : Met à jour une vente
- `remove(id)` : Supprime une vente

### **Contrôleur VenteController**

#### Endpoints
- `POST /vente` : Créer une vente
- `GET /vente` : Liste toutes les ventes
- `GET /vente/compte/:compteId` : Ventes d'un compte
- `GET /vente/agent/:agentId` : Ventes d'un agent
- `GET /vente/date/:date` : Ventes d'une date
- `GET /vente/:id` : Récupère une vente
- `PATCH /vente/:id` : Met à jour une vente
- `DELETE /vente/:id` : Supprime une vente

---

## 🍽️ Module Consommation

### **Entité Consommation**
```typescript
@Schema({ timestamps: true })
export class Consommation {
  _id: string;
  compte: Compte;           // Compte de l'étudiant
  ticket: Ticket;           // Type de ticket consommé
  service: Service;         // Service où le ticket est utilisé
  agentControle: User;      // Agent qui a validé la consommation
  decade?: Decade;          // Décade associée (optionnel)
}
```

### **DTO CreateConsommationDto**
```typescript
{
  compte: string;           // ID du compte
  ticket: string;           // ID du ticket
  service: string;          // ID du service
  agentControle: string;    // ID de l'agent contrôleur
  decade?: string;          // ID de la décade (optionnel)
}
```

### **Service ConsommationService**

#### Méthode `create()`
1. Vérifie l'agent de contrôle (actif)
2. Vérifie le compte (actif)
3. Vérifie le ticket (actif)
4. Vérifie le service (actif)
5. **Vérifie que le compte possède le ticket** via `compteService.getQuantiteTicket()`
6. **Retire 1 ticket du compte** via `compteService.retirerTickets()`
7. Crée l'enregistrement de consommation

#### Autres méthodes
- `findAll()` : Liste toutes les consommations
- `findOne(id)` : Récupère une consommation
- `findByCompte(compteId)` : Consommations d'un compte
- `findByService(serviceId)` : Consommations d'un service
- `findByAgent(agentId)` : Consommations d'un agent
- `findByDecade(decadeId)` : Consommations d'une décade
- `update(id, dto)` : Met à jour une consommation
- `remove(id)` : Supprime une consommation

### **Contrôleur ConsommationController**

#### Endpoints
- `POST /consommation` : Créer une consommation
- `GET /consommation` : Liste toutes les consommations
- `GET /consommation/compte/:compteId` : Consommations d'un compte
- `GET /consommation/service/:serviceId` : Consommations d'un service
- `GET /consommation/agent/:agentId` : Consommations d'un agent
- `GET /consommation/decade/:decadeId` : Consommations d'une décade
- `GET /consommation/:id` : Récupère une consommation
- `PATCH /consommation/:id` : Met à jour une consommation
- `DELETE /consommation/:id` : Supprime une consommation

---

## 🔄 Flux de données

### **Vente de tickets**
```
1. Agent vendeur → POST /vente
2. VenteService.create()
   ├─ Validation (agent, compte, ticket)
   ├─ compteService.ajouterTickets() → Ajoute tickets au compte
   ├─ soldevendeurService.updateSoldevendeur() → Ajoute au solde vendeur
   └─ Sauvegarde Vente
```

### **Consommation de tickets**
```
1. Agent contrôleur → POST /consommation
2. ConsommationService.create()
   ├─ Validation (agent, compte, ticket, service)
   ├─ Vérification disponibilité ticket
   ├─ compteService.retirerTickets() → Retire 1 ticket du compte
   └─ Sauvegarde Consommation
```

---

## 📦 Dépendances des modules

### **VenteModule**
- `CompteModule` : Gestion des comptes
- `TicketModule` : Gestion des tickets
- `UserModule` : Gestion des utilisateurs
- `SoldevendeurModule` : Gestion des soldes vendeurs

### **ConsommationModule**
- `CompteModule` : Gestion des comptes
- `TicketModule` : Gestion des tickets
- `UserModule` : Gestion des utilisateurs
- `ServiceModule` : Gestion des services
- `DecadeModule` : Gestion des décades

---

## ✅ Points clés

1. **Séparation claire** : Vente et Consommation sont deux opérations distinctes
2. **Gestion des tickets** : Utilisation des méthodes utilitaires du `CompteService`
3. **Traçabilité** : Chaque opération est enregistrée avec l'agent et la date
4. **Validation** : Vérifications complètes avant chaque opération
5. **Authentification** : Tous les endpoints sont protégés par JWT

---

## 🚀 Utilisation

### **Vendre des tickets**
```bash
POST /vente
{
  "compte": "compte_id",
  "ticket": "ticket_id",
  "quantite": 5,
  "agentControle": "vendeur_id",
  "date": "2025-01-15"
}
```

### **Consommer un ticket**
```bash
POST /consommation
{
  "compte": "compte_id",
  "ticket": "ticket_id",
  "service": "service_id",
  "agentControle": "controleur_id",
  "decade": "decade_id"  // optionnel
}
```
