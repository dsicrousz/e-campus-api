import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { TransfertVersementService } from './transfert-versement.service';
import { 
  TransfertVendeurRecouvreurDto, 
  TransfertRecouvreurCaissierPrincipalDto, 
  TransfertCaissierPrincipalAgentComptableDto,
  ValiderTransfertDto 
} from './dto/create-transfert-versement.dto';
import { ETAT_TRANSFERT, TYPE_TRANSFERT } from './entities/transfert-versement.entity';
import { TYPE_ACTEUR } from 'src/historique-solde/entities/historique-solde.entity';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('transfert-versement')
@UseGuards(BetterAuthGuard)
export class TransfertVersementController {
  constructor(private readonly transfertVersementService: TransfertVersementService) {}

  @Post('vendeur-recouvreur')
  createTransfertVendeurRecouvreur(@Body() dto: TransfertVendeurRecouvreurDto) {
    return this.transfertVersementService.createTransfertVendeurRecouvreur(dto);
  }

  @Post('recouvreur-caissier-principal')
  createTransfertRecouvreurCaissierPrincipal(@Body() dto: TransfertRecouvreurCaissierPrincipalDto) {
    return this.transfertVersementService.createTransfertRecouvreurCaissierPrincipal(dto);
  }

  @Post('caissier-principal-agent-comptable')
  createTransfertCaissierPrincipalAgentComptable(@Body() dto: TransfertCaissierPrincipalAgentComptableDto) {
    return this.transfertVersementService.createTransfertCaissierPrincipalAgentComptable(dto);
  }

  @Patch(':id/valider')
  validerTransfert(@Param('id') id: string, @Body() dto: ValiderTransfertDto) {
    return this.transfertVersementService.validerTransfert(id, dto.validateur_id);
  }

  @Patch(':id/refuser')
  refuserTransfert(@Param('id') id: string, @Body() dto: ValiderTransfertDto) {
    return this.transfertVersementService.refuserTransfert(id, dto.validateur_id);
  }

  @Get()
  findAll() {
    return this.transfertVersementService.findAll();
  }

  @Get('en-attente')
  findEnAttente() {
    return this.transfertVersementService.findByEtat(ETAT_TRANSFERT.EN_ATTENTE);
  }

  @Get('valides')
  findValides() {
    return this.transfertVersementService.findByEtat(ETAT_TRANSFERT.VALIDE);
  }

  @Get('refuses')
  findRefuses() {
    return this.transfertVersementService.findByEtat(ETAT_TRANSFERT.REFUSE);
  }

  @Get('type/:typeTransfert')
  findByTypeTransfert(@Param('typeTransfert') typeTransfert: TYPE_TRANSFERT) {
    return this.transfertVersementService.findByTypeTransfert(typeTransfert);
  }

  @Get('vendeur/:vendeurId')
  findByVendeur(@Param('vendeurId') vendeurId: string) {
    return this.transfertVersementService.findByActeur(vendeurId, TYPE_ACTEUR.VENDEUR);
  }

  @Get('recouvreur/:recouvreurId')
  findByRecouvreur(@Param('recouvreurId') recouvreurId: string) {
    return this.transfertVersementService.findByActeur(recouvreurId, TYPE_ACTEUR.RECOUVREUR);
  }

  @Get('caissier-principal/:caissierPrincipalId')
  findByCaissierPrincipal(@Param('caissierPrincipalId') caissierPrincipalId: string) {
    return this.transfertVersementService.findByActeur(caissierPrincipalId, TYPE_ACTEUR.CAISSIER_PRINCIPAL);
  }

  @Get('agent-comptable/:agentComptableId')
  findByAgentComptable(@Param('agentComptableId') agentComptableId: string) {
    return this.transfertVersementService.findByActeur(agentComptableId, TYPE_ACTEUR.AGENT_COMPTABLE);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.transfertVersementService.findBySession(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfertVersementService.findOne(id);
  }
}
