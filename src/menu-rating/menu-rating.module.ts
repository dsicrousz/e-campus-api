import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Menu, MenuSchema } from 'src/menu/entities/menu.entity';
import {
  MenuDishRating,
  MenuDishRatingSchema,
} from './entities/menu-dish-rating.entity';
import { MenuRatingService } from './menu-rating.service';
import { MenuRatingController } from './menu-rating.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature(
      [{ name: MenuDishRating.name, schema: MenuDishRatingSchema }],
      'ecampus',
    ),
    MongooseModule.forFeatureAsync(
      [
        {
          name: Menu.name,
          useFactory: () => {
            const schema = MenuSchema;
            schema.plugin(require('mongoose-autopopulate'));
            return schema;
          },
        },
      ],
      'ecampus',
    ),
  ],
  controllers: [MenuRatingController],
  providers: [MenuRatingService],
  exports: [MenuRatingService],
})
export class MenuRatingModule {}
