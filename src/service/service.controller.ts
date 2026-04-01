import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { BetterAuthGuard } from 'src/auth/better-auth.guard';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(BetterAuthGuard)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get('active')
  @UseGuards(BetterAuthGuard)
  findActive() {
    return this.serviceService.findActive();
  }

  @Get('by-agent-controle/:agentControleId')
  @UseGuards(BetterAuthGuard)
  getByAgentControle(@Param('agentControleId') agentControleId: string) {
    return this.serviceService.getByAgentControle(agentControleId);
  }


  @Get('by-gerant/:gerantId')
  @UseGuards(BetterAuthGuard)
  getByGerant(@Param('gerantId') gerantId: string) {
    return this.serviceService.getByGerant(gerantId);
  }

  @Get('bytype/:type')
  @UseGuards(AnyAuthGuard)
  getByType(@Param('type') type: string) {
    return this.serviceService.getByType(type);
  }


  @Get()
  @UseGuards(BetterAuthGuard)
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  @UseGuards(AnyAuthGuard)
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(BetterAuthGuard)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
