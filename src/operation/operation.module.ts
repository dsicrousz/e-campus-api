import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperationService } from './operation.service';
import { OperationController } from './operation.controller';
import { Operation, OperationSchema } from './entities/operation.entity';
import { CompteModule } from 'src/compte/compte.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { ServiceModule } from 'src/service/service.module';
import { DecadeModule } from 'src/decade/decade.module';
import { SoldevendeurModule } from 'src/soldevendeur/soldevendeur.module';
import { Etudiant, EtudiantSchema } from 'src/etudiant/entities/etudiant.entity';
import { SessionModule } from 'src/session/session.module';
import { AuthModule } from 'src/auth/auth.module';
import { EventsModule } from 'src/events/events.module';
import { User, UserSchema } from 'src/user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Operation.name, schema: OperationSchema }], 'ecampus'),
    MongooseModule.forFeature([{ name: Etudiant.name, schema: EtudiantSchema }], 'etudiant'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'users'),
    CompteModule,
    TicketModule,
    ServiceModule,
    AuthModule,
    DecadeModule,
    SoldevendeurModule,
    SessionModule,
    EventsModule
  ],
  controllers: [OperationController],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
