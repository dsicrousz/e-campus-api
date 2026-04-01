import { Module } from '@nestjs/common';
import { EtudiantService } from './etudiant.service';
import { EtudiantController } from './etudiant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Etudiant, EtudiantSchema } from './entities/etudiant.entity';
import { CaslModule } from '../casl/casl.module';
import { InscriptionModule } from '../inscription/inscription.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Etudiant.name, schema: EtudiantSchema}],"etudiant"),CaslModule,
  InscriptionModule,
  AuthModule
],
  controllers: [EtudiantController],
  providers: [EtudiantService],
  exports: [EtudiantService]
})
export class EtudiantModule {}
