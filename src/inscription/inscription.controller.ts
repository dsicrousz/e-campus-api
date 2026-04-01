import { Controller} from '@nestjs/common';
@Controller('inscription')
export class InscriptionController {
  constructor() {}

  // @Get('/byetudiantactive/:id')
  // findActiveByEtudiant(@Param('id') id: string) {
  //   return this.inscriptionService.findActiveByEtudiant(id);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.inscriptionService.findOne(id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateInscriptionDto: UpdateInscriptionDto) {
  // const ins = await this.inscriptionService.update(id, updateInscriptionDto);
  // if(updateInscriptionDto?.active === true) {
  //   await this.etudiantService.update(ins.etudiant._id, {formation: updateInscriptionDto.formation})
  // }
  // return ins;
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.inscriptionService.remove(id);
  // }
}
