import { Module, forwardRef } from '@nestjs/common';
import { SoldevendeurService } from './soldevendeur.service';
import { SoldevendeurController } from './soldevendeur.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Soldevendeur, SoldevendeurSchema } from './entities/soldevendeur.entity';
import { HistoriqueSoldeModule } from 'src/historique-solde/historique-solde.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    MongooseModule.forFeatureAsync([{name:Soldevendeur.name,useFactory:()=> {
      const schema = SoldevendeurSchema;
      schema.plugin(require('mongoose-autopopulate'));
      return schema;
    }}],'ecampus'),
    forwardRef(() => HistoriqueSoldeModule),
    AuthModule
  ],
  controllers: [SoldevendeurController],
  providers: [SoldevendeurService],
  exports: [SoldevendeurService],
})
export class SoldevendeurModule {}
