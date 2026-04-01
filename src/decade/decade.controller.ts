import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { DecadeService } from './decade.service';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';
@Controller('decades')
@UseGuards(BetterAuthGuard)
export class DecadeController {
  constructor(private readonly decadeService: DecadeService) {}

  // @Post()
  // create(@Body() createDecadeDto: CreateDecadeDto) {
  //   return this.decadeService.create(createDecadeDto);
  // }

  @Get()
  findAll() {
    return this.decadeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.decadeService.findOne(id);
  }

  @Get('active')
  findActiveDecade() {
    return this.decadeService.findActiveDecade();
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    // Retourne toutes les décades d'une session spécifique
    return this.decadeService.findBySession(sessionId);
  }

  @Post('trigger')
  triggerDecadeCreation() {
    return this.decadeService.triggerDecadeCreation();
  }
}
