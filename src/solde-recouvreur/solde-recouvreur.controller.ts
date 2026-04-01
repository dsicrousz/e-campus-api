import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SoldeRecouvreurService } from './solde-recouvreur.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('solde-recouvreur')
@UseGuards(BetterAuthGuard)
export class SoldeRecouvreurController {
  constructor(private readonly soldeRecouvreurService: SoldeRecouvreurService) {}

  @Get()
  findAll() {
    return this.soldeRecouvreurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldeRecouvreurService.findOne(id);
  }

  @Get('recouvreur/:recouvreurId')
  findByRecouvreur(@Param('recouvreurId') recouvreurId: string) {
    return this.soldeRecouvreurService.findByRecouvreur(recouvreurId);
  }

  @Get('recouvreur/:recouvreurId/solde')
  getSolde(@Param('recouvreurId') recouvreurId: string) {
    return this.soldeRecouvreurService.getSolde(recouvreurId);
  }
}
