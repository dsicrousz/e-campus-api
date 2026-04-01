import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException } from '@nestjs/common';
import { CompteService } from './compte.service';
import { CompteUpdatePassDto } from './dto/compte-update-pass-dto';
import { CompteLoginDto } from './dto/compteLoginDto';
import { CreateCompteDto } from './dto/create-compte.dto';
import { UpdateCompteDto } from './dto/update-compte.dto';
import { JwtService } from '@nestjs/jwt';
import { AnyAuthGuard } from 'src/auth/any-auth.guard';
import { Public } from 'src/auth/public.decorator';
// import { CompteAuthGuard } from 'src/auth/compte-auth.guard';

@Controller('compte')
@UseGuards(AnyAuthGuard)
export class CompteController {
  constructor(private readonly compteService: CompteService,
    private jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() createCompteDto: CreateCompteDto) {
    return this.compteService.create(createCompteDto);
  }

  @Post('login')
  @Public()
  async login(@Body() compteLoginDto: CompteLoginDto) {
   const compte = await this.compteService.login(compteLoginDto);
   if(compte.is_actif === false){
    throw new HttpException("Compte bloqué, veuillez contacter l'administrateur",440);
    }
   const token = this.jwtService.sign({ _id: compte._id, role: compte.code});
  return {token, compte};
  }

  @Post('loginwithncs')
  @Public()
  async loginWithNcs(@Body() compteLoginDto: CompteLoginDto) {
   const compte = await this.compteService.loginWithNcs(compteLoginDto);
   if(compte.is_actif === false){
    throw new HttpException("Compte bloqué, veuillez contacter l'administrateur",440);
    }
   const token = this.jwtService.sign({ _id: compte._id, role: compte.code});
  return {token, compte};
  }


  @Post('passmatch/:id')
  verifyPass(@Param('id') id: string, @Body() verifyPassDto: {password: string}) {
    return this.compteService.verifyPass(id,verifyPassDto.password);
  }

  
  @Post('changepassword/:id')
  changepassword(@Param('id') id: string, @Body() compteUpdatePassDto: CompteUpdatePassDto) {
    return this.compteService.changepassword(id,compteUpdatePassDto);
  }


  @Get()
  findAll() {
    return this.compteService.findAll();
  }

  
  @Get('count')
  count() {
    return this.compteService.count();
  }


  @Get('/code/:code')
  findOneByCode(@Param('code') code: string) {
    return this.compteService.findOneByCode(code);
  }

  @Get('/ncs/:ncs')
  findOneByNcs(@Param('ncs') ncs: string) {
    return this.compteService.findOneByNcs(ncs);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compteService.findOne(id);
  }

  
  @Get('/etudiant/:id')
  findOneByEtudiant(@Param('id') id: string) {
    return this.compteService.findOneByEtudiant(id);
  }

 
  @Patch('/toggle/:id')
  toggleState(@Param('id') id: string, @Body() updateStateDto: {is_actif: boolean}) {
    return this.compteService.toggleState(id, updateStateDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompteDto: UpdateCompteDto) {
    return this.compteService.update(id, updateCompteDto);
  }

  // @Delete(':id')
  // @CheckAbility({ action: Action.Delete, subject: Compte })
  // @UseGuards(AuthGuard('jwt'), CaslGuard)
  // async remove(@Param('id') id: string) {
  //   const c = await this.compteService.remove(id);
  //   await this.operationService.deleteMany(c._id);
  //   return c;
  // }
}
