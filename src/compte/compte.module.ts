import { Module, forwardRef } from '@nestjs/common';
import { CompteService } from './compte.service';
import { CompteController } from './compte.controller';
import { MongooseModule } from '@nestjs/mongoose'; 
import { Compte, CompteSchema } from './entities/compte.entity';
import { Etudiant, EtudiantSchema } from '../etudiant/entities/etudiant.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{name: Compte.name, schema: CompteSchema}],'ecampus'),
  MongooseModule.forFeature([{name: Etudiant.name, schema: EtudiantSchema}],'etudiant'),
  forwardRef(() => AuthModule),
  JwtModule.registerAsync({
    useFactory: async (config: ConfigService) => {
      return {
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      };
    },
    inject: [ConfigService],
  }),
],
  controllers: [CompteController],
  providers: [CompteService],
  exports: [CompteService],
})
export class CompteModule {}
     