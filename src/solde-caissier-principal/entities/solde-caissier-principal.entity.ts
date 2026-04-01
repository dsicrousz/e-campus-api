import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SoldeCaissierPrincipalDocument = HydratedDocument<SoldeCaissierPrincipal>;

@Schema({ timestamps: true })
export class SoldeCaissierPrincipal {
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  caissier_principal_id: string;

  @Prop({ type: Number, default: 0 })
  solde: number;
}

export const SoldeCaissierPrincipalSchema = SchemaFactory.createForClass(SoldeCaissierPrincipal);
