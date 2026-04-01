import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Dish } from '../../dish/entities/dish.entity';
import { Service } from 'src/service/entities/service.entity';

export type MenuDocument = HydratedDocument<Menu>;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  nom: string;

  @Prop({type: Date, required: true, unique: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Service.name,autopopulate: {select: '_id nom'} })
  service: Service | string;

   @Prop({ 
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Dish.name,autopopulate: {select: '_id nom ticket image'} }],
    required: true
  })
  plats: Dish[];


  @Prop({type: String})
  notes?: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
