import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SoldeCaissierPrincipalService } from './solde-caissier-principal.service';
import { SoldeCaissierPrincipalController } from './solde-caissier-principal.controller';
import { SoldeCaissierPrincipal, SoldeCaissierPrincipalSchema } from './entities/solde-caissier-principal.entity';
import { HistoriqueSoldeModule } from 'src/historique-solde/historique-solde.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SoldeCaissierPrincipal.name, schema: SoldeCaissierPrincipalSchema }
    ], 'ecampus'),
    HistoriqueSoldeModule,
    AuthModule
  ],
  controllers: [SoldeCaissierPrincipalController],
  providers: [SoldeCaissierPrincipalService],
  exports: [SoldeCaissierPrincipalService]
})
export class SoldeCaissierPrincipalModule {}
