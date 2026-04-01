import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SoldecaissierService } from './soldecaissier.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('soldecaissier')
@UseGuards(BetterAuthGuard)
export class SoldecaissierController {
  constructor(private readonly soldecaissierService: SoldecaissierService) {}

  @Get()
  findAll() {
    return this.soldecaissierService.findAll();
  }

  @Get('caissier/:id')
  findByCaissier(@Param('id') id: string) {
    return this.soldecaissierService.findByCaissier(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soldecaissierService.findOne(id);
  }

}
