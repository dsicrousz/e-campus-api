import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument,Schema as MongooseSchema } from 'mongoose';
import { Service } from '../../service/entities/service.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

export type DishDocument = HydratedDocument<Dish>;

@Schema({ timestamps: true })
export class Dish {
  @Prop({ type: String, required: true })
  nom: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Service.name,autopopulate: {select: '_id nom'} })
  service: Service | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Ticket.name, autopopulate: { select: '_id montant nom' } })
  ticket: Ticket;

  @Prop({ type: String })
  description: string;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: [String], default: [] })
  allergenes: string[];
}

export const DishSchema = SchemaFactory.createForClass(Dish);
