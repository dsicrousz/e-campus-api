import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SoldeRecouvreurService } from './solde-recouvreur.service';
import { SoldeRecouvreurController } from './solde-recouvreur.controller';
import { SoldeRecouvreur, SoldeRecouvreurSchema } from './entities/solde-recouvreur.entity';
import { HistoriqueSoldeModule } from 'src/historique-solde/historique-solde.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SoldeRecouvreur.name, schema: SoldeRecouvreurSchema }
    ], 'ecampus'),
    HistoriqueSoldeModule,
    AuthModule
  ],
  controllers: [SoldeRecouvreurController],
  providers: [SoldeRecouvreurService],
  exports: [SoldeRecouvreurService]
})
export class SoldeRecouvreurModule {}
