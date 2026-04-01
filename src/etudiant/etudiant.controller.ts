import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { EtudiantService } from './etudiant.service';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';
import { UpdateEtudiantProfileDto } from './dto/update-etudiant-profile.dto';

@Controller('etudiant')
@UseGuards(AnyAuthGuard)
export class EtudiantController {
  constructor(private readonly etudiantService: EtudiantService) {}

  @Get()
  findAll() {
    return this.etudiantService.findAll();
  }
  
  @Get('count')
  count() {
    return this.etudiantService.count();
  }

  @Get('inscription/:id')
  findOneInscription(@Param('id') id: string) {
    return this.etudiantService.findInscription(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.etudiantService.findOne(id);
  }

  @Get('/nce/:nce')
  findOneByNce(@Param('nce') nce: string) {
    return this.etudiantService.findOneByNce(nce);
  }

  @Patch(':id/profile')
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateEtudiantProfileDto,
  ) {
    return this.etudiantService.updateProfile(id, dto);
  }

  
}
