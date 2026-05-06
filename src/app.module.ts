import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { EtudiantModule } from './etudiant/etudiant.module';
import { CompteModule } from './compte/compte.module';
import { OperationModule } from './operation/operation.module';
import { ServiceModule } from './service/service.module';
import { PubModule } from './pub/pub.module';
import { EventsModule } from './events/events.module';
import { EventsGateway } from './events/events.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { TicketModule } from './ticket/ticket.module';
import { SoldecaissierModule } from './soldecaissier/soldecaissier.module';
import { SoldevendeurModule } from './soldevendeur/soldevendeur.module';
import { DishModule } from './dish/dish.module';
import { MenuModule } from './menu/menu.module';
import { MenuRatingModule } from './menu-rating/menu-rating.module';
import { HistoriqueSoldeModule } from './historique-solde/historique-solde.module';
import { SoldeRecouvreurModule } from './solde-recouvreur/solde-recouvreur.module';
import { SoldeCaissierPrincipalModule } from './solde-caissier-principal/solde-caissier-principal.module';
import { TransfertVersementModule } from './transfert-versement/transfert-versement.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URL'),
        autoCreate: true,
        minPoolSize:1,
        maxPoolSize: 1,
      }),
      connectionName:'ecampus',
      inject: [ConfigService],
    }),
     MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_USERS_URL'),
      }),
      connectionName:'users',
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URL_ETUDIANT'),
        autoCreate: true,
      }),
      connectionName:'etudiant',
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    EtudiantModule,
    CompteModule,
    OperationModule,
    ServiceModule,
    PubModule,
    EventsModule,
    TicketModule,
    SoldecaissierModule,
    SoldevendeurModule,
    DishModule,
    MenuModule,
    MenuRatingModule,
    HistoriqueSoldeModule,
    SoldeRecouvreurModule,
    SoldeCaissierPrincipalModule,
    TransfertVersementModule
  ],
  controllers: [AppController],
  providers: [AppService,EventsGateway,{
    provide: APP_FILTER,
    useClass: SentryGlobalFilter,
  },],
})
export class AppModule {}
