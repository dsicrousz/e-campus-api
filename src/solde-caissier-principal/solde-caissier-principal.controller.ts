import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SoldeCaissierPrincipalService } from './solde-caissier-principal.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('solde-caissier-principal')
@UseGuards(BetterAuthGuard)
export class SoldeCaissierPrincipalController {
  constructor(private readonly soldeCaissierPrincipalService: SoldeCaissierPrincipalService) {}

  @Get()
  findAll() {
    return this.soldeCaissierPrincipalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldeCaissierPrincipalService.findOne(id);
  }

  @Get('caissier-principal/:caissierPrincipalId')
  findByCaissierPrincipal(@Param('caissierPrincipalId') caissierPrincipalId: string) {
    return this.soldeCaissierPrincipalService.findByCaissierPrincipal(caissierPrincipalId);
  }

  @Get('caissier-principal/:caissierPrincipalId/solde')
  getSolde(@Param('caissierPrincipalId') caissierPrincipalId: string) {
    return this.soldeCaissierPrincipalService.getSolde(caissierPrincipalId);
  }
}
