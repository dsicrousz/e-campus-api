import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dish, DishSchema } from './entities/dish.entity';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([{ name: Dish.name, useFactory: () => {
      const schema = DishSchema;
      schema.plugin(require('mongoose-autopopulate'));
      return schema;
    } }], 'ecampus'),
  MulterModule.register(),
  AuthModule,
  ],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule {}
