import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get()
  @UseGuards(BetterAuthGuard)
  findAll() {
    return this.sessionService.findAll();
  }

  @Get('active')
  @UseGuards(BetterAuthGuard)
  getActiveSession() {
    return this.sessionService.getActiveSession();
  }

  @Get('annee/:annee')
  @UseGuards(BetterAuthGuard)
  findByAnnee(@Param('annee') annee: string) {
    return this.sessionService.findByAnnee(annee);
  }

  @Get(':id')
  @UseGuards(BetterAuthGuard)
  findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id/activate')
   @UseGuards(BetterAuthGuard)
  activateSession(@Param('id') id: string) {
    return this.sessionService.activateSession(id);
  }
  

  @Patch(':id')
  @UseGuards(BetterAuthGuard)
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}
