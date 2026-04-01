import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoriqueSoldeService } from './historique-solde.service';
import { HistoriqueSoldeController } from './historique-solde.controller';
import { HistoriqueSolde, HistoriqueSoldeSchema } from './entities/historique-solde.entity';
import { SessionModule } from 'src/session/session.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: HistoriqueSolde.name,
        useFactory: () => {
          const schema = HistoriqueSoldeSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        }
      }
    ], 'ecampus'),
    SessionModule,
    AuthModule
  ],
  controllers: [HistoriqueSoldeController],
  providers: [HistoriqueSoldeService],
  exports: [HistoriqueSoldeService]
})
export class HistoriqueSoldeModule {}
