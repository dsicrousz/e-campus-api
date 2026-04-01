import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransfertVersementService } from './transfert-versement.service';
import { TransfertVersementController } from './transfert-versement.controller';
import { TransfertVersement, TransfertVersementSchema } from './entities/transfert-versement.entity';
import { SoldevendeurModule } from 'src/soldevendeur/soldevendeur.module';
import { SoldeRecouvreurModule } from 'src/solde-recouvreur/solde-recouvreur.module';
import { SoldeCaissierPrincipalModule } from 'src/solde-caissier-principal/solde-caissier-principal.module';
import { SessionModule } from 'src/session/session.module';
import { HistoriqueSoldeModule } from 'src/historique-solde/historique-solde.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: TransfertVersement.name,
        useFactory: () => {
          const schema = TransfertVersementSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        }
      }
    ], 'ecampus'),
    SoldevendeurModule,
    SoldeRecouvreurModule,
    SoldeCaissierPrincipalModule,
    SessionModule,
    HistoriqueSoldeModule,
    AuthModule
  ],
  controllers: [TransfertVersementController],
  providers: [TransfertVersementService],
  exports: [TransfertVersementService]
})
export class TransfertVersementModule {}
