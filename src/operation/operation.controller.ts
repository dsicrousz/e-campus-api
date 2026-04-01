import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OperationService } from './operation.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';

import { TypeOperation } from './entities/operation.entity';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';

@Controller('operation')
 @UseGuards(AnyAuthGuard)
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @Post()
  create(@Body() createOperationDto: CreateOperationDto) {
    return this.operationService.create(createOperationDto);
  }

  @Get()
  findAll() {
    return this.operationService.findAll();
  }

  @Get('type/:type')
  findByType(@Param('type') type: TypeOperation) {
    return this.operationService.findByType(type);
  }

  @Get('period')
  findByPeriod(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.operationService.findByPeriod(startDate, endDate);
  }

  @Get('compte/:compteId')
  findByCompte(@Param('compteId') compteId: string) {
    return this.operationService.findByCompte(compteId);
  }

   @Get('compte/latest/:compteId')
  findLatestByCompte(@Param('compteId') compteId: string) {
    return this.operationService.findLatestByCompte(compteId);
  }

  @Get('agent/:agentId')
  findByAgent(@Param('agentId') agentId: string) {
    // Retourne les opérations RECHARGE et UTILISATION (types utilisant agentControle)
    return this.operationService.findByAgent(agentId);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId') ticketId: string) {
    // Retourne uniquement les opérations d'UTILISATION (seul type utilisant ticket)
    return this.operationService.findByTicket(ticketId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {
    // Retourne uniquement les opérations d'UTILISATION (seul type utilisant service)
    return this.operationService.findByService(serviceId);
  }

  @Get('decade/:decadeId')
  findByDecade(@Param('decadeId') decadeId: string) {
    // Retourne uniquement les opérations d'UTILISATION dans un restaurant
    return this.operationService.findByDecade(decadeId);
  }

   @Get('decade/:decadeId/service/:serviceId')
  findByDecadeAndService(@Param('decadeId') decadeId: string, @Param('serviceId') serviceId: string) {
    // Retourne uniquement les opérations d'UTILISATION dans un restaurant
    return this.operationService.findByDecadeAndService(decadeId, serviceId);
  }

  @Get('hasconsumedtoday/:compteId')
  hasConsumedToday(@Param('compteId') compteId: string, @Query('ticketType') ticketId: string) {
    // Vérifie si un ticket a été consommé aujourd'hui par un compte
    return this.operationService.hasConsumedToday(compteId, ticketId);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    // Retourne toutes les opérations d'une session spécifique
    return this.operationService.findBySession(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperationDto: UpdateOperationDto) {
    return this.operationService.update(id, updateOperationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operationService.remove(id);
  }
}
