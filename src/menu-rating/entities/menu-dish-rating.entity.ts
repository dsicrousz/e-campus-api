import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Dish } from 'src/dish/entities/dish.entity';
import { Compte } from 'src/compte/entities/compte.entity';

export type MenuDishRatingDocument = HydratedDocument<MenuDishRating>;

@Schema({ timestamps: true })
export class MenuDishRating {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Dish.name, required: true, index: true })
  dishId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId,ref:Compte.name, required: true, index: true })
  compteId: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String })
  comment?: string;
}

export const MenuDishRatingSchema = SchemaFactory.createForClass(MenuDishRating);
