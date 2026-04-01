import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SoldevendeurService } from './soldevendeur.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('soldevendeur')
@UseGuards(BetterAuthGuard)
export class SoldevendeurController {
  constructor(private readonly soldevendeurService: SoldevendeurService) {}

  @Get()
  findAll() {
    return this.soldevendeurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldevendeurService.findOne(id);
  }

  @Get('vendeur/:id')
  findByVendeur(@Param('id') id: string) {
    return this.soldevendeurService.findByVendeur(id);
  }
}
