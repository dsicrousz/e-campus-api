import { Module } from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import { InscriptionController } from './inscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inscription, InscriptionSchema } from './entities/inscription.entity';
import { EtudiantModule } from 'src/etudiant/etudiant.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Inscription.name,schema:InscriptionSchema }],"etudiant"),
],
  controllers: [InscriptionController],
  providers: [InscriptionService],
  exports:[InscriptionService]
})
export class InscriptionModule {}
