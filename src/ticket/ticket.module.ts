import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './entities/ticket.entity';
import { CompteModule } from '../compte/compte.module';
import { ServiceModule } from '../service/service.module';
import { TicketService } from './services/ticket.service';
import { TicketController } from './controllers/ticket.controller';
import { DecadeModule } from '../decade/decade.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      { name: Ticket.name, useFactory: () => {
        const schema = TicketSchema;
        schema.plugin(require('mongoose-autopopulate'));
        return schema;
      } },
    ], 'ecampus'),
    CompteModule,
    ServiceModule,
    DecadeModule,
    AuthModule
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
