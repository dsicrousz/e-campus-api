import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('tickets')
@UseGuards(BetterAuthGuard)
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  /**
   * POST /tickets
   * Créer un nouveau ticket
   */
  @Post()
  create(@Body() createDto: CreateTicketDto) {
    return this.ticketService.create(createDto);
  }

  /**
   * GET /tickets
   * Liste tous les tickets
   */
  @Get()
  findAll() {
    return this.ticketService.findAll();
  }

  /**
   * GET /tickets/actif
   * Liste les tickets actifs
   */
  @Get('active')
  findAllActive() {
    return this.ticketService.findAllActive();
  }


  /**
   * GET /tickets/:id
   * Récupère un ticket
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  /**
   * PATCH /tickets/:id
   * Met à jour un ticket
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateDto);
  }

  /**
   * DELETE /tickets/:id
   * Supprime un ticket
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }

  /**
   * POST /tickets/:id/toggle-active
   * Active/désactive un ticket
   */
  @Post(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  toggleActive(@Param('id') id: string) {
    return this.ticketService.toggleActive(id);
  }

  /**
   * GET /tickets/verifier/:compteCode
   * Vérifie si un étudiant peut utiliser un ticket
   */
  @Get('verifier/:compteCode')
  @UseGuards(BetterAuthGuard)
  verifier(
    @Param('compteCode') compteCode: string,
    @Query('ticketId') ticketId: string,
  ) {
    return this.ticketService.peutUtiliserTicket(
      compteCode,
      ticketId,
    );
  }

}
