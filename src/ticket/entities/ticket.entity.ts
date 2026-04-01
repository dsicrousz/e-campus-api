import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';



export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  _id: string;

  @Prop({ type: String, required: true })
  nom: string; // Ex: "Petit-déjeuner", "Repas", "Séance sport", "Consultation"

  @Prop({ type: Number,default:0 })
  prix: number;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);


export const allowedTicketFields = ['nom', 'service', 'active','prix','_id'];
