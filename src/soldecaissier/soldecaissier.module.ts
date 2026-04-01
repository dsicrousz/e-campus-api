import { Module, forwardRef } from '@nestjs/common';
import { SoldecaissierService } from './soldecaissier.service';
import { SoldecaissierController } from './soldecaissier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Soldecaissier, SoldecaissierSchema } from './entities/soldecaissier.entity';
import { HistoriqueSoldeModule } from 'src/historique-solde/historique-solde.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    MongooseModule.forFeatureAsync([{name:Soldecaissier.name,useFactory:()=> {
      const schema = SoldecaissierSchema;
      schema.plugin(require('mongoose-autopopulate'));
      return schema;
    }}],'ecampus'),
    forwardRef(() => HistoriqueSoldeModule),
    AuthModule
  ],
  controllers: [SoldecaissierController],
  providers: [SoldecaissierService],
  exports: [SoldecaissierService] 
})
export class SoldecaissierModule {}
