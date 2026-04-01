# Décade Module - Cron Job Documentation

## Fonctionnalité
Ce module implémente un cron job qui vérifie quotidiennement à 1h du matin si la décade active est terminée (date de fin <= date courante) et crée automatiquement une nouvelle décade si nécessaire, tout en désactivant les précédentes.

## Configuration du Cron Job
- **Fréquence**: Tous les jours à 1h00 du matin
- **Expression Cron**: `0 1 * * *`
- **Logique**: Vérifie si la décade active est terminée (date de fin <= date courante)
- **Localisation**: Dans `DecadeService.handleDecadeCreation()`

## Processus de création de décade
1. Désactivation de toutes les décades existantes
2. Création d'une nouvelle décade avec:
   - Nom: "Décade [numéro]"
   - Référence: "DEC-[année]-[numéro]"
   - Date de début: Jour actuel
   - Date de fin: Jour actuel + 9 jours
   - Statut: Active

## Endpoints API
- `POST /decade` - Créer une décade manuellement
- `GET /decade` - Lister toutes les décades
- `POST /decade/trigger` - Déclencher manuellement la création de décade

## Utilisation manuelle
Pour tester la création de décade:
```bash
curl -X POST http://localhost:3000/decade/trigger
```

## Configuration requise
Le module utilise:
- `@nestjs/schedule` pour les tâches cron
- Mongoose pour la persistance des données
- Validation avec class-validator et class-transformer
