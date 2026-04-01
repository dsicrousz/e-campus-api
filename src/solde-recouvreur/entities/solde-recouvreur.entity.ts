import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SoldeRecouvreurDocument = HydratedDocument<SoldeRecouvreur>;

@Schema({ timestamps: true })
export class SoldeRecouvreur {
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  recouvreur_id: string;

  @Prop({ type: Number, default: 0 })
  solde: number;
}

export const SoldeRecouvreurSchema = SchemaFactory.createForClass(SoldeRecouvreur);
