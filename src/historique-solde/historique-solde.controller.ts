import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { HistoriqueSoldeService } from './historique-solde.service';
import { TYPE_ACTEUR } from './entities/historique-solde.entity';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('historique-solde')
@UseGuards(BetterAuthGuard)
export class HistoriqueSoldeController {
  constructor(private readonly historiqueSoldeService: HistoriqueSoldeService) {}

  @Get()
  findAll() {
    return this.historiqueSoldeService.findAll();
  }

  @Get('vendeur/:id')
  findByVendeur(
    @Param('id') id: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string
  ) {
    return this.historiqueSoldeService.findByActeurWithDates(id, TYPE_ACTEUR.VENDEUR, dateDebut, dateFin);
  }

  @Get('recouvreur/:id')
  findByRecouvreur(
    @Param('id') id: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string
  ) {
    return this.historiqueSoldeService.findByActeurWithDates(id, TYPE_ACTEUR.RECOUVREUR, dateDebut, dateFin);
  }

  @Get('caissier-principal/:id')
  findByCaissierPrincipal(
    @Param('id') id: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string
  ) {
    return this.historiqueSoldeService.findByActeurWithDates(id, TYPE_ACTEUR.CAISSIER_PRINCIPAL, dateDebut, dateFin);
  }

  @Get('agent-comptable/:id')
  findByAgentComptable(
    @Param('id') id: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string
  ) {
    return this.historiqueSoldeService.findByActeurWithDates(id, TYPE_ACTEUR.AGENT_COMPTABLE, dateDebut, dateFin);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.historiqueSoldeService.findBySession(sessionId);
  }
}
