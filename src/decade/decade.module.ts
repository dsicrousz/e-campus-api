import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DecadeService } from './decade.service';
import { DecadeController } from './decade.controller';
import { Decade, DecadeSchema } from './entities/decade.entity';
import { SessionModule } from 'src/session/session.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([{ name: Decade.name, useFactory: () => {
      const schema = DecadeSchema;
     schema.plugin(require('mongoose-autopopulate'));
      return schema;
    }}], 'ecampus'),
    ScheduleModule.forRoot(),
    SessionModule,
    AuthModule,
  ],
  controllers: [DecadeController],
  providers: [DecadeService],
  exports: [DecadeService]
})
export class DecadeModule {}
